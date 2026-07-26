# Item Bank Review — Placement Test

**STATUS: SIGNED OFF — 26.07.2026, Dennis. The gate is satisfied; the test may be given to the
child.** (This document was `REQUIRED-BEFORE-CHILD-USE`. See section 6 for the sign-off and the one
defect it caught.)

> **הדרך המהירה:** פתחי את `docs/item-bank-review.html` בדפדפן (לחיצה כפולה על
> הקובץ). הכלי מנגן כל הקלטה ומציג כל תמונה ואת כל האפשרויות, עם תיבת סימון לכל
> שאלה — כמה דקות של לחיצות במקום פתיחת קבצי mp3 ידנית. המסמך הזה נשאר המקום
> שבו רושמים את האישור (סעיף 6) ואת הוראות התיקון (סעיף 5).
> הכלי נוצר על ידי `node scripts/build-item-review.js` ואינו נשלח לאפליקציה —
> הוא מכיל את התשובות הנכונות ולכן חייב להישאר מחוץ ל-`public/`.

## 1. What this is (מה זה)

אלה כל השאלות (items) שהבת שלך תראה במבחן המיון (placement test). המבחן קובע את **רמת ההתחלה** שלה באפליקציה — אם השאלות לא ברורות, לא מדויקות, או קשות/קלות מדי, הרמה שתיקבע תהיה שגויה. אנא עברי על כל הרשימה למטה **לפני** שהילדה עושה את המבחן בפעם הראשונה. עם הכלי שלמעלה זה אמור לקחת כמה דקות.

## 2. Task 1 items (12)

Task 1 items are drawn from `data/placement-items.json` → `task1`. Items `t1-01`..`t1-06` are `audio-to-picture` (she hears a word, picks the matching emoji out of 4 options) and have a spoken-word mp3 at `public/audio/word-<lemma>.mp3`. Items `t1-07`..`t1-12` are `picture-to-word` (she sees an emoji, picks the matching English word out of 4 options).

**Per-item checks to perform:**
- האם האימוג'י (emoji) מציג בבירור את המילה?
- האם התרגום לעברית (he) נכון?
- האם 3 האפשרויות השגויות (distractors) חד-משמעיות — כלומר יש רק תשובה נכונה אחת אפשרית?
- לפריטי אודיו (audio): נגני את קובץ ה-mp3 ב-`public/audio/word-<lemma>.mp3` — האם המילה מבוטאת בבירור ובנכונות?

| # | id | lemma | he | emoji | direction | audio file | ✅ checked |
|---|-----|--------|--------------|------|-------------------|--------------------------------|---|
| 1 | t1-01 | pet | חיית מחמד | 🐕 | audio-to-picture | `public/audio/word-pet.mp3` | ☐ |
| 2 | t1-02 | mom | אמא | 👩 | audio-to-picture | `public/audio/word-mom.mp3` | ☐ |
| 3 | t1-03 | camp | מחנה | 🏕️ | audio-to-picture | `public/audio/word-camp.mp3` | ☐ |
| 4 | t1-04 | fan | מאוורר | 🌀 | audio-to-picture | `public/audio/word-fan.mp3` | ☐ |
| 5 | t1-05 | dad | אבא | 👨 | audio-to-picture | `public/audio/word-dad.mp3` | ☐ |
| 6 | t1-06 | desk | שולחן | 🧑‍💻 | audio-to-picture | `public/audio/word-desk.mp3` | ☐ |
| 7 | t1-07 | singer | זמר | 🎤 | picture-to-word | — | ☐ |
| 8 | t1-08 | horse | סוס | 🐎 | picture-to-word | — | ☐ |
| 9 | t1-09 | zoo | גן חיות | 🦁 | picture-to-word | — | ☐ |
| 10 | t1-10 | movie | סרט | 🎬 | picture-to-word | — | ☐ |
| 11 | t1-11 | monkey | קוף | 🐒 | picture-to-word | — | ☐ |
| 12 | t1-12 | steak | סטייק | 🥩 | picture-to-word | — | ☐ |

## 3. Known weak spots (נקודות חלשות ידועות)

