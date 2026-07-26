// Resolve the word printed in the story to the lemma we actually have a clip for.
//
// The story generator is told "inflected forms are allowed", so the page shows
// "feels" while the audio set only has "feel". This maps one to the other.
//
// EXACT MATCH IS TRIED FIRST, and that is the whole safety mechanism: it is why
// "bus" does not become "bu", "this" does not become "thi", and "glass",
// "across", "carpet" and "sunday" are left alone. Only a word that is NOT in the
// set is ever de-inflected, and then only into a candidate that IS in the set.
//
// A naive longest-prefix rule (what findInGlossary uses for translations) is
// deliberately NOT used here: it fails "stories" and "making", and it happily
// turns "carpet" into "car".
//
// Pure and dependency-free. Imported by the browser views AND by api/profile.js,
// which is unusual for a file under public/ and is intentional: two copies of
// this logic would mean verifying one against a re-implementation of the other.

const DOUBLED = /^(.*?[bcdfglmnprstz])\1(ing|ed|er|est)$/;

export function lemmaCandidates(word) {
  const w = String(word).toLowerCase();
  const out = [w];
  const push = (c) => {
    if (c && c.length >= 2 && !out.includes(c)) out.push(c);
  };

  const dbl = w.match(/^(.*?)([bcdfglmnprstz])\2(ing|ed|er|est)$/);
  if (dbl) push(dbl[1] + dbl[2]);

  if (w.endsWith('ies') && w.length > 4) push(w.slice(0, -3) + 'y');
  if (w.endsWith('es') && w.length > 3) push(w.slice(0, -2));
  if (w.endsWith('s') && w.length > 2) push(w.slice(0, -1));
  if (w.endsWith('ed') && w.length > 3) {
    push(w.slice(0, -2));
    push(w.slice(0, -1));
  }
  if (w.endsWith('ing') && w.length > 4) {
    push(w.slice(0, -3));
    push(w.slice(0, -3) + 'e');
  }
  if (w.endsWith('ily') && w.length > 4) push(w.slice(0, -3) + 'y');
  if (w.endsWith('ly') && w.length > 3) push(w.slice(0, -2));
  if (w.endsWith('est') && w.length > 4) {
    push(w.slice(0, -3));
    push(w.slice(0, -2));
  }
  if (w.endsWith('er') && w.length > 3) {
    push(w.slice(0, -2));
    push(w.slice(0, -1));
  }

  return out;
}

// allowedSet: anything with a .has() -- a Set, or an object exposing has().
// Returns the lemma to speak/store, or null when we have nothing for this word.
export function resolveLemma(word, allowedSet) {
  if (!allowedSet || typeof allowedSet.has !== 'function') return null;
  for (const candidate of lemmaCandidates(word)) {
    if (allowedSet.has(candidate)) return candidate;
  }
  return null;
}
