// Pure, dependency-free vocabulary coverage engine.
// No imports allowed in this module.

export function tokenize(text) {
  return String(text).toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
}

function undouble(stem) {
  if (stem.length < 3) return null;
  const last = stem[stem.length - 1];
  const secondLast = stem[stem.length - 2];
  if (last !== secondLast) return null;
  if ("aeiou".includes(last)) return null;
  return stem.slice(0, -1);
}

export function baseForms(token) {
  const forms = [token];

  const add = (candidate) => {
    if (candidate.length >= 2 && !forms.includes(candidate)) {
      forms.push(candidate);
    }
  };

  const addWithUndouble = (candidate) => {
    add(candidate);
    const reduced = undouble(candidate);
    if (reduced !== null) {
      add(reduced);
    }
  };

  if (token.endsWith("ies") && token.length >= 5) {
    add(token.slice(0, -3) + "y");
  }
  if (token.endsWith("es") && token.length >= 4) {
    add(token.slice(0, -2));
  }
  if (token.endsWith("s") && token.length >= 4 && !token.endsWith("ss")) {
    add(token.slice(0, -1));
  }
  if (token.endsWith("ied") && token.length >= 5) {
    add(token.slice(0, -3) + "y");
  }
  if (token.endsWith("ed") && token.length >= 4) {
    addWithUndouble(token.slice(0, -2));
    add(token.slice(0, -1));
  }
  if (token.endsWith("ing") && token.length >= 5) {
    addWithUndouble(token.slice(0, -3));
    add(token.slice(0, -3) + "e");
  }
  if (token.endsWith("est") && token.length >= 5) {
    addWithUndouble(token.slice(0, -3));
  }
  if (token.endsWith("er") && token.length >= 4) {
    addWithUndouble(token.slice(0, -2));
  }

  return forms;
}

export function knownLemmaSet(profile) {
  const known = new Set();
  const words = profile && profile.words;
  if (!words) return known;
  for (const k of Object.keys(words)) {
    if (words[k] && words[k].status === "known") {
      known.add(k);
    }
  }
  return known;
}

export function coverage(text, profile) {
  const toks = tokenize(text);
  const known = knownLemmaSet(profile);
  let knownCount = 0;
  const unknownSet = new Set();

  for (const token of toks) {
    if (baseForms(token).some((b) => known.has(b))) {
      knownCount++;
    } else {
      unknownSet.add(token);
    }
  }

  const total = toks.length;
  return {
    total,
    known: knownCount,
    unknown: Array.from(unknownSet).sort(),
    ratio: total === 0 ? 0 : knownCount / total,
  };
}
