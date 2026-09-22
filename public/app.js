import { render as renderHome } from "./views/home.js";
import { render as renderPlacement } from "./views/placement.js";
import { render as renderReader } from "./views/reader.js";
import { render as renderTrophies } from "./views/trophies.js";
import { render as renderWords } from "./views/words.js";
import { render as renderExamWords } from "./views/exam-words.js";
import { isMuted, setMuted, start as musicStart, prime as musicPrime } from "./music.js";

// R8. Both icons are PURE ASCII inline SVG. FC-7 measures "no new Hebrew" as raw
// non-ASCII bytes, which counts emoji too, so a music-note glyph is not available
// to us -- and an icon is clearer to an eleven-year-old than a letter anyway.
const MUSIC_ICON_ON =
  '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="2"/>';
const MUSIC_ICON_OFF =
  '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2"/>';

function paintMusic(btn) {
  const on = !isMuted();
  btn.classList.toggle("on", on);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  const svg = btn.querySelector("svg");
  if (svg) svg.innerHTML = on ? MUSIC_ICON_ON : MUSIC_ICON_OFF;
}

function setUpMusic() {
  const btn = document.getElementById("music-toggle");
  if (!btn) return;
  paintMusic(btn);

  btn.addEventListener("click", () => {
    // She is turning it ON exactly when it was muted a moment ago. start() is
    // called from inside this click, because Safari only permits the FIRST play
    // inside the gesture handler itself.
    const turningOn = isMuted();
    setMuted(!turningOn);
    if (turningOn) musicStart();
    paintMusic(btn);
  });

  // prime() only ADOPTS a copy already stored from a previous session; it never
  // downloads. That is what makes every session after the first cost nothing and
  // work with no signal at all.
  try {
    const primed = musicPrime();
    if (primed && typeof primed.catch === "function") primed.catch(() => {});
  } catch (err) {
    /* music must never affect the app */
  }

  // Property 2: browsers block audio without a gesture. If she left music on, it
  // resumes at her FIRST touch anywhere -- never on load. Guarded so the very tap
  // that turns music on cannot double-start it.
  document.addEventListener(
    "pointerdown",
    () => {
      if (!isMuted()) musicStart();
    },
    { once: true }
  );
}

const ROUTES = {
  "/home": renderHome,
  "/placement": renderPlacement,
  "/reader": renderReader,
  "/trophies": renderTrophies,
  "/words": renderWords,
  "/exam-words": renderExamWords,
};

const OWNER_ROUTE = "/parent";

const DEFAULT_ROUTE = "/home";

function currentRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === OWNER_ROUTE) return OWNER_ROUTE;
  return ROUTES[hash] ? hash : DEFAULT_ROUTE;
}

function setActiveTab(route) {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    const isActive = tab.dataset.route === route;
    tab.classList.toggle("active", isActive);
    if (isActive) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  });
}

function renderRoute() {
  const route = currentRoute();
  const app = document.getElementById("app");
  app.innerHTML = "";
  setActiveTab(route);
  if (route === OWNER_ROUTE) {
    import("./views/parent.js")
      .then((mod) => mod.render(app, {}))
      .catch(() => {
        app.textContent = "לא הצלחתי לטעון את תצוגת ההורים. צריך חיבור לאינטרנט.";
      });
    return;
  }
  const view = ROUTES[route];
  view(app, {});
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
setUpMusic();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
