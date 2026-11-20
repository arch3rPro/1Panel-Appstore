'use strict';
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const e = process.env;
const data = '/data/tdai-memory-proxy';
// The upstream Proxy runs as uid 10001. Prepare only its bind-mounted directory,
// then drop privileges before writing config or launching the actual service.
if (process.getuid() === 0) {
  fs.mkdirSync(data, { recursive: true });
  fs.chownSync(data, 10001, 10001);
  process.setgid(10001);
  process.setuid(10001);
}
const endpoint = e.CORE_URL;
const config = {
  server: { host: '0.0.0.0', port: 8096, forwardTimeoutMs: 600000 },
  upstream: { url: e.PROXY_UPSTREAM_URL, apiKey: e.PROXY_UPSTREAM_API_KEY },
  log: { file: '', level: 'info', backend: 'console' },
  tdai: { enabled: true, endpoint, apiKey: 'local', serviceId: 'default',
    memory: { enabled: true, inject: true, writeL0: true, recallL1: true, injectL2L3: true } },
  skill: { endpoint, serviceToken: 'local' },
  knowledge: { enabled: true, endpoint, serviceToken: 'local', serviceId: 'default' },
  auth: { enabled: true, url: endpoint, timeoutMs: 5000 },
  sessionInit: { enabled: true, maxRetries: 3, injectAgentContext: true, injectTaskContext: true,
    headerAutoSelect: { enabled: true, teamHeader: 'x-team-id', agentHeader: 'x-agent-id',
      taskHeader: 'x-task-id', onMismatch: 'form' } },
  costGuard: { enabled: false },
  injection: { enabled: true, injectors: ['skill', 'knowledge', 'tdai-memory'] },
  redis: { enabled: false },
  admin: { apiKey: e.PROXY_ADMIN_API_KEY }
};
const configFile = '/tmp/1panel-proxy.json';
fs.writeFileSync(configFile, JSON.stringify(config), { mode: 0o600 });
const child = spawn(process.execPath, ['--import', 'tsx/esm', 'src/index.ts', '--config', configFile], {
  cwd: '/app', stdio: 'inherit'
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
child.on('error', () => { console.error('[1panel] Cannot launch Proxy'); process.exit(1); });
child.on('exit', code => process.exit(code ?? 1));
