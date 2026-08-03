const CACHE = "magic-vet-v24";
// The background music is stored ONCE and must OUTLIVE every version bump, so it
// is deliberately NOT part of CACHE and is spared by the activate sweep below.
// Precaching it instead would spend 4 MB on EVERY deploy, for a feature that is
// default OFF and that she may never switch on. The name is duplicated in
// public/music.js (MUSIC_CACHE) and a test asserts the two cannot drift.
const MUSIC_CACHE = "magic-vet-music-v1";
const PRECACHE = [
  "/",
  "/styles.css",
  "/app.js",
  "/api.js",
  "/lemma.js",
  "/words-index.js",
  "/music.js",
  "/quiz-core.js",
  "/quiz.js",
  "/views/home.js",
  "/views/placement.js",
  "/views/reader.js",
  "/views/words.js",
  "/views/trophies.js",
  "/manifest.webmanifest",
  "/icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE && key !== MUSIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
