import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-dev-server-'));
const originalDataDir = process.env.DATA_DIR;
const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
process.env.DATA_DIR = tmpDir;
delete process.env.BLOB_READ_WRITE_TOKEN;

const { startServer } = await import('../scripts/dev-server.js');

function restoreEnv() {
  if (originalDataDir === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = originalDataDir;
  if (originalBlobToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function rawRequest(port, requestPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ port, path: requestPath }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: Buffer.concat(chunks).toString('utf8') });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

test('dev server: static, api, 404, and traversal', async (t) => {
  const { server, port } = await startServer(0);

  try {
    await t.test('/ serves index.html with rtl body', async () => {
      const res = await fetch(`http://localhost:${port}/`);
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('content-type').startsWith('text/html'));
      const body = await res.text();
      assert.ok(body.includes('dir="rtl"'));
    });

    await t.test('/styles.css serves 200', async () => {
      const res = await fetch(`http://localhost:${port}/styles.css`);
      assert.strictEqual(res.status, 200);
    });

    await t.test('/api/health returns ok json', async () => {
      const res = await fetch(`http://localhost:${port}/api/health`);
      assert.strictEqual(res.status, 200);
      const parsed = await res.json();
      assert.strictEqual(parsed.ok, true);
    });

    await t.test('/api/nope returns 404', async () => {
      const res = await fetch(`http://localhost:${port}/api/nope`);
      assert.strictEqual(res.status, 404);
    });

    await t.test('traversal attempts never leak package.json', async () => {
      const res1 = await rawRequest(port, '/../package.json');
      assert.ok(!res1.body.includes('@vercel/blob'));

      const res2 = await rawRequest(port, '/..%2Fpackage.json');
      assert.ok(!res2.body.includes('@vercel/blob'));
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    restoreEnv();
  }
});
