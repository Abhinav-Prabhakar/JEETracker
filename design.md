# JEE Tracker — Design System

**Version 1.4 · October 2026**

A quiet, editorial dashboard for a loud ambition. White space does the work;
colour is information. Every component below follows these rules so that new
surfaces feel like they were drawn by the same hand.

---

## 1. Principles

1. **Quiet surfaces, precise data.** Hairline borders, soft white, no gradients
   on chrome. The information is the decoration.
2. **One brand accent.** Raspberry `#B12F5F` belongs to the product: the mark,
   the overview contribution tracker, focus rings, live markers. Subject data
   uses subject hues, never the accent.
3. **Hover is the second layer.** Secondary data (percentages, best days,
   milestone maths) is tucked behind hover states. Nothing essential is hidden.
4. **Numbers are typography.** Large light numerals, tight tracking, tabular
   figures. A number and its target share one baseline.
5. **Motion confirms, never entertains.** 180–600 ms, one easing family,
   no bouncing carousels. Everything stops under `prefers-reduced-motion`.

---

## 2. Colour

### Brand & neutrals

| Token | Value | Use |
| --- | --- | --- |
| `--accent` | `#B12F5F` | Brand mark, overview heatmap, focus ring, live pin |
| `--accent-ink` | `#8E2449` | Pressed accent, accent text on soft fill |
| `--accent-soft` | `#FBEBF1` | Selected rows, subtle accent wash |
| `--ink` | `#141418` | Headings, values, primary buttons |
| `--ink-2` | `#3F3F49` | Secondary values |
| `--muted` | `#72727D` | Labels, captions, metadata |
| `--faint` | `#9C9CA7` | Tertiary hints, future days |
| `--line` | `#EAEAEF` | Card borders, dividers |
| `--line-strong` | `#DEDEE5` | Hover borders, input rules |
| `--soft` | `#F5F5F8` | Nav track, inactive bars, tooltip rows |
| `--bg` | `#FCFCFD` | Page canvas |

A single soft raspberry radial wash sits behind the top of the page. It must
never become a gradient card.

### Subject identity

| Subject | Token | Hex | Character |
| --- | --- | --- | --- |
| Mathematics | `--m` | `#6366F1` | Indigo — ink-blue, analytical |
| Physics | `--p` | `#F59E0B` | Amber — heat, energy |
| Chemistry | `--c` | `#0D9488` | Teal — glass, solution |

**Physics and Chemistry were swapped from the original build.** Amber is
Physics; teal is Chemistry. Never reintroduce the old mapping.

### Contribution ramp

The overview tracker is **monochrome**. One hue, four densities.

| Step | Mix of `#B12F5F` over white | Meaning |
| --- | --- | --- |
| Empty | `#F3F3F6` | no questions |
| 1 | 26% | under 20% of target |
| 2 | 50% | 20–45% of target |
| 3 | 75% | 45–70% of target |
| 4 | 100% | above 70% of target |

Density is computed against the relevant daily target (100 overall, 34 Maths,
33 Physics, 33 Chemistry). Subject pages reuse the same four steps with their
own hue. Legend copy is always "Less → More"; exact counts live in the tooltip.

A **grace day** is not a density step. When a fully missed day is covered by
streak insurance, the overview cell keeps an `--accent-soft` wash and carries a
single 3.5 px accent dot at 60% opacity. The marker appears on the overview
tracker only; subject trackers never show it. Its tooltip always adds the line
"Grace day · streak protected".

### Dark theme

