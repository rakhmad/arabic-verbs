(function () {
  "use strict";

  // ── Pronouns ──────────────────────────────────────────────────────────────

  var PAST_PRONOUNS = [
    { ar: "هُوَ",      en: "he",           id: "huwa"    },
    { ar: "هِيَ",      en: "she",          id: "hiya"    },
    { ar: "هُمَا",     en: "they two (m)", id: "huma-m"  },
    { ar: "هُمَا",     en: "they two (f)", id: "huma-f"  },
    { ar: "هُمْ",      en: "they (m pl)",  id: "hum"     },
    { ar: "هُنَّ",     en: "they (f pl)",  id: "hunna"   },
    { ar: "أَنْتَ",    en: "you (m sg)",   id: "anta"    },
    { ar: "أَنْتِ",    en: "you (f sg)",   id: "anti"    },
    { ar: "أَنْتُمَا", en: "you two",      id: "antuma"  },
    { ar: "أَنْتُمْ",  en: "you (m pl)",   id: "antum"   },
    { ar: "أَنْتُنَّ", en: "you (f pl)",   id: "antunna" },
    { ar: "أَنَا",     en: "I",            id: "ana"     },
    { ar: "نَحْنُ",    en: "we",           id: "nahnu"   }
  ];

  var PRESENT_PRONOUNS = PAST_PRONOUNS;

  var IMPERATIVE_PRONOUNS = [
    { ar: "أَنْتَ",    en: "you (m sg)", id: "anta"    },
    { ar: "أَنْتِ",    en: "you (f sg)", id: "anti"    },
    { ar: "أَنْتُمَا", en: "you two",    id: "antuma"  },
    { ar: "أَنْتُمْ",  en: "you (m pl)", id: "antum"   },
    { ar: "أَنْتُنَّ", en: "you (f pl)", id: "antunna" }
  ];

  // ── Helper ────────────────────────────────────────────────────────────────

  function toRoman(n) {
    var map = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return map[n] || String(n);
  }

  // ── Forms ─────────────────────────────────────────────────────────────────

  var FORMS = [
    {
      form: 1,
      formAr: "فَعَلَ",
      root: "ك ت ب",
      meaning: "to write",
      pastEn: "wrote",
      presentEn: "writes",
      imperativeEn: "write",
      verbalNounEn: "writing",
      verbalNounAr: "كِتَابَة",
      past: [
        "كَتَبَ", "كَتَبَتْ", "كَتَبَا", "كَتَبَتَا", "كَتَبُوا", "كَتَبْنَ",
        "كَتَبْتَ", "كَتَبْتِ", "كَتَبْتُمَا", "كَتَبْتُمْ", "كَتَبْتُنَّ",
        "كَتَبْتُ", "كَتَبْنَا"
      ],
      present: [
        "يَكْتُبُ", "تَكْتُبُ", "يَكْتُبَانِ", "تَكْتُبَانِ", "يَكْتُبُونَ", "يَكْتُبْنَ",
        "تَكْتُبُ", "تَكْتُبِينَ", "تَكْتُبَانِ", "تَكْتُبُونَ", "تَكْتُبْنَ",
        "أَكْتُبُ", "نَكْتُبُ"
      ],
      imperative: [
        "اُكْتُبْ", "اُكْتُبِي", "اُكْتُبَا", "اُكْتُبُوا", "اُكْتُبْنَ"
      ]
    },
    {
      form: 2,
      formAr: "فَعَّلَ",
      root: "ع ل م",
      meaning: "to teach",
      pastEn: "taught",
      presentEn: "teaches",
      imperativeEn: "teach",
      verbalNounEn: "teaching",
      verbalNounAr: "تَعْلِيم",
      past: [
        "عَلَّمَ", "عَلَّمَتْ", "عَلَّمَا", "عَلَّمَتَا", "عَلَّمُوا", "عَلَّمْنَ",
        "عَلَّمْتَ", "عَلَّمْتِ", "عَلَّمْتُمَا", "عَلَّمْتُمْ", "عَلَّمْتُنَّ",
        "عَلَّمْتُ", "عَلَّمْنَا"
      ],
      present: [
        "يُعَلِّمُ", "تُعَلِّمُ", "يُعَلِّمَانِ", "تُعَلِّمَانِ", "يُعَلِّمُونَ", "يُعَلِّمْنَ",
        "تُعَلِّمُ", "تُعَلِّمِينَ", "تُعَلِّمَانِ", "تُعَلِّمُونَ", "تُعَلِّمْنَ",
        "أُعَلِّمُ", "نُعَلِّمُ"
      ],
      imperative: [
        "عَلِّمْ", "عَلِّمِي", "عَلِّمَا", "عَلِّمُوا", "عَلِّمْنَ"
      ]
    },
    {
      form: 3,
      formAr: "فَاعَلَ",
      root: "ج ه د",
      meaning: "to strive",
      pastEn: "strove",
      presentEn: "strives",
      imperativeEn: "strive",
      verbalNounEn: "striving / holy striving",
      verbalNounAr: "جِهَاد / مُجَاهَدَة",
      past: [
        "جَاهَدَ", "جَاهَدَتْ", "جَاهَدَا", "جَاهَدَتَا", "جَاهَدُوا", "جَاهَدْنَ",
        "جَاهَدْتَ", "جَاهَدْتِ", "جَاهَدْتُمَا", "جَاهَدْتُمْ", "جَاهَدْتُنَّ",
        "جَاهَدْتُ", "جَاهَدْنَا"
      ],
      present: [
        "يُجَاهِدُ", "تُجَاهِدُ", "يُجَاهِدَانِ", "تُجَاهِدَانِ", "يُجَاهِدُونَ", "يُجَاهِدْنَ",
        "تُجَاهِدُ", "تُجَاهِدِينَ", "تُجَاهِدَانِ", "تُجَاهِدُونَ", "تُجَاهِدْنَ",
        "أُجَاهِدُ", "نُجَاهِدُ"
      ],
      imperative: [
        "جَاهِدْ", "جَاهِدِي", "جَاهِدَا", "جَاهِدُوا", "جَاهِدْنَ"
      ]
    },
    {
      form: 4,
      formAr: "أَفْعَلَ",
      root: "س ل م",
      meaning: "to submit (to God)",
      pastEn: "submitted",
      presentEn: "submits",
      imperativeEn: "submit",
      verbalNounEn: "submission / Islam",
      verbalNounAr: "إِسْلَام",
      past: [
        "أَسْلَمَ", "أَسْلَمَتْ", "أَسْلَمَا", "أَسْلَمَتَا", "أَسْلَمُوا", "أَسْلَمْنَ",
        "أَسْلَمْتَ", "أَسْلَمْتِ", "أَسْلَمْتُمَا", "أَسْلَمْتُمْ", "أَسْلَمْتُنَّ",
        "أَسْلَمْتُ", "أَسْلَمْنَا"
      ],
      present: [
        "يُسْلِمُ", "تُسْلِمُ", "يُسْلِمَانِ", "تُسْلِمَانِ", "يُسْلِمُونَ", "يُسْلِمْنَ",
        "تُسْلِمُ", "تُسْلِمِينَ", "تُسْلِمَانِ", "تُسْلِمُونَ", "تُسْلِمْنَ",
        "أُسْلِمُ", "نُسْلِمُ"
      ],
      imperative: [
        "أَسْلِمْ", "أَسْلِمِي", "أَسْلِمَا", "أَسْلِمُوا", "أَسْلِمْنَ"
      ]
    },
    {
      form: 5,
      formAr: "تَفَعَّلَ",
      root: "ف ك ر",
      meaning: "to reflect / to think deeply",
      pastEn: "reflected",
      presentEn: "reflects",
      imperativeEn: "reflect",
      verbalNounEn: "deep reflection",
      verbalNounAr: "تَفَكُّر",
      past: [
        "تَفَكَّرَ", "تَفَكَّرَتْ", "تَفَكَّرَا", "تَفَكَّرَتَا", "تَفَكَّرُوا", "تَفَكَّرْنَ",
        "تَفَكَّرْتَ", "تَفَكَّرْتِ", "تَفَكَّرْتُمَا", "تَفَكَّرْتُمْ", "تَفَكَّرْتُنَّ",
        "تَفَكَّرْتُ", "تَفَكَّرْنَا"
      ],
      present: [
        "يَتَفَكَّرُ", "تَتَفَكَّرُ", "يَتَفَكَّرَانِ", "تَتَفَكَّرَانِ", "يَتَفَكَّرُونَ", "يَتَفَكَّرْنَ",
        "تَتَفَكَّرُ", "تَتَفَكَّرِينَ", "تَتَفَكَّرَانِ", "تَتَفَكَّرُونَ", "تَتَفَكَّرْنَ",
        "أَتَفَكَّرُ", "نَتَفَكَّرُ"
      ],
      imperative: [
        "تَفَكَّرْ", "تَفَكَّرِي", "تَفَكَّرَا", "تَفَكَّرُوا", "تَفَكَّرْنَ"
      ]
    },
    {
      form: 6,
      formAr: "تَفَاعَلَ",
      root: "ع ر ف",
      meaning: "to get acquainted",
      pastEn: "got acquainted",
      presentEn: "gets acquainted",
      imperativeEn: "get acquainted",
      verbalNounEn: "mutual acquaintance",
      verbalNounAr: "تَعَارُف",
      past: [
        "تَعَارَفَ", "تَعَارَفَتْ", "تَعَارَفَا", "تَعَارَفَتَا", "تَعَارَفُوا", "تَعَارَفْنَ",
        "تَعَارَفْتَ", "تَعَارَفْتِ", "تَعَارَفْتُمَا", "تَعَارَفْتُمْ", "تَعَارَفْتُنَّ",
        "تَعَارَفْتُ", "تَعَارَفْنَا"
      ],
      present: [
        "يَتَعَارَفُ", "تَتَعَارَفُ", "يَتَعَارَفَانِ", "تَتَعَارَفَانِ", "يَتَعَارَفُونَ", "يَتَعَارَفْنَ",
        "تَتَعَارَفُ", "تَتَعَارَفِينَ", "تَتَعَارَفَانِ", "تَتَعَارَفُونَ", "تَتَعَارَفْنَ",
        "أَتَعَارَفُ", "نَتَعَارَفُ"
      ],
      imperative: [
        "تَعَارَفْ", "تَعَارَفِي", "تَعَارَفَا", "تَعَارَفُوا", "تَعَارَفْنَ"
      ]
    },
    {
      form: 7,
      formAr: "اِنْفَعَلَ",
      root: "ق ط ع",
      meaning: "to be cut off",
      pastEn: "was cut off",
      presentEn: "is cut off",
      imperativeEn: "be cut off",
      verbalNounEn: "severance / being cut off",
      verbalNounAr: "اِنْقِطَاع",
      past: [
        "اِنْقَطَعَ", "اِنْقَطَعَتْ", "اِنْقَطَعَا", "اِنْقَطَعَتَا", "اِنْقَطَعُوا", "اِنْقَطَعْنَ",
        "اِنْقَطَعْتَ", "اِنْقَطَعْتِ", "اِنْقَطَعْتُمَا", "اِنْقَطَعْتُمْ", "اِنْقَطَعْتُنَّ",
        "اِنْقَطَعْتُ", "اِنْقَطَعْنَا"
      ],
      present: [
        "يَنْقَطِعُ", "تَنْقَطِعُ", "يَنْقَطِعَانِ", "تَنْقَطِعَانِ", "يَنْقَطِعُونَ", "يَنْقَطِعْنَ",
        "تَنْقَطِعُ", "تَنْقَطِعِينَ", "تَنْقَطِعَانِ", "تَنْقَطِعُونَ", "تَنْقَطِعْنَ",
        "أَنْقَطِعُ", "نَنْقَطِعُ"
      ],
      imperative: [
        "اِنْقَطِعْ", "اِنْقَطِعِي", "اِنْقَطِعَا", "اِنْقَطِعُوا", "اِنْقَطِعْنَ"
      ]
    },
    {
      form: 8,
      formAr: "اِفْتَعَلَ",
      root: "ح ر م",
      meaning: "to respect",
      pastEn: "respected",
      presentEn: "respects",
      imperativeEn: "respect",
      verbalNounEn: "respect",
      verbalNounAr: "اِحْتِرَام",
      past: [
        "اِحْتَرَمَ", "اِحْتَرَمَتْ", "اِحْتَرَمَا", "اِحْتَرَمَتَا", "اِحْتَرَمُوا", "اِحْتَرَمْنَ",
        "اِحْتَرَمْتَ", "اِحْتَرَمْتِ", "اِحْتَرَمْتُمَا", "اِحْتَرَمْتُمْ", "اِحْتَرَمْتُنَّ",
        "اِحْتَرَمْتُ", "اِحْتَرَمْنَا"
      ],
      present: [
        "يَحْتَرِمُ", "تَحْتَرِمُ", "يَحْتَرِمَانِ", "تَحْتَرِمَانِ", "يَحْتَرِمُونَ", "يَحْتَرِمْنَ",
        "تَحْتَرِمُ", "تَحْتَرِمِينَ", "تَحْتَرِمَانِ", "تَحْتَرِمُونَ", "تَحْتَرِمْنَ",
        "أَحْتَرِمُ", "نَحْتَرِمُ"
      ],
      imperative: [
        "اِحْتَرِمْ", "اِحْتَرِمِي", "اِحْتَرِمَا", "اِحْتَرِمُوا", "اِحْتَرِمْنَ"
      ]
    },
    {
      form: 9,
      formAr: "اِفْعَلَّ",
      root: "ح م ر",
      meaning: "to turn red",
      pastEn: "turned red",
      presentEn: "turns red",
      imperativeEn: "turn red",
      verbalNounEn: "reddening",
      verbalNounAr: "اِحْمِرَار",
      past: [
        "اِحْمَرَّ", "اِحْمَرَّتْ", "اِحْمَرَّا", "اِحْمَرَّتَا", "اِحْمَرُّوا", "اِحْمَرَرْنَ",
        "اِحْمَرَرْتَ", "اِحْمَرَرْتِ", "اِحْمَرَرْتُمَا", "اِحْمَرَرْتُمْ", "اِحْمَرَرْتُنَّ",
        "اِحْمَرَرْتُ", "اِحْمَرَرْنَا"
      ],
      present: [
        "يَحْمَرُّ", "تَحْمَرُّ", "يَحْمَرَّانِ", "تَحْمَرَّانِ", "يَحْمَرُّونَ", "يَحْمَرِرْنَ",
        "تَحْمَرُّ", "تَحْمَرِّينَ", "تَحْمَرَّانِ", "تَحْمَرُّونَ", "تَحْمَرِرْنَ",
        "أَحْمَرُّ", "نَحْمَرُّ"
      ],
      imperative: [
        "اِحْمَرَّ", "اِحْمَرِّي", "اِحْمَرَّا", "اِحْمَرُّوا", "اِحْمَرِرْنَ"
      ]
    },
    {
      form: 10,
      formAr: "اِسْتَفْعَلَ",
      root: "غ ف ر",
      meaning: "to seek forgiveness",
      pastEn: "sought forgiveness",
      presentEn: "seeks forgiveness",
      imperativeEn: "seek forgiveness",
      verbalNounEn: "seeking forgiveness",
      verbalNounAr: "اِسْتِغْفَار",
      past: [
        "اِسْتَغْفَرَ", "اِسْتَغْفَرَتْ", "اِسْتَغْفَرَا", "اِسْتَغْفَرَتَا", "اِسْتَغْفَرُوا", "اِسْتَغْفَرْنَ",
        "اِسْتَغْفَرْتَ", "اِسْتَغْفَرْتِ", "اِسْتَغْفَرْتُمَا", "اِسْتَغْفَرْتُمْ", "اِسْتَغْفَرْتُنَّ",
        "اِسْتَغْفَرْتُ", "اِسْتَغْفَرْنَا"
      ],
      present: [
        "يَسْتَغْفِرُ", "تَسْتَغْفِرُ", "يَسْتَغْفِرَانِ", "تَسْتَغْفِرَانِ", "يَسْتَغْفِرُونَ", "يَسْتَغْفِرْنَ",
        "تَسْتَغْفِرُ", "تَسْتَغْفِرِينَ", "تَسْتَغْفِرَانِ", "تَسْتَغْفِرُونَ", "تَسْتَغْفِرْنَ",
        "أَسْتَغْفِرُ", "نَسْتَغْفِرُ"
      ],
      imperative: [
        "اِسْتَغْفِرْ", "اِسْتَغْفِرِي", "اِسْتَغْفِرَا", "اِسْتَغْفِرُوا", "اِسْتَغْفِرْنَ"
      ]
    }
  ];

  // ── buildCards ────────────────────────────────────────────────────────────

  function buildCards() {
    var cards = [];

    FORMS.forEach(function (f) {
      var formLabel = "Form " + toRoman(f.form);

      // 1. Past (13 cards)
      PAST_PRONOUNS.forEach(function (p, i) {
        cards.push({
          id:        "f" + f.form + "-past-" + p.id,
          form:      f.form,
          formAr:    f.formAr,
          formLabel: formLabel,
          tense:     "past",
          tenseAr:   "ماضي",
          pronounAr: p.ar,
          pronounEn: p.en,
          arabic:    f.past[i],
          english:   p.en + " " + f.pastEn,
          root:      f.root,
          meaning:   f.meaning
        });
      });

      // 2. Present (13 cards)
      PRESENT_PRONOUNS.forEach(function (p, i) {
        cards.push({
          id:        "f" + f.form + "-present-" + p.id,
          form:      f.form,
          formAr:    f.formAr,
          formLabel: formLabel,
          tense:     "present",
          tenseAr:   "مضارع",
          pronounAr: p.ar,
          pronounEn: p.en,
          arabic:    f.present[i],
          english:   p.en + " " + f.presentEn,
          root:      f.root,
          meaning:   f.meaning
        });
      });

      // 3. Imperative (5 cards)
      IMPERATIVE_PRONOUNS.forEach(function (p, i) {
        cards.push({
          id:        "f" + f.form + "-imperative-" + p.id,
          form:      f.form,
          formAr:    f.formAr,
          formLabel: formLabel,
          tense:     "imperative",
          tenseAr:   "أمر",
          pronounAr: p.ar,
          pronounEn: p.en,
          arabic:    f.imperative[i],
          english:   p.en + ": " + f.imperativeEn + "!",
          root:      f.root,
          meaning:   f.meaning
        });
      });

      // 4. Verbal noun (1 card)
      cards.push({
        id:        "f" + f.form + "-verbal-noun",
        form:      f.form,
        formAr:    f.formAr,
        formLabel: formLabel,
        tense:     "verbal-noun",
        tenseAr:   "مصدر",
        pronounAr: "",
        pronounEn: "",
        arabic:    f.verbalNounAr,
        english:   f.verbalNounEn,
        root:      f.root,
        meaning:   f.meaning
      });
    });

    return cards;
  }

  // ── Export globals ─────────────────────────────────────────────────────────

  window.CARDS      = buildCards();
  window.FORMS_META = FORMS;

}());
