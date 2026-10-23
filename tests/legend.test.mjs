/* Contribution graph legend threshold tests.
   Verifies that the question range shown for each legend box matches the
   activation thresholds in levelFor() across all subject and overview targets. */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const fnRegex = /function\s+levelFor\s*\([\s\S]*?^  \}/m;
const fnThreshRegex = /function\s+legendThreshold\s*\([\s\S]*?^  \}/m;

const levelForMatch = html.match(fnRegex);
const legendThreshMatch = html.match(fnThreshRegex);

assert.ok(levelForMatch, 'levelFor function must exist in index.html');
assert.ok(legendThreshMatch, 'legendThreshold function must exist in index.html');

const evalEnv = new Function(
  'const GOAL = 100;\n' +
  levelForMatch[0] + '\n' +
  legendThreshMatch[0] + '\n' +
  'return { levelFor, legendThreshold };'
)();

const { levelFor, legendThreshold } = evalEnv;

function expectTier(target, level, label, first, last) {
  assert.equal(legendThreshold(level, target), label);
  assert.equal(levelFor(first, target), level);
  assert.equal(levelFor(last, target), level);
  if (level < 3) assert.equal(levelFor(last + 1, target), level + 1);
}

test('empty legend step is zero', () => {
  assert.equal(legendThreshold(-1, 100), '0');
  assert.equal(levelFor(0, 100), -1);
  assert.equal(levelFor(1, 100), 0);
});

test('overview (target 100) ranges match levelFor bounds', () => {
  expectTier(100, 0, '1 – 20', 1, 20);
  expectTier(100, 1, '21 – 45', 21, 45);
  expectTier(100, 2, '46 – 70', 46, 70);
  expectTier(100, 3, '71+', 71, 150);
});

test('maths (target 34) ranges match levelFor bounds', () => {
  expectTier(34, 0, '1 – 6', 1, 6);
  expectTier(34, 1, '7 – 15', 7, 15);
  expectTier(34, 2, '16 – 23', 16, 23);
  expectTier(34, 3, '24+', 24, 50);
});

test('physics and chemistry (target 33) ranges match levelFor bounds', () => {
  expectTier(33, 0, '1 – 6', 1, 6);
  expectTier(33, 1, '7 – 14', 7, 14);
  expectTier(33, 2, '15 – 23', 15, 23);
  expectTier(33, 3, '24+', 24, 50);
});

test('legend tooltip is just the threshold range', () => {
  assert.ok(html.includes('data-level='), 'legendHTML must generate swatches with data-level attributes');
  assert.ok(html.includes('legendTipHTML'), 'legendTipHTML function must be implemented');
  assert.ok(html.includes("return legendThreshold(lvl, target);"), 'tooltip copy must stay a bare range');
  assert.ok(!html.includes('lt-kicker'), 'no extra dialog chrome');
  assert.ok(html.includes('role="tooltip"'), 'tooltip element must exist');
});

test('the legend never claims the graph hook used to build the grid', () => {
  // Regression: putting data-graph on .legend made `$('[data-graph]')` resolve to
  // the legend, so the contribution cells were rendered into the legend row.
  assert.ok(html.includes('<div class="legend" data-legend>'), 'legend must not carry data-graph');
  assert.ok(!html.includes('data-legend data-graph'), 'legend and graph hooks must stay separate');
  assert.ok(html.includes("$('.graph[data-graph]', el)"), 'graph lookup must be scoped to .graph');
});
