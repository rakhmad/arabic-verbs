// app.js — Main application logic
// Depends on: CARDS (data.js), DB (db.js), SRS (srs.js)
// Sets window.App

(function () {

  // ── State ──────────────────────────────────────────────────────────────
  var state = {
    queue: [],          // cards due this session (ordered)
    current: null,      // current card object
    direction: "ar",    // "ar" (Arabic→English) or "en" (English→Arabic)
    flipped: false,
    sessionTotal: 0,    // cards in this session queue
    sessionDone: 0,     // cards rated this session (non-hard)
    hardQueue: [],      // cards rated hard, to be reshown at end of queue
    progressMap: {}     // all SRS progress loaded from DB
  };

  // ── DOM References ──────────────────────────────────────────────────────
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

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    DB.getAllProgress().then(function (progressMap) {
      state.progressMap = progressMap;
      state.queue = SRS.getDueCards(CARDS, progressMap);
      state.hardQueue = [];
      state.sessionTotal = state.queue.length;
      state.sessionDone = 0;

      if (state.queue.length === 0) {
        showDone(true);
      } else {
        nextCard();
      }
    }).catch(function () {
      // Fallback for browsers where IndexedDB is unavailable (e.g. some private modes)
      state.progressMap = {};
      state.queue = SRS.getDueCards(CARDS, {});
      state.hardQueue = [];
      state.sessionTotal = state.queue.length;
      state.sessionDone = 0;
      nextCard();
    });
  }

  // ── Card Navigation ─────────────────────────────────────────────────────
  function nextCard() {
    if (state.queue.length === 0) {
      if (state.hardQueue.length > 0) {
        // Replay hard cards once before ending session
        state.queue = state.hardQueue.slice();
        state.hardQueue = [];
      } else {
        showDone(false);
        return;
      }
    }

    state.current = state.queue.shift();
    state.direction = Math.random() < 0.5 ? "ar" : "en";
    state.flipped = false;

    renderCard();
    elCard.classList.remove("flipped");
    elRatingBar.hidden = true;
    updateProgress();
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function renderCard() {
    var c = state.current;
    if (!c) return;

    // Top bar metadata (always LTR meta + Arabic pronoun)
    elMetaForm.textContent = c.formLabel + " (" + c.formAr + ")";
    elMetaTense.textContent = c.tenseAr;
    elMetaPronoun.textContent = c.pronounAr || "";

    if (state.direction === "ar") {
      // Front: Arabic → user recalls English
      elFrontAr.textContent = c.arabic;
      elFrontEn.textContent = "";
      elFrontHint.textContent = "اضغط للقلب";
      // Back: show Arabic + English + root
      elBackAr.textContent = c.arabic;
      elBackEn.textContent = c.formLabel + " • " + c.tenseAr +
        (c.pronounEn ? " • " + c.pronounEn : "") + "\n" + c.english;
      elBackRoot.textContent = "الجذر: " + c.root + "  —  " + c.meaning;
    } else {
      // Front: English → user recalls Arabic
      elFrontAr.textContent = "";
      elFrontEn.textContent = c.formLabel + " • " + c.tenseAr +
        (c.pronounEn ? " • " + c.pronounEn : "") + "\n" + c.english;
      elFrontHint.textContent = "tap to reveal Arabic";
      // Back: show Arabic + English + root
      elBackAr.textContent = c.arabic;
      elBackEn.textContent = c.english;
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
    var updated = SRS.computeNext(existing, grade);

    state.progressMap[c.id] = updated;
    DB.saveProgress(updated).catch(console.error);

    if (grade < 3) {
      // Hard: push to hard queue to be reshown at end
      state.hardQueue.push(c);
    } else {
      state.sessionDone++;
    }

    nextCard();
  }

  // ── Progress Bar ────────────────────────────────────────────────────────
  function updateProgress() {
    var total = state.sessionTotal;
    var done = state.sessionDone;
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
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
    var pm = state.progressMap;
    var allIds = CARDS.map(function (c) { return c.id; });
    var mastered = allIds.filter(function (id) {
      return pm[id] && pm[id].interval >= 21;
    }).length;
    var learning = allIds.filter(function (id) {
      return pm[id] && pm[id].repetitions > 0 && pm[id].interval < 21;
    }).length;
    var newCount = allIds.filter(function (id) { return !pm[id]; }).length;
    var dueToday = SRS.getDueCards(CARDS, pm).length;

    elStatsContent.innerHTML =
      stat("Total Cards", CARDS.length) +
      stat("Due Today", dueToday) +
      stat("New", newCount) +
      stat("Learning", learning) +
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

  elDoneRestart.addEventListener("click", function () {
    elDoneScreen.hidden = true;
    init();
  });

  // ── Start ────────────────────────────────────────────────────────────────
  window.App = { init: init };
  init();

})();
