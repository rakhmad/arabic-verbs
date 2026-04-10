# Two-Part Deck Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the app from a single 320-card conjugation deck into a three-deck navigator with a home screen, adding Part 1 (20 pattern cards) and Part 2 (49 transformation cards).

**Architecture:** New `data2.js` sets `window.PART1_CARDS` and `window.PART2_CARDS` using `window.FORMS_META` (already set by `data.js`) plus hardcoded ك ت ب cross-form data. `app.js` gains an `activeDeck` state flag, a `renderHomeScreen()` function, a `startDeck()` switcher, and an expanded `renderCard()` that dispatches on `c.type`. The home screen is always the first view on load.

**Tech Stack:** ES5 IIFEs, vanilla JS/CSS/HTML, IndexedDB via existing `db.js`, SM-2 SRS via existing `srs.js`, service worker precache.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `data2.js` | **Create** | IIFE; sets `window.PART1_CARDS` (20 cards) and `window.PART2_CARDS` (49 cards); depends on `window.FORMS_META` |
| `style.css` | **Modify** | Add home screen layout, `.deck-btn` styles, `#back-btn` styles |
| `index.html` | **Modify** | Add `#home-screen` div, `#back-btn` to top bar, `<script src="data2.js">` |
| `app.js` | **Modify** | Add `activeDeck` state, `renderHomeScreen()`, `showView()`, `startDeck()`, new `renderCard()` dispatch |
| `sw.js` | **Modify** | Add `"./data2.js"` to `LOCAL_FILES`; bump cache version to `arabic-verbs-v2` |

---

## Task 1: Create `data2.js`

**Files:**
- Create: `data2.js`

Depends on `window.FORMS_META` (set by `data.js`). Sets two globals: `window.PART1_CARDS` (20 cards) and `window.PART2_CARDS` (49 cards).

Card shapes for new types — all have `{id, type, metaLabel, frontAr, frontEn, backAr, backEn}`:
- `p1-pat`: front = Arabic pattern / function label; back = full form info
- `p1-ovr`: front = Arabic pattern / "Form N — pattern"; back = 4 tenses
- `p2-abs`: front = فَعَلَ source / English question; back = target pattern
- `p2-real-base`: front = كَتَبَ source / English question; back = target past + meaning
- `p2-conj`: front = source conjugation / English question with tense; back = target conjugation

- [ ] **Step 1: Create `data2.js`**

