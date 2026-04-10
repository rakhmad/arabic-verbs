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
