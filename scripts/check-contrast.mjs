import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSS_PATH = path.resolve(__dirname, "..", "public", "styles.css");

const PAIRS = [
  { fg: "--color-ink", bg: "--color-bg", min: 4.5, label: "body text on page" },
  { fg: "--color-ink", bg: "--color-card", min: 4.5, label: "body text on card" },
  { fg: "--color-ink", bg: "--color-surface-2", min: 4.5, label: "body text on raised surface" },
  { fg: "--color-muted", bg: "--color-bg", min: 4.5, label: "muted text on page" },
  { fg: "--color-muted", bg: "--color-card", min: 4.5, label: "muted text on card" },
  { fg: "--color-muted", bg: "--color-nav", min: 4.5, label: "nav label on nav bar" },
  { fg: "--color-muted", bg: "--color-surface-2", min: 4.5, label: "muted text on raised surface" },
  { fg: "--color-primary", bg: "--color-bg", min: 3, label: "app title 1.6rem/700 on page (large text)" },
  { fg: "--color-primary", bg: "--color-nav", min: 4.5, label: "active nav tab label on nav bar" },
  { fg: "--color-primary", bg: "--color-card", min: 4.5, label: "primary text/icon on card" },
  { fg: "--color-primary-ink", bg: "--color-primary", min: 4.5, label: "primary button label" },
  { fg: "--color-teal", bg: "--color-card", min: 4.5, label: "teal text on card" },
  { fg: "--color-teal", bg: "--color-bg", min: 4.5, label: "teal text on page" },
  { fg: "--color-primary-ink", bg: "--color-teal", min: 4.5, label: "play-button label" },
  { fg: "--color-accent", bg: "--color-card", min: 4.5, label: "amber text on card" },
  { fg: "--color-primary-ink", bg: "--color-accent", min: 4.5, label: "amber badge label" },
  { fg: "--color-danger", bg: "--color-card", min: 4.5, label: "error text on card" },
  { fg: "--color-danger", bg: "--color-bg", min: 4.5, label: "error text on page" },
  { fg: "--color-primary", bg: { mix: "--color-primary", pct: 18 }, min: 4.5, label: "card icon on its plate" },
  { fg: "--color-muted", bg: { mix: "--color-muted", pct: 15 }, min: 4.5, label: "locked card icon on its plate" },
  { fg: "--color-ink", bg: { mix: "--color-primary", pct: 14 }, min: 4.5, label: "label on selected option" },
  { fg: "--color-ink", bg: { mix: "--color-teal", pct: 16 }, min: 4.5, label: "label on correct option" },
  { fg: "--color-ink", bg: { mix: "--color-danger", pct: 16 }, min: 4.5, label: "label on wrong option" },
  { fg: "--color-ink", bg: { mix: "--color-accent", pct: 28 }, min: 4.5, label: "tapped word highlight" },
  { fg: "--color-teal", bg: { mix: "--color-teal", pct: 18 }, min: 4.5, label: '"known" word badge' },
  { fg: "--color-accent", bg: { mix: "--color-accent", pct: 18 }, min: 4.5, label: '"learning" word badge' },
  { fg: "--color-border", bg: "--color-card", min: 3, label: "control border on card (WCAG 1.4.11)" },
  { fg: "--color-border", bg: "--color-bg", min: 3, label: "control border on page (WCAG 1.4.11)" },
  { fg: "--color-ink", bg: "--color-bg-top", min: 4.5, label: "body text on page (top wash)" },
  { fg: "--color-muted", bg: "--color-bg-top", min: 4.5, label: "muted text on page (top wash)" },
  { fg: "--color-primary", bg: "--color-bg-top", min: 3, label: "app title on page, large text (top wash)" },
  { fg: "--color-teal", bg: "--color-bg-top", min: 4.5, label: "teal text on page (top wash)" },
  { fg: "--color-danger", bg: "--color-bg-top", min: 4.5, label: "error text on page (top wash)" },
  { fg: "--color-border", bg: "--color-bg-top", min: 3, label: "control border on page, WCAG 1.4.11 (top wash)" },
  { fg: "--color-ink", bg: "--color-bg-glow-violet", min: 4.5, label: "body text on page (violet glow)" },
  { fg: "--color-muted", bg: "--color-bg-glow-violet", min: 4.5, label: "muted text on page (violet glow)" },
  { fg: "--color-primary", bg: "--color-bg-glow-violet", min: 3, label: "app title on page, large text (violet glow)" },
  { fg: "--color-teal", bg: "--color-bg-glow-violet", min: 4.5, label: "teal text on page (violet glow)" },
  { fg: "--color-danger", bg: "--color-bg-glow-violet", min: 4.5, label: "error text on page (violet glow)" },
  { fg: "--color-border", bg: "--color-bg-glow-violet", min: 3, label: "control border on page, WCAG 1.4.11 (violet glow)" },
  { fg: "--color-ink", bg: "--color-bg-glow-teal", min: 4.5, label: "body text on page (teal glow)" },
  { fg: "--color-muted", bg: "--color-bg-glow-teal", min: 4.5, label: "muted text on page (teal glow)" },
  { fg: "--color-primary", bg: "--color-bg-glow-teal", min: 3, label: "app title on page, large text (teal glow)" },
  { fg: "--color-teal", bg: "--color-bg-glow-teal", min: 4.5, label: "teal text on page (teal glow)" },
  { fg: "--color-danger", bg: "--color-bg-glow-teal", min: 4.5, label: "error text on page (teal glow)" },
  { fg: "--color-border", bg: "--color-bg-glow-teal", min: 3, label: "control border on page, WCAG 1.4.11 (teal glow)" },
  { fg: "--color-ink", bg: "--color-bg-glow-amber", min: 4.5, label: "body text on page (amber glow)" },
  { fg: "--color-muted", bg: "--color-bg-glow-amber", min: 4.5, label: "muted text on page (amber glow)" },
  { fg: "--color-primary", bg: "--color-bg-glow-amber", min: 3, label: "app title on page, large text (amber glow)" },
  { fg: "--color-teal", bg: "--color-bg-glow-amber", min: 4.5, label: "teal text on page (amber glow)" },
  { fg: "--color-danger", bg: "--color-bg-glow-amber", min: 4.5, label: "error text on page (amber glow)" },
  { fg: "--color-border", bg: "--color-bg-glow-amber", min: 3, label: "control border on page, WCAG 1.4.11 (amber glow)" },
  { fg: "--color-bronze", bg: "--color-card", min: 3, label: "bronze trophy ring on card (WCAG 1.4.11)" },
  { fg: "--color-bronze", bg: "--color-surface-2", min: 3, label: "bronze trophy ring on raised surface (WCAG 1.4.11)" },
  { fg: "--color-silver", bg: "--color-card", min: 3, label: "silver trophy ring on card (WCAG 1.4.11)" },
  { fg: "--color-silver", bg: "--color-surface-2", min: 3, label: "silver trophy ring on raised surface (WCAG 1.4.11)" },
  { fg: "--color-gold", bg: "--color-card", min: 3, label: "gold trophy ring on card (WCAG 1.4.11)" },
  { fg: "--color-gold", bg: "--color-surface-2", min: 3, label: "gold trophy ring on raised surface (WCAG 1.4.11)" },
];

