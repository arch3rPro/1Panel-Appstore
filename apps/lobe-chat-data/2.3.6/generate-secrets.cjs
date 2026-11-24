#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const REQUIRED = [
  'POSTGRES_PASSWORD', 'RUSTFS_SECRET_KEY', 'KEY_VAULTS_SECRET', 'AUTH_SECRET',
  'GATEWAY_SERVICE_TOKEN', 'JWKS_KEY', 'JWKS_PUBLIC_KEY',
];

function generateSecrets() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const meta = { alg: 'RS256', kid: crypto.randomBytes(8).toString('hex'), use: 'sig' };
  return {
    LOBE_DB_NAME: 'lobehub',
    RUSTFS_ACCESS_KEY: 'admin',
    POSTGRES_PASSWORD: crypto.randomBytes(24).toString('hex'),
    RUSTFS_SECRET_KEY: crypto.randomBytes(24).toString('hex'),
    KEY_VAULTS_SECRET: crypto.randomBytes(32).toString('base64'),
    AUTH_SECRET: crypto.randomBytes(32).toString('hex'),
    GATEWAY_SERVICE_TOKEN: crypto.randomBytes(32).toString('hex'),
    JWKS_KEY: JSON.stringify({ keys: [{ ...privateKey.export({ format: 'jwk' }), ...meta }] }),
    JWKS_PUBLIC_KEY: JSON.stringify({ keys: [{ ...publicKey.export({ format: 'jwk' }), ...meta }] }),
    SEARXNG_SECRET: crypto.randomBytes(32).toString('hex'),
  };
}

// Read only known, single-line legacy fields. Never source/execute the .env file.
function readLegacyEnv(file) {
  if (!fs.existsSync(file)) return {};
  const result = {};
  const known = new Set([...REQUIRED, 'LOBE_DB_NAME', 'RUSTFS_ACCESS_KEY', 'CONTAINER_NAME']);
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (!match || !known.has(match[1])) continue;
    let value = match[2];
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1).replace(/\\'/g, "'");
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\([\\"$])/g, '$1');
    }
    result[match[1]] = value;
  }
  return result;
}

function validate(values) {
  for (const key of [...REQUIRED, 'LOBE_DB_NAME', 'RUSTFS_ACCESS_KEY', 'SEARXNG_SECRET']) {
    if (typeof values[key] !== 'string' || !values[key] || /[\r\n\0]/.test(values[key])) {
      throw new Error(`Missing or invalid ${key}; restore the original secrets instead of regenerating them.`);
    }
  }
  if (Buffer.from(values.KEY_VAULTS_SECRET, 'base64').length !== 32) {
    throw new Error('KEY_VAULTS_SECRET must decode to 32 bytes.');
  }
  if (values.AUTH_SECRET.length < 32 || values.RUSTFS_SECRET_KEY.length < 8) {
    throw new Error('AUTH_SECRET or RUSTFS_SECRET_KEY is too short.');
  }
  const priv = JSON.parse(values.JWKS_KEY).keys?.[0];
  const pub = JSON.parse(values.JWKS_PUBLIC_KEY).keys?.[0];
  if (!priv?.d || priv.kty !== 'RSA' || priv.alg !== 'RS256' || !pub || pub.kty !== 'RSA' ||
      ['d', 'p', 'q', 'dp', 'dq', 'qi'].some(key => key in pub)) {
    throw new Error('Invalid private/public JWKS separation.');
  }
  const derived = crypto.createPublicKey(crypto.createPrivateKey({ key: priv, format: 'jwk' }))
    .export({ format: 'jwk' });
  if (pub.n !== derived.n || pub.e !== derived.e || pub.kid !== priv.kid || pub.alg !== 'RS256') {
    throw new Error('JWKS keypair does not match.');
  }
}

function writePrivate(file, contents) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, contents, { mode: 0o600, flag: 'wx' });
  fs.renameSync(tmp, file);
  fs.chmodSync(file, 0o600);
}

function envFile(values) {
  // Single quotes prevent Compose from expanding $ characters in imported passwords.
  return Object.entries(values).map(([key, value]) => `${key}='${value.replace(/'/g, "\\'")}'`).join('\n') + '\n';
}

