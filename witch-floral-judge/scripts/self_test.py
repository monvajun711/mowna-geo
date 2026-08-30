#!/usr/bin/env python3
"""Small dependency-free smoke test for the skill package."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    ROOT / "SKILL.md",
    ROOT / "agents" / "openai.yaml",
    ROOT / "references" / "general-rubric.md",
    ROOT / "references" / "style-adapters.md",
    ROOT / "references" / "photo-evidence.md",
    ROOT / "references" / "judging-protocol.md",
    ROOT / "references" / "sources.md",
    ROOT / "references" / "assessment.schema.json",
    ROOT / "scripts" / "calculate_score.py",
]
missing = [str(p) for p in required if not p.exists()]
if missing:
    print("FAIL: missing " + ", ".join(missing))
    sys.exit(1)
schema = json.loads((ROOT / "references" / "assessment.schema.json").read_text(encoding="utf-8"))
assert schema["title"] == "Witch Floral Judge assessment"
skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
for marker in ("name: witch-floral-judge", "# 魔女花道", "photo-evidence.md", "style-adapters.md"):
    assert marker in skill, marker
sys.path.insert(0, str(ROOT / "scripts"))
from calculate_score import recalculate
demo = {"scores": {"domains": [{"key": "idea", "label": "创意", "max": 25, "items": [{"label": "题意", "status": "scored", "score": 8, "max": 10, "reason": "可见", "evidence_ids": []}]}]}}
scored = recalculate(demo)
assert scored["scores"]["grade"] == "证据不足"
assert scored["scores"]["coverage"] == 0.4
print(f"OK: {len(required)} required files and valid schema")
