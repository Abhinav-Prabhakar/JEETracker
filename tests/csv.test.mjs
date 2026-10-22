/* CSV parser, serialiser and merge tests.
   The source of truth is the <csv-core> block in index.html; these tests
   extract it and run it in Node, so the browser and the suite never drift. */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const OPEN = '/* <csv-core>';
const CLOSE = '/* </csv-core> */';
const start = html.indexOf(OPEN);
const end = html.indexOf(CLOSE);
const openEnd = html.indexOf('*/', start);
assert.ok(start >= 0 && end > start && openEnd > start, 'index.html must contain the <csv-core> block');

const source = html.slice(openEnd + 2, end);
const core = new Function(
  source + '\nreturn { CSV_HEADER, csvEscape, csvParseRows, csvHeaderMap, csvLooksLikeHeader, ' +
  'csvCleanDate, csvCleanInt, csvParse, csvSerialize, csvMerge };'
)();

const TODAY = '2026-10-22';

test('serialises the canonical header, ascending rows, CRLF and a recomputed total', () => {
  const text = core.csvSerialize({
    '2026-10-22': { m: 18, p: 9, c: 7 },
    '2024-02-29': { m: 1, p: 2, c: 3 },
    '2025-12-31': { m: 0, p: 4, c: 0 }
  });

  assert.equal(text, [
    'date,maths,physics,chemistry,total',
    '2024-02-29,1,2,3,6',
    '2025-12-31,0,4,0,4',
    '2026-10-22,18,9,7,34',
    ''
  ].join('\r\n'));
  assert.equal(text.includes('\r\n'), true);
  assert.equal(text.includes('\n\n'), false);
});

test('empty data still exports a clean header', () => {
  assert.equal(core.csvSerialize({}), 'date,maths,physics,chemistry,total\r\n');
});

test('quotes fields that contain commas, quotes or newlines (RFC 4180)', () => {
  assert.equal(core.csvEscape('plain'), 'plain');
  assert.equal(core.csvEscape('a,b'), '"a,b"');
  assert.equal(core.csvEscape('say "hi"'), '"say ""hi"""');
  assert.equal(core.csvEscape('two\nlines'), '"two\nlines"');
});

test('row parser handles quoted commas, escaped quotes, CRLF and LF', () => {
  assert.deepEqual(
    core.csvParseRows('date,note\r\n2026-01-01,"a, b"\r\n2026-01-02,"say ""hi"""\r\n'),
    [['date', 'note'], ['2026-01-01', 'a, b'], ['2026-01-02', 'say "hi"']]
  );
  assert.deepEqual(
    core.csvParseRows('a,b\n1,2\n'),
    [['a', 'b'], ['1', '2']]
  );
});

test('row parser strips a UTF-8 BOM and ignores fully blank lines', () => {
  const text = '\uFEFFdate,maths\r\n\r\n2026-01-01,4\r\n,,\r\n';
  assert.deepEqual(core.csvParseRows(text), [
    ['date', 'maths'],
    ['2026-01-01', '4']
  ]);
});

test('header aliases are case-insensitive and whitespace-tolerant', () => {
  const parsed = core.csvParse(
    ' Day , Math , Phys , Chem , Total\r\n2026-01-02,1,2,3,999\r\n',
    TODAY
  );
  assert.equal(parsed.ok, true);
  assert.equal(parsed.skipped, 0);
  assert.deepEqual(parsed.rows, [{ key: '2026-01-02', m: 1, p: 2, c: 3 }]);

  const long = core.csvParse(
    'DATE,Mathematics,Physics,Chemistry\n2026-01-03,4,5,6\n',
    TODAY
  );
  assert.deepEqual(long.rows, [{ key: '2026-01-03', m: 4, p: 5, c: 6 }]);
});

test('a headerless file uses date,maths,physics,chemistry order', () => {
  const parsed = core.csvParse(
    '2026-01-02,1,2,3\n2026-01-03,4,5,6\n',
    TODAY
  );
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.rows, [
    { key: '2026-01-02', m: 1, p: 2, c: 3 },
    { key: '2026-01-03', m: 4, p: 5, c: 6 }
  ]);
});

test('blank numeric cells become zero', () => {
  const parsed = core.csvParse('date,maths,physics,chemistry\n2026-01-02,,2,\n', TODAY);
  assert.deepEqual(parsed.rows, [{ key: '2026-01-02', m: 0, p: 2, c: 0 }]);
});

test('negative values clamp to zero and large values clamp to 9999', () => {
  const parsed = core.csvParse('date,maths,physics,chemistry\n2026-01-02,-4,99999,7\n', TODAY);
  assert.deepEqual(parsed.rows, [{ key: '2026-01-02', m: 0, p: 9999, c: 7 }]);
});

test('non-integer subject values skip the row instead of silently deleting a day', () => {
  const parsed = core.csvParse(
    'date,maths,physics,chemistry\n2026-01-02,3.5,1,1\n2026-01-03,1,2,3\n',
    TODAY
  );
  assert.equal(parsed.skipped, 1);
  assert.deepEqual(parsed.rows, [{ key: '2026-01-03', m: 1, p: 2, c: 3 }]);
  assert.equal(core.csvCleanInt('12abc').ok, false);
  assert.equal(core.csvCleanInt('').value, 0);
  assert.equal(core.csvCleanInt('+7').value, 7);
});

