// Frozen truth table for parent.js codeAccepted(). Run from the repo root.
const { codeAccepted } = await import('file:///C:/Users/dkreinov/claude/english-app/public/views/parent.js');

const cases = [
  ['1234', '1234', true, 'correct code with a stored code'],
  ['9999', '1234', false, 'WRONG code must still be refused'],
  ['1234', '9999', false, 'mismatch the other way'],
  ['', '1234', false, 'empty input'],
  ['   ', '1234', false, 'blank input'],
  [undefined, '1234', false, 'undefined input'],
  [null, '1234', false, 'null input'],
  ['  1234  ', '1234', true, 'typed code is trimmed'],
  ['x', '', true, 'NO stored code -> let the server verify (the reported defect)'],
  ['x', undefined, true, 'undefined stored code -> let the server verify'],
  ['', '', false, 'both empty'],
];

let bad = 0;
for (const [typed, stored, want, name] of cases) {
  const got = codeAccepted(typed, stored);
  if (got !== want) {
    bad++;
    console.log(`FAIL ${name}: codeAccepted(${JSON.stringify(typed)}, ${JSON.stringify(stored)}) = ${got}, want ${want}`);
  }
}
if (bad) {
  console.log(`${bad} case(s) failed`);
  process.exit(1);
}
console.log('TRUTH-TABLE-OK (11 cases)');
