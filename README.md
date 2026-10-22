<div align="center">
  <img src="assets/banner.svg" width="100%" alt="JEE Tracker — a quiet dashboard for a loud ambition">
</div>

<h1 align="center">JEE Tracker</h1>

<p align="center">
  <strong>Track every question. Watch the year fill in. Keep the streak alive.</strong><br>
  A local-first, single-file dashboard for JEE preparation — built around one hue, real habits,
  and a simulated All India Rank that rewards consistency.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#the-dashboard">Dashboard</a> ·
  <a href="#weekly-snapshot">Snapshot</a> ·
  <a href="#simulated-air">AIR model</a> ·
  <a href="#keyboard">Shortcuts</a> ·
  <a href="#data--persistence">Data</a> ·
  <a href="design.md">Design system</a>
</p>

<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=141418">
  <img alt="localStorage" src="https://img.shields.io/badge/storage-localStorage-B12F5F?style=flat-square&labelColor=141418">
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-141418?style=flat-square">
  <img alt="Responsive" src="https://img.shields.io/badge/layout-responsive-B12F5F?style=flat-square&labelColor=141418">
</p>

![Overview — demo history loaded on first run](assets/preview.png)

> **Demo data.** On first launch the app seeds roughly six months of history,
> ending with a believable two-week sprint, so the year, streaks, records and a
> banked grace token have something to show. Clear it in one step with
> <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> → **Clear all data** (undoable), then log your own questions.

---

## Quick start

No install. No build. No account.

```bash
cd JEETrack
open index.html          # macOS
# or just drag index.html into any browser
```

Prefer a local server? Any static server works:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

**Requirements:** a modern browser. That is the whole list.

---

## The dashboard

### Overview

| Surface | What it does |
| --- | --- |
| **Today cards** | One card per subject. The count and its `/40`, `/30`, `/30` target share a single baseline; hover the card for the percentage and your best day. `−` / `+` write straight to today. |
| **All time** | Total questions solved, with a one-line composition bar and per-subject values: Maths · Physics · Chemistry. |
| **Simulated AIR** | A playful JEE Advanced rank derived from all-time questions, shown with a milestone rail and the next target. Hover a milestone to see its threshold. |
| **Last 7 days** | Seven bars, one per day, with the change against the previous week. Hover any bar for that day's count; hover the main number for the rolling daily average versus the week before. |
| **Best streak** | Personal best (in days), the current run, and a fourteen-day tick strip. |
| **Daily average** | A thirty-day mean with a sparkline and your peak day. |
| **Grace bank** | Streak insurance: two shield tokens, a five-segment rail toward the next token, and the earned / used / covered history on hover. |
| **Contribution** | The whole year in a 53 × 7 grid. **One raspberry hue**, four densities. Today is outlined; future days recede; grace days carry a soft accent dot. Click any past day to edit it. |
| **Personal records** | A closing all-time plaque of eight compact tiles: best day, best 7 days, best month, days active, longest Triple Master run, and the three subject peaks. Hover or focus any tile for its range and context. |
| **Weekly snapshot** | An optional 1080 × 1920 share card for the last seven days: hero total, seven-cell raspberry week, target balance, streak and grace shields, subject split, all-time and simulated AIR. Download it, share it as a file, or copy it to the clipboard. |

### Subject pages

Each subject gets its own quiet page: all-time solved and best streak in the header,
today's control, the same three metrics in the subject's hue, and a subject-tinted
contribution year.

| Physics, in amber | The command palette |
| --- | --- |
| ![Physics view](assets/subject.png) | ![Command palette](assets/palette.png) |

### A few details worth noticing

- **Targets share the number's baseline.** `/40` is not a caption — it is part of the number.
- **Hover is a second layer.** Percentages, best days and milestone maths appear only when needed.
- **Every edit is undoable.** Steppers, day inputs, imports, even "clear all" — `⌘Z` is always there.
- **Cross-tab sync.** Open the dashboard twice; changes in one tab appear in the other.
- **Motion with manners.** Numbers count up, bars grow, heatmap cells settle — then everything stops. `prefers-reduced-motion` removes all of it.

