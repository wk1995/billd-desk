const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const ts = require('typescript');

const code = ts.transpileModule(
  fs.readFileSync(
    path.join(__dirname, '../src/utils/network/videoSize.ts'),
    'utf8'
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;
const context = { exports: {} };
vm.runInNewContext(code, context);
const { videoDisplaySize } = context.exports;

test('1:1 physical pixels do not shrink a 1440P image to a smaller window', () => {
  const result = videoDisplaySize(2560, 1440, 2473, 1391, 1, 'native');
  assert.equal(result.width, 2560);
  assert.equal(result.height, 1440);
});
test('1:1 mode accounts for Windows fractional DPI scaling', () => {
  const result = videoDisplaySize(2560, 1440, 2473, 1391, 1.25, 'native');
  assert.equal(result.width * 1.25, 2560);
  assert.equal(result.height * 1.25, 1440);
});
test('fit mode stays inside the window while keeping aspect ratio', () => {
  const result = videoDisplaySize(2560, 1440, 2473, 1391, 1, 'fit');
  assert.ok(result.width <= 2473 && result.height <= 1391);
  assert.ok(Math.abs(result.width / result.height - 16 / 9) < 0.00001);
});
test('missing frame size does not yield NaN styles', () => {
  const result = videoDisplaySize(0, 0, 2473, 1391, 1, 'native');
  assert.equal(result.width, 0);
  assert.equal(result.height, 0);
});