אלה זוהו מראש בזמן בניית ה-item bank. שימי לב אליהן במיוחד:

- **`t1-06` desk → 🧑‍💻** — האימוג'י הזה נקרא בעיקר כ"אדם מול מחשב" (person at computer), לא כ"שולחן" באופן חד-משמעי. בנוסף, התרגום לעברית "שולחן" עמום — כדאי לשקול מילה ברורה יותר, או לתקן את התרגום ל-"שולחן כתיבה" כדי להבהיר את הכוונה.
- **`t1-04` fan → 🌀** — אימוג'י הציקלון (cyclone) הוא ייצוג חלש למילה "מאוורר". וודאי מול הבת שלך שהיא אכן מזהה את זה כ"מאוורר" — אם לא, שקלי להחליף את הפריט.

## 4. Task 2 texts (2)

Task 2 items are drawn from `data/placement-items.json` → `task2`. Each text has 3 comprehension questions, each with 4 Hebrew-language answer options and a marked correct answer (`correctIndex`, 0-based).

**Per-text / per-question checks:**
- האם הטקסט טבעי ומתאים לרמה?
- האם יש בטקסט "ספוילר" לתשובה (למשל התשובה כתובה מילה במילה)?
- האם כל שאלה ניתנת למענה מתוך הטקסט בלבד?
- האם התשובה המסומנת כנכונה באמת נכונה?
- האם הניסוח בעברית טבעי?

### Text 1 — `t2-t1`: "בדיקת חיה בבית החולים" ☐

> The doctor is at the hospital. She looks at the dog. The dog is not well. The doctor gives advice to the owner. They will come again tomorrow.

| id | prompt | options (✔ = marked correct) |
|----|--------|-------------------------------|
| t2-t1-q1 | איפה נמצא הרופא? | ✔ בבית החולים · בבית · בגן · בבית הספר |
| t2-t1-q2 | מה עושה הרופא לכלב? | ✔ בודק אותו · משחק איתו · נותן לו אוכל · רואה סרט |
| t2-t1-q3 | מתי הם יחזרו? | ✔ מחר · היום · אתמול · בשבוע הבא |

### Text 2 — `t2-t2`: "חיות בגן החיות" ☐

> There is a big elephant at the zoo. The elephant is near a tree. A boy and a girl look at the elephant. They like the animal very much. The sun is bright and the day is warm.

| id | prompt | options (✔ = marked correct) |
|----|--------|-------------------------------|
| t2-t2-q1 | איזה חיה יש בגן החיות? | ✔ פיל · כלב · חתול · ציפור |
| t2-t2-q2 | איפה הפיל נמצא? | ✔ ליד עץ · על המים · בבית · במכונית |
| t2-t2-q3 | איך הילדים מרגישים לגבי הפיל? | ✔ הם אוהבים אותו · הם מפחדים ממנו · הם לא רואים אותו · הם עייפים |

## 5. How to fix an item safely (איך לתקן פריט בבטחה)

1. Edit `data/placement-items.json` **directly** (there is no UI for this).
2. **NEVER** change the schema: keys, id formats (`t1-NN`, `t2-tN`, `t2-tN-qM`), the "exactly 4 options" rule, or the `correctIndex` range (0-3).
3. After **any** edit, run `npm test` — it lints the bank mechanically (checks ids, distinct options, Hebrew fields, correctIndex bounds, etc.).
4. If you changed the **lemma** of an audio item (`t1-01`..`t1-06`), you must regenerate its mp3:
   ```
   set -a; . ./.env; set +a; node scripts/build-tts.js
   ```
5. Commit the changes (`data/placement-items.json`, and any regenerated file under `public/audio/`).

## 6. Sign-off (אישור)

Date: ___26.07.2026___________

☑ Reviewed and approved — I have gone through every item above and the placement test is ready for my child to use.

Reviewer's finding, fixed before signing: `t1-04` ("fan") offered **singer** as one of the four
pictures. Because "fan" also means an admirer, the singer was a defensible second correct answer.
Replaced with **camp** and redeployed (commit `9a7c790`). No automated check could have caught this:
they all verify that the marked answer is correct, not that no *other* option is also correct.

Signed: _____Dennis_________