function parseTokens(css) {
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!rootMatch) {
    console.error("ERROR: could not find :root { ... } block in " + CSS_PATH);
    process.exit(1);
  }
  const body = rootMatch[1];
  const tokens = {};
  const declRe = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = declRe.exec(body)) !== null) {
    const name = m[1];
    const value = m[2].trim();
    const hexMatch = value.match(/^#([0-9a-fA-F]{6})$/);
    if (hexMatch) {
      tokens[name] = hexMatch[1].toLowerCase();
    }
  }
  return tokens;
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function requireToken(tokens, name) {
  if (!(name in tokens)) {
    console.error(`ERROR: token ${name} is missing from :root in ${CSS_PATH}`);
    process.exit(1);
  }
  return tokens[name];
}

function resolveMix(tokens, mixSpec) {
  const tokenHex = requireToken(tokens, mixSpec.mix);
  const cardHex = requireToken(tokens, "--color-card");
  const token = hexToRgb(tokenHex);
  const card = hexToRgb(cardHex);
  const frac = mixSpec.pct / 100;
  const mixed = {
    r: Math.round(token.r * frac + card.r * (1 - frac)),
    g: Math.round(token.g * frac + card.g * (1 - frac)),
    b: Math.round(token.b * frac + card.b * (1 - frac)),
  };
  return rgbToHex(mixed);
}

function resolveColor(tokens, spec) {
  if (typeof spec === "string") {
    return requireToken(tokens, spec);
  }
  return resolveMix(tokens, spec);
}

function specLabel(spec) {
  if (typeof spec === "string") return spec;
  return `mix(${spec.mix}, ${spec.pct})`;
}

function channelToLinear(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = channelToLinear(r);
  const G = channelToLinear(g);
  const B = channelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lMax = Math.max(lA, lB);
  const lMin = Math.min(lA, lB);
  return (lMax + 0.05) / (lMin + 0.05);
}

function main() {
  const css = readFileSync(CSS_PATH, "utf8");
  const tokens = parseTokens(css);

  let failures = 0;

  for (const pair of PAIRS) {
    const fgHex = resolveColor(tokens, pair.fg);
    const bgHex = resolveColor(tokens, pair.bg);
    const ratio = contrastRatio(fgHex, bgHex);
    const pass = ratio >= pair.min;
    if (!pass) failures++;

    const status = pass ? "PASS" : "FAIL";
    const ratioStr = ratio.toFixed(2).padStart(5, " ");
    const minStr = String(pair.min).padStart(3, " ");
    const fgLabel = specLabel(pair.fg).padEnd(20, " ");
    const bgLabel = specLabel(pair.bg).padEnd(28, " ");

    console.log(
      `${status}  ratio=${ratioStr}  min=${minStr}  fg=${fgLabel} (#${fgHex})  bg=${bgLabel} (#${bgHex})  - ${pair.label}`
    );
  }

  if (failures === 0) {
    console.log("ALL PASS");
    process.exit(0);
  } else {
    console.log(`${failures} FAILURES`);
    process.exit(1);
  }
}

main();
