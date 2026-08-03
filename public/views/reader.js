import { getJson, postJson } from "../api.js";
import { resolveLemma } from "../lemma.js";
import { getAllowedSet } from "../words-index.js";
import { startQuiz } from "../quiz.js";
import { pickQuizWords, knownSetFromProfile, pickCandidateWords } from "../quiz-core.js";
import { maybeCelebrateTrophy } from "./trophies.js";
import { playOverMusic } from "../music.js";

const CHAPTER_BANNERS = { 0: "chapter-night", 1: "chapter-clinic", 2: "chapter-forest" };

// C (word-finish). ONE SITTING'S READER STATE. The router (public/app.js:37-52)
// does app.innerHTML = "" and calls the view again on every hashchange, so leaving
// for the dictionary and coming back built a brand-new closure, refetched the
// profile, and painted a loading screen while she waited. Measured before the fix:
// on a re-entry the FIRST paint contained no story at all.
//
// The profile is STILL refetched on every entry -- this caches the PAINT, not the
// FETCH. The refetch simply happens behind a screen she can already read.
let sitting = null;

// Only the mounted view may paint. renderRoute hands the SAME #app element to every
// view, so an in-flight callback from a view she has already left can otherwise
// overwrite whatever is on screen now.
let mountSeq = 0;

// The invalidation signal is the WHOLE serialised profile, never a list of fields.
// A hand-maintained field list silently stops covering a field the day someone
// renders a new one, and THAT failure direction shows a child a stale story.
// Comparing everything cannot under-invalidate; at worst it over-invalidates, which
// costs one local redraw and no network. A throw returns null, treated as changed.
export function profileSignature(profile) {
  try {
    return JSON.stringify(profile);
  } catch (err) {
    return null;
  }
}

// On a re-entry the quiz must be able to run again. bindEvents only calls startQuiz
// when `started` is false, so a kept quizState with started:true would render an
// empty quiz slot and never fill it -- no quiz, no continue button, green suite.
export function restartQuizzes(quizState) {
  if (!quizState || typeof quizState !== "object") return quizState;
  for (const key of Object.keys(quizState)) {
    const entry = quizState[key];
    if (entry && typeof entry === "object") entry.started = false;
  }
  return quizState;
}

// F1-2 / R4(ii). THE READ-BACK. Her answers were already saved durably
// (api/profile.js:104 -> lib/profile.js:418) and NOTHING read them, so a page
// reload showed every answered question as unanswered. Phase 1 kept state across
// a TAB SWITCH only; a reload builds a new module instance and `sitting` is null.
//
// design.md section 10, the OWNER'S RULING, quoted so no later step re-opens it:
//   "a question counts as ANSWERED AND DONE if any logged attempt was correct,
//    not only the first ... where checkLog holds several entries for the same
//    questionId (possible from prior re-entries), the question is done if ANY of
//    them is correct."
//
// THREE THINGS ARE LOAD-BEARING, and each was measured before it was written:
//
// 1. CORRECTNESS IS RECOMPUTED AGAINST THE QUESTION ON SCREEN, never read from
//    the entry's own `correct` flag. That flag is derived server-side from a
//    correctIndex the BROWSER supplied (api/profile.js:95-109 validates its type
//    and nothing else), so it is a claim about a question that may no longer be
//    the one being rendered. Two sources for one card is exactly the seam that
//    put "target reached" on a greyed trophy (field guide 15b). Here there is one.
//
// 2. THE OPTION AT q.correctIndex CAN NEVER BE DISABLED. `correct` and
//    `triedWrong` are filled from the SAME comparison, in opposite branches, so
//    "restored as wrong" and "is the right answer" are not simultaneously
//    representable. Without this, a chapter whose correctIndex moved would grey
//    out the only option that can clear the question and strand her on it.
//
// 3. logged IS FALSE UNLESS SHE IS ALREADY CORRECT. checkLog records only the
//    FIRST attempt (reader.js's own isFirstAnswer guard), so a wrong-then-right
//    question leaves ONLY the wrong entry behind -- MEASURED, not assumed. If the
//    restore also set logged=true, her next correct answer would never be posted,
//    the log could never learn she got it right, and the question would come back
//    unfinished after EVERY reload, forever. logged=false makes the log
//    self-healing: the correct attempt is appended, and the de-duplication rule
//    above is precisely what makes that second entry safe.
export function restoredCheckState(chapter, checkLog) {
  const out = {};
  const questions = chapter && Array.isArray(chapter.questions) ? chapter.questions : [];
  const log = Array.isArray(checkLog) ? checkLog : [];
  for (const q of questions) {
    if (!q || typeof q.id !== "string") continue;
    let correct = false;
    let chosen = null;
    const triedWrong = new Set();
    for (const entry of log) {
      if (!entry || entry.questionId !== q.id) continue;
      if (typeof entry.chosenIndex !== "number") continue;
      if (entry.chosenIndex === q.correctIndex) {
        correct = true;
      } else {
        triedWrong.add(entry.chosenIndex);
        chosen = entry.chosenIndex;
      }
    }
    if (!correct && triedWrong.size === 0) continue;
    out[q.id] = { correct, chosen: correct ? q.correctIndex : chosen, logged: correct, triedWrong };
  }
  return out;
}

