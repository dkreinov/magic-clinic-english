// Count visits only. Never transmit in-app answers, account paths, query strings,
// fragments, or custom events. Every page view is reported as the site root.
(function () {
  if (location.protocol !== 'https:' || window.__siteAnalyticsLoaded) return;
  window.__siteAnalyticsLoaded = true;
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
  window.va('beforeSend', function (event) {
    if (event.type !== 'pageview') return null;
    return { ...event, url: location.origin + '/' };
  });
  var script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  document.head.appendChild(script);
})();