Dark mode is a designed counterpart, not an inversion. It keeps the same
hierarchy, the same 22 px cards and the same one-hue contribution year. The
subject hues are deliberately unchanged. Tokens live on
`html[data-theme="dark"]`; the light `:root` values are unchanged.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#FCFCFD` | `#0F0F13` | Page canvas |
| `--card` | `#FFFFFF` | `#16161C` | Cards, modals, palette |
| `--soft` | `#F5F5F8` | `#202028` | Nav track, rails, icon wells |
| `--raised` | `#FFFFFF` | `#202028` | kbd, ghost hover, palette icons |
| `--active` | `#FFFFFF` | `#2C2C36` | Active nav pill |
| `--line` | `#EAEAEF` | `#2A2A33` | Hairlines |
| `--line-soft` | `#F2F2F5` | `#22222A` | Inner dividers |
| `--line-strong` | `#DEDEE5` | `#3A3A45` | Hover rules |
| `--ink` | `#141418` | `#F4F4F6` | Headings, values |
| `--ink-2` | `#3F3F49` | `#D8D8DE` | Secondary values |
| `--muted` | `#72727D` | `#A0A0AD` | Labels, metadata |
| `--faint` | `#9C9CA7` | `#7F7F8B` | Tertiary hints |
| `--accent` | `#B12F5F` | `#D45480` | Brand, one-hue tracker, focus |
| `--accent-ink` | `#8E2449` | `#F2A7C0` | Accent text on soft fill |
| `--accent-soft` | `#FBEBF1` | `#2B1720` | Selection, grace wash |
| `--heat-empty` | `#F3F3F6` | `#24242D` | Empty heatmap cell |
| `--tip-bg` | `#141418` | `#2A2A33` | Tooltip / toast surface |
| `--legend-line` | `rgba(20,20,24,.04)` | `rgba(255,255,255,.07)` | Legend swatch edge |

Theme rules:

- The theme resolves in this order: `?theme=dark|light` → saved
  `jee-tracker.theme` → `prefers-color-scheme`. A tiny inline head script sets
  `data-theme` and `<meta name="theme-color">` before the first paint, so there
  is no flash. `color-scheme` follows the theme for native controls.
- A query override is for screenshots and QA; it does not write to
  localStorage. A toggle is an explicit choice and persists.
- `prefers-color-scheme` changes are followed only while there is no saved
  choice. A saved choice or a query override wins.
- The theme toggle sits in the top bar beside the command chip. It is a 28 px
  sun/moon button with an accessible label and a 280 ms icon crossfade.
- `D` toggles the theme on every view, including while a modal is open, but is
  ignored while typing in an input or when a text field has focus.
- The contribution tracker remains **one raspberry hue** in dark. Its ramp is
  blended from `--card`, not from white, so cells stay saturated instead of
  turning pastel. The empty step uses `--heat-empty`.
- CSS colours use tokens. JS-generated chart colours are re-derived from the
  live tokens on every theme change; legends and cached graph colours are
  refreshed rather than reused.
- The weekly snapshot is theme-aware: the share card is drawn in the dark
  palette when the app is dark. It stays one-hue and uses a dark canvas, not a
  translucent overlay.

---

## 3. Typography

- **UI / body:** Inter, weights 300–500, tracking `-0.011em`.
- **Display / numerals:** Inter Tight, weights 200–300, tracking `-0.045em`.
- **Figures:** `font-variant-numeric: tabular-nums` everywhere numbers change.

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| Hero number | 60 px | 200 | `/40` sits inline at 21 px, 300 |
| All-time / AIR | 54 px | 200 | prefixed `#` at 20 px muted |
| View title | 30 px | 300 | tracking `-0.035em` |
| Metric number | 38 px | 200 | |
| Record value | 30 px | 200 | personal-record tile, tabular |
| Body | 13 px | 300 | |
| Metadata | 12 px | 400 | muted |
| Eyebrow / label | 9.5–10 px | 500 | uppercase, `.14–.18em`, muted |

Sentence case for headings. Labels are lowercase in markup where the CSS
uppercases them. No emoji, no exclamation marks.

---

## 4. Space, radius, elevation

- Spacing scale: `4 / 8 / 12 / 14 / 16 / 18 / 20 / 22 / 24 / 32 / 40 / 48`.
- Grid gutter: **14 px**. Card padding: **18–22 px**.
- Radii: cards **22 px**, inner panels **16 px**, controls **10 px**,
  pills **999 px**, heatmap cells **3 px**.
- Elevation: none at rest. On hover only:
  `0 24px 48px -32px rgba(20,20,24,.35)`.
- Card hover: border → `--line-strong`, `translateY(-2px)`.

### Page

`max-width: 1140px`, side padding `32px` (22 px under 900 px).
Top bar 68 px, sticky, `backdrop-filter: blur(14px)` at 82% canvas opacity.

### Grids

| Region | Columns |
| --- | --- |
| Today cards | `repeat(3, 1fr)` |
| All-time + rank | `1.2fr 0.8fr` |
| Metrics | `repeat(3, 1fr)` |
| Overview metrics | `repeat(4, 1fr)`, 2 × 2 at ≤980 px, one column at ≤640 px |
| Personal records | `repeat(4, 1fr)`, 2 × 4 at ≤980 px |
| Heatmap | flexible, horizontal scroll below ~720 px |