// The restore FILLS IN; it never downgrades. A re-entry refetches the profile
// (phase 1 kept the paint, not the fetch), so this runs again on every tab
// switch -- and F1-3 means a POST she made in this sitting may have been
// swallowed. Overwriting would then UNDO on screen work the server never heard
// about. Merging can only ever move a question from unanswered towards done.
export function mergeRestoredChecks(checkState, restored) {
  for (const [id, r] of Object.entries(restored)) {
    const cur = checkState[id];
    if (!cur) {
      checkState[id] = r;
      continue;
    }
    if (r.correct && !cur.correct) {
      cur.correct = true;
      cur.chosen = r.chosen;
      cur.logged = true;
    }
    if (cur.triedWrong instanceof Set) {
      for (const i of r.triedWrong) cur.triedWrong.add(i);
    }
  }
  return checkState;
}

// C (word-finish), the other half of "it takes time": she also loses her place.
// app.innerHTML = "" collapses the document height to nothing, so the browser
// drops her to the top before the new view has any content.
//
// There is no unmount hook, so the position is recorded CONTINUOUSLY rather than
// at the moment of leaving. The hash guard is the same source of truth the router
// itself uses (app.js:20), so scrolling the dictionary can never overwrite the
// reader's saved position -- and by the time the router runs, the hash has already
// changed, so the collapse-to-zero scroll event is ignored.
//
// A hashchange listener would fire earlier and be exact, but only because
// reader.js's module body runs before app.js's. Depending on ESM evaluation order
// would fail SILENTLY -- restoring her to 0 with nothing to show for it -- the day
// someone reorders an import. This does not depend on it.
let readerScrollY = 0;

export function shouldRecordScroll(hash) {
  return hash === "#/reader";
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener(
    "scroll",
    () => {
      if (shouldRecordScroll(window.location.hash)) readerScrollY = window.scrollY;
    },
    { passive: true }
  );
}