```javascript
// data2.js — Part 1 (pattern) and Part 2 (transformation) flash-card data
// Depends on: window.FORMS_META (set by data.js)
// Sets: window.PART1_CARDS (20 cards), window.PART2_CARDS (49 cards)

(function () {
  "use strict";

  var FM = window.FORMS_META; // Array[10], index 0 = Form I

  function toRoman(n) {
    return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || String(n);
  }

  // Semantic function label for each form (index 0 = Form I)
  var FORM_FUNCTIONS = [
    "Base meaning",
    "Intensification / causation",
    "Reciprocal action (with another)",
    "Causative",
    "Reflexive of Form II",
    "Reciprocal reflexive of Form III",
    "Passive / involuntary",
    "Reflexive / middle voice",
    "Colors and physical defects",
    "To consider / request the base meaning"
  ];

  // ك ت ب cross-form data — Forms I, II, III, IV, V, VI, VII, VIII, X (no Form IX)
  var KTB_FORMS = [
    { form: 1,  past: "كَتَبَ",      present: "يَكْتُبُ",     imperative: "اُكْتُبْ",     verbalNoun: "كِتَابَة",     meaning: "to write" },
    { form: 2,  past: "كَتَّبَ",     present: "يُكَتِّبُ",    imperative: "كَتِّبْ",      verbalNoun: "تَكْتِيب",     meaning: "to make write / dictate" },
    { form: 3,  past: "كَاتَبَ",     present: "يُكَاتِبُ",    imperative: "كَاتِبْ",      verbalNoun: "مُكَاتَبَة",   meaning: "to correspond with" },
    { form: 4,  past: "أَكْتَبَ",    present: "يُكْتِبُ",     imperative: "أَكْتِبْ",     verbalNoun: "إِكْتَاب",     meaning: "to dictate" },
    { form: 5,  past: "تَكَتَّبَ",   present: "يَتَكَتَّبُ",  imperative: "تَكَتَّبْ",    verbalNoun: "تَكَتُّب",     meaning: "to be enrolled" },
    { form: 6,  past: "تَكَاتَبَ",   present: "يَتَكَاتَبُ",  imperative: "تَكَاتَبْ",    verbalNoun: "تَكَاتُب",     meaning: "to correspond with each other" },
    { form: 7,  past: "اِنْكَتَبَ",  present: "يَنْكَتِبُ",   imperative: "اِنْكَتِبْ",   verbalNoun: "اِنْكِتَاب",   meaning: "to be written" },
    { form: 8,  past: "اِكْتَتَبَ",  present: "يَكْتَتِبُ",   imperative: "اِكْتَتِبْ",   verbalNoun: "اِكْتِتَاب",   meaning: "to subscribe / copy" },
    { form: 10, past: "اِسْتَكْتَبَ",present: "يَسْتَكْتِبُ", imperative: "اِسْتَكْتِبْ", verbalNoun: "اِسْتِكْتَاب", meaning: "to ask to write" }
  ];

  // ── Part 1 (20 cards) ──────────────────────────────────────────────────

  function buildPart1Cards() {
    var cards = [];

    FM.forEach(function (f, i) {
      var formLabel = "Form " + toRoman(f.form);
      var fn = FORM_FUNCTIONS[i];

      // Type A — Pattern Recognition (10 cards)
      cards.push({
        id:        "p1-pat-f" + f.form,
        type:      "p1-pat",
        metaLabel: formLabel,
        frontAr:   f.formAr,
        frontEn:   formLabel + " — " + fn,
        backAr:    f.formAr,
        backEn:    formLabel + " (" + f.formAr + ")\nFunction: " + fn +
                   "\nExample: " + f.past[0] + " — " + f.meaning +
                   " (root: " + f.root + ")"
      });

      // Type B — Form Overview (10 cards)
      cards.push({
        id:        "p1-ovr-f" + f.form,
        type:      "p1-ovr",
        metaLabel: formLabel + " — Overview",
        frontAr:   f.formAr,
        frontEn:   formLabel + " — " + f.formAr,
        backAr:    "",
        backEn:    "ماضي:   " + f.past[0] +
                   "\nمضارع:  " + f.present[0] +
                   "\nأمر:    " + f.imperative[0] +
                   "\nمصدر:   " + f.verbalNounAr
      });
    });

    return cards; // 20 cards
  }

  // ── Part 2 (49 cards) ──────────────────────────────────────────────────

  function buildPart2Cards() {
    var cards = [];
    var srcPatternAr = FM[0].formAr; // فَعَلَ
    var ktbSrc = KTB_FORMS[0];       // Form I of ك ت ب

    // Type 1 — Abstract Pattern Transform (9 cards: Form I → Forms II–X)
    for (var i = 1; i < FM.length; i++) {
      var tgt = FM[i];
      var tgtLabel = "Form " + toRoman(tgt.form);
      cards.push({
        id:        "p2-abs-f1-f" + tgt.form,
        type:      "p2-abs",
        metaLabel: "Transform",
        frontAr:   srcPatternAr,
        frontEn:   "Form I (" + srcPatternAr + ") → " + tgtLabel + " — what is the pattern?",
        backAr:    tgt.formAr,
        backEn:    tgtLabel + " (" + tgt.formAr + ")"
      });
    }

    // Type 2 — Real Root Base Form Transform (8 cards: Forms II–X, skip IX)
    KTB_FORMS.slice(1).forEach(function (ktb) {
      var tgtLabel = "Form " + toRoman(ktb.form);
      cards.push({
        id:        "p2-real-f1-f" + ktb.form + "-base",
        type:      "p2-real-base",
        metaLabel: "Transform",
        frontAr:   ktbSrc.past,
        frontEn:   ktbSrc.past + " (Form I, past) → " + tgtLabel + "?",
        backAr:    ktb.past,
        backEn:    tgtLabel + " past — " + ktb.meaning
      });
    });

    // Type 3 — Real Root Full Conjugation Transform (32 cards: 4 tenses × 8 forms)
    var TENSES = [
      {
        key: "past", label: "past", labelAr: "ماضي", pronoun: "هُوَ",
        getSrc: function (k) { return k.past; },
        getTgt: function (k) { return k.past; }
      },
      {
        key: "present", label: "present", labelAr: "مضارع", pronoun: "هُوَ",
        getSrc: function (k) { return k.present; },
        getTgt: function (k) { return k.present; }
      },
      {
        key: "imperative", label: "imperative", labelAr: "أمر", pronoun: "أَنْتَ",
        getSrc: function (k) { return k.imperative; },
        getTgt: function (k) { return k.imperative; }
      },
      {
        key: "verbal-noun", label: "verbal noun", labelAr: "مصدر", pronoun: "",
        getSrc: function (k) { return k.verbalNoun; },
        getTgt: function (k) { return k.verbalNoun; }
      }
    ];

    TENSES.forEach(function (tense) {
      KTB_FORMS.slice(1).forEach(function (ktb) {
        var tgtLabel = "Form " + toRoman(ktb.form);
        var srcVerb = tense.getSrc(ktbSrc);
        var tgtVerb = tense.getTgt(ktb);
        var pronounPart = tense.pronoun ? " (" + tense.pronoun + ")" : "";
        cards.push({
          id:        "p2-conj-f1-f" + ktb.form + "-" + tense.key,
          type:      "p2-conj",
          metaLabel: "Transform — " + tense.labelAr,
          frontAr:   srcVerb,
          frontEn:   srcVerb + " — Form I, " + tense.label + pronounPart + " → " + tgtLabel + "?",
          backAr:    tgtVerb,
          backEn:    tgtLabel + " " + tense.label
        });
      });
    });

    return cards; // 49 cards: 9 + 8 + 32
  }

  // ── Globals ────────────────────────────────────────────────────────────
  window.PART1_CARDS = buildPart1Cards();
  window.PART2_CARDS = buildPart2Cards();

})();
```

