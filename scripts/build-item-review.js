import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BANK_PATH = path.join(ROOT, "data", "placement-items.json");
const OUT_PATH = path.join(ROOT, "docs", "item-bank-review.html");

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const KIND_TEXT = {
  "audio-to-picture": "שומעת מילה, בוחרת תמונה",
  "picture-to-word": "רואה תמונה, בוחרת מילה",
};

const WARNINGS = {
  "t1-04": 'נקודה חלשה ידועה: התמונה עלולה להיקרא כ"סופה" ולא כ"מאוורר". ודאי שהיא מזהה אותה נכון.',
  "t1-06": 'נקודה חלשה ידועה: התמונה נקראת בעיקר כ"אדם מול מחשב", והתרגום "שולחן" עמום.',
};

function picturePath(lemma) {
  return `../public/assets/placement/${esc(lemma)}.webp`;
}

function renderTask1Item(item, byEmoji) {
  const parts = [];
  parts.push(`<article class="item" id="${esc(item.id)}">`);
  parts.push(`<h3>${esc(item.id)} · ${esc(item.lemma)} · ${esc(item.he)}</h3>`);
  if (WARNINGS[item.id]) {
    parts.push(`<p class="warn">${WARNINGS[item.id]}</p>`);
  }
  parts.push(`<p class="kind">${KIND_TEXT[item.direction]}</p>`);
  if (item.direction === "audio-to-picture") {
    parts.push(`<audio controls preload="none" src="../public/${esc(item.audio)}"></audio>`);
    parts.push('<div class="opts">');
    item.options.forEach((optionEmoji, idx) => {
      const opt = byEmoji.get(optionEmoji);
      const isCorrect = idx === item.correctIndex;
      const cls = isCorrect ? "opt correct" : "opt";
      const caption = isCorrect ? `${esc(opt.lemma)} ✓` : esc(opt.lemma);
      parts.push(
        `<figure class="${cls}"><img src="${picturePath(opt.lemma)}" alt="${esc(opt.he)}"><figcaption>${caption}</figcaption></figure>`
      );
    });
    parts.push("</div>");
  } else {
    parts.push(`<img class="prompt" src="${picturePath(item.lemma)}" alt="${esc(item.he)}">`);
    parts.push('<div class="opts words">');
    item.options.forEach((word, idx) => {
      const isCorrect = idx === item.correctIndex;
      const cls = isCorrect ? "opt correct" : "opt";
      const text = isCorrect ? `${esc(word)} ✓` : esc(word);
      parts.push(`<span class="${cls}">${text}</span>`);
    });
    parts.push("</div>");
  }
  parts.push('<label class="check"><input type="checkbox" /> בדקתי</label>');
  parts.push("</article>");
  return parts.join("\n");
}

function renderQuestion(question) {
  const parts = [];
  parts.push(`<div class="question" id="${esc(question.id)}">`);
  parts.push(`<p class="prompt">${esc(question.prompt)}</p>`);
  parts.push('<ul class="opts">');
  question.options.forEach((option, idx) => {
    const isCorrect = idx === question.correctIndex;
    const cls = isCorrect ? "opt correct" : "opt";
    const text = isCorrect ? `${esc(option)} ✓` : esc(option);
    parts.push(`<li class="${cls}">${text}</li>`);
  });
  parts.push("</ul>");
  parts.push('<label class="check"><input type="checkbox" /> בדקתי</label>');
  parts.push("</div>");
  return parts.join("\n");
}

function renderTask2Text(text) {
  const parts = [];
  parts.push(`<article class="text" id="${esc(text.id)}">`);
  parts.push(`<h3>${esc(text.id)} · ${esc(text.title)}</h3>`);
  parts.push(`<p class="english" dir="ltr">${esc(text.text)}</p>`);
  text.questions.forEach((q) => parts.push(renderQuestion(q)));
  parts.push("</article>");
  return parts.join("\n");
}

const STYLE = `
    body { font-family: system-ui, sans-serif; max-width: 960px; margin: 0 auto; padding: 24px; line-height: 1.5; color: #1a1a1a; background: #fafafa; }
    h1 { font-size: 1.6em; }
    h2 { margin-top: 2em; border-bottom: 2px solid #ccc; padding-bottom: 0.2em; }
    h3 { margin-bottom: 0.2em; }
    p.kind { color: #555; margin-top: 0; font-size: 0.9em; }
    p.warn { background: #fff3cd; border: 1px solid #e0c36a; padding: 8px 12px; border-radius: 6px; }
    article.item, article.text { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 16px 0; }
    div.question { border-top: 1px dashed #ccc; padding-top: 10px; margin-top: 10px; }
    p.english { direction: ltr; text-align: left; background: #f0f4f8; padding: 10px 12px; border-radius: 6px; }
    div.opts { display: flex; flex-wrap: wrap; gap: 12px; margin: 10px 0; }
    div.opts.words { align-items: center; }
    figure.opt { margin: 0; text-align: center; width: 120px; }
    figure.opt img { width: 100px; height: 100px; object-fit: contain; background: #f4f4f4; border-radius: 6px; }
    img.prompt { width: 140px; height: 140px; object-fit: contain; background: #f4f4f4; border-radius: 6px; display: block; margin: 10px 0; }
    span.opt, li.opt { display: inline-block; padding: 4px 10px; border: 1px solid #ccc; border-radius: 6px; margin: 2px; }
    ul.opts { list-style: none; padding: 0; }
    .opt.correct { border: 2px solid #2e8b57; background: #e6f4ea; font-weight: bold; }
    figcaption.correct, figure.correct figcaption { color: #2e8b57; }
    label.check { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; font-weight: bold; cursor: pointer; }
    audio { display: block; margin: 10px 0; width: 100%; max-width: 320px; }
`;

const SCRIPT = `
    document.addEventListener('change', function (event) {
      if (event.target && event.target.type === 'checkbox') {
        var checked = document.querySelectorAll('input:checked');
        document.getElementById('review-done').textContent = String(checked.length);
      }
    });
`;

function buildHtml(bank) {
  const byEmoji = new Map(bank.task1.map((i) => [i.emoji, i]));

  const task1Html = bank.task1.map((item) => renderTask1Item(item, byEmoji)).join("\n");
  const task2Html = bank.task2.map((text) => renderTask2Text(text)).join("\n");

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>סקירת מאגר השאלות — מבחן המיון</title>
<style>${STYLE}</style>
</head>
<body>
<h1>סקירת מאגר השאלות</h1>
<p>עברי על כל השאלות: השמיעי כל הקלטה, הביטי בכל תמונה, ובדקי שהתשובה המסומנת ב-✓ היא באמת הנכונה ושאין אפשרות שנייה שיכולה להיות נכונה. סמני כל שאלה שבדקת.</p>
<p>נבדקו <span id="review-done">0</span> מתוך 18</p>
<h2>משימה 1 — מילים ותמונות (12)</h2>
${task1Html}
<h2>משימה 2 — הבנת הנקרא (2 טקסטים, 6 שאלות)</h2>
${task2Html}
<p>סיימת? רשמי את האישור בסעיף 6 של docs/item-bank-review.md. הוראות לתיקון פריט נמצאות בסעיף 5 של אותו מסמך.</p>
<script>${SCRIPT}</script>
</body>
</html>
`;
}

async function main() {
  const bank = JSON.parse(readFileSync(BANK_PATH, "utf8"));
  const html = buildHtml(bank);
  writeFileSync(OUT_PATH, html, "utf8");
  console.log("wrote docs/item-bank-review.html");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
