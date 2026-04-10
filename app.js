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
