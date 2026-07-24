import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadProfile, saveProfile } from '../lib/store.js';
import { defaultProfile } from '../lib/profile.js';

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-store-'));
  const originalDataDir = process.env.DATA_DIR;
  const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.DATA_DIR = tmpDir;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  return Promise.resolve()
    .then(() => fn(tmpDir))
    .finally(() => {
      if (originalDataDir === undefined) delete process.env.DATA_DIR;
      else process.env.DATA_DIR = originalDataDir;
      if (originalBlobToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
      else process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
}

test('loadProfile returns null when nothing is stored yet', async () => {
  await withTempDataDir(async () => {
    const result = await loadProfile();
    assert.strictEqual(result, null);
  });
});

test('saveProfile writes profile.json to DATA_DIR', async () => {
  await withTempDataDir(async (tmpDir) => {
    const profile = defaultProfile();
    await saveProfile(profile);
    const filePath = path.join(tmpDir, 'profile.json');
    assert.ok(fs.existsSync(filePath));
    const onDisk = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.strictEqual(onDisk.version, 1);
  });
});

test('loadProfile returns the saved profile', async () => {
  await withTempDataDir(async () => {
    const profile = defaultProfile();
    profile.learner.heroineName = 'Nour';
    await saveProfile(profile);
    const loaded = await loadProfile();
    assert.strictEqual(loaded.learner.heroineName, 'Nour');
    assert.strictEqual(loaded.version, 1);
  });
});

test('saveProfile bumps meta.updatedAt on each save', async () => {
  await withTempDataDir(async () => {
    const profile = defaultProfile();
    const first = await saveProfile(profile);
    const firstUpdatedAt = first.meta.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));

    const second = await saveProfile(profile);
    const secondUpdatedAt = second.meta.updatedAt;

    assert.ok(Date.parse(secondUpdatedAt) >= Date.parse(firstUpdatedAt));
    assert.notStrictEqual(secondUpdatedAt, firstUpdatedAt);
  });
});