Below 900 px everything becomes one column; the nav moves to a second row.

---

## 5. Components

### Top bar
Hairline appears only after 8 px of scroll. Brand mark is a 20 px raspberry
tile with three white bars — a chart, a flag, a monogram. Nav is a segmented
control on `--soft`; active item is white in light, `--active` in dark, with a
1 px shadow. The theme toggle sits left of the `⌘K` chip: a 28 px hairline
circle whose sun and moon crossfade with a slight rotation. Its label changes
to "Switch to light theme" / "Switch to dark theme".

### Subject card (Today)
1. Eyebrow row: hue dot, uppercase subject, `1,204 all-time` on the right.
2. Display row: today count (60 px) + `/40` (21 px) sharing a baseline,
   steppers (`−`, `+`) at the trailing edge.
3. 3 px progress rail in the subject hue.
4. Hover foot: `55% of target` and `best 47` fade up. Never reserve more
   than 14 px for it.

### All-time card
Eyebrow + `in 2026` (or `since 2025` when older data exists), 54 px total, a
7 px stacked composition bar (subject hues), then a three-item legend with
values. Hovering a segment shows count and share. Zero state shows a single
soft rail.

### Simulated AIR card
`SIMULATED AIR` + `JEE ADVANCED` tag. Rank is `#` + 54 px number, with a
`top 1.7%` chip. Below, an equal-step milestone rail: 200k · 50k · 10k · 5k ·
500 · 1. The accent pin and fill interpolate inside each milestone segment.
Hover a stop for the exact question threshold. The footer always names the
next milestone and the questions remaining.

### Metric card
Label, 38 px value + unit, one visual, one caption line. Visuals are never
decorative: week bars (7), streak ticks (14), 30-day sparkline. Hover any
bar or tick for the day's count. The main number of **Last 7 days** is also
hoverable (`cursor: help`): it shows a dotted underline on hover and a tooltip
comparing this week's average with the previous week, both to one decimal.

### Grace bank (overview only)
The fourth overview metric, native to the metric grid: label `Grace bank`,
38 px bank count + `of 2`, then a visual row of two 21 px shield icons and a
five-segment rail. A filled raspberry shield with a white tick is a banked
token; an outlined shield is empty. The rail shows progress toward the next
token; when the bank is full the rail is empty and the caption reads
`Bank full`. Captions: `3 target days to next`, `Bank full`, `0 banked`.

Hovering anywhere on the card reveals tokens earned, tokens used, and up to
three recent covered dates. When the bank increases, the shield pair scales to
1.14 for 420 ms and settles. The card is keyboard focusable and carries the
same information in its `aria-label`. Subject pages keep three metric cards —
insurance is an overall concept.

### Streak insurance rules
- Earn **1 token** for every **5 consecutive days** at or above the overall
  daily goal (`GOAL = 100`). Bank at most **2**. A past below-goal day resets
  the five-day progress; at the cap the cycle still resets without earning.
- A fully missed day (`0` questions) spends one token automatically **only**
  while the question streak is alive. That day becomes a *grace day*: it counts
  toward current and best streaks (overall and subject), but it is not a target
  day and never advances the five-day earning progress.
- A non-zero day below target keeps the question streak alive, resets earning
  progress, and spends nothing.
- Today can earn a token immediately but never spends one and never resets
  carried progress; the day is still in progress.
- Bank, progress, earned, used and covered days are **derived by replaying
  history on every render**. Nothing new is persisted, so undo, import, export
  and cross-tab sync stay consistent for free.

### Subject today control
A 270 px bordered pill at the right of the subject header: eyebrow `TODAY`,
40 px current count with the 16 px target on the same baseline, a subject-hue
rail, and the same `−` / `+` steppers. It is the only elevated control on a
subject page and lifts 2 px on hover.

### Contribution tracker
Full-year calendar, Sunday-start columns, 13 px cells with 3 px gaps.
Weekday labels `Mon / Wed / Fri`. Month labels sit above the first column of
each month, 9 px. Today has a 1 px accent ring. Future days are 32% opacity
and not interactive. Grace days carry the soft accent wash and dot described
in §2, with the tooltip line "Grace day · streak protected". Clicking any past
day opens the day editor. The header carries year total + active days; the
legend carries density only.

