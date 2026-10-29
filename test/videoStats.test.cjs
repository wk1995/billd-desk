const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const ts = require('typescript');

const code = ts.transpileModule(
  fs.readFileSync(
    path.join(__dirname, '../src/utils/network/videoStats.ts'),
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
const { collectVideoMetrics } = context.exports;
const sample = (timestamp, bytes, frames, incoming = false) =>
  new Map([
    [
      'video',
      {
        id: 'video',
        type: incoming ? 'inbound-rtp' : 'outbound-rtp',
        kind: 'video',
        timestamp,
        frameWidth: 2560,
        frameHeight: 1440,
        ...(incoming
          ? { bytesReceived: bytes, framesDecoded: frames }
          : { bytesSent: bytes, framesEncoded: frames }),
      },
    ],
  ]);

test('actual sending rate uses byte/frame deltas, not a configured ceiling', () => {
  const previous = new Map();
  assert.equal(
    collectVideoMetrics(sample(1000, 0, 0), previous)[0].bitrateKbps,
    undefined
  );
  const row = collectVideoMetrics(sample(2000, 750000, 30), previous)[0];
  assert.equal(row.bitrateKbps, 6000);
  assert.equal(row.fps, 30);
  assert.equal(row.width, 2560);
  assert.equal(
    collectVideoMetrics(sample(3000, 750000, 30), previous)[0].bitrateKbps,
    0
  );
});

test('receiving rate uses received bytes and decoded frames', () => {
  const previous = new Map();
  collectVideoMetrics(sample(1000, 1000, 20, true), previous);
  const row = collectVideoMetrics(sample(2000, 501000, 45, true), previous)[0];
  assert.equal(row.stage, '接收');
  assert.equal(row.bitrateKbps, 4000);
  assert.equal(row.fps, 25);
});

test('counter resets and duplicate timestamps do not produce fake rates', () => {
  const previous = new Map();
  collectVideoMetrics(sample(1000, 1000, 30), previous);
  assert.equal(
    collectVideoMetrics(sample(2000, 0, 0), previous)[0].bitrateKbps,
    undefined
  );
  assert.equal(
    collectVideoMetrics(sample(2000, 1000, 30), previous)[0].bitrateKbps,
    undefined
  );
  collectVideoMetrics(new Map(), previous);
  assert.equal(previous.size, 0);
});
