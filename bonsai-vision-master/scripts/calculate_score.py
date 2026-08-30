#!/usr/bin/env python3
"""Recompute bonsai score totals deterministically from an assessment JSON."""
import argparse
import json
import sys
from pathlib import Path

GROUP_MAX = {"far_view": 25, "middle_view": 25, "near_view": 20, "living_view": 15, "school_fit": 15}
CAPS = {"none": 100, "watch": 100, "intervention": 69, "critical": 59}


def grade(score):
    if score >= 95: return "宗师境"
    if score >= 90: return "传世候选"
    if score >= 80: return "上品"
    if score >= 70: return "佳作"
    if score >= 60: return "成景"
    if score >= 45: return "养成期"
    return "素材期"


def recompute(data):
    errors = []
    scores = data.get("scores", {})
    evidence_ids = {item.get("id") for item in data.get("evidence", [])}
    for key, expected_max in GROUP_MAX.items():
        group = scores.get(key, {})
        if float(group.get("max", -1)) != expected_max:
            errors.append(f"{key}.max must be {expected_max}")
        subtotal = 0.0
        item_max = 0.0
        for idx, item in enumerate(group.get("items", [])):
            value, maximum = float(item.get("score", -1)), float(item.get("max", -1))
            if value < 0 or maximum <= 0 or value > maximum:
                errors.append(f"{key}.items[{idx}] score must be between 0 and max")
            subtotal += max(0, value)
            item_max += max(0, maximum)
            unknown = set(item.get("evidence_ids", [])) - evidence_ids
            if unknown:
                errors.append(f"{key}.items[{idx}] unknown evidence ids: {sorted(unknown)}")
        if abs(item_max - expected_max) > 0.001:
            errors.append(f"{key} item maxima sum to {item_max}, expected {expected_max}")
        group["subtotal"] = round(subtotal, 1)
    confidence = int(data.get("assessment_confidence", 0))
    if not 0 <= confidence <= 100:
        errors.append("assessment_confidence must be 0..100")
    base = sum(scores[k].get("subtotal", 0) for k in ("far_view", "middle_view", "near_view", "living_view"))
    raw = base + scores.get("school_fit", {}).get("subtotal", 0)
    gate = data.get("health_gate", "none")
    if gate not in CAPS:
        errors.append(f"unknown health_gate: {gate}")
        gate = "none"
    final = min(raw, CAPS[gate])
    uncertainty = 2 if confidence >= 85 else 4 if confidence >= 60 else 7
    scores.update(base_total=round(base, 1), raw_total=round(raw, 1), final_total=round(final, 1), grade=grade(final), uncertainty=uncertainty)
    if errors:
        raise ValueError("; ".join(errors))
    return data


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", nargs="?", type=Path)
    args = parser.parse_args()
    data = recompute(json.loads(args.input.read_text(encoding="utf-8")))
    payload = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.write_text(payload, encoding="utf-8")
    else:
        sys.stdout.write(payload)


if __name__ == "__main__":
    main()
