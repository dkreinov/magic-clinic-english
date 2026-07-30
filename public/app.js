import { render as renderHome } from "./views/home.js";
import { render as renderPlacement } from "./views/placement.js";
import { render as renderReader } from "./views/reader.js";
import { render as renderTrophies } from "./views/trophies.js";
import { render as renderWords } from "./views/words.js";

const ROUTES = {
  "/home": renderHome,
  "/placement": renderPlacement,
  "/reader": renderReader,
  "/trophies": renderTrophies,
  "/words": renderWords,
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
