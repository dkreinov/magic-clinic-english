#!/bin/sh
# FROZEN validation — step 1.3 (Sunrise Parchment :root swap + pinned hexes)
set -u
while IFS= read -r line; do
  [ -z "$line" ] && continue
  grep -qF -- "$line" public/styles.css || { echo "FAIL: styles.css missing verbatim: $line"; exit 1; }
done <<'EOF'
--color-primary: #7b3fb5;
--color-teal: #086055;
--color-accent: #8a5600;
--color-bg: #fff4e2;
--color-ink: #3a2412;
--radius: 22px;
--color-primary-ink: #fff6e8;
--color-muted: #7a5a3c;
--color-card: #fffaf0;
--color-surface-2: #fdeed6;
--color-border: #96682f;
--color-nav: #fff8ec;
--color-danger: #b3341c;
--color-glow: #ffd98a;
--color-bg-top: #ffe9c9;
--color-bg-glow-violet: #f3e4fb;
--color-bg-glow-teal: #dff4ee;
--color-bg-glow-amber: #ffe4b5;
--shadow-soft: 0 0 0 1px rgba(150, 104, 47, 0.16), 0 6px 18px rgba(120, 78, 30, 0.13);
--nav-height: 68px;
--transition-fast: 150ms ease;
EOF
root=$(sed -n '1,/^}/p' public/styles.css)
for old in '#241305' '#3a1d08' '#4d2a0e' '#2e1806' '#fdf1d8' '#d9bc92' '#c39bf0' '#2a1606' '#4ecec0' '#f5c563' '#ef9a7d' '#a35d22' '#361d08' '#321f1a' '#282416' '#331f0c' '#fde3a2'; do
  case "$root" in *"$old"*) echo "FAIL: old token value $old still in :root"; exit 1 ;; esac
done
for hex in '#ffe9c9' '#f3e4fb' '#dff4ee' '#ffe4b5'; do
  grep -qF -- "$hex" tests/background.test.js || { echo "FAIL: background.test.js does not pin $hex"; exit 1; }
done
n=$(node scripts/check-contrast.mjs | grep -c '^PASS')
[ "$n" = "52" ] || { echo "FAIL: contrast PASS count is $n, expected 52"; exit 1; }
node scripts/check-contrast.mjs > /dev/null || { echo "FAIL: contrast gate exit non-zero"; exit 1; }
out=$(npm test 2>&1)
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: not 282 pass"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: has failures"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/styles.css tests/background.test.js " ] || { echo "FAIL: unexpected changed files: [$changed]"; exit 1; }
echo RESKIN-TOKENS-OK