---

## Simulated AIR

The rank is a **motivational estimate**, not a prediction. It is a continuous piecewise-linear
function of all-time questions solved, `Q`, with a plateau and a hard cap.

```text
AIR(Q) =
  200000                                            if Q <= 0
  round(200000 - (Q / 500) * 150000)                if 0 < Q < 500
  50000                                             if 500 <= Q < 1000        (plateau)
  round(50000 - ((Q - 1000) / 1500) * 40000)        if 1000 <= Q < 2500
  round(10000 - ((Q - 2500) / 2500) * 5000)         if 2500 <= Q < 5000
  round(5000 - ((Q - 5000) / 5000) * 4500)          if 5000 <= Q < 10000
  round(500 - ((Q - 10000) / 5000) * 499)           if 10000 <= Q < 15000
  1                                                 if Q >= 15000             (hard cap)
```

### Milestone anchors

| Questions solved | Simulated AIR | Shape of the curve |
| ---: | ---: | --- |
| 0 | **200,000** | starting line |
| 500 | **50,000** | the plateau begins |
| 1,000 | **50,000** | plateau ends |
| 2,000 | **23,333** | ≈ 26.7 ranks/Q on this leg |
| 2,500 | **10,000** | 2 ranks/Q after this point |
| 5,000 | **5,000** | ≈ 0.9 ranks/Q after this point |
| 10,000 | **500** | ≈ 0.1 ranks/Q after this point |
| 15,000+ | **1** | hard cap |

The overview rail uses six anchors — `200k · 50k · 10k · 5k · 500 · 1` — and interpolates
the pin within each segment. The percentage chip assumes a candidate pool of **250,000**,
purely for flavour. Implemented in `calcAIR()` in `index.html`.

---

## Streak insurance

Consistency should survive one bad day. The tracker banks a small amount of grace:

| Rule | Detail |
| --- | --- |
| **Earn** | `1` token for every **5 consecutive days** at or above the overall goal of **100 questions**. |
| **Bank** | Maximum `2`. At the cap the five-day cycle resets without earning another token. |
| **Spend** | A fully missed day (`0` questions) spends one token automatically, but only while a question streak is alive. |
| **Covered day** | Counts toward current and best streaks (overall and per subject), is marked with a soft raspberry dot on the overview year, and never counts as a target day. |
| **Today** | Can earn a token immediately. It never spends one and never resets carried progress — the day is still in progress. |

A below-target day with any questions keeps the question streak alive, resets the
five-day earning progress, and spends nothing. The whole model — bank, progress,
earned, used and the covered days — is replayed from history on every render, so it
survives reload, undo, import, export and cross-tab sync without touching the saved
schema.

Hover the **Grace bank** card for tokens earned and used plus recent covered dates.
Covered days on the overview year say **“Grace day · streak protected”** on hover.

---

## Personal records

A closing all-time plaque under the contribution year. Eight records are derived
from the whole store on every render — all years, not just the current one. Hover
or focus a tile for the exact range, subject split and a small comparison.

| Tile | Record | Rule |
| --- | --- | --- |
| **Best day** | Highest total in one day | Ties keep the earliest date. |
| **Best 7 days** | Highest sum of seven consecutive calendar days | Every window is checked; zero-question days inside the window count. |
| **Best month** | Highest monthly total | Grouped by local `YYYY-MM`, with the winning month's bar strip. |
| **Days active** | Days with at least one question | The ring compares them with the calendar span since the first entry. |
| **Triple Master** | Longest run with Maths ≥ 40, Physics ≥ 30 and Chemistry ≥ 30 | Consecutive calendar days; a missing or below-target day breaks the run. |
| **Maths / Physics / Chem peak** | Highest single-day count in that subject | All years. |

