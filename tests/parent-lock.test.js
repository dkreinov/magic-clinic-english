import test from 'node:test';
import assert from 'node:assert';

const { codeAccepted } = await import('../public/views/parent.js');

test('a stored code must match exactly', () => {
  assert.strictEqual(codeAccepted('1234', '1234'), true);
  assert.strictEqual(codeAccepted('9999', '1234'), false);
  assert.strictEqual(codeAccepted('1234', '9999'), false);
});

test('an empty or blank code is always rejected', () => {
  assert.strictEqual(codeAccepted('', '1234'), false);
  assert.strictEqual(codeAccepted('   ', '1234'), false);
  assert.strictEqual(codeAccepted(undefined, '1234'), false);
  assert.strictEqual(codeAccepted(null, '1234'), false);
  assert.strictEqual(codeAccepted('', ''), false);
});

test('the typed code is trimmed before comparison', () => {
  assert.strictEqual(codeAccepted('  1234  ', '1234'), true);
});

test('with no stored code the typed code is accepted so the server can verify it', () => {
  assert.strictEqual(codeAccepted('anything', ''), true);
  assert.strictEqual(codeAccepted('anything', undefined), true);
});

test('a wrong code is still refused whenever a code is stored', () => {
  for (const typed of ['0000', 'abcd', '1235', ' 1234x']) {
    assert.strictEqual(codeAccepted(typed, '1234'), false);
  }
});