test('future and invalid dates are skipped and counted', () => {
  const text = [
    'date,maths,physics,chemistry',
    '2026-10-23,1,1,1',   // future
    '2026-02-30,1,1,1',   // impossible calendar day
    '22-10-2026,1,1,1',   // wrong shape
    'not-a-date,1,1,1',
    '2024-02-29,1,1,1'    // leap day is valid
  ].join('\n');
  const parsed = core.csvParse(text, TODAY);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.skipped, 4);
  assert.deepEqual(parsed.rows, [{ key: '2024-02-29', m: 1, p: 1, c: 1 }]);
});

test('empty files, bad headers and header-only files report a quiet failure', () => {
  assert.equal(core.csvParse('', TODAY).reason, 'empty');
  assert.equal(core.csvParse(' \r\n\r\n', TODAY).reason, 'empty');
  assert.equal(core.csvParse('date,notes\n2026-01-02,hello\n', TODAY).reason, 'header');
  assert.equal(core.csvParse('date,maths,math\n2026-01-02,1,1\n', TODAY).reason, 'header');
  assert.equal(core.csvParse('date,maths,physics,chemistry,total\n', TODAY).reason, 'rows');
});

test('a file with only invalid rows reports no valid rows and counts them', () => {
  const parsed = core.csvParse(
    'date,maths,physics,chemistry\n2026-10-23,1,1,1\n2026-02-30,1,1,1\n',
    TODAY
  );
  assert.equal(parsed.ok, false);
  assert.equal(parsed.reason, 'rows');
  assert.equal(parsed.skipped, 2);
  assert.deepEqual(parsed.rows, []);
});

test('a bad first data row in a headerless file is skipped, not fatal', () => {
  const parsed = core.csvParse('oops,1,2,3\n2026-01-02,4,5,6\n', TODAY);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.skipped, 1);
  assert.deepEqual(parsed.rows, [{ key: '2026-01-02', m: 4, p: 5, c: 6 }]);
});

test('duplicate dates parse in order and merge last-one-wins', () => {
  const parsed = core.csvParse(
    'date,maths,physics,chemistry\n2026-01-02,1,1,1\n2026-01-02,2,3,4\n',
    TODAY
  );
  assert.equal(parsed.rows.length, 2);
  const merged = core.csvMerge({}, parsed.rows);
  assert.deepEqual(merged.data, { '2026-01-02': { m: 2, p: 3, c: 4 } });
  assert.equal(merged.days, 1);
});

test('merge overwrites all three subjects, deletes all-zero days and preserves absent days', () => {
  const base = {
    '2026-01-01': { m: 10, p: 11, c: 12 },
    '2026-01-02': { m: 20, p: 21, c: 22 },
    '2026-01-03': { m: 30, p: 31, c: 32 }
  };
  const merged = core.csvMerge(base, [
    { key: '2026-01-01', m: 0, p: 0, c: 0 },
    { key: '2026-01-02', m: 4, p: 0, c: 6 }
  ]);

  assert.equal(merged.data['2026-01-01'], undefined);
  assert.deepEqual(merged.data['2026-01-02'], { m: 4, p: 0, c: 6 });
  assert.deepEqual(merged.data['2026-01-03'], { m: 30, p: 31, c: 32 });
  assert.equal(merged.days, 2);
  assert.deepEqual(base['2026-01-01'], { m: 10, p: 11, c: 12 }, 'the input store is not mutated');
});

test('export → import round-trips exactly, including years and sparse subjects', () => {
  const data = {
    '2024-02-29': { m: 5, p: 6, c: 7 },
    '2025-12-31': { m: 0, p: 3, c: 0 },
    '2026-01-01': { m: 1, p: 2, c: 3 },
    '2026-10-22': { m: 18, p: 9, c: 7 }
  };

  const parsed = core.csvParse(core.csvSerialize(data), TODAY);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.skipped, 0);
  assert.deepEqual(core.csvMerge({}, parsed.rows).data, data);
});

test('a zero row in a round-trip removes the day while other days survive', () => {
  const base = {
    '2026-01-01': { m: 4, p: 5, c: 6 },
    '2026-01-02': { m: 7, p: 8, c: 9 }
  };
  const csv = 'date,maths,physics,chemistry,total\r\n2026-01-01,0,0,0,0\r\n';
  const merged = core.csvMerge(base, core.csvParse(csv, TODAY).rows);

  assert.deepEqual(merged.data, { '2026-01-02': { m: 7, p: 8, c: 9 } });
  assert.equal(merged.days, 1);
});

test('a large file parses and merges without losing rows', () => {
  const lines = ['date,maths,physics,chemistry,total'];
  for (let i = 0; i < 5000; i++) {
    const d = new Date(Date.UTC(2000, 0, 1) + i * 86400000).toISOString().slice(0, 10);
    lines.push([d, (i % 40) + 1, (i % 30) + 1, (i % 28) + 1,
      (i % 40) + (i % 30) + (i % 28) + 3].join(','));
  }
  const parsed = core.csvParse(lines.join('\r\n'), '2099-12-31');
  assert.equal(parsed.ok, true);
  assert.equal(parsed.rows.length, 5000);
  assert.equal(parsed.skipped, 0);

  const merged = core.csvMerge({}, parsed.rows);
  assert.equal(Object.keys(merged.data).length, 5000);
  assert.equal(merged.days, 5000);
});