Nothing is hard-coded or persisted: `computeRecords()` rebuilds the model and
the board refreshes after steppers, the day editor, undo, import and cross-tab
sync. With no data, every tile shows a quiet `—` and a short caption instead of
a fabricated date or zero. The board lives on the overview only; subject pages
stay focused on one subject.

---

## Weekly snapshot

An optional share card for the week, generated on demand — a designed
1080 × 1920 story image, not a screenshot.

<p align="center">
  <img src="assets/snapshot.png" width="70%" alt="The weekly snapshot modal over the blurred overview">
</p>

Open it three ways:

| Entry point | How |
| --- | --- |
| Overview header | The ghost **Weekly snapshot** button, right of the title |
| Command palette | <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> → **Create weekly snapshot** |
| Keyboard | <kbd>W</kbd> |

The card carries the last seven days: the total with the word *questions*, a
seven-cell raspberry heatmap with weekday labels and counts (today outlined), a
balance rail against the 7 × 100 weekly target with the target marker, current
and best streak with the grace-bank shields, a subject split in subject hues,
and the all-time total with the simulated AIR in the footer. It is redrawn from
current data every time it opens.

Actions in the modal: **Download PNG** (`jee-week-2026-10-22.png`),
**Share** through the Web Share API when file sharing is available, and
**Copy** through `ClipboardItem` when it is. Unsupported actions hide
themselves. It is drawn with Canvas 2D after `document.fonts.ready`, so it
uses Inter and Inter Tight when they have loaded. Nothing is saved and no
image library is involved.

<p align="center">
  <img src="assets/week-card.png" width="32%" alt="The generated 1080 by 1920 weekly snapshot card">
</p>

---

## Keyboard

Press <kbd>?</kbd> in the app for the same map.

| Keys | Action |
| --- | --- |
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> | Overview · Maths · Physics · Chemistry |
| <kbd>M</kbd> <kbd>P</kbd> <kbd>C</kbd> | Add one question to that subject (today) |
| <kbd>⇧</kbd> + <kbd>M</kbd> / <kbd>P</kbd> / <kbd>C</kbd> | Remove one question |
| <kbd>T</kbd> | Open today's day editor |
| <kbd>W</kbd> | Create a weekly snapshot |
| <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> | Command palette |
| <kbd>⌘Z</kbd> / <kbd>Ctrl Z</kbd> | Undo the last change |
| <kbd>?</kbd> | Shortcut sheet |
| <kbd>Esc</kbd> | Close the palette, sheet, editor or snapshot |

Shortcuts pause automatically while you are typing in an input.

---

## Data & persistence

Everything lives in **one localStorage key** on your machine:

```json
{
  "version": 2,
  "data": {
    "2026-10-22": { "m": 18, "p": 9, "c": 7 }
  },
  "prefs": { "view": "overview" }
}
```

- **Key:** `jee-tracker.v2`
- **Writes:** every mutation schedules a 120 ms save; the top-right *Saved* dot confirms it.
- **Flush:** pending writes are flushed on `beforeunload`.
- **Sync:** the `storage` event refreshes other open tabs.
- **Undo:** the last 60 states are kept in memory.
- **Migration:** the original `jee-tracker.v1` payload is imported on first run.
- **Portability:** export a timestamped JSON file or import one from the footer / palette.
  Import is sanitised and undoable.

There is no server, no account and no analytics. The only network request the page makes is
for the **Inter / Inter Tight** webfonts; remove the `<link>` tags in `index.html` to make it
fully offline (system sans will take over).

> "Backend" here means the browser: a small, explicit store (`loadState` → `persist` →
> `render`) with a versioned schema, import/export, cross-tab sync and undo.

---

## Design system

The full contract lives in **[design.md](design.md)**. The short version:

| Token | Value | Role |
| --- | --- | --- |
| Accent | `#B12F5F` (rgb 177, 47, 95) | Brand, overview heatmap, focus, live markers |
| Mathematics | `#6366F1` | indigo |
| Physics | `#F59E0B` | amber |
| Chemistry | `#0D9488` | teal |
| Ink | `#141418` | type, primary buttons |
| Canvas | `#FCFCFD` | page |
| Line | `#EAEAEF` | 1 px borders |

