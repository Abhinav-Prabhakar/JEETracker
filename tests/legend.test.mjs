/* Contribution graph legend threshold tests.
   Verifies that the threshold calculations for each legend box match the
   activation thresholds in levelFor() across all subject and overview targets. */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// Extract levelFor and legendThreshold directly from index.html to ensure test fidelity
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

const bands = [
  'Up to 20% of target',
  '20 – 45% of target',
  '45 – 70% of target',
  'Above 70% of target'
];

function expectTier(target, level, title, first, last) {
  const th = legendThreshold(level, target);
  assert.equal(th.title, title);
  assert.equal(th.band, bands[level]);
  assert.equal(th.tier, level + 1);
  assert.equal(th.step, 'Tier ' + (level + 1) + ' of 4');
  assert.match(th.aria, new RegExp('Tier ' + (level + 1) + ' of 4, ' +
    title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(levelFor(first, target), level);
  assert.equal(levelFor(last, target), level);
  if (level < 3) assert.equal(levelFor(last + 1, target), level + 1);
}

test('empty legend step is the only zero-question tier', () => {
  const th = legendThreshold(-1, 100);
  assert.equal(th.title, '0 questions');
  assert.equal(th.band, '0% of target');
  assert.equal(th.tier, 0);
  assert.equal(th.step, 'Empty');
  assert.equal(levelFor(0, 100), -1);
  assert.equal(levelFor(1, 100), 0);
});

test('overview (target 100) legend thresholds match levelFor bounds', () => {
  expectTier(100, 0, '1 – 20 questions', 1, 20);
  expectTier(100, 1, '21 – 45 questions', 21, 45);
  expectTier(100, 2, '46 – 70 questions', 46, 70);
  expectTier(100, 3, '71+ questions', 71, 150);
});

test('maths (target 34) legend thresholds match levelFor bounds', () => {
  expectTier(34, 0, '1 – 6 questions', 1, 6);
  expectTier(34, 1, '7 – 15 questions', 7, 15);
  expectTier(34, 2, '16 – 23 questions', 16, 23);
  expectTier(34, 3, '24+ questions', 24, 50);
});

test('physics and chemistry (target 33) legend thresholds match levelFor bounds', () => {
  expectTier(33, 0, '1 – 6 questions', 1, 6);
  expectTier(33, 1, '7 – 14 questions', 7, 14);
  expectTier(33, 2, '15 – 23 questions', 15, 23);
  expectTier(33, 3, '24+ questions', 24, 50);
});

test('legend dialog markup and interaction hooks are present', () => {
  assert.ok(html.includes('.tip.legend-tip'), 'anchored legend dialog styles must exist');
  assert.ok(html.includes('.legend i:hover'), 'legend swatches need a hover affordance');
  assert.ok(html.includes('data-level='), 'legendHTML must generate swatches with data-level attributes');
  assert.ok(html.includes('showLegendTip'), 'showLegendTip function must be implemented');
  assert.ok(html.includes('legendTipHTML'), 'legendTipHTML function must be implemented');
  assert.ok(html.includes('role="tooltip"'), 'tooltip element must exist');
});

test('the legend never claims the graph hook used to build the grid', () => {
  // Regression: putting data-graph on .legend made `$('[data-graph]')` resolve to
  // the legend, so the contribution cells were rendered into the legend row.
  assert.ok(html.includes('<div class="legend" data-legend>'), 'legend must not carry data-graph');
  assert.ok(!html.includes('data-legend data-graph'), 'legend and graph hooks must stay separate');
  assert.ok(html.includes("$('.graph[data-graph]', el)"), 'graph lookup must be scoped to .graph');
});
