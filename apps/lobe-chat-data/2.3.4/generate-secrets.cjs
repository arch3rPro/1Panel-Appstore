#!/usr/bin/env node
'use strict';

// Run locally with Node.js or pipe into the official LobeHub image's /bin/node.
// Prints new secrets only: never overwrites an existing deployment's .env.
const { generateKeyPairSync, randomBytes } = require('node:crypto');
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const meta = { alg: 'RS256', kid: randomBytes(8).toString('hex'), use: 'sig' };
const values = {
  POSTGRES_PASSWORD: randomBytes(24).toString('hex'),
  RUSTFS_SECRET_KEY: randomBytes(24).toString('hex'),
  KEY_VAULTS_SECRET: randomBytes(32).toString('base64'),
  AUTH_SECRET: randomBytes(32).toString('hex'),
  GATEWAY_SERVICE_TOKEN: randomBytes(32).toString('hex'),
  JWKS_KEY: JSON.stringify({ keys: [{ ...privateKey.export({ format: 'jwk' }), ...meta }] }),
  JWKS_PUBLIC_KEY: JSON.stringify({ keys: [{ ...publicKey.export({ format: 'jwk' }), ...meta }] }),
};
for (const [key, value] of Object.entries(values)) console.log(`${key}=${value}`);