### Personal records (overview only)
A closing all-time plaque after the contribution year: eight compact tiles on
a 4 × 2 hairline grid (2 × 4 below 980 px), inside one full-width card. Header:
`Personal records` + `all time`; no CTA. About 277 px tall on desktop.

| Row | Tiles |
| --- | --- |
| Overall | Best day · Best 7 days · Best month · Days active |
| Performance | Triple Master · Maths peak · Physics peak · Chem peak |

Each tile: an uppercase 9 px label, a 22 px glyph at the trailing edge, a
30 px Inter Tight 200 value with tabular figures, and one quiet date/range
caption. Tiles are `tabindex="0"` with an `aria-label`; hover and keyboard
focus both open the standard dark tooltip with subject splits, exact ranges,
or comparison copy such as "above your active-day average". No essential
number is hidden.

Glyphs are data, not decoration: three subject-hued composition bars (best
day), seven raspberry density bars (best week), a twelve-bar month strip with
the winning month in full accent (best month), a raspberry ring of active days
over the calendar span (days active), three subject dots (Triple Master), and
a subject-hue rail with a 50% target tick and a record dot (subject peaks).
The overview tracker stays monochrome; subject hues appear only where the
record itself is subject data. Values count up on change; hover is a 200 ms
wash with no lift.

Empty state: a quiet `—` and a short caption (`no data yet`, `no triple yet`);
never a fake date or a zero record. Records replay from the whole store on
every render — no new persisted state. Definitions:

- **Best day** — highest total in one calendar day.
- **Best 7 days** — highest sum of any seven consecutive calendar days,
  including zero-question days inside the window.
- **Triple Master** — longest run of consecutive days meeting all three
  targets (Maths 34, Physics 33, Chemistry 33); a missing or below-target day
  breaks it.
- **Subject peaks** — highest Maths / Physics / Chemistry count in one day.
- **Best month** — highest total in a local `YYYY-MM` month.
- **Days active** — days with at least one question, across all years.

### Tooltip
Fixed, `--tip-bg` (near-black in light, elevated graphite in dark), 9 px
radius, 11 px text, single 5 px hue dots per row, never wider than 260 px.
Replaces itself; never stacks. The tooltip stays an ink surface in both
themes — it never becomes a light card on dark.

### Day editor
Up to 430 px modal, blurred canvas behind. Rows: hue dot, subject, `−`, numeric
input, `+`, with a 2 px target rail underneath. Footer: total / 100, clear,
Done. Inputs commit on every keystroke; `Esc` closes; undo is global.

### Command palette
560 px, 20 px radius, search row, grouped commands, 10 px rows. Selected row
uses `--soft` plus a 2 px accent bar. Shortcut chips on the right. Opens with
`⌘K` / `Ctrl K`.

### Weekly snapshot (overview)
A ghost action in the overview header, aligned right: a small image glyph and
`Weekly snapshot` at 11.5 px in `--muted`, on a hairline ghost pill. It is an
optional share action — never a filled primary CTA. The same action is available
as `Create weekly snapshot` in the palette and on `W`; the shortcut appears in
the help sheet.

### Snapshot modal
A light blurred backdrop (the standard 10 px backdrop) and a 404 px modal.
Header: `SHARE CARD` eyebrow, `Weekly snapshot` title, close X. The preview is
the actual generated 1080 × 1920 PNG, scaled down with CSS to the modal width
and constrained by the viewport height, with 18 px corners and one deep soft
shadow. Footer: quiet `1080 × 1920 · jee-week-YYYY-MM-DD.png` metadata and a
single action row — **Download PNG** (ink primary), **Share** (file share,
hidden when the browser cannot share files) and **Copy** (hidden when
`ClipboardItem` is unavailable). Success and failure both raise a toast.

`Esc`, the X and a backdrop click close it. Scroll locks, other overlays close
first, and the overlay stack closes the snapshot before the palette, help sheet
or editor. Focus is trapped inside the dialog; on close it returns to the
trigger when that trigger is still visible, otherwise to the overview snapshot
button or the active nav item. The image is redrawn from current data on every
open; no state is persisted.