function initialize(appDir, containerName = process.env.CONTAINER_NAME) {
  const dataDir = path.join(appDir, 'data');
  if (fs.existsSync(path.join(dataDir, 'PG_VERSION'))) {
    throw new Error('LobeChat 1.x database detected; migrate in a separate instance first.');
  }
  const secretsDir = path.join(dataDir, 'secrets');
  const stateFile = path.join(secretsDir, 'state.json');
  const { CONTAINER_NAME: configuredName, ...legacy } = readLegacyEnv(path.join(appDir, '.env'));
  let values;
  let source;
  if (fs.existsSync(stateFile)) {
    values = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    source = 'existing';
  } else {
    const provided = REQUIRED.filter(key => legacy[key]);
    if (provided.length && provided.length !== REQUIRED.length) {
      throw new Error('Incomplete previous 2.x secrets in .env; restore all seven fields before continuing.');
    }
    if (provided.length) {
      values = {
        LOBE_DB_NAME: 'lobehub', RUSTFS_ACCESS_KEY: 'admin', ...legacy,
        SEARXNG_SECRET: crypto.randomBytes(32).toString('hex'),
      };
      source = 'imported';
    } else {
      const existingData = ['postgresql', 'rustfs', 'redis', 'secrets'].some(name => {
        const dir = path.join(dataDir, name);
        return fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
      });
      if (existingData) {
        throw new Error('Existing data without saved secrets; restore data/secrets or the original 2.x .env.');
      }
      values = generateSecrets();
      source = 'generated';
    }
  }
  containerName = containerName || configuredName;
  if (!containerName || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(containerName)) {
    throw new Error('Set a valid CONTAINER_NAME in .env before initializing credentials.');
  }
  validate(values);
  fs.mkdirSync(secretsDir, { recursive: true, mode: 0o700 });
  fs.chmodSync(secretsDir, 0o700);
  // Save the source of truth before producing derived env files. Interrupted runs can safely retry.
  if (source !== 'existing') writePrivate(stateFile, JSON.stringify(values, null, 2) + '\n');
  fs.chmodSync(stateFile, 0o600);
  // Match the dependency container, not a generic alias on the shared 1Panel network.
  const databaseUrl = `postgresql://postgres:${encodeURIComponent(values.POSTGRES_PASSWORD)}@${containerName}-postgresql:5432/${encodeURIComponent(values.LOBE_DB_NAME)}`;
  const files = {
    'lobe.env': {
      KEY_VAULTS_SECRET: values.KEY_VAULTS_SECRET,
      AUTH_SECRET: values.AUTH_SECRET,
      JWKS_KEY: values.JWKS_KEY,
      DATABASE_URL: databaseUrl,
      S3_ACCESS_KEY_ID: values.RUSTFS_ACCESS_KEY,
      S3_SECRET_ACCESS_KEY: values.RUSTFS_SECRET_KEY,
      AGENT_GATEWAY_SERVICE_TOKEN: values.GATEWAY_SERVICE_TOKEN,
      DEVICE_GATEWAY_SERVICE_TOKEN: values.GATEWAY_SERVICE_TOKEN,
    },
    'gateway.env': { SERVICE_TOKEN: values.GATEWAY_SERVICE_TOKEN, JWKS_PUBLIC_KEY: values.JWKS_PUBLIC_KEY },
    'postgresql.env': { POSTGRES_DB: values.LOBE_DB_NAME, POSTGRES_PASSWORD: values.POSTGRES_PASSWORD },
    'rustfs.env': { RUSTFS_ACCESS_KEY: values.RUSTFS_ACCESS_KEY, RUSTFS_SECRET_KEY: values.RUSTFS_SECRET_KEY },
    'searxng.env': { SEARXNG_SECRET: values.SEARXNG_SECRET },
  };
  for (const [name, content] of Object.entries(files)) writePrivate(path.join(secretsDir, name), envFile(content));
  return source;
}

module.exports = { generateSecrets, initialize, readLegacyEnv };
if (require.main === module) {
  try {
    if (process.argv[2] === '--init' && process.argv[3]) {
      const source = initialize(path.resolve(process.argv[3]));
      console.log(`LobeHub secrets ${source}; saved under data/secrets (values are not logged).`);
    } else if (process.argv.length === 2) {
      // Optional manual recovery/migration utility; normal installs use --init automatically.
      for (const [key, value] of Object.entries(generateSecrets())) console.log(`${key}=${value}`);
    } else {
      throw new Error('Usage: node generate-secrets.cjs [--init APP_DIR]');
    }
  } catch (error) {
    // Do not print parser exceptions, which can contain fragments of secret JSON.
    console.error('LobeHub secret initialization failed. Check/restore saved credentials; no keys were reset.');
    if (error instanceof SyntaxError) console.error('Saved JSON is invalid.');
    else console.error(error.message);
    process.exitCode = 1;
  }
}
