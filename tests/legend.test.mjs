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

test('overview (target 100) legend thresholds match levelFor bounds', () => {
  const target = 100;
  const tNeg = legendThreshold(-1, target);
  assert.equal(tNeg.title, '0 questions');
  assert.equal(tNeg.pct, '0% of daily target');
  assert.equal(levelFor(0, target), -1);

  const t0 = legendThreshold(0, target);
  assert.equal(t0.title, '1 – 20 questions');
  assert.equal(t0.pct, '1% – 20% of daily target');
  assert.equal(levelFor(1, target), 0);
  assert.equal(levelFor(20, target), 0);
  assert.equal(levelFor(21, target), 1);

  const t1 = legendThreshold(1, target);
  assert.equal(t1.title, '21 – 45 questions');
  assert.equal(t1.pct, '21% – 45% of daily target');
  assert.equal(levelFor(21, target), 1);
  assert.equal(levelFor(45, target), 1);
  assert.equal(levelFor(46, target), 2);

  const t2 = legendThreshold(2, target);
  assert.equal(t2.title, '46 – 70 questions');
  assert.equal(t2.pct, '46% – 70% of daily target');
  assert.equal(levelFor(46, target), 2);
  assert.equal(levelFor(70, target), 2);
  assert.equal(levelFor(71, target), 3);

  const t3 = legendThreshold(3, target);
  assert.equal(t3.title, '71+ questions');
  assert.equal(t3.pct, '> 70% of daily target');
  assert.equal(levelFor(71, target), 3);
  assert.equal(levelFor(150, target), 3);
});

test('maths (target 34) legend thresholds match levelFor bounds', () => {
  const target = 34;
  const tNeg = legendThreshold(-1, target);
  assert.equal(tNeg.title, '0 questions');
  assert.equal(levelFor(0, target), -1);

  const t0 = legendThreshold(0, target);
  assert.equal(t0.title, '1 – 6 questions');
  assert.equal(levelFor(1, target), 0);
  assert.equal(levelFor(6, target), 0);
  assert.equal(levelFor(7, target), 1);

  const t1 = legendThreshold(1, target);
  assert.equal(t1.title, '7 – 15 questions');
  assert.equal(levelFor(7, target), 1);
  assert.equal(levelFor(15, target), 1);
  assert.equal(levelFor(16, target), 2);

  const t2 = legendThreshold(2, target);
  assert.equal(t2.title, '16 – 23 questions');
  assert.equal(levelFor(16, target), 2);
  assert.equal(levelFor(23, target), 2);
  assert.equal(levelFor(24, target), 3);

  const t3 = legendThreshold(3, target);
  assert.equal(t3.title, '24+ questions');
  assert.equal(levelFor(24, target), 3);
  assert.equal(levelFor(50, target), 3);
});

test('physics and chemistry (target 33) legend thresholds match levelFor bounds', () => {
  const target = 33;
  const tNeg = legendThreshold(-1, target);
  assert.equal(tNeg.title, '0 questions');
  assert.equal(levelFor(0, target), -1);

  const t0 = legendThreshold(0, target);
  assert.equal(t0.title, '1 – 6 questions');
  assert.equal(levelFor(1, target), 0);
  assert.equal(levelFor(6, target), 0);
  assert.equal(levelFor(7, target), 1);

  const t1 = legendThreshold(1, target);
  assert.equal(t1.title, '7 – 14 questions');
  assert.equal(levelFor(7, target), 1);
  assert.equal(levelFor(14, target), 1);
  assert.equal(levelFor(15, target), 2);

  const t2 = legendThreshold(2, target);
  assert.equal(t2.title, '15 – 23 questions');
  assert.equal(levelFor(15, target), 2);
  assert.equal(levelFor(23, target), 2);
  assert.equal(levelFor(24, target), 3);

  const t3 = legendThreshold(3, target);
  assert.equal(t3.title, '24+ questions');
  assert.equal(levelFor(24, target), 3);
  assert.equal(levelFor(50, target), 3);
});

test('index.html contains legend tooltip interactions and styles', () => {
  assert.ok(html.includes('.legend i:hover'), 'CSS must include .legend i:hover styling');
  assert.ok(html.includes('data-level='), 'legendHTML must generate swatches with data-level attributes');
  assert.ok(html.includes('legendTipHTML'), 'legendTipHTML function must be implemented');
  assert.ok(html.includes("role=\"tooltip\""), 'tooltip element must exist');
});