### Snapshot canvas
Drawn with Canvas 2D at exactly **1080 × 1920** — phone story aspect, 84 px side
margins. `document.fonts.ready` (with a 900 ms fallback) runs before drawing so
Inter and Inter Tight are used when available. No image library, no DOM
capture. One very soft raspberry radial wash sits behind the top; everything
else is flat. The palette is read from the live theme at draw time, so the card
is light-on-paper in light mode and a deep graphite card in dark mode. The
layout, density ramp and hierarchy are identical in both.

| Region | Spec |
| --- | --- |
| Brand | 46 px raspberry tile with the white bars, `JEE Tracker`, right-aligned `WEEKLY SNAPSHOT` eyebrow at 16 px |
| Date | Last seven days, e.g. `16 — 22 October 2026`, 29 px Inter Tight 300 |
| Hero | `TOTAL THIS WEEK` eyebrow, total at 218 px Inter Tight 200, `questions` at 30 px |
| Balance | Delta pill (`+34 above target` / `−126 below target`), 12 px rail, ink target tick with a canvas-coloured halo, `target 700` under the tick. Scale is `max(week, 700) × 1.08` |
| Week row | Exactly seven 120 × 106 cells, 15 px radius, 12 px gap; the §2 raspberry density ramp; three-letter weekday above, count below; today carries a 2 px accent outline offset 5 px |
| Streak | 52 × 60 shield, current streak at 100 px, personal best beneath; two 28 × 32 grace shields and `n of 2 banked` on the right |
| Subjects | Three columns: hue dot, name, 56 px value with its weekly target (`/ 238` for Maths, `/ 231` for Physics and Chemistry), 6 px subject-hue rail |
| Footer | `all-time solved` on the left, `SIMULATED AIR` + `#` rank on the right, then the tiny `local-first · jeetracker` mark and date |

The snapshot uses one accent only (plus subject hues in the subject row). Text
stays left-aligned and editorial; no table, no dense grid, no fake chrome.

### Install affordance & sheet
Installation is a quiet convenience, never a campaign. The only persistent
entry points are a text action in the footer (`Install app`, 10.5 px in
`--muted`, 11 px device/download glyph) and **Install app** in the command
palette under `App`. There is no banner, no floating CTA and no modal on first
visit. **I** invokes the same flow from any view, outside a text field and the
open overlays.

- If the browser fires `beforeinstallprompt`, the event is captured and the
  native prompt is shown on demand. The app never prompts by itself.
- If no prompt is available, a 430 px sheet explains the current platform:
  iPadOS/iOS Safari → `Share → Add to Home Screen`; macOS Safari 17+ →
  `File → Add to Dock`; Windows/macOS Chromium → browser menu →
  `Install JEE Tracker` / `Apps → Install this site as an app`; Firefox →
  open in Chrome or Edge. iPadOS is detected as `MacIntel` plus touch points,
  never as macOS.
- Standalone launches say `Already installed`. `appinstalled` hides the footer
  affordance and raises the standard `Installed` toast.
- The sheet reuses the standard backdrop, modal radius, shadow, `Esc`, backdrop
  click, close X, scroll lock and focus trap. It closes other overlays first and
  returns focus to its trigger. Content: an eyebrow, title, one-sentence lead,
  up to three numbered steps, one quiet note, and a small ink `Got it` action at
  the editor's `.btn done` scale. No accent fill, no illustration, no banner.

### PWA assets
`manifest.webmanifest`, `sw.js` and `assets/icons/` live at the repo root. All
manifest URLs are relative so `start_url`, `scope` and the worker stay inside
`/jeetrack/` on GitHub Pages.

| Asset | Rule |
| --- | --- |
| `icon-192.png`, `icon-512.png` | Raspberry rounded tile (`--accent` `#B12F5F`), three white bars, transparent corners, `purpose: any` |
| `maskable-512.png` | Full-bleed raspberry, mark entirely inside the 80% safe circle |
| `apple-touch-icon.png` | 180 × 180, opaque full-bleed (iOS supplies the mask) |
| `favicon-32.png` | 32 × 32, same mark, crisp at tab size |
| Screenshots | `assets/preview.png` 1440 × 1440 `wide`; `assets/week-card.png` 1080 × 1920 `narrow` |

The icons use no gradients, shadows or theme-dependent colour: the same file
must read on a light or dark home screen. The inline SVG favicon stays as the
vector fallback; the PNG is the installable/tab asset.