**Physics and Chemistry are deliberately swapped** from the first iteration: amber is Physics,
teal is Chemistry. The overview contribution tracker is strictly monochrome — one raspberry
hue, four densities — while subject heatmaps inherit their subject's hue.

Display numerals use **Inter Tight 200**, UI text uses **Inter 300–500**, and every changing
figure is tabular. Cards are 22 px radius, hairline borders, no shadows at rest. Hover lifts
and reveals the second layer.

---

## Project structure

```text
JEETrack/
├── index.html        # the entire app: tokens, markup, store, AIR, views, palette
├── design.md         # design system + component contracts
├── README.md
└── assets/
    ├── banner.svg
    ├── preview.png
    ├── subject.png
    ├── palette.png
    ├── snapshot.png
    └── week-card.png
```

Inside `index.html`:

| Block | Responsibility |
| --- | --- |
| `:root` | Design tokens (colour, radius, easing) |
| `loadState` / `persist` | Versioned localStorage store, migration, cross-tab sync |
| `summarize` | All derived metrics (today, all-time, 7-day, streaks, average) |
| `computeInsurance` | Deterministic grace-bank replay over history (bank, progress, covered days) |
| `computeRecords` | All-time personal records: best day/week/month, Triple Master, subject peaks |
| `calcAIR` | The piecewise rank curve and milestone rail position |
| `drawWeekCard` | The 1080 × 1920 Canvas 2D weekly share card |
| `buildOverview` / `buildSubjectView` | Static skeletons, built once |
| `render*` | Targeted updates — numbers, rails, bars, graph cells |
| `buildGraph` | The 53 × 7 year grid, tooltips and day editor hook |
| `COMMANDS` | Palette actions, grouped and searchable |
| `bindEvents` / `init` | Keyboard map, midnight rollover, boot |

No frameworks, no build step, no dependencies.

---

## Customise it

| Want to change… | Edit |
| --- | --- |
| Daily subject targets | `TARGETS = { m: 40, p: 30, c: 30 }` |
| Overall daily goal | `GOAL = 100` |
| The rank curve | `calcAIR(q)` and `RANK_STOPS` |
| Subject names / hues | `SUBJECTS` (and the matching `--m`, `--p`, `--c` tokens) |
| Accent hue | `--accent` in `:root` — JS reads it for the heatmap |
| Heatmap contrast | `SHADES` and `levelFor()` |
| First-run demo history | `seed()` |
| Palette commands | `COMMANDS` |
| Personal records | `computeRecords()` and `RECORD_DEFS` |
| Weekly snapshot card | `drawWeekCard()` and `SNAP_W` / `SNAP_H` |
| Starting view | `prefs.view` in localStorage |

The layout adapts at **980 px** (single-column cards, nav on its own row) and **640 px**
(one-column metrics, full-width today control).

---

## Accessibility notes

- A visible `2px` accent focus ring on every interactive element.
- Heatmap cells carry full `aria-label`s; **today's cell is keyboard-focusable** —
  <kbd>Tab</kbd> to it, then <kbd>Enter</kbd> to open the editor.
- Colour is never the only signal: AIR has a numeric label, streaks have text, the
  contribution legend is labelled *less → more*.
- All motion is suppressed under `prefers-reduced-motion: reduce`.
- Data is stored locally; clearing site data clears the tracker. Export first if it matters.

---

## Roadmap

- [ ] A real backend sync adapter (the store is already isolated behind one interface)
- [ ] CSV / spreadsheet import
- [ ] Chapter-level tags and weak-topic analysis
- [ ] Mock-test log with score → rank overlay
- [ ] Optional dark theme that respects the same tokens
- [ ] Installable PWA with offline caching

---

<p align="center">
  <sub>Built with vanilla HTML, CSS and JavaScript · Inter & Inter Tight · one accent, three subjects, no noise.</sub>
</p>
