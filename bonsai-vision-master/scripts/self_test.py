#!/usr/bin/env python3
"""Stdlib-only integrity checks for the bonsai skill bundle."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_calculator():
    path = ROOT / "scripts" / "calculate_score.py"
    spec = importlib.util.spec_from_file_location("bonsai_score", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    required = [
        "SKILL.md", "agents/openai.yaml", "references/scoring-rubric.md",
        "references/four-views.md", "references/style-profiles.yaml",
        "references/species-care.yaml", "references/critique-lines.json",
        "references/assessment.schema.json", "references/game-rules.md",
        "references/image-analysis-protocol.md", "references/sources.md",
        "scripts/calculate_score.py", "scripts/render_report.py"
    ]
    missing = [name for name in required if not (ROOT / name).exists()]
    assert not missing, f"missing files: {missing}"
    skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    assert skill.startswith("---\nname: bonsai-vision-master\n")
    assert "[TODO" not in skill
    lines = json.loads((ROOT / "references/critique-lines.json").read_text(encoding="utf-8"))
    assert lines["count"] == len(lines["lines"]) >= 100
    assert len({item["id"] for item in lines["lines"]}) == len(lines["lines"])
    assert {item["polarity"] for item in lines["lines"]} == {"praise", "improve"}
    schema = json.loads((ROOT / "references/assessment.schema.json").read_text(encoding="utf-8"))
    assert schema["title"] == "Bonsai visual assessment"
    demo_path = ROOT / "assets/demo-assessment.json"
    demo = json.loads(demo_path.read_text(encoding="utf-8"))
    scored = load_calculator().recompute(demo)
    assert scored["scores"]["final_total"] == 76
    assert scored["scores"]["base_total"] == 65
    assert scored["scores"]["grade"] == "佳作"
    print(f"OK: {len(required)} required files, {lines['count']} critique lines, demo score 76/100")


if __name__ == "__main__":
    main()