const VIEW_STYLE = `
  .reader-card-title {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .reader-chapter-label {
    font-size: 0.9rem;
    color: var(--color-muted);
    font-weight: 600;
    margin-bottom: 10px;
  }

  .reader-text {
    font-size: 1.08rem;
    line-height: 1.9;
    text-align: left;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .reader-text .w {
    cursor: pointer;
    border-radius: 4px;
    transition: background var(--transition-fast);
  }

  .reader-text .w:active,
  .reader-text .w.tapped {
    background: color-mix(in srgb, var(--color-accent) 28%, var(--color-card));
  }

  .reader-onboard-field {
    margin-bottom: 18px;
  }

  .reader-onboard-label {
    display: block;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .reader-onboard-input {
    width: 100%;
    min-height: 48px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    padding: 0 16px;
    font-size: 1.05rem;
    font-family: inherit;
    color: var(--color-ink);
  }

  .reader-onboard-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .reader-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 40px 16px;
    text-align: center;
    color: var(--color-muted);
    font-weight: 600;
  }

  .reader-spinner {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      var(--color-primary),
      var(--color-teal),
      var(--color-accent),
      var(--color-primary)
    );
    -webkit-mask-image: radial-gradient(circle, transparent 56%, #000 60%);
    mask-image: radial-gradient(circle, transparent 56%, #000 60%);
    animation: reader-spin 1.4s linear infinite;
  }

  @keyframes reader-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .reader-loading-art {
    animation: reader-float 3.2s ease-in-out infinite;
  }

  @keyframes reader-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .reader-spinner { animation-duration: 3.2s; }
    .reader-loading-art { animation: none; }
  }

  .reader-question-card {
    margin-bottom: 16px;
  }

  .reader-question-prompt {
    font-weight: 700;
    margin-bottom: 12px;
  }

  .reader-question-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .reader-question-option {
    min-height: 48px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-surface-2);
    box-shadow: var(--shadow-soft);
    color: var(--color-ink);
    font-size: 0.98rem;
    font-weight: 600;
    padding: 10px 16px;
    text-align: right;
    cursor: pointer;
    transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  }

  .reader-question-option:active {
    transform: scale(0.98);
  }

  .reader-question-option.correct {
    border-color: var(--color-teal);
    background: color-mix(in srgb, var(--color-teal) 16%, var(--color-card));
  }

  .reader-question-option.wrong {
    border-color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger) 16%, var(--color-card));
  }

  .reader-question-option[disabled] {
    cursor: default;
  }

  .reader-question-feedback {
    margin-top: 10px;
    font-weight: 700;
  }

  .reader-question-feedback.ok {
    color: var(--color-teal);
  }

  .reader-question-feedback.bad {
    color: var(--color-danger);
  }

  .reader-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 50;
  }

  .reader-popup {
    width: 100%;
    max-width: 480px;
    background: var(--color-card);
    border-radius: var(--radius) var(--radius) 0 0;
    box-shadow: var(--shadow-soft);
    padding: 22px 20px calc(20px + env(safe-area-inset-bottom, 0px));
    text-align: center;
  }

  .reader-popup-word {
    font-size: 1.4rem;
    font-weight: 700;
    direction: ltr;
    margin-bottom: 6px;
  }

  .reader-popup-he {
    font-size: 1.2rem;
    color: var(--color-muted);
    margin-bottom: 18px;
  }

  .reader-popup-confirm {
    color: var(--color-teal);
    font-weight: 700;
    margin-top: 10px;
  }

  .reader-popup {
    animation: reader-popup-in var(--transition-fast);
  }

  .reader-popup::before {
    content: "";
    display: block;
    width: 40px;
    height: 4px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-muted) 45%, var(--color-card));
    margin: -6px auto 14px;
  }

  @keyframes reader-popup-in {
    from { transform: translateY(12px); opacity: 0.6; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

// R8. The music control MOVED to the app shell (public/index.html + app.js) so it
// exists on every screen: the <audio> element is module state and keeps playing
// across routes, so a reader-only button left her with music running and no way
// to stop it on her word list or trophies. The header is back to what it was.
function header(subtitle, title) {
  return `
    <header class="app-header">
      <p class="greeting">${subtitle}</p>
      <h1 class="app-title">${title}</h1>
    </header>
  `;
}

function styleTag() {
  return `<style>${VIEW_STYLE}</style>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function normalizeWord(raw) {
  return raw.toLowerCase().replace(/[^a-z]/g, "");
}

// word-finish phase 2 (design section 8, FROZEN). canSay gates the button's STATE, no
// longer its EXISTENCE. A word we cannot speak still shows the speaker, crossed out
// by CSS, with the ASCII caption "coming soon" under it -- so she can tell "no sound
// for THIS word yet" from "this app has no sound". The pressable branch still implies
// a clip exists: it is the only branch that carries data-say, and the [data-say]
// handler is the only thing that can play anything.
export function saySlot(canSay, lemma) {
  if (canSay) {
    return `<button class="btn-say" type="button" data-say="${escapeHtml(lemma)}" aria-label="הקשיבי למילה">🔊</button>`;
  }
  return `<span class="say-soon-wrap"><button class="btn-say na" type="button" disabled aria-hidden="true">🔊</button><span class="btn-say-soon">coming soon</span></span>`;
}

function renderWords(text) {
  const tokens = text.split(/(\s+)/);
  return tokens
    .map((tok) => {
      if (/^\s+$/.test(tok) || tok === "") return tok;
      const dataWord = normalizeWord(tok);
      if (dataWord === "") return escapeHtml(tok);
      return `<span class="w" data-word="${escapeHtml(dataWord)}">${escapeHtml(tok)}</span>`;
    })
    .join("");
}

