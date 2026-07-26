// Loads the word manifest once and hands the views a Set to resolve against.
//
// Kept separate from lemma.js so that lemma.js stays pure and dependency-free --
// api/profile.js imports lemma.js on the server, where fetching a URL would make
// no sense.
//
// Failure is never fatal: if the manifest cannot be loaded we return an empty
// set, resolveLemma returns null for everything, and the views simply do not
// render a play button. A dictionary that loads without audio beats one that
// does not load.

let cached = null;

export async function getAllowedSet() {
  if (cached) return cached;
  try {
    const res = await fetch('/audio/words/index.json');
    if (!res.ok) throw new Error(`manifest ${res.status}`);
    const words = await res.json();
    cached = new Set(Array.isArray(words) ? words : []);
  } catch (err) {
    cached = new Set();
  }
  return cached;
}
