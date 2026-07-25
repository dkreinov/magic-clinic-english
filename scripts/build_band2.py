"""Deterministic builder: data/raw/band2.pdf -> data/band2.json.

Extracts the Israel MoE "Lexical Band II — Junior High School" vocabulary
tables using pymupdf's word-position data. See design docs for the frozen
algorithm this script implements verbatim.
"""
import fitz
import json
import re

SRC = "data/raw/band2.pdf"
DST = "data/band2.json"


def build():
    doc = fitz.open(SRC)
    entries = []

    section = None
    have_geometry = False
    entry_left = None
    second_left = None
    reg_left = None
    meaning_left = None
    header_y = None

    for i in range(2, doc.page_count):
        page = doc[i]
        text = page.get_text()

        if "BAND II CORE II" in text:
            section = "bandIIcoreII"
        elif "BAND II CORE I" in text:
            section = "bandIIcoreI"
        # otherwise: leave `section` at its carried-forward value

        if section is None:
            continue

        ws = [w for w in page.get_text("words") if w[1] > 90]

        rows = {}
        for w in ws:
            key = round(w[1])
            rows.setdefault(key, []).append(w)
        for key in rows:
            rows[key].sort(key=lambda w: w[0])

        header_row = None
        for y in sorted(rows.keys()):
            row = rows[y]
            texts = set(w[4] for w in row)
            if "Entry" in texts and ("PoS" in texts or "Meaning" in texts):
                header_row = row
                break

        if header_row is not None:
            xs = sorted(set(round(w[0]) for w in header_row))
            entry_left = xs[0]
            second_left = xs[1]

            regtoks = [w[0] for w in ws if w[4] in ("Prod", "Rec")]
            reg_left = min(regtoks) if regtoks else max(w[0] for w in header_row)

            meaning_left = None
            for w in header_row:
                if w[4].startswith("Meaning"):
                    meaning_left = w[0]
                    break

            header_y = round(header_row[0][1])
        else:
            if not have_geometry:
                continue
            header_y = -1

        have_geometry = True

        for y in sorted(rows.keys()):
            if not (y > header_y + 2):
                continue
            row = rows[y]

            entry_words = [w[4] for w in row if w[0] < second_left - 2]
            entry = re.sub(r"\s+", " ", " ".join(entry_words)).strip()

            reg_words = [w[4] for w in row if w[0] >= reg_left - 2]
            reg_joined = " ".join(reg_words)
            reg = reg_joined if reg_joined in ("Prod", "Rec") else None

            if meaning_left is not None:
                meaning_words = [
                    w[4] for w in row
                    if meaning_left - 2 <= w[0] < reg_left - 2
                ]
                meaning = " ".join(meaning_words)
            else:
                meaning = ""

            pos_upper = (meaning_left - 2) if meaning_left is not None else (reg_left - 2)
            pos_words = [
                w[4] for w in row
                if second_left - 2 <= w[0] < pos_upper
            ]
            pos = " ".join(pos_words)

            if not entry:
                continue
            if not (reg and reg.strip()) and not pos.strip():
                continue

            lemma = entry.lower()
            entries.append({
                "lemma": lemma,
                "pos": pos.strip() or None,
                "meaning": re.sub(r"\s+", " ", meaning).strip() or None,
                "reg": reg,
                "section": section,
                "single": bool(re.fullmatch(r"[a-z]+", lemma)),
            })

    entries.sort(key=lambda e: (
        e["section"] == "bandIIcoreII",
        e["lemma"],
        e["pos"] or "",
        e["meaning"] or "",
    ))

    meta = {
        "source": "Israel MoE — Lexical Band II (Junior High School)",
        "sourceUrl": "https://meyda.education.gov.il/files/Mazkirut_Pedagogit/English/CurriculumFilesAugust21/LexicalBand2.pdf",
        "extractedWith": "pymupdf",
        "entryCount": len(entries),
        "singleWordCount": sum(1 for e in entries if e["single"]),
    }

    with open(DST, "w", encoding="utf-8") as f:
        json.dump({"meta": meta, "entries": entries}, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"entryCount={meta['entryCount']} singleWordCount={meta['singleWordCount']}")


if __name__ == "__main__":
    build()
