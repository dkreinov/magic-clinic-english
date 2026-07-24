import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

test('package.json parses and has expected fields', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.strictEqual(pkg.type, 'module');
  assert.strictEqual(pkg.scripts.test, 'node --test');
});

test('vercel.json parses as JSON', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.ok(config);
});

test('.env.example contains all three key names', () => {
  const contents = readFileSync('.env.example', 'utf8');
  assert.ok(contents.includes('OPENAI_API_KEY='));
  assert.ok(contents.includes('BLOB_READ_WRITE_TOKEN='));
  assert.ok(contents.includes('ANTHROPIC_API_KEY='));
});

test('.gitignore contains .env and .data/', () => {
  const contents = readFileSync('.gitignore', 'utf8');
  assert.ok(contents.includes('.env'));
  assert.ok(contents.includes('.data/'));
});
