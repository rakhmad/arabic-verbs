# Two-Part Deck Redesign — Design Spec
**Date:** 2026-04-10
**Status:** Approved

---

## Overview

Restructure the app from a single 320-card conjugation deck into a three-deck navigator with a home screen. Part 1 teaches the 10 verb form patterns. Part 2 drills cross-form transformation. The original 320-card conjugation deck remains as the third deck. Each deck has its own independent SRS queue.

---

## Home Screen

Replaces the current immediate-session-start behaviour. Shows three deck cards with live SRS counts (cards due today).

```
┌─────────────────────────────┐
│     أوزان — Arabic Verbs    │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │  📖  Part 1            │  │
│  │  Learn the Forms      │  │
│  │  20 cards • N due     │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  ✏️  Part 2            │  │
│  │  Transform Verbs      │  │
│  │  54 cards • N due     │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  🔤  Full Conjugations │  │
│  │  320 cards • N due    │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

- Tapping a deck starts a session for that deck
- A ← Back button in the top-left of the session view returns to the home screen
- Home screen is the app's default view on load

---

## Part 1 Card Types (20 cards)

### Type A — Pattern Recognition (10 cards, one per form)

- **Front:** Large Arabic pattern only (e.g. فَعَّلَ)
- **Back:** Form number + label, semantic function, example word + meaning
- **ID prefix:** `p1-pat-f{n}` (e.g. `p1-pat-f2`)

Example back content for Form II:
```
Form II (فَعَّلَ)
Function: intensification / causation
Example: عَلَّمَ — to teach (root: ع ل م)
```

Form functions (one per form):
| Form | Function |
|------|----------|
| I    | Base meaning |
| II   | Intensification / causation |
| III  | Reciprocal action (with another) |
| IV   | Causative |
| V    | Reflexive of Form II |
| VI   | Reciprocal reflexive of Form III |
| VII  | Passive / involuntary |
| VIII | Reflexive / middle voice |
| IX   | Colors and physical defects |
| X    | To consider/request the base meaning |

### Type B — Form Overview (10 cards, one per form)

- **Front:** Form number + Arabic pattern (e.g. "Form II — فَعَّلَ")
- **Back:** All 4 tenses using the existing example root
- **ID prefix:** `p1-ovr-f{n}` (e.g. `p1-ovr-f2`)

Example back content for Form II:
```
ماضي:   عَلَّمَ
مضارع:  يُعَلِّمُ
أمر:    عَلِّمْ
مصدر:   تَعْلِيم
```

---

## Part 2 Card Types (49 cards)

Uses two roots:
- **Abstract root** ف ع ل — the classical model root used in all Arabic grammar
- **Real root** ك ت ب — conjugated across all applicable forms

### Type 1 — Abstract Pattern Transform (9 cards)

Questions from Form I to each other form using ف ع ل.

- **Front:** "Form I (فَعَلَ) → Form IV — what is the pattern?"
- **Back:** أَفْعَلَ (the target form pattern)
- **ID:** `p2-abs-f1-f{n}` (e.g. `p2-abs-f1-f4`)

All 9 pairs: Form I → Forms II, III, IV, V, VI, VII, VIII, IX, X

### Type 2 — Real Root Base Form Transform (8 cards)

Form I of كَتَبَ transformed to each applicable form (skip Form IX — not applicable to ك ت ب).

- **Front:** "كَتَبَ (Form I, past) → Form IV?"
- **Back:** أَكْتَبَ
- **ID:** `p2-real-f1-f{n}-base` (e.g. `p2-real-f1-f4-base`)

Cross-form data for ك ت ب (past / present / imperative / verbal noun):

| Form | ماضي | مضارع | أمر | مصدر | Meaning |
|------|------|--------|-----|------|---------|
| I    | كَتَبَ | يَكْتُبُ | اُكْتُبْ | كِتَابَة | to write |
| II   | كَتَّبَ | يُكَتِّبُ | كَتِّبْ | تَكْتِيب | to make write / dictate |
| III  | كَاتَبَ | يُكَاتِبُ | كَاتِبْ | مُكَاتَبَة | to correspond with |
| IV   | أَكْتَبَ | يُكْتِبُ | أَكْتِبْ | إِكْتَاب | to dictate |
| V    | تَكَتَّبَ | يَتَكَتَّبُ | تَكَتَّبْ | تَكَتُّب | to be enrolled |
| VI   | تَكَاتَبَ | يَتَكَاتَبُ | تَكَاتَبْ | تَكَاتُب | to correspond with each other |
| VII  | اِنْكَتَبَ | يَنْكَتِبُ | اِنْكَتِبْ | اِنْكِتَاب | to be written |
| VIII | اِكْتَتَبَ | يَكْتَتِبُ | اِكْتَتِبْ | اِكْتِتَاب | to subscribe / copy |
| X    | اِسْتَكْتَبَ | يَسْتَكْتِبُ | اِسْتَكْتِبْ | اِسْتِكْتَاب | to ask to write |

### Type 3 — Real Root Full Conjugation Transform (36 cards)

4 tense slots × 9 form pairs (skip Form IX) — but using only the هُوَ base conjugation per tense to keep card count manageable. Cards ask for the full form.

- **Front:** Source conjugation + context (e.g. "يَكْتُبُ — Form I, present, هُوَ → Form IV?")
- **Back:** يُكْتِبُ
- **ID:** `p2-conj-f1-f{n}-{tense}` (e.g. `p2-conj-f1-f4-present`)

Tenses used: past (هو), present (هو), imperative (أنت), verbal noun.

---

## Architecture

### New File

**`data2.js`** — sets `window.PART1_CARDS` (20 cards) and `window.PART2_CARDS` (~54 cards). IIFE pattern, ES5-compatible, no dependencies.

### Modified Files

**`index.html`**
- Add `<script src="data2.js"></script>` before `app.js`
- Add `#home-screen` section with three deck buttons
- Add `#back-btn` button to `#top-bar`

