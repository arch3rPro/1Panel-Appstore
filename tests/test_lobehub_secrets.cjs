'use strict';

// Run: node --test tests/test_lobehub_secrets.cjs
// Tests use temporary directories and `docker compose config`, never start services.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const base = path.resolve(__dirname, '../apps/lobe-chat-data');
for (const version of ['latest', '2.3.4']) {
  const source = path.join(base, version);
  const { generateSecrets, initialize: initializeSecrets } = require(path.join(source, 'generate-secrets.cjs'));
  const initialize = dir => initializeSecrets(dir, 'lobehub-test');
  function fixture(t) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lobehub-secrets-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    fs.cpSync(source, dir, { recursive: true });
    fs.appendFileSync(path.join(dir, '.env'), '\nCONTAINER_NAME=lobehub-test\n');
    return dir;
  }
  const statePath = dir => path.join(dir, 'data/secrets/state.json');
  const readState = dir => JSON.parse(fs.readFileSync(statePath(dir), 'utf8'));
  function legacyEnv(values) {
    return Object.entries(values).map(([key, value]) => `${key}='${value.replace(/'/g, "\\'")}'`).join('\n');
  }

  test(`${version}: unique RSA keys, 32-byte vault key and least-privilege env files`, t => {
    const dir = fixture(t);
    assert.equal(initialize(dir), 'generated');
    const values = readState(dir);
    assert.equal(Buffer.from(values.KEY_VAULTS_SECRET, 'base64').length, 32);
    const priv = JSON.parse(values.JWKS_KEY).keys[0];
    const pub = JSON.parse(values.JWKS_PUBLIC_KEY).keys[0];
    const signature = crypto.sign('sha256', Buffer.from('test'), { key: priv, format: 'jwk' });
    assert(crypto.verify('sha256', Buffer.from('test'), { key: pub, format: 'jwk' }, signature));
    assert.notEqual(generateSecrets().KEY_VAULTS_SECRET, values.KEY_VAULTS_SECRET);
    const gateway = fs.readFileSync(path.join(dir, 'data/secrets/gateway.env'), 'utf8');
    assert(!gateway.includes('JWKS_KEY='));
    assert(!gateway.includes(values.KEY_VAULTS_SECRET));
    assert.equal(pub.d, undefined);
    assert.equal(fs.statSync(path.dirname(statePath(dir))).mode & 0o777, 0o700);
    for (const name of fs.readdirSync(path.dirname(statePath(dir)))) {
      assert.equal(fs.statSync(path.join(dir, 'data/secrets', name)).mode & 0o777, 0o600);
    }
  });

  test(`${version}: repeated initialization keeps keys and repairs derived env files`, t => {
    const dir = fixture(t);
    initialize(dir);
    const before = fs.readFileSync(statePath(dir), 'utf8');
    fs.rmSync(path.join(dir, 'data/secrets/gateway.env'));
    assert.equal(initialize(dir), 'existing');
    assert.equal(fs.readFileSync(statePath(dir), 'utf8'), before);
    assert(fs.readFileSync(path.join(dir, 'data/secrets/gateway.env'), 'utf8').includes('JWKS_PUBLIC_KEY='));
    // Subsequent changes in panel .env must not rotate persisted credentials.
    fs.writeFileSync(path.join(dir, '.env'), legacyEnv(generateSecrets()));
    initialize(dir);
    assert.equal(fs.readFileSync(statePath(dir), 'utf8'), before);
  });

  test(`${version}: dependency hostname changes repair derived files without rotating saved credentials`, t => {
    const dir = fixture(t);
    initializeSecrets(dir);
    const stateBefore = fs.readFileSync(statePath(dir), 'utf8');
    const oldEnv = fs.readFileSync(path.join(dir, 'data/secrets/lobe.env'), 'utf8');
    assert(oldEnv.includes('@lobehub-test-postgresql:5432/'));
    fs.writeFileSync(path.join(dir, 'data/secrets/lobe.env'), oldEnv.replace('@lobehub-test-postgresql:', '@postgresql:'));
    initializeSecrets(dir);
    assert.equal(fs.readFileSync(path.join(dir, 'data/secrets/lobe.env'), 'utf8'), oldEnv);
    assert.equal(fs.readFileSync(statePath(dir), 'utf8'), stateBefore);
    fs.writeFileSync(path.join(dir, '.env'), 'CONTAINER_NAME=second-lobehub\n');
    initializeSecrets(dir);
    assert.equal(fs.readFileSync(statePath(dir), 'utf8'), stateBefore);
    const newEnv = fs.readFileSync(path.join(dir, 'data/secrets/lobe.env'), 'utf8');
    assert(newEnv.includes('@second-lobehub-postgresql:5432/'));
  });

  test(`${version}: imports previous 2.x secrets without rotating passwords or vault key`, t => {
    const dir = fixture(t);
    const original = generateSecrets();
    original.LOBE_DB_NAME = 'old_lobe';
    original.RUSTFS_ACCESS_KEY = 'old-admin';
    fs.writeFileSync(path.join(dir, '.env'), legacyEnv(original));
    fs.mkdirSync(path.join(dir, 'data/postgresql'));
    fs.writeFileSync(path.join(dir, 'data/postgresql/PG_VERSION'), '17');
    assert.equal(initialize(dir), 'imported');
    const values = readState(dir);
    for (const key of Object.keys(original).filter(key => key !== 'SEARXNG_SECRET')) {
      assert.equal(values[key], original[key], key);
    }
  });

  test(`${version}: imports double-quoted panel dotenv values and escaped JWKS JSON`, t => {
    const dir = fixture(t);
    const original = generateSecrets();
    fs.writeFileSync(path.join(dir, '.env'), Object.entries(original)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n'));
    assert.equal(initialize(dir), 'imported');
    assert.equal(readState(dir).JWKS_KEY, original.JWKS_KEY);
    assert.equal(readState(dir).JWKS_PUBLIC_KEY, original.JWKS_PUBLIC_KEY);
  });

  test(`${version}: refuses incomplete old credentials, lost state, corrupt JSON and mismatched keys`, t => {
    const dir = fixture(t);
    fs.writeFileSync(path.join(dir, '.env'), 'AUTH_SECRET=partial');
    assert.throws(() => initialize(dir), /Incomplete/);
    fs.writeFileSync(path.join(dir, '.env'), '');
    fs.mkdirSync(path.join(dir, 'data/postgresql'));
    fs.writeFileSync(path.join(dir, 'data/postgresql/PG_VERSION'), '17');
    assert.throws(() => initialize(dir), /Existing data without saved secrets/);
    fs.rmSync(path.join(dir, 'data/postgresql'), { recursive: true });
    initialize(dir);
    fs.writeFileSync(statePath(dir), '{broken');
    assert.throws(() => initialize(dir), SyntaxError);
    assert.equal(fs.readFileSync(statePath(dir), 'utf8'), '{broken');
    const values = generateSecrets();
    values.JWKS_PUBLIC_KEY = generateSecrets().JWKS_PUBLIC_KEY;
    fs.writeFileSync(statePath(dir), JSON.stringify(values));
    assert.throws(() => initialize(dir), /keypair does not match/);
  });

  test(`${version}: refuses old 1.x layout before creating secrets`, t => {
    const dir = fixture(t);
    fs.writeFileSync(path.join(dir, 'data/PG_VERSION'), '17');
    assert.throws(() => initialize(dir), /1.x/);
    assert(!fs.existsSync(statePath(dir)));
    const result = spawnSync('bash', [path.join(dir, 'scripts/init.sh')], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert(!fs.existsSync(statePath(dir)));
  });

  test(`${version}: init/upgrade hooks retain secrets and never log them`, { skip: process.getuid?.() !== 0 }, t => {
    const dir = fixture(t);
    for (const script of ['init.sh', 'upgrade.sh']) {
      const result = spawnSync('bash', [path.join(dir, 'scripts', script)], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      const values = readState(dir);
      for (const key of ['AUTH_SECRET', 'KEY_VAULTS_SECRET', 'POSTGRES_PASSWORD', 'JWKS_KEY']) {
        assert(!`${result.stdout}${result.stderr}`.includes(values[key]));
      }
      if (script === 'init.sh') fs.writeFileSync(path.join(dir, 'saved.json'), JSON.stringify(values));
      else assert.deepEqual(values, JSON.parse(fs.readFileSync(path.join(dir, 'saved.json'), 'utf8')));
      assert.equal(fs.statSync(path.join(dir, 'data/rustfs')).uid, 10001);
      assert(!fs.existsSync(path.join(dir, '.secrets-init.lock')));
    }
  });

  test(`${version}: falls back to the main image when host Node.js is unavailable`, { skip: process.getuid?.() !== 0 }, t => {
    const dir = fixture(t);
    const bin = path.join(dir, 'bin');
    fs.mkdirSync(bin);
    fs.writeFileSync(path.join(bin, 'node'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
    fs.writeFileSync(path.join(bin, 'docker'), '#!/bin/bash\nprintf "%s\\n" "$@" > "$TEST_DOCKER_ARGS"\nexec "$REAL_NODE" "$TEST_APP_DIR/generate-secrets.cjs" --init "$TEST_APP_DIR"\n', { mode: 0o755 });
    const argsFile = path.join(dir, 'docker-args');
    const result = spawnSync('bash', [path.join(dir, 'scripts/init.sh')], {
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, REAL_NODE: process.execPath, TEST_APP_DIR: dir, TEST_DOCKER_ARGS: argsFile },
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert(fs.existsSync(statePath(dir)));
    const args = fs.readFileSync(argsFile, 'utf8');
    assert(args.includes(`lobehub/lobehub:${version}\n`));
    assert(args.includes('--network\nnone\n'));
    assert(args.includes('--entrypoint\n/bin/node\n'));
    assert(args.includes('--user\n0:0\n'));
    assert(args.includes('/deployment/generate-secrets.cjs\n--init\n/deployment\n'));
  });

  test(`${version}: concurrent initialization fails without touching secrets`, t => {
    const dir = fixture(t);
    fs.mkdirSync(path.join(dir, '.secrets-init.lock'));
    const result = spawnSync('bash', [path.join(dir, 'scripts/init.sh')], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert(!fs.existsSync(statePath(dir)));
  });

  test(`${version}: Compose resolves generated credentials, special characters and both gateways`, t => {
    const dir = fixture(t);
    const values = generateSecrets();
    values.POSTGRES_PASSWORD = 'db@pass$WORD#hash';
    values.RUSTFS_SECRET_KEY = "store$PASS'word\\end";
    fs.writeFileSync(path.join(dir, '.env'), legacyEnv(values));
    initialize(dir);
    const env = {
      ...process.env, CONTAINER_NAME: 'lobehub-test',
      PANEL_APP_PORT_HTTP: '3210', PANEL_APP_PORT_S3: '9000', PANEL_APP_PORT_ADMIN: '9001',
      PANEL_APP_PORT_API: '8787', PANEL_APP_PORT_PROXY: '8788',
      APP_URL: 'https://lobe.example.com', S3_ENDPOINT: 'https://s3.example.com',
      AGENT_GATEWAY_URL: 'https://agent.example.com', DEVICE_GATEWAY_PUBLIC_URL: 'https://device.example.com',
      AUTH_ALLOWED_EMAILS: 'owner@example.com',
    };
    const result = spawnSync('docker', ['compose', '-f', path.join(dir, 'docker-compose.yml'), 'config', '--format', 'json'], { env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    const services = JSON.parse(result.stdout).services;
    // Compose serializes literal dollars as $$ so its config output can be reused as input.
    for (const service of Object.values(services)) {
      for (const [key, value] of Object.entries(service.environment || {})) {
        if (typeof value === 'string') service.environment[key] = value.replace(/\$\$/g, '$');
      }
    }
    assert.equal(services.lobe.image, `lobehub/lobehub:${version}`);
    assert.equal(services.lobe.environment.AUTH_DISABLE_EMAIL_PASSWORD, '0');
    assert.equal(services.lobe.environment.AUTH_EMAIL_VERIFICATION, '0');
    assert.equal(services.lobe.environment.AUTH_ENABLE_MAGIC_LINK, '0');
    assert.equal(services.lobe.environment.AUTH_ALLOWED_EMAILS, env.AUTH_ALLOWED_EMAILS);
    assert.equal(services.lobe.environment.JWKS_KEY, values.JWKS_KEY);
    assert.equal(services.lobe.environment.S3_SECRET_ACCESS_KEY, values.RUSTFS_SECRET_KEY);
    assert.equal(services.rustfs.environment.RUSTFS_SECRET_KEY, values.RUSTFS_SECRET_KEY);
    assert.equal(services.postgresql.environment.POSTGRES_PASSWORD, values.POSTGRES_PASSWORD);
    assert(services.lobe.environment.DATABASE_URL.includes(encodeURIComponent(values.POSTGRES_PASSWORD)));
    assert.equal(new URL(services.lobe.environment.DATABASE_URL).hostname, services.postgresql.container_name);
    assert.equal(new URL(services.lobe.environment.REDIS_URL).hostname, services.redis.container_name);
    assert.equal(new URL(services.lobe.environment.S3_INTERNAL_ENDPOINT).hostname, services.rustfs.container_name);
    assert.equal(new URL(services.lobe.environment.SEARXNG_URL).hostname, services.searxng.container_name);
    assert.equal(new URL(services.lobe.environment.AGENT_GATEWAY_INTERNAL_URL).hostname, services.gateway.container_name);
    assert.equal(new URL(services.lobe.environment.DEVICE_GATEWAY_URL).hostname, services.gateway.container_name);
    assert.equal(new URL(services.gateway.environment.LOBE_API_BASE_URL).hostname, services.lobe.container_name);
    assert.equal(new URL(services['rustfs-init'].environment.RUSTFS_ENDPOINT).hostname, services.rustfs.container_name);
    assert.equal(services.lobe.environment.DEVICE_GATEWAY_PUBLIC_URL, env.DEVICE_GATEWAY_PUBLIC_URL);
    assert.equal(services.lobe.environment.DEVICE_GATEWAY_SERVICE_TOKEN, services.gateway.environment.SERVICE_TOKEN);
    assert.equal(services.lobe.environment.AGENT_GATEWAY_SERVICE_TOKEN, services.gateway.environment.SERVICE_TOKEN);
    assert.equal(services.gateway.environment.JWKS_KEY, undefined);
    assert.equal(services.gateway.environment.JWKS_PUBLIC_KEY, values.JWKS_PUBLIC_KEY);
    assert.deepEqual(services.gateway.ports.map(port => port.target).sort(), [8787, 8788]);
    for (const name of ['postgresql', 'redis', 'searxng']) assert(!services[name].ports);
    assert.equal(services['rustfs-init'].restart, 'no');
    assert.equal(services['rustfs-init'].labels.skipStatusCheck, 'true');
    for (const [name, service] of Object.entries(services)) {
      if (name !== 'rustfs-init') assert.equal(service.labels.skipStatusCheck, undefined);
    }
    assert.equal(services.lobe.depends_on['rustfs-init'].condition, 'service_completed_successfully');
    const defaultEnv = { ...env };
    delete defaultEnv.AUTH_ALLOWED_EMAILS;
    const defaultConfig = spawnSync('docker', ['compose', '-f', path.join(dir, 'docker-compose.yml'), 'config', '--format', 'json'], { env: defaultEnv, encoding: 'utf8' });
    assert.equal(defaultConfig.status, 0, defaultConfig.stderr);
    assert.equal(JSON.parse(defaultConfig.stdout).services.lobe.environment.AUTH_ALLOWED_EMAILS, '');
  });
}
