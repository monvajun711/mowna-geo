---
name: bonsai-vision-master
description: Evaluate bonsai or penjing images with evidence-linked scores, regional-school aesthetics, species-conditioned care and pruning advice, or run a choice-driven cyber bonsai game. Use for bonsai critique, image scoring, styling plans, exhibition reports, and bonsai game sessions; do not identify a plant or prescribe irreversible work from weak visual evidence with false certainty.
---

# Bonsai Vision Master

Treat bonsai as living art. Separate what the image shows, what is inferred, and what cannot be known from one view. Never reward a visual effect that compromises health.

## Choose the mode

- **Image assessment:** read [image-analysis-protocol.md](references/image-analysis-protocol.md), [scoring-rubric.md](references/scoring-rubric.md), the relevant entry in [style-profiles.yaml](references/style-profiles.yaml), and the likely species group in [species-care.yaml](references/species-care.yaml). Search [critique-lines.json](references/critique-lines.json) only after scores are final.
- **Styling or care plan:** read the scoring rubric, relevant style profile, and species-care entry. Ask for location, season, outdoor/indoor placement, recent work, and substrate only when missing answers would change a risky recommendation. Otherwise give conditional branches.
- **Cyber bonsai game session:** read [game-rules.md](references/game-rules.md). Maintain the state ledger, let the player choose every irreversible action, resolve the season, and score the finished work with the same rubric.
- **Build the online game:** read [game-rules.md](references/game-rules.md), [assessment.schema.json](references/assessment.schema.json), and the project blueprint at `../docs/赛博盆景在线游戏_产品与开发蓝图.md`.

## Image assessment workflow

1. Check image fitness. State view count, occlusion, lighting, background interference, and whether the pot and soil surface are visible.
2. Identify up to three species candidates and one or more style/school candidates. Give confidence and visible evidence; do not turn resemblance into certainty.
3. Record normalized evidence boxes `[x, y, width, height]` for every material claim. Score only supported features.
4. Score **四观基础 85** plus **流派校准 15** using [scoring-rubric.md](references/scoring-rubric.md). If no school is declared or inferable above 0.65 confidence, use the `unaffiliated` profile so the work is not punished for eclecticism.
5. Apply the health gate only when multiple visible symptoms support it. Missing views reduce confidence, not artistic score.
6. Select one positive and one improvement line from [critique-lines.json](references/critique-lines.json). Match school, score band, tags, polarity, and evidence. Never present the library's original templates as historical quotations.
7. Give a three-horizon plan: `now_7_days`, `next_season`, `one_to_three_years`. Order actions as health first, structure second, refinement third.
8. Save the structured result against [assessment.schema.json](references/assessment.schema.json). Run `scripts/calculate_score.py` to recompute totals, then `scripts/render_report.py` to create the visual report when local file output is available.

## Required answer shape

Lead with the displayed image and verdict. Include:

- total score, grade, scoring confidence, and health gate;
- four-view subtotals and the 15-point school fit;
- evidence-linked strengths and weaknesses, including what cannot be judged;
- matched critique lines;
- species candidates and assumptions;
- phased styling, pruning, and care advice with risk and season;
- a visible warning before any trunk chop, major root work, full defoliation, jin/shari work, or simultaneous major operations.

For a text-only response, use compact progress bars or a table. For a file response, prefer the generated report so the supplied image, evidence boxes, radar, school profile, critique lines, and plan appear in one view.

## Non-negotiable constraints

- Do not claim a single universal bonsai standard. The 100-point model is this skill's transparent comparison framework, informed by judging literature and Chinese school sources.
- Never infer watering frequency from image appearance alone. Recommend checking substrate moisture, drainage, climate, season, and species.
- Never prescribe fixed calendar dates without the user's climate zone. Use phenological timing such as “before bud break” or “after the spring flush hardens.”
- Do not combine repotting/root pruning with severe canopy reduction unless a species-specific expert plan supports it.
- Do not advise deadwood techniques on broadleaf species merely to imitate conifer aesthetics.
- Do not score photography quality as tree quality. Report photo limitations separately.
- Do not quote books or articles at length. Use [sources.md](references/sources.md) for provenance and the original critique library for reusable wording.
