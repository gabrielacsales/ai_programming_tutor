#!/usr/bin/env python3
"""Analisa os pares pré/pós exportados do painel, sem acessar Supabase.
Uso:
  python scripts/analyze_study.py --assessments tcc_assessments_2026-10-20.csv \
    --key research-answer-key.private.json --output resultados
O arquivo privado de respostas corretas NÃO deve ser commitado.
"""
import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path
from statistics import mean, median, stdev

ITEMS = [f"q{i}" for i in range(1, 9)]

def read_answers(path):
    pairs = defaultdict(dict)
    with open(path, encoding="utf-8-sig", newline="") as file:
        for row in csv.DictReader(file):
            code = row.get("code", "").strip()
            phase = row.get("phase", "").strip()
            if not code or phase not in ("pre", "post"):
                continue
            pairs[code][phase] = {q: row.get("answers_" + q, "").strip() for q in ITEMS}
    return pairs

def score(answers, key):
    return sum(1 for q in ITEMS if answers.get(q) == key.get(q))

def describe(values):
    if not values:
        return {"n": 0}
    return {
        "n": len(values), "mean": round(mean(values), 3),
        "median": round(median(values), 3),
        "min": min(values), "max": max(values),
        "sd": round(stdev(values), 3) if len(values) > 1 else None
    }

def main():
    parser = argparse.ArgumentParser(description="Estudo exploratório: correção pré/pós")
    parser.add_argument("--assessments", type=Path, required=True)
    parser.add_argument("--key", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("resultados_pesquisa"))
    args = parser.parse_args()
    key = json.loads(args.key.read_text(encoding="utf-8"))
    if set(key) != {"pre", "post"} or any(set(key[phase]) != set(ITEMS) for phase in ("pre","post")):
        raise ValueError("Gabarito inválido; exigidas fases pre/post e questões q1..q8.")
    pairs = read_answers(args.assessments)
    rows = []
    for code, phases in sorted(pairs.items()):
        if not all(phase in phases for phase in ("pre", "post")):
            continue
        pre = score(phases["pre"], key["pre"])
        post = score(phases["post"], key["post"])
        rows.append({"code": code, "pre_score": pre, "post_score": post,
                     "delta": post - pre, "pre_percent": pre / 8 * 100,
                     "post_percent": post / 8 * 100})
    args.output.mkdir(parents=True, exist_ok=True)
    with (args.output / "paired_scores.csv").open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=["code","pre_score","post_score","delta","pre_percent","post_percent"])
        writer.writeheader()
        writer.writerows(rows)
    summary = {
        "instrument_version": "tcc-v1",
        "item_count": 8,
        "total_distinct_submissions": len(pairs),
        "paired_participants": len(rows),
        "pre": describe([r["pre_score"] for r in rows]),
        "post": describe([r["post_score"] for r in rows]),
        "paired_change": describe([r["delta"] for r in rows]),
        "paired_improved": sum(r["delta"] > 0 for r in rows),
        "paired_unchanged": sum(r["delta"] == 0 for r in rows),
        "paired_declined": sum(r["delta"] < 0 for r in rows),
        "interpretation_caution": "Comparação exploratória sem grupo-controle; não atribuir causalidade ao tutor."
    }
    # Estatística opcional: teste pareado de Wilcoxon (n pequeno: interpretar com cautela).
    try:
        from scipy.stats import wilcoxon
        if len(rows) >= 6 and any(r["delta"] != 0 for r in rows):
            w = wilcoxon([r["post_score"] for r in rows], [r["pre_score"] for r in rows],
                         alternative="two-sided", zero_method="wilcox", method="auto")
            summary["wilcoxon_exploratory"] = {"statistic": float(w.statistic), "p_value": float(w.pvalue)}
    except ImportError:
        summary["wilcoxon_exploratory"] = "SciPy não instalado (opcional)."
    (args.output / "descriptive_summary.json").write_text(
        json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8"
    )
    print("Arquivo gerado:", args.output / "paired_scores.csv")
    print(json.dumps(summary, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