// Exported so a test can pin the two decisions that are easy to get backwards:
// we SAVE the lemma ("feel") but SEARCH for the sentence by the surface form
// ("feels"), because the chapter never contains the lemma. Swap them and the
// context is silently empty forever.
export function wordTapBody({ lemma, surface, he, text }) {
  const body = { action: "word-tap", lemma, he: he || null };
  const context = sentenceFor(text, surface);
  if (context) body.context = context;
  return body;
}

export function sentenceFor(text, word) {
  const target = String(word).toLowerCase();
  for (const s of String(text).split(/(?<=[.!?])\s+/)) {
    if (s.toLowerCase().split(/[^a-z']+/).includes(target)) return s.trim().slice(0, 200);
  }
  return "";
}

// Frozen decision table: she is NEVER blocked from continuing the story --
// if there is nothing to ask (lemmaCount=0), 'celebrate' wins even though the
// quiz has not run.
export function afterChapterStage({ doneAll, quizDone, lemmaCount }) {
  if (!doneAll) return "questions";
  if (quizDone) return "celebrate";
  if (lemmaCount === 0) return "celebrate";
  return "quiz";
}

// Keyed by chapter number so a fresh chapter always gets a fresh quiz -- a
// flat boolean here would silently skip the quiz on chapter 2 onward.
export function chapterQuizState(quizState, n) {
  if (!quizState[n]) quizState[n] = { started: false, done: false };
  return quizState[n];
}

// T2 (word-polish). The end-of-chapter quiz asks about THIS chapter's words
// first. Four things are frozen here, because each is a place the quiz can
// silently do nothing at all:
//  * the key is `word`, not `lemma` -- a glossary entry is { word, he }.
//  * a word containing a space ("deep breath") can never be a lemma file.
//  * a glossary word is DROPPED unless it is already a key in profile.words:
//    api/profile.js:130 answers a quiz-answer for an unknown word with
//    400 'unknown word' and public/quiz.js:304 swallows that, so an
//    unrecordable word buys a question that scores nothing, awards no
//    quizRight progress and never records lastQuizAt.
//  * the chapter's words are SHUFFLED with the Fisher-Yates from
//    quiz-core.js:26-29, so re-opening a chapter does not always ask the
//    same first four.
// The global pool is appended, de-duplicated. A lemma already asked earlier in
// this sitting goes to the TAIL rather than being dropped, so the quiz can
// always still reach four. Pure: no DOM, no fetch, no clock.
export function chapterQuizLemmas(chapter, words, pool, asked, rand = Math.random) {
  const known = words && typeof words === "object" ? words : {};
  const seen = new Set();
  const first = [];
  const glossary = chapter && Array.isArray(chapter.glossary) ? chapter.glossary : [];
  for (const g of glossary) {
    if (!g || typeof g.word !== "string") continue;
    const k = g.word.trim().toLowerCase();
    if (k === "" || k.includes(" ")) continue;
    if (!Object.prototype.hasOwnProperty.call(known, k)) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    first.push(k);
  }
  for (let i = first.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [first[i], first[j]] = [first[j], first[i]];
  }
  const already = asked instanceof Set ? asked : new Set();
  const fresh = [];
  const repeat = [];
  for (const k of Array.isArray(pool) ? pool : []) {
    if (typeof k !== "string" || seen.has(k)) continue;
    seen.add(k);
    if (already.has(k)) repeat.push(k);
    else fresh.push(k);
  }
  return first.concat(fresh, repeat);
}

function findInGlossary(chapter, dataWord) {
  if (!chapter || !Array.isArray(chapter.glossary)) return null;
  for (const g of chapter.glossary) {
    if (!g || typeof g.word !== "string") continue;
    const gw = g.word.toLowerCase();
    if (gw === dataWord || dataWord.startsWith(gw)) {
      return g.he;
    }
  }
  return null;
}

export async function render(container, ctx) {
  const kept = sitting;
  const myMount = ++mountSeq;
  let profile = kept ? kept.profile : null;
  let stage = "loading";
  let generating = false;
  let genError = false;
  let activePopup = null; // { lemma, surface, he, saved, canSay }
  let allowedWords = new Set();
  let lemmas = kept ? kept.lemmas : [];
  let knownSet = kept ? kept.knownSet : new Set();
  let candidateSet = kept ? kept.candidateSet : new Set();
  // T2. One quiz list per chapter, computed ONCE and memoised, so the count
  // afterChapterStage sees and the array startQuiz receives are the SAME array
  // object and cannot disagree (field guide 15b: bugs live in the seam).
  // askedThisSitting is what actually fixes D2: `lemmas` below is built once in
  // boot() and never rebuilt -- runGenerate pushes a chapter without touching it
  // and the celebrate-from-server helper deliberately reads into a local -- so without this,
  // every chapter in one sitting is handed the identical order and quiz.js
  // takes the identical first four.
  const quizLemmasByChapter = kept ? kept.quizLemmasByChapter : {};
  const askedThisSitting = kept ? kept.askedThisSitting : new Set();

  async function boot() {
    const resuming = kept !== null && kept.profile !== null;
    if (resuming) restartQuizzes(quizState);
    if (resuming) decideStage();
    draw();
    if (resuming) restoreScroll();
    let signature = resuming ? kept.signature : null;
    try {
      allowedWords = await getAllowedSet();
      const fresh = await getJson("/api/profile");
      if (myMount !== mountSeq) return;
      const sig = profileSignature(fresh);
      const changed = !resuming || sig === null || signature === null || sig !== signature;
      signature = sig;
      if (!changed) { remember(signature); return; }
      profile = fresh;
      const candidateLemmas = pickCandidateWords(profile, 1);
      candidateSet = new Set(candidateLemmas);
      lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));
      knownSet = knownSetFromProfile(profile);
      // F1-2 / R4(ii). The read-back sits HERE and nowhere else: after the fresh
      // profile has replaced the kept one and before decideStage()/draw(), so the
      // first paint of a reload already shows what she finished. The unchanged-
      // profile early return above is deliberately NOT a restore point -- on that
      // path `sitting` already holds the very checkState this would rebuild.
      const chs = profile.story && Array.isArray(profile.story.chapters) ? profile.story.chapters : [];
      mergeRestoredChecks(
        checkState,
        restoredCheckState(chs[chs.length - 1] || null, profile.story && profile.story.checkLog)
      );
      decideStage();
    } catch (err) {
      if (!resuming) stage = "error";
    }
    draw();
    if (resuming) restoreScroll();
    remember(signature);
  }

  function remember(signature) {
    sitting = { profile, signature, lemmas, knownSet, candidateSet, quizLemmasByChapter, askedThisSitting, checkState, quizState };
  }

  function restoreScroll() {
    if (typeof window === "undefined" || typeof window.scrollTo !== "function") return;
    window.scrollTo(0, readerScrollY);
  }
  function decideStage() {
    if (!profile.placement || !profile.placement.completed) {
      stage = "needs-placement";
      return;
    }
    if (!profile.learner.heroineName || !profile.learner.petName) {
      stage = "onboarding";
      return;
    }
    if (!profile.story.chapters || profile.story.chapters.length === 0) {
      stage = "start-story";
      return;
    }
    stage = "chapter";
  }

  function latestChapter() {
    const chapters = profile.story.chapters;
    return chapters[chapters.length - 1];
  }

  function quizLemmasFor(chapter) {
    if (!quizLemmasByChapter[chapter.n]) {
      quizLemmasByChapter[chapter.n] = chapterQuizLemmas(
        chapter,
        profile && profile.words,
        lemmas,
        askedThisSitting
      );
    }
    return quizLemmasByChapter[chapter.n];
  }

  async function runGenerate() {
    generating = true;
    genError = false;
    draw();
    try {
      const { chapter } = await postJson("/api/chapter", { action: "generate" });
      profile.story.chapters.push(chapter);
      generating = false;
      stage = "chapter";
      draw();
      await celebrateFromServer();
    } catch (err) {
      generating = false;
      genError = true;
      draw();
    }
  }

  // T5 + SK3-2. api/chapter.js:66 returns { chapter } and NO profile, so the
  // phone asks once. Read into a LOCAL: reassigning the module-scope `profile`
  // here would silently change what latestChapter(), decideStage() and the
  // already-computed lemmas/knownSet see. A profile provably exists by now
  // (the server just saved one), so this GET creates nothing.
  async function celebrateFromServer() {
    let fresh;
    try {
      fresh = await getJson("/api/profile");
    } catch (err) {
      return;
    }
    maybeCelebrateTrophy(fresh);
  }

  function renderLoading() {
    return `${styleTag()}${header("הסיפור", "רגע...")}<p class="card-subtitle">טוען...</p>`;
  }

  function renderNeedsPlacement() {
    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <div class="card">
        <p class="card-subtitle" style="margin-bottom: 16px;">קודם נעשה מבחן היכרות קטן</p>
        <a class="btn btn-primary" href="#/placement" style="text-decoration:none;">למבחן ההיכרות</a>
      </div>
    `;
  }

  function renderOnboarding() {
    return `
      ${styleTag()}
      ${header("הסיפור", "בואי נכיר")}
      <div class="card">
        <div class="reader-onboard-field">
          <label class="reader-onboard-label" for="heroineName">איך נקרא לגיבורה שלנו?</label>
          <input class="reader-onboard-input" id="heroineName" type="text" dir="ltr" autocomplete="off" autocorrect="off" spellcheck="false" />
        </div>
        <div class="reader-onboard-field">
          <label class="reader-onboard-label" for="petName">ואיך נקרא לחיה הקסומה הראשונה?</label>
          <input class="reader-onboard-input" id="petName" type="text" dir="ltr" autocomplete="off" autocorrect="off" spellcheck="false" />
        </div>
        <button class="btn btn-primary" type="button" data-action="onboard-submit">יאללה, מתחילים!</button>
      </div>
    `;
  }

  function renderStartStory() {
    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <img class="hero-banner" src="/assets/hero-clinic.webp" alt="" />
      <div class="card">
        <p class="card-subtitle" style="margin-bottom: 16px;">הכל מוכן! הגיע הזמן להתחיל את ההרפתקה.</p>
        <button class="btn btn-primary" type="button" data-action="generate">מתחילים את הסיפור</button>
      </div>
    `;
  }

  function renderGenerating() {
    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <div class="reader-loading">
        <img class="spot-image spot-image--sm reader-loading-art" src="/assets/placement-friend.webp" alt="" />
        <div class="reader-spinner" aria-hidden="true"></div>
        <p>הקסם קורה... רגע אחד</p>
      </div>
    `;
  }

  function renderGenError() {
    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <div class="card">
        <p class="card-subtitle" style="margin-bottom: 16px;">רגע, הקסם מתעכב… ננסה שוב עוד רגע.</p>
        <button class="btn btn-primary" type="button" data-action="generate">נסי שוב</button>
      </div>
    `;
  }

  const checkState = kept ? kept.checkState : {};
  const quizState = kept ? kept.quizState : {};

  function questionState(q) {
    const key = q.id;
    if (!checkState[key]) {
      checkState[key] = { correct: false, chosen: null, logged: false, triedWrong: new Set() };
    }
    return checkState[key];
  }

  function allQuestionsCorrect(chapter) {
    return chapter.questions.every((q) => questionState(q).correct);
  }

  function renderQuestion(chapter, q) {
    const st = questionState(q);
    const optionsHtml = q.options
      .map((opt, i) => {
        let cls = "reader-question-option";
        let disabled = "";
        if (st.correct) {
          disabled = "disabled";
          if (i === q.correctIndex) cls += " correct";
        } else if (st.triedWrong.has(i)) {
          disabled = "disabled";
          cls += " wrong";
        }
        return `<button class="${cls}" type="button" data-action="q-answer" data-q="${q.id}" data-choice="${i}" ${disabled}>${escapeHtml(opt)}</button>`;
      })
      .join("");

    let feedbackHtml = "";
    if (st.correct) {
      feedbackHtml = `<p class="reader-question-feedback ok">כל הכבוד!</p>`;
    } else if (st.chosen !== null) {
      feedbackHtml = `<p class="reader-question-feedback bad">לא נורא, ננסה שוב</p>`;
    }

    return `
      <div class="card reader-question-card">
        <p class="reader-question-prompt">${escapeHtml(q.prompt)}</p>
        <div class="reader-question-options">${optionsHtml}</div>
        ${feedbackHtml}
      </div>
    `;
  }

  function renderPopup() {
    if (!activePopup) return "";
    const savedHtml = activePopup.saved
      ? `<p class="reader-popup-confirm">נשמר!</p>`
      : `<button class="btn btn-primary" type="button" data-action="popup-save">שמרי למילים שלי</button>`;
    return `
      <div class="reader-overlay" data-action="popup-close">
        <div class="reader-popup" data-action="popup-stop">
          <p class="reader-popup-word">${escapeHtml(activePopup.lemma)}</p>
          ${saySlot(activePopup.canSay, activePopup.lemma)}
          <p class="reader-popup-he">${escapeHtml(activePopup.he || "—")}</p>
          ${savedHtml}
        </div>
      </div>
    `;
  }

  function renderChapter() {
    const chapter = latestChapter();
    const bannerName = CHAPTER_BANNERS[chapter.n % 3];
    const questionsHtml = chapter.questions.map((q) => renderQuestion(chapter, q)).join("");
    const doneAll = allQuestionsCorrect(chapter);
    const qs = chapterQuizState(quizState, chapter.n);
    const chapterStage = afterChapterStage({ doneAll, quizDone: qs.done, lemmaCount: quizLemmasFor(chapter).length });
    const quizHtml = chapterStage === "quiz" ? `<div class="reader-quiz-slot"></div>` : "";
    const celebrateHtml = chapterStage === "celebrate"
      ? `<img class="celebrate-image" src="/assets/celebration.webp" alt="" />`
      : "";
    const continueHtml = chapterStage === "celebrate"
      ? `<button class="btn btn-primary" type="button" data-action="continue-story">המשך הסיפור</button>`
      : "";

    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <p class="reader-chapter-label">פרק ${chapter.n}</p>
      <img class="chapter-banner" src="/assets/${bannerName}.webp" alt="" />
      <div class="card">
        <p class="reader-card-title">${escapeHtml(chapter.title)}</p>
        <div class="reader-text" dir="ltr">${renderWords(chapter.text)}</div>
      </div>
      ${questionsHtml}
      ${quizHtml}
      ${celebrateHtml}
      ${continueHtml}
      ${renderPopup()}
    `;
  }

  function draw() {
    if (myMount !== mountSeq) return;
    let html;
    if (stage === "loading") html = renderLoading();
    else if (stage === "needs-placement") html = renderNeedsPlacement();
    else if (stage === "onboarding") html = renderOnboarding();
    else if (stage === "start-story") html = renderStartStory();
    else if (stage === "chapter") {
      if (generating) html = renderGenerating();
      else if (genError) html = renderGenError();
      else html = renderChapter();
    } else {
      html = `${styleTag()}${header("הסיפור", "אופס")}<p class="card-subtitle">משהו השתבש.</p>`;
    }

    container.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    const onboardBtn = container.querySelector('[data-action="onboard-submit"]');
    if (onboardBtn) {
      onboardBtn.addEventListener("click", async () => {
        const heroineName = container.querySelector("#heroineName").value.trim();
        const petName = container.querySelector("#petName").value.trim();
        if (!heroineName || !petName) return;
        try {
          profile = await postJson("/api/profile", {
            action: "set-learner",
            heroineName,
            petName,
          });
        } catch (err) {
          return;
        }
        stage = "chapter";
        await runGenerate();
      });
    }

    const generateBtn = container.querySelector('[data-action="generate"]');
    if (generateBtn) {
      generateBtn.addEventListener("click", async () => {
        stage = "chapter";
        await runGenerate();
      });
    }

    const continueBtn = container.querySelector('[data-action="continue-story"]');
    if (continueBtn) {
      continueBtn.addEventListener("click", async () => {
        await runGenerate();
      });
    }

    container.querySelectorAll('[data-action="q-answer"]').forEach((btn) => {
      btn.addEventListener("click", async () => {
        const chapter = latestChapter();
        const qId = btn.getAttribute("data-q");
        const q = chapter.questions.find((x) => x.id === qId);
        const choice = Number(btn.getAttribute("data-choice"));
        const st = questionState(q);
        const isFirstAnswer = !st.logged;

        st.chosen = choice;
        st.correct = choice === q.correctIndex;
        if (!st.correct) {
          st.triedWrong.add(choice);
        }

        if (isFirstAnswer) {
          // F1-3. `st.logged = true` USED TO SIT HERE, BEFORE the await, and the catch
          // swallowed every failure -- so a save that never reached the server was never
          // retried and never surfaced, and her answer was simply lost. Phase 1 made that
          // WORSE, not better: keeping checkState alive for a whole sitting hides the loss
          // until she reloads. With the read-back above, this is the ONLY remaining path
          // by which her work can disappear.
          //
          // Setting it only AFTER the await resolves makes the log self-healing: a failed
          // save leaves the question unlogged, so her next answer on it posts again, and
          // the owner's de-duplication ruling makes that second entry harmless.
          //
          // NOTHING IS RENDERED TO HER ABOUT IT (ruling R-F6-3). She is eleven and learning
          // to read English; a message about a failed network write is noise she cannot act
          // on, and D14 already says the correction loop must never wait on a human.
          try {
            await postJson("/api/profile", {
              action: "log-check",
              chapter: chapter.n,
              questionId: q.id,
              chosenIndex: choice,
              correctIndex: q.correctIndex,
            });
            st.logged = true;
          } catch (err) {
            // left unlogged ON PURPOSE so the next attempt retries it.
            if (typeof console !== "undefined" && console.warn) {
              console.warn("log-check failed; will retry on her next answer", err);
            }
          }
        }

        draw();
      });
    });

    const storyEl = container.querySelector(".reader-text");
    if (storyEl) {
      // A long press used to raise the browser's own "Copy" callout. Refuse it, so the
      // release still reaches the click handler below and opens her word popup instead.
      storyEl.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
      });
    }

    container.querySelectorAll(".reader-text .w").forEach((span) => {
      span.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const dataWord = span.getAttribute("data-word");
        if (!dataWord) return;
        const chapter = latestChapter();
        let he = findInGlossary(chapter, dataWord);
        // dataWord is what is PRINTED ("feels"); the clip is under the lemma
        // ("feel"). Keep both: the surface form is what the glossary and the
        // sentence search need, the lemma is what we speak and save.
        const lemma = resolveLemma(dataWord, allowedWords);
        activePopup = {
          lemma: lemma || dataWord,
          surface: dataWord,
          canSay: lemma !== null,
          he: he || "",
          saved: false,
        };
        draw();
        if (he === null) {
          try {
            const r = await postJson("/api/translate", { word: dataWord });
            if (activePopup && activePopup.surface === dataWord) {
              activePopup.he = r.he;
              draw();
            }
          } catch (err) {
            // leave popup with dash
          }
        }
      });
    });

    const popupSaveBtn = container.querySelector('[data-action="popup-save"]');
    if (popupSaveBtn) {
      popupSaveBtn.addEventListener("click", async () => {
        if (!activePopup) return;
        try {
          const body = wordTapBody({
            lemma: activePopup.lemma,
            surface: activePopup.surface,
            he: activePopup.he,
            text: latestChapter().text,
          });
          await postJson("/api/profile", body);
        } catch (err) {
          // ignore
        }
        if (activePopup) {
          activePopup.saved = true;
          draw();
        }
      });
    }

    container.querySelectorAll("[data-say]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const lemma = btn.getAttribute("data-say");
        if (!lemma) return;
        try {
          const audio = new Audio(`/audio/words/${encodeURIComponent(lemma)}.aac`);
          // R8. SPEECH ALWAYS WINS: this is what actually makes the music duck.
          // The bed drops to near-silence for exactly as long as the clip runs,
          // so the one sound she is trying to learn is never competed with.
          playOverMusic(audio);
          const p = audio.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch (err) {
          /* a missing clip must never break the story */
        }
      });
    });

    const overlay = container.querySelector(".reader-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        activePopup = null;
        draw();
      });
    }

    const popup = container.querySelector('[data-action="popup-stop"]');
    if (popup) {
      popup.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
    }

    const slot = container.querySelector(".reader-quiz-slot");
    if (slot) {
      const chapter = latestChapter();
      const qs = chapterQuizState(quizState, chapter.n);
      if (!qs.started) {
        qs.started = true;
        const started = startQuiz(slot, {
          lemmas: quizLemmasFor(chapter),
          knownSet,
          candidateSet,
          count: 4,
          words: (profile && profile.words) || {},
          audioSet: allowedWords,
          onDone: async ({ total }) => {
            qs.done = true;
            draw();
            if (total > 0) await celebrateFromServer();
          },
        });
        // T2. quiz.js -- not this file -- decides which four of the list it
        // could actually load, and session.questions is where it says so. That
        // knowledge exists nowhere else, so it is recorded here, at the start,
        // not in onDone: the next chapter's list is built before onDone fires.
        started.then(
          (session) => {
            for (const q of session.questions) askedThisSitting.add(q.lemma);
          },
          () => {}
        );
      }
    }
  }

  await boot();
}