The service worker precaches only the shell (`./`, `index.html`, manifest,
icons). Navigation is **network-first** with the cached index as the offline
fallback, so an online load always sees a new GitHub Pages deploy. Same-origin
assets are stale-while-revalidate. Cross-origin font requests are left to the
browser and fall back to system fonts offline. Old `jee-tracker-*` caches are
deleted on activate. Heavy README screenshots are never precached, and
non-icon raster images are left out of runtime caching too — the browser's
install UI can still fetch them from the network.

### CSV export & import
A spreadsheet path beside the JSON backup: same local store, same commit and
undo rules, no library. The parser and writer live in one DOM-free
`<csv-core>` block in `index.html`, tested directly from Node.

**Export.** Header `date,maths,physics,chemistry,total`, then one row per
stored day, ascending by ISO date across every year. `total` is the
recomputed sum. Fields use RFC 4180 quoting (commas, quotes and newlines are
quoted, `"` becomes `""`) and rows end in CRLF. UTF-8, no BOM — the payload is
plain ASCII. The download is a Blob plus anchor named
`jee-tracker-YYYY-MM-DD.csv` (the export date), and the toast reads
`Exported N days as CSV`.

**Import.** A hidden input separate from the JSON one (`accept=".csv,text/csv"`).
The header is case-insensitive:

| Field | Accepted names |
| --- | --- |
| date | `date`, `day` |
| maths | `maths`, `math`, `mathematics`, `m` |
| physics | `physics`, `phys`, `p` |
| chemistry | `chemistry`, `chem`, `c` |
| total | `total` — optional, ignored and recomputed |

If the first cell is not a date alias, the file is read as headerless in the
canonical order `date,maths,physics,chemistry`. The reader handles quoted
fields, doubled quotes, commas inside quotes, CRLF / LF / CR, blank lines and
an optional UTF-8 BOM.