- [ ] **Step 2: Verify card counts in browser console**

Open `index.html` (even before app.js changes), open DevTools console and run:
```javascript
console.log(PART1_CARDS.length); // expected: 20
console.log(PART2_CARDS.length); // expected: 49
console.log(PART1_CARDS[0]);     // expected: {id:"p1-pat-f1", type:"p1-pat", ...}
console.log(PART2_CARDS[0]);     // expected: {id:"p2-abs-f1-f2", type:"p2-abs", ...}
```
(Requires `data2.js` to be in index.html — add it temporarily for this check, or wait until Task 3.)

- [ ] **Step 3: Commit**

```bash
git add data2.js
git commit -m "feat: add data2.js with Part 1 (20) and Part 2 (49) cards"
```

---

## Task 2: Add CSS to `style.css`

**Files:**
- Modify: `style.css` (append to end of file)

- [ ] **Step 1: Append home screen and deck button styles to `style.css`**

Add to the very end of `style.css`:

```css
/* ── Home Screen ── */
#home-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px 16px;
  gap: 16px;
  overflow-y: auto;
}

#home-title {
  font-family: var(--font-ar);
  font-size: 28px;
  color: var(--gold);
  text-align: center;
  margin-bottom: 8px;
  direction: rtl;
}

#deck-list {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deck-btn {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--surface2);
  border-radius: var(--radius);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background 0.2s;
  color: var(--text);
  font-family: var(--font-ui);
  direction: ltr;
}

.deck-btn:hover,
.deck-btn:focus-visible {
  border-color: var(--gold);
  background: var(--surface2);
  outline: none;
}

.deck-icon { font-size: 32px; flex-shrink: 0; }

.deck-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.deck-title   { font-size: 18px; font-weight: 700; color: var(--text); }
.deck-subtitle{ font-size: 13px; color: var(--text-muted); }
.deck-count   { font-size: 14px; color: var(--gold-light); font-weight: 600; }

/* ── Back Button ── */
#back-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: color 0.2s;
  flex-shrink: 0;
  direction: ltr;
}

#back-btn:hover { color: var(--gold); }

#back-btn:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "feat: add home screen and deck button CSS"
```