**`app.js`**
- Add `activeDeck` to state: `"home" | "conj" | "part1" | "part2"`
- Add `showView(name)` — toggles visibility of home screen vs session view
- Add `startDeck(deckId)` — loads the right CARDS array, resets session state, calls `init()`
- Modify `init()` — on load, show home screen instead of immediately starting a session
- Modify `renderCard()` — handle Part 1 pattern/overview card layout and Part 2 transform card layout in addition to existing conjugation layout
- Add back button event listener

**`sw.js`**
- Add `"./data2.js"` to `LOCAL_FILES` precache array

### SRS Isolation

Card IDs never collide across decks:
- Conjugation deck: `f{n}-{tense}-{pronounId}` (existing, unchanged)
- Part 1: `p1-pat-f{n}`, `p1-ovr-f{n}`
- Part 2: `p2-abs-f1-f{n}`, `p2-real-f1-f{n}-base`, `p2-conj-f1-f{n}-{tense}`

All progress stored in the same IndexedDB store — no schema changes needed.

---

## Card Render Logic by Type

| Card type | Front Arabic | Front English | Back Arabic | Back English |
|-----------|-------------|---------------|-------------|--------------|
| p1-pat | pattern (large) | — | pattern | form number + function + example |
| p1-ovr | form label | form label | — | 4 tenses laid out |
| p2-abs | source pattern | "Form I → Form N?" | target pattern | form labels |
| p2-real-base | source verb | source context | target verb | meaning |
| p2-conj | source verb | pronoun + tense context | target verb | target context |
| conj (existing) | arabic verb | — | arabic verb | english gloss + root |

Bidirectional randomisation applies to all card types.

---

## Out of Scope

- Form IX real-root cards (Form IX only applies to colors/defects — ك ت ب has no Form IX)
- Transformations between non-Form-I pairs (e.g. Form II → Form V)
- Audio pronunciation
- Cross-deck statistics on home screen (only per-deck due counts shown)