Dates must be real ISO `YYYY-MM-DD` keys (the app's storage format), from 1900
onward and never in the future. Anything else skips that row. Subject values
must be integers; blank cells are `0`, negatives clamp to `0`, values above
`9999` clamp to `9999`, and a non-numeric value skips the row rather than
silently becoming zero. An absent subject column also reads as `0`. Duplicate
dates are allowed: the last row wins.

**Merge.** Each valid row overwrites that day's Maths, Physics and Chemistry.
A row of three zeros deletes the day. Days absent from the file are untouched.
The whole file is one `commit()`: one undo snapshot, one persist, one toast —
`Imported N days · M rows skipped`. Empty files, a bad header and files with
no valid rows raise a quiet toast and change nothing.

**Entry points.** Footer `Export CSV · Import CSV · Backup JSON · Restore JSON`
(wrapping into three quiet lines on mobile), palette `Export CSV` /
`Import CSV`, and <kbd>E</kbd> / <kbd>⇧</kbd><kbd>E</kbd>. Shortcuts pause
while typing and while a day editor or overlay is open.

### Toast
Dark pill, bottom centre, check glyph, optional **Undo** in accent-soft.
Maximum three, 2.8 s, slides 10 px.

### Buttons & keys
Primary: `--btn-bg`, `--btn-ink`, 12 px (ink in light; near-white with dark
text in dark). Steppers: 30 px circles, hairline, hover ink border and lift.
`kbd`: 10 px, `--raised`, hairline, 5 px radius.

---

## 6. Motion

| Motion | Duration | Easing |
| --- | --- | --- |
| Hover / colour | 180–250 ms | `ease` |
| Bars, rails, pins | 600–700 ms | `cubic-bezier(.22,.8,.24,1)` |
| Number count-up | 520 ms | cubic ease-out |
| View enter | 420 ms, 10 px rise | `cubic-bezier(.22,.8,.24,1)` |
| Heatmap first paint | 500 ms, 4 ms per column | `cubic-bezier(.2,.8,.2,1)` |
| Grace bank pop | 420 ms, 1.14 scale | `cubic-bezier(.22,.8,.24,1)` |
| Snapshot modal | 320 ms, 10 px rise | `cubic-bezier(.22,.8,.24,1)` |
| Install sheet | 320 ms, 10 px rise | `cubic-bezier(.22,.8,.24,1)` |
| Snapshot loading label | 1.4 s opacity pulse | `ease-in-out` |
| Theme icon crossfade | 280 ms, 42 ms rotation | `cubic-bezier(.22,.8,.24,1)` |

No parallax, no autoplay, no looping animation. `prefers-reduced-motion:
reduce` removes transforms and count-ups.

---

## 7. Accessibility & content

- Focus ring: `2px solid var(--accent)`, offset `2px`. Never `outline: none`
  without a replacement.
- Primary controls are ≥ 28 px. Heatmap cells are the deliberate exception (13 px);
  they carry `aria-label`s and today's cell is a keyboard entry point.
- Colour is never the only carrier: AIR has text labels, streaks have pills.
- Personal-record tiles are focusable and expose their tooltip copy through
  an `aria-label`.
- The theme toggle has a live `aria-label` and `aria-pressed`; `D` toggles it
  everywhere except while typing.
- Muted text is checked against the live card surface in both themes: dark
  `#A0A0AD` on `#16161C` is 6.97:1; faint `#7F7F8B` is 4.56:1.
- Keyboard map is documented in-app (`?`) and in the README. `D` toggles the
  theme and `I` opens the install flow; `E` exports CSV and `⇧E` opens the CSV
  picker. All are ignored while typing.
- Voice: short, lowercase metadata, Indian exam context. "Simulated AIR" is
  always labelled as an estimate.

---

## 8. Do / Don't

| Do | Don't |
| --- | --- |
| Use one accent for the overview heatmap | Rainbow heatmaps on the overview |
| Put targets on the same baseline as counts | Stack `/40` under the number |
| Hide percentages until hover | Fill every card with three lines of copy |
| Use subject hues only for subject data | Tint whole cards with subject hues |
| Keep borders 1 px `--line` | Use shadows at rest |
| Animate one property at a time | Animate layout height or width together |
| Treat dark as its own token set | Invert the light theme with filters |
| Blend dark charts from `--card` | Blend chart cells toward white on dark |

---

## 9. Implementation map

CSS custom properties live in `:root` and `html[data-theme="dark"]` in
`index.html`. Components use `data-*` hooks only for behaviour; visual class
names are stable:

`.card`, `.subject-card`, `.alltime`, `.rankcard`, `.metric`, `.contrib`,
`.records`, `.rec-grid`, `.rec`, `.rec-vis`, `.rv-bars`, `.rv-dots`,
`.rv-rail`, `.rv-ring`,
`.view-head`, `.eyebrow`, `.num-display`, `.target`, `.steps`, `.step`,
`.bar`, `.rail`, `.legend`, `.graph`, `.ggrid`, `.cell`, `.palette`, `.toast`,
`.grace`, `.shield`, `.grace-rail`, `.tipnum`,
`.theme-btn`, `.theme-ico`,
`.snap-btn`, `.snapshot-modal`, `.snap-head`, `.snap-preview`, `.snap-loading`,
`.snap-bar`, `.snap-meta`, `.snap-actions`, `.snap-note`,
`.install-modal`, `.install-lead-row`, `.install-glyph`, `.install-kicker`,
`.install-lead`, `.install-steps`, `.install-step`, `.install-step-n`,
`.install-note`, `.install-foot`, `.install-meta`,
`.foot`, `.foot-left`, `.foot-right`, `.foot-note`, `.foot-actions`.

The snapshot canvas itself is procedural (`drawWeekCard` in `index.html`), so it
introduces no new DOM classes beyond the modal above. Theme plumbing is
`syncThemeTokens` → `paintTheme` → `refreshLegends` → `render`; the snapshot
palette is `snapPalette()`. The inline head boot script owns first paint.
PWA plumbing lives in `initPWA`, `openInstall`, `openInstallSheet`,
`installPlatform`, `registerServiceWorker`, and `handleLaunchAction`; the
manifest and worker stay static at the repo root.

CSV plumbing lives inside the `<csv-core>` block (`csvParseRows`,
`csvHeaderMap`, `csvCleanDate`, `csvCleanInt`, `csvParse`, `csvSerialize`,
`csvMerge`) plus the thin `exportCSV` / `importCSV` UI wrappers and the two
hidden file inputs. `tests/csv.test.mjs` extracts that block, so the suite and
the browser share one implementation.


Future components must reuse these tokens and classes before introducing new
ones. Additions belong in this document first.