---

## Task 3: Update `index.html`

**Files:**
- Modify: `index.html`

Three changes:
1. Add `#home-screen` div (before `<main id="card-container">`)
2. Add `#back-btn` to `#top-bar` (first child, before `#card-meta`)
3. Add `<script src="data2.js"></script>` (before `app.js`)
4. Change `done-restart` button text from "Start Again" to "Back to Decks"

- [ ] **Step 1: Add `#home-screen` div before `<main>`**

In `index.html`, after line 31 (`</header>`) and before line 33 (`<!-- Flashcard -->`), insert:

```html
  <!-- Home screen (shown on load) -->
  <div id="home-screen">
    <h1 id="home-title">أوزان — Arabic Verbs</h1>
    <div id="deck-list"></div>
  </div>
```

- [ ] **Step 2: Add `#back-btn` as first child of `#top-bar`**

In `#top-bar`, add `<button id="back-btn" hidden aria-label="Back to home">←</button>` as the very first child (before `<div id="card-meta">`):

```html
  <header id="top-bar">
    <button id="back-btn" hidden aria-label="Back to home">←</button>
    <div id="card-meta">
```

- [ ] **Step 3: Add `data2.js` script and update `done-restart` button**

In `index.html`, add `<script src="data2.js"></script>` on the line directly before `<script src="app.js"></script>`. Also change the `done-restart` button text to "Back to Decks":

```html
    <button id="done-restart">Back to Decks</button>
```

The final script block order must be:
```html
  <script src="data.js"></script>
  <script src="data2.js"></script>
  <script src="db.js"></script>
  <script src="srs.js"></script>
  <script src="app.js"></script>
```

- [ ] **Step 4: Verify HTML structure**

