(function (window) {
  var MAX_NEW_PER_SESSION = 20;

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(dateStr, n) {
    var d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function createInitialProgress(cardId) {
    return {
      id: cardId,
      easeFactor: 2.5,
      interval: 0,
      dueDate: today(),
      repetitions: 0
    };
  }

  function computeNext(progress, grade) {
    var t = today();
    if (typeof grade !== 'number' || grade < 0 || grade > 5) {
      grade = 1; // treat invalid grade as hard
    }
    var ef = progress.easeFactor;
    var interval = progress.interval;
    var reps = progress.repetitions;
    var newInterval, newEf, newReps;

    if (grade < 3) {
      newInterval = 1;
      newEf = Math.max(1.3, ef - 0.2);
      newReps = 0;
    } else {
      if (reps === 0) {
        newInterval = 1;
      } else if (reps === 1) {
        newInterval = 3;
      } else {
        newInterval = Math.round(interval * ef);
      }
      newEf = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
      newEf = Math.max(1.3, newEf);
      newReps = reps + 1;
    }

    return {
      id: progress.id,
      easeFactor: Math.round(newEf * 1000) / 1000,
      interval: newInterval,
      dueDate: addDays(t, newInterval),
      repetitions: newReps
    };
  }

  function getDueCards(allCards, progressMap) {
    var due = [];
    var newCards = [];
    var todayStr = today();

    for (var i = 0; i < allCards.length; i++) {
      var card = allCards[i];
      var prog = progressMap[card.id];
      if (prog) {
        if (prog.dueDate <= todayStr) {
          due.push(card);
        }
      } else {
        newCards.push(card);
      }
    }

    return shuffle(due).concat(shuffle(newCards).slice(0, MAX_NEW_PER_SESSION));
  }

  window.SRS = {
    createInitialProgress: createInitialProgress,
    computeNext: computeNext,
    getDueCards: getDueCards,
    today: today
  };
}(window));
