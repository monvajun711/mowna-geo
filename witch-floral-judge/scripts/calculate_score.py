#!/usr/bin/env python3
"""Recalculate a Witch Floral Judge assessment without changing its rubric."""
import argparse
import json
from pathlib import Path


def grade(total: float) -> str:
    if total >= 90:
        return "卓越"
    if total >= 80:
        return "强"
    if total >= 70:
        return "胜任"
    if total >= 60:
        return "发展中"
    return "基础待加强"


def recalculate(data: dict) -> dict:
    domains = data.setdefault("scores", {}).get("domains", [])
    assessed = 0.0
    assessed_max = 0.0
    total_max = 0.0
    for domain in domains:
        subtotal = 0.0
        domain_max = float(domain.get("max", 0))
        total_max += domain_max
        for item in domain.get("items", []):
            if item.get("status") == "scored" and item.get("score") is not None:
                score = float(item["score"])
                maximum = float(item.get("max", 0))
                if score < 0 or maximum <= 0 or score > maximum:
                    raise ValueError(f"invalid score in {domain.get('key')}/{item.get('label')}")
                subtotal += score
                assessed += score
                assessed_max += maximum
        domain["subtotal"] = round(subtotal, 2)
        domain["max"] = domain_max
    scores = data["scores"]
    scores["assessed_points"] = round(assessed, 2)
    scores["assessed_max"] = round(assessed_max, 2)
    scores["total_points"] = round(assessed, 2)
    scores["total_max"] = round(total_max, 2)
    scores["coverage"] = round(assessed_max / total_max, 3) if total_max else 0
    scores["grade"] = grade(assessed) if total_max and assessed_max / total_max >= 0.8 else "证据不足"
    scores.setdefault("notes", [])
    return data


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("-o", "--output", type=Path)
    args = parser.parse_args()
    data = json.loads(args.input.read_text(encoding="utf-8"))
    result = recalculate(data)
    target = args.output or args.input
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: {target} assessed={result['scores']['assessed_points']}/{result['scores']['assessed_max']} grade={result['scores']['grade']}")


if __name__ == "__main__":
    main()
