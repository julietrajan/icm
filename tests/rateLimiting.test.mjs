import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const apiDll = fileURLToPath(new URL('../IncidentManagement.Api/bin/Debug/net10.0/IncidentManagement.Api.dll', import.meta.url));

function request(port, path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, signal: AbortSignal.timeout(5000), ...options }, res => {
      res.resume();
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
    req.end();
  });
}

test('API rate limits are shared per client, replenish, and exclude static files', { timeout: 30000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'icm-rate-limit-'));
  let server;
  try {
    await mkdir(join(root, 'wwwroot'));
    await writeFile(join(root, 'wwwroot', 'index.html'), 'static content');
    server = spawn('dotnet', [apiDll, '--urls', 'http://[::]:0', '--contentRoot', root], {
      env: { ...process.env, ASPNETCORE_ENVIRONMENT: 'Production', RateLimiting__PermitLimit: '3', RateLimiting__WindowSeconds: '2' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const port = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error(`API did not start: ${output}`)), 15000);
      const onData = chunk => {
        output += chunk;
        const match = output.match(/Now listening on: http:\/\/\[::\]:(\d+)/);
        if (match) {
          clearTimeout(timer);
          resolve(Number(match[1]));
        }
      };
      server.stdout.on('data', onData);
      server.stderr.on('data', onData);
      server.once('error', error => { clearTimeout(timer); reject(error); });
      server.once('exit', code => { clearTimeout(timer); reject(new Error(`API exited (${code}): ${output}`)); });
    });

    assert.equal(await request(port, '/api/incidents'), 200);
    assert.equal(await request(port, '/api/health'), 200);
    assert.equal(await request(port, '/api/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' } }), 400);
    assert.equal(await request(port, '/api/incidents'), 429);
    assert.equal(await request(port, '/api/health', { headers: { 'X-Forwarded-For': '203.0.113.1' } }), 429);
    assert.equal(await request(port, '/api/health', { host: '::1' }), 200);
    assert.equal(await request(port, '/index.html'), 200);

    let status = 429;
    for (let attempt = 0; attempt < 30 && status === 429; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      status = await request(port, '/api/health');
    }
    assert.equal(status, 200);
  } finally {
    if (server && server.exitCode === null && server.signalCode === null) {
      server.kill();
      await once(server, 'exit');
    }
    await rm(root, { recursive: true, force: true });
  }
});