Open `index.html` in a browser. The page should not crash (console errors are OK at this stage since app.js isn't updated yet). Check that:
- `document.getElementById("home-screen")` returns an element
- `document.getElementById("back-btn")` returns an element
- `PART1_CARDS.length === 20` in console
- `PART2_CARDS.length === 49` in console

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add home screen HTML, back button, data2.js script tag"
```

---

## Task 4: Update `app.js`

**Files:**
- Modify: `app.js`

This is the largest change. The full updated `app.js` is shown below — replace the entire file content.

Key changes vs current `app.js`:
- State: `activeDeck: "home"`, `currentCards: window.CARDS` added
- DOM refs: `elHomeScreen`, `elDeckList`, `elBackBtn`, `elCardContainer`, `elCardMeta`, `elProgressWrap` added
- `init()`: loads progress then calls `renderHomeScreen()` (no longer starts a session directly)
- `renderHomeScreen()`: re-fetches progress from DB, computes per-deck due counts, renders three deck buttons
- `showView(name)`: toggles `#home-screen` vs `#card-container` visibility; hides/shows back btn, meta, progress
- `startDeck(deckId, cards)`: stores `state.currentCards`, builds queue, calls `showView("session")`, then `nextCard()` or `showDone(true)`
- `renderCard()`: dispatches on `c.type` — new-type cards use `frontAr/frontEn/backAr/backEn/metaLabel`; existing conj cards use the original path
- `openStats()`: uses `state.currentCards` instead of hardcoded `CARDS`
- `elDoneRestart` listener: calls `renderHomeScreen()` instead of `init()`
- Back button listener: calls `renderHomeScreen()`

- [ ] **Step 1: Replace `app.js` with the following**

```javascript
// app.js — Main application logic
// Depends on: CARDS (data.js), PART1_CARDS, PART2_CARDS (data2.js), DB (db.js), SRS (srs.js)
// Sets window.App

(function () {

  // ── State ──────────────────────────────────────────────────────────────
  var state = {
    activeDeck:   "home",         // "home" | "conj" | "part1" | "part2"
    currentCards: window.CARDS,   // cards array for the active deck
    queue:        [],
    current:      null,
    direction:    "ar",
    flipped:      false,
    sessionTotal: 0,
    sessionDone:  0,
    hardQueue:    [],
    progressMap:  {}
  };

  // ── DOM References ──────────────────────────────────────────────────────
  var elHomeScreen  = document.getElementById("home-screen");
  var elDeckList    = document.getElementById("deck-list");
  var elBackBtn     = document.getElementById("back-btn");
  var elCardContainer = document.getElementById("card-container");
  var elCardMeta    = document.getElementById("card-meta");
  var elProgressWrap= document.getElementById("progress-wrap");
  var elCard        = document.getElementById("card");
  var elFrontAr     = document.getElementById("front-arabic");
  var elFrontEn     = document.getElementById("front-english");
  var elFrontHint   = document.getElementById("front-hint");
  var elBackAr      = document.getElementById("back-arabic");
  var elBackEn      = document.getElementById("back-english");
  var elBackRoot    = document.getElementById("back-root");
  var elMetaForm    = document.getElementById("meta-form");
  var elMetaTense   = document.getElementById("meta-tense");
  var elMetaPronoun = document.getElementById("meta-pronoun");
  var elProgressBar = document.getElementById("progress-bar");
  var elProgressLbl = document.getElementById("progress-label");
  var elRatingBar   = document.getElementById("rating-bar");
  var elStatsBtn    = document.getElementById("stats-btn");
  var elStatsPanel  = document.getElementById("stats-panel");
  var elStatsClose  = document.getElementById("stats-close");
  var elStatsContent= document.getElementById("stats-content");
  var elDoneScreen  = document.getElementById("done-screen");
  var elDoneSummary = document.getElementById("done-summary");
  var elDoneRestart = document.getElementById("done-restart");

  // ── View Management ─────────────────────────────────────────────────────
  function showView(name) {
    var isHome = (name === "home");
    state.activeDeck = isHome ? "home" : state.activeDeck;
    elHomeScreen.hidden    = !isHome;
    elCardContainer.hidden = isHome;
    elBackBtn.hidden       = isHome;
    elCardMeta.hidden      = isHome;
    elProgressWrap.hidden  = isHome;
    if (isHome) {
      elRatingBar.hidden  = true;
      elDoneScreen.hidden = true;
    }
  }

  // ── Home Screen ─────────────────────────────────────────────────────────
  function renderHomeScreen() {
    DB.getAllProgress().then(function (progressMap) {
      state.progressMap = progressMap;
      _drawHomeDecks(progressMap);
    }).catch(function () {
      _drawHomeDecks(state.progressMap);
    });
  }

  function _drawHomeDecks(progressMap) {
    var decks = [
      { id: "part1", icon: "📖", title: "Part 1", subtitle: "Learn the Forms",        cards: window.PART1_CARDS },
      { id: "part2", icon: "✏️",  title: "Part 2", subtitle: "Transform Verbs",        cards: window.PART2_CARDS },
      { id: "conj",  icon: "🔤", title: "Full Conjugations", subtitle: "All verb forms", cards: window.CARDS }
    ];

    elDeckList.innerHTML = "";
    decks.forEach(function (deck) {
      var due   = SRS.getDueCards(deck.cards, progressMap).length;
      var total = deck.cards.length;
      var btn = document.createElement("button");
      btn.className = "deck-btn";
      btn.innerHTML =
        '<span class="deck-icon">' + deck.icon + '</span>' +
        '<span class="deck-info">' +
          '<span class="deck-title">'    + deck.title    + '</span>' +
          '<span class="deck-subtitle">' + deck.subtitle + '</span>' +
          '<span class="deck-count">'    + total + ' cards • ' + due + ' due</span>' +
        '</span>';
      (function (d) {
        btn.addEventListener("click", function () { startDeck(d.id, d.cards); });
      }(deck));
      elDeckList.appendChild(btn);
    });

    showView("home");
  }

  // ── Start a Deck Session ────────────────────────────────────────────────
  function startDeck(deckId, cards) {
    state.activeDeck   = deckId;
    state.currentCards = cards;
    state.queue        = SRS.getDueCards(cards, state.progressMap);
    state.hardQueue    = [];
    state.sessionTotal = state.queue.length;
    state.sessionDone  = 0;

    showView("session");

    if (state.queue.length === 0) {
      showDone(true);
    } else {
      nextCard();
    }
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    renderHomeScreen();
  }

  // ── Card Navigation ─────────────────────────────────────────────────────
  function nextCard() {
    if (state.queue.length === 0) {
      if (state.hardQueue.length > 0) {
        state.queue     = state.hardQueue.slice();
        state.hardQueue = [];
      } else {
        showDone(false);
        return;
      }
    }

    state.current   = state.queue.shift();
    state.direction = Math.random() < 0.5 ? "ar" : "en";
    state.flipped   = false;

    renderCard();
    elCard.classList.remove("flipped");
    elRatingBar.hidden = true;
    updateProgress();
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function renderCard() {
    var c = state.current;
    if (!c) return;

    // New-type cards (p1-* and p2-*)
    if (c.type === "p1-pat" || c.type === "p1-ovr" ||
        c.type === "p2-abs" || c.type === "p2-real-base" || c.type === "p2-conj") {

      elMetaForm.textContent    = c.metaLabel;
      elMetaTense.textContent   = "";
      elMetaPronoun.textContent = "";

      if (state.direction === "ar") {
        elFrontAr.textContent  = c.frontAr;
        elFrontEn.textContent  = "";
        elFrontHint.textContent= "اضغط للقلب";
        elBackAr.textContent   = c.backAr;
        elBackEn.textContent   = c.backEn;
        elBackRoot.textContent = "";
      } else {
        elFrontAr.textContent  = "";
        elFrontEn.textContent  = c.frontEn;
        elFrontHint.textContent= "tap to reveal Arabic";
        elBackAr.textContent   = c.backAr;
        elBackEn.textContent   = c.backEn;
        elBackRoot.textContent = "";
      }
      return;
    }

    // Existing conjugation card
    elMetaForm.textContent    = c.formLabel + " (" + c.formAr + ")";
    elMetaTense.textContent   = c.tenseAr;
    elMetaPronoun.textContent = c.pronounAr || "";

    if (state.direction === "ar") {
      elFrontAr.textContent  = c.arabic;
      elFrontEn.textContent  = "";
      elFrontHint.textContent= "اضغط للقلب";
      elBackAr.textContent   = c.arabic;
      elBackEn.textContent   = c.formLabel + " • " + c.tenseAr +
        (c.pronounEn ? " • " + c.pronounEn : "") + "\n" + c.english;
      elBackRoot.textContent = "الجذر: " + c.root + "  —  " + c.meaning;
    } else {
      elFrontAr.textContent  = "";
      elFrontEn.textContent  = c.formLabel + " • " + c.tenseAr +
        (c.pronounEn ? " • " + c.pronounEn : "") + "\n" + c.english;
      elFrontHint.textContent= "tap to reveal Arabic";
      elBackAr.textContent   = c.arabic;
      elBackEn.textContent   = c.english;
      elBackRoot.textContent = "الجذر: " + c.root + "  —  " + c.meaning;
    }
  }

  // ── Flip ────────────────────────────────────────────────────────────────
  function flip() {
    if (state.flipped) return;
    state.flipped = true;
    elCard.classList.add("flipped");
    elRatingBar.hidden = false;
  }

  // ── Rating ──────────────────────────────────────────────────────────────
  function rate(grade) {
    if (!state.current || !state.flipped) return;
    var c = state.current;
    var existing = state.progressMap[c.id] || SRS.createInitialProgress(c.id);
    var updated  = SRS.computeNext(existing, grade);

    state.progressMap[c.id] = updated;
    DB.saveProgress(updated).catch(console.error);

    if (grade < 3) {
      state.hardQueue.push(c);
    } else {
      state.sessionDone++;
    }

    nextCard();
  }

  // ── Progress Bar ────────────────────────────────────────────────────────
  function updateProgress() {
    var total = state.sessionTotal;
    var done  = state.sessionDone;
    var pct   = total > 0 ? Math.round((done / total) * 100) : 0;
    elProgressBar.style.setProperty("--progress", pct + "%");
    elProgressLbl.textContent = done + "/" + total;
  }

  // ── Done Screen ─────────────────────────────────────────────────────────
  function showDone(allDone) {
    elDoneScreen.hidden = false;
    if (allDone) {
      document.getElementById("done-title").textContent = "All caught up! 🌟";
      elDoneSummary.textContent = "No cards are due today. Come back tomorrow to keep your streak going.";
    } else {
      document.getElementById("done-title").textContent = "Session Complete!";
      elDoneSummary.textContent =
        "You reviewed " + state.sessionDone + " card" +
        (state.sessionDone !== 1 ? "s" : "") + " this session. Great work!";
    }
  }

  // ── Stats Panel ─────────────────────────────────────────────────────────
  function openStats() {
    var pm     = state.progressMap;
    var cards  = state.currentCards;
    var allIds = cards.map(function (c) { return c.id; });
    var mastered = allIds.filter(function (id) {
      return pm[id] && pm[id].interval >= 21;
    }).length;
    var learning = allIds.filter(function (id) {
      return pm[id] && pm[id].repetitions > 0 && pm[id].interval < 21;
    }).length;
    var newCount = allIds.filter(function (id) { return !pm[id]; }).length;
    var dueToday = SRS.getDueCards(cards, pm).length;

    elStatsContent.innerHTML =
      stat("Total Cards", cards.length) +
      stat("Due Today",   dueToday) +
      stat("New",         newCount) +
      stat("Learning",    learning) +
      stat("Mastered (21+ day interval)", mastered) +
      '<button class="stat-reset-btn" id="reset-btn">⚠ Reset All Progress</button>';

    elStatsPanel.hidden = false;

    document.getElementById("reset-btn").addEventListener("click", function () {
      if (confirm("Reset all progress? This cannot be undone.")) {
        DB.clearAll().then(function () { location.reload(); });
      }
    });
  }

  function stat(label, value) {
    return '<div class="stat-row">' +
      '<span class="stat-label">' + label + '</span>' +
      '<span class="stat-value">' + value + '</span>' +
      '</div>';
  }

  // ── Event Listeners ─────────────────────────────────────────────────────
  elCard.addEventListener("click", flip);
  elCard.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
  });

  document.getElementById("btn-hard").addEventListener("click", function () { rate(1); });
  document.getElementById("btn-okay").addEventListener("click", function () { rate(3); });
  document.getElementById("btn-easy").addEventListener("click", function () { rate(5); });

  elStatsBtn.addEventListener("click", openStats);
  elStatsClose.addEventListener("click", function () { elStatsPanel.hidden = true; });

  elBackBtn.addEventListener("click", renderHomeScreen);

  elDoneRestart.addEventListener("click", function () {
    elDoneScreen.hidden = true;
    renderHomeScreen();
  });

  // ── Start ────────────────────────────────────────────────────────────────
  window.App = { init: init };
  init();

})();
```

- [ ] **Step 2: Manual smoke test**

Open `index.html` in a browser (or reload if already open). Verify:
1. Home screen shows with three deck buttons and "N due" counts
2. Tapping Part 1 starts a session; cards show Arabic pattern on front
3. Tapping the back shows `backEn` with function/example info
4. Rate a card; progress bar advances
5. ← button returns to home screen
6. Home screen updates due counts after a session
7. Tapping Full Conjugations shows existing conjugation cards (formLabel in meta bar)
8. Stats panel (☰) shows stats for the active deck

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add home screen navigation and new card type rendering"
```

---

## Task 5: Update `sw.js` — precache `data2.js` and bump cache version

**Files:**
- Modify: `sw.js`

Two changes:
1. Add `"./data2.js"` to `LOCAL_FILES`
2. Bump `CACHE_NAME` from `"arabic-verbs-v1"` to `"arabic-verbs-v2"` so old caches are evicted on next install

- [ ] **Step 1: Edit `sw.js`**

Change `CACHE_NAME`:
```javascript
var CACHE_NAME = "arabic-verbs-v2";
```

Add `"./data2.js"` to the `LOCAL_FILES` array (after `"./data.js"`):
```javascript
var LOCAL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./data.js",
  "./data2.js",
  "./db.js",
  "./srs.js",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./icons/icon-192.png"
];
```

- [ ] **Step 2: Verify service worker installs cleanly**

Open `index.html` in Chrome → DevTools → Application → Service Workers → click "Update". Check that:
- "Status: activated and is running" appears
- No install errors in the console
- Application → Cache Storage → `arabic-verbs-v2` shows `data2.js` in the file list
- Old `arabic-verbs-v1` cache is gone

- [ ] **Step 3: Commit**

```bash
git add sw.js
git commit -m "feat: add data2.js to sw precache; bump cache to v2"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered in |
|-----------------|-----------|
| Home screen with 3 deck cards + live SRS counts | Task 3 (HTML) + Task 4 (`_drawHomeDecks`) |
| ← Back button returns to home | Task 3 (HTML) + Task 4 (back btn listener) |
| Home screen is default view on load | Task 4 (`init()` → `renderHomeScreen()`) |
| Part 1: 10 pattern recognition cards (p1-pat) | Task 1 |
| Part 1: 10 form overview cards (p1-ovr) | Task 1 |
| Part 2: 9 abstract ف ع ل transform cards (p2-abs) | Task 1 |
| Part 2: 8 real ك ت ب base cards (p2-real-base) | Task 1 |
| Part 2: 32 real ك ت ب conjugation cards (p2-conj) | Task 1 |
| SRS isolation via non-colliding ID prefixes | Task 1 (ID naming) |
| `data2.js` added to SW precache | Task 5 |
| `activeDeck` state in app.js | Task 4 |
| `showView()` / `startDeck()` in app.js | Task 4 |
| Bidirectional randomisation for new card types | Task 4 (`renderCard()` direction dispatch) |
| Stats uses active deck cards | Task 4 (`openStats` uses `state.currentCards`) |
| ES5-compatible, IIFE, no dependencies | Task 1 (`data2.js` design) |

**No placeholders found.** All steps contain full code.

**Type consistency check:** `c.type` values used in `renderCard()` ("p1-pat", "p1-ovr", "p2-abs", "p2-real-base", "p2-conj") match exactly the `type` fields set in `buildPart1Cards()` and `buildPart2Cards()` in `data2.js`. `state.currentCards` initialized to `window.CARDS` and updated in `startDeck()` — `openStats()` uses it safely.
