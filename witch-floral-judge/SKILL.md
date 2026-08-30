---
name: witch-floral-judge
description: Score floral arrangements from images or live-brief evidence with transparent 100-point rubrics, style-aware calibration, rule compliance, and actionable critique. Use for flower arranging, floristry, ikebana, Chinese traditional floral art, competition pre-scoring, and photo-based feedback; do not claim official certification or infer hidden mechanics from an inadequate image.
---

# 魔女花道

把插花当作“植物材料 + 空间设计 + 技术实现 + 文化语境”的综合作品来评审。先说证据，再说分数；把可见事实、合理推断和无法判断的事项分开。作品评分与摄影质量分开，除非用户明确参加的是花艺摄影比赛。

## Select the mode

- **Image score / critique:** read [photo-evidence.md](references/photo-evidence.md), [general-rubric.md](references/general-rubric.md), and the relevant style adapter in [style-adapters.md](references/style-adapters.md).
- **Competition or client brief:** also read [judging-protocol.md](references/judging-protocol.md). Apply the supplied brief, size, material, safety, and timing rules before aesthetic scoring.
- **Chinese traditional floral art:** read the Chinese traditional adapter; never substitute generic Western fullness or symmetry for its rule system.
- **Ikebana:** require a school/style when possible (for example Ikenobo rikka, shoka, or free style). If unknown, use the neutral adapter and state the limitation.
- **Structured output or local report:** use [assessment.schema.json](references/assessment.schema.json) and run `scripts/calculate_score.py` after drafting the score.

## Workflow

1. **Declare the brief and style.** Record purpose, audience, display environment, allowed materials, size limits, and declared school/style. If absent, say which assumptions are being used.
2. **Check evidence fitness.** Count views, note lighting, occlusion, scale reference, background interference, and whether the back, underside, water source, and mechanics are visible. A single front image can support a provisional visual critique, not a full technical verdict.
3. **Separate constraints from merit.** Mark hard-rule status (pass, deduction, or disqualification risk) independently from the 100-point aesthetic/technical score. Do not hide a rule violation inside a subjective score.
4. **Score four domains.** Use the default 25/25/25/25 structure in [general-rubric.md](references/general-rubric.md), or pre-declare a different task-specific weighting before looking at the result. Use the 1–5 anchored scale and `N/A` when evidence is insufficient.
5. **Apply the style adapter.** Adjust what counts as convincing within the named tradition. Do not penalize asymmetry, sparse material, buds, withered material, or an absent Western focal point when the selected tradition values them.
6. **Attach evidence.** For each material claim, give an evidence ID and normalized box `[x, y, width, height]` when an image is available. Do not identify a species or hidden construction with false certainty.
7. **Report coverage and confidence.** Show assessed points, unassessed points, evidence coverage, and confidence. Do not normalize missing evidence into a falsely precise 100-point result.
8. **Give useful feedback.** Lead with one-line verdict, then strengths, highest-leverage improvements, what cannot be judged, and the smallest next action. Keep criticism specific to the brief and visible evidence.

## Required answer shape

Return:

- mode, declared style, brief assumptions, and image fitness;
- rule-compliance status and any separate penalties;
- score by domain with max points, evidence IDs, and one-sentence rationale;
- total or provisional total, assessed/max points, confidence, and grade band;
- three strengths, three prioritized improvements, and `not_judged` items;
- style-sensitive explanation of why the work succeeds or falls short;
- the next photo or piece of information that would most improve confidence.

For image answers, show or reference the supplied image when the host supports it. Do not invent image boxes if the image is unavailable.

## Non-negotiable constraints

- No single universal floral aesthetic. A generic score is a comparison aid, not an official qualification.
- Do not score hidden stability, water uptake, durability, material freshness, scent, or safety from one front photo. Label them unverified or request the relevant view/test.
- Do not score the photograph as the arrangement. Poor framing lowers evidence confidence, not artistic merit, except in a photography category.
- Do not infer a school from appearance alone when several traditions are plausible. Ask for the school or score neutrally.
- Do not make sustainability claims without sourcing, material, disposal, or process evidence. Treat sustainability as an optional evidence-based module.
- For high-stakes competitions, recommend trained human judges and independent scoring. This Skill is a coaching/pre-screening aid, not a replacement for an appointed jury.
- Preserve uncertainty: species names, provenance, cultural meaning, and construction details are hypotheses unless supplied or clearly visible.

## References

- [general-rubric.md](references/general-rubric.md): default 100-point rubric, anchors, and score bands.
- [style-adapters.md](references/style-adapters.md): Chinese traditional, modern floristry, Ikenobo, and neutral handling.
- [photo-evidence.md](references/photo-evidence.md): minimum views, authenticity, and photo-only limitations.
- [judging-protocol.md](references/judging-protocol.md): blind/multi-judge, penalties, and feedback procedure.
- [assessment.schema.json](references/assessment.schema.json): machine-readable output contract.
- [sources.md](references/sources.md): provenance and update notes.
