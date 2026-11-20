'use strict';
// JSON is valid YAML. Serialize values rather than interpolating secrets into YAML.
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const e = process.env;
const dir = '/data/tdai-memory';
fs.mkdirSync(dir, { recursive: true });
const config = {
  deployMode: 'standalone', stateBackend: 'local',
  server: { host: '0.0.0.0', port: 8420 }, data: { baseDir: dir },
  llm: { baseUrl: e.MEMORY_LLM_BASE_URL, apiKey: e.MEMORY_LLM_API_KEY,
    model: e.MEMORY_LLM_MODEL, maxTokens: 32000, timeoutMs: 300000 },
  memory: {
    promptMode: e.MEMORY_PROMPT_MODE || 'code',
    capture: { enabled: true },
    extraction: { enabled: true, enableDedup: true, maxMemoriesPerSession: 20 },
    persona: { triggerEveryN: 50, maxScenes: 15, triggerMode: 'current' },
    pipeline: { everyNConversations: 5, enableWarmup: true, l1IdleTimeoutSeconds: 600,
      l2DelayAfterL1Seconds: 90, l2MinIntervalSeconds: 900, l2MaxIntervalSeconds: 3600 },
    recall: { enabled: true, maxResults: 5, scoreThreshold: 0.3, strategy: 'hybrid', timeoutMs: 5000 },
    storeBackend: 'sqlite', embedding: { provider: 'none' }
  },
  skill: {
    enabled: true, routing: { mode: 'bm25', searchTopK: 20 },
    extraction: { enabled: true, maxIterations: 16,
      queue: { backend: 'local', keyPrefix: 'tdai', resultTtlSeconds: 86400,
        lockTtlMs: 600000, maxRetries: 2, retryBackoffsMs: [5000, 15000] } },
    resources: { maxResourceSizeBytes: 5000000 }
  }
};
const configFile = '/tmp/1panel-core.json';
fs.writeFileSync(configFile, JSON.stringify(config), { mode: 0o600 });
const child = spawn(process.execPath, ['--import', 'tsx', 'src/gateway/server.ts'], {
  cwd: '/app', stdio: 'inherit', env: { ...e, TDAI_GATEWAY_CONFIG: configFile }
});
let stopping = false;
let initializationFailed = false;
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => {
  stopping = true;
  child.kill(signal);
});
child.on('error', () => { console.error('[1panel] Cannot launch Core'); process.exit(1); });
child.on('exit', code => process.exit(initializationFailed ? 1 : (code ?? (stopping ? 0 : 1))));

async function request(path, body) {
  return fetch(`http://127.0.0.1:8420${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-tdai-service-id': 'default' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(10000)
  });
}
async function initialize() {
  let ready = false;
  for (let i = 0; i < 120 && !stopping; i++) {
    try {
      const r = await fetch('http://127.0.0.1:8420/health', { signal: AbortSignal.timeout(2000) });
      if (r.ok) { ready = true; break; }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (stopping) return;
  if (!ready) throw new Error('Core health check timed out');
  const keyFile = `${dir}/.admin-key`;
  const key = fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim()
    : (e.ADMIN_USER_KEY || `sk-mem-${randomBytes(24).toString('hex')}`);
  // Save before the API call so a crash after creation cannot lose the key.
  fs.writeFileSync(keyFile, key, { mode: 0o600 });
  fs.chmodSync(keyFile, 0o600);
  const r = await request('/v3/internal/meta/user/init-admin', {
    username: e.ADMIN_USERNAME || 'admin', user_key: key
  });
  if (r.status !== 200 && r.status !== 409) throw new Error(`init-admin HTTP ${r.status}`);
  const verified = await request('/v3/meta/auth/verify', { user_key: key });
  const result = verified.ok ? await verified.json() : null;
  if (result?.code !== 0 || result?.data?.valid !== true || !result?.data?.user?.user_id) {
    throw new Error('Stored admin key does not match the database; restore a matching backup');
  }
  fs.writeFileSync(`${dir}/.1panel-initialized`, 'ok\n', { mode: 0o600 });
  console.log('[1panel] Admin initialized and verified. Key: data/core/.admin-key (not printed).');
}
fs.rmSync(`${dir}/.1panel-initialized`, { force: true });
initialize().catch(error => {
  console.error(`[1panel] ${error.message}`);
  initializationFailed = true;
  child.kill('SIGTERM');
});
