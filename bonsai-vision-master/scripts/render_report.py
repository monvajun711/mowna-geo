#!/usr/bin/env python3
"""Render a standalone, offline bonsai assessment report from JSON."""
import argparse
import base64
import html
import json
import math
import mimetypes
from pathlib import Path


def esc(value):
    return html.escape(str(value))


def image_uri(path):
    file_path = Path(path)
    mime = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(file_path.read_bytes()).decode("ascii")


def radar(scores):
    keys = [("far_view", "远观势", 25), ("middle_view", "中观骨", 25), ("near_view", "近观功", 20), ("living_view", "活观生", 15), ("school_fit", "流派", 15)]
    cx, cy, radius = 150, 150, 104
    def point(i, ratio):
        angle = -math.pi / 2 + i * 2 * math.pi / len(keys)
        return cx + math.cos(angle) * radius * ratio, cy + math.sin(angle) * radius * ratio
    rings = []
    for r in (0.25, 0.5, 0.75, 1):
        rings.append(" ".join(f"{x:.1f},{y:.1f}" for i in range(5) for x, y in [point(i, r)]))
    values = [scores[k].get("subtotal", 0) / maximum for k, _, maximum in keys]
    polygon = " ".join(f"{x:.1f},{y:.1f}" for i, ratio in enumerate(values) for x, y in [point(i, ratio)])
    labels = []
    for i, (key, label, maximum) in enumerate(keys):
        x, y = point(i, 1.22)
        anchor = "middle" if abs(x - cx) < 20 else ("start" if x > cx else "end")
        labels.append(f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}">{esc(label)} {scores[key].get("subtotal",0):g}/{maximum}</text>')
    spokes = "".join(f'<line x1="{cx}" y1="{cy}" x2="{x:.1f}" y2="{y:.1f}" />' for i in range(5) for x, y in [point(i, 1)])
    return f'''<svg class="radar" viewBox="0 0 300 300" role="img" aria-label="四观与流派雷达图">
      <g class="grid">{''.join(f'<polygon points="{r}" />' for r in rings)}{spokes}</g>
      <polygon class="radar-fill" points="{polygon}" />
      <g class="radar-labels">{''.join(labels)}</g>
    </svg>'''


def bars(scores):
    groups = [("far_view", "远观势", 25), ("middle_view", "中观骨", 25), ("near_view", "近观功", 20), ("living_view", "活观生", 15), ("school_fit", "流派校准", 15)]
    result = []
    for key, label, maximum in groups:
        value = float(scores[key].get("subtotal", 0))
        result.append(f'''<div class="bar-row"><div class="bar-head"><span>{label}</span><b>{value:g}<small>/{maximum}</small></b></div><div class="track"><i style="width:{value/maximum*100:.1f}%"></i></div></div>''')
    return "".join(result)


def evidence_overlay(items):
    nodes = []
    for i, item in enumerate(items, 1):
        x, y, w, h = item["bbox"]
        nodes.append(f'<span class="evidence-box" style="left:{x*100:.2f}%;top:{y*100:.2f}%;width:{w*100:.2f}%;height:{h*100:.2f}%" aria-label="证据 {i}: {esc(item["label"])}"><b>{i}</b></span>')
    return "".join(nodes)


def list_items(values, empty="暂无"):
    return "".join(f"<li>{esc(v)}</li>" for v in values) or f"<li>{empty}</li>"


def actions(values):
    rows = []
    labels = {"low": "低风险", "medium": "中风险", "high": "高风险"}
    for item in values:
        rows.append(f'''<article class="action"><div><strong>{esc(item['action'])}</strong><span class="risk {esc(item['risk'])}">{labels.get(item['risk'], item['risk'])}</span></div><p>{esc(item['why'])}</p><small>{esc(item['timing'])}</small></article>''')
    return "".join(rows) or "<p class=muted>本阶段暂无动作。</p>"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("assessment", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    data = json.loads(args.assessment.read_text(encoding="utf-8"))
    scores = data["scores"]
    source_image = Path(data["image"]["path"])
    if not source_image.is_absolute():
        source_image = (args.assessment.parent / source_image).resolve()
    uri = image_uri(source_image)
    species = data["subject"].get("species_candidates", [])
    species_text = "；".join(f"{s['name']} {round(s['confidence']*100)}%" for s in species) or "未识别"
    report = f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(data['subject']['display_name'])} · 盆景评鉴</title>
<style>
:root{{--ink:#e9f0e5;--muted:#9baa9a;--paper:#101510;--panel:#182018;--line:#314131;--moss:#b6ff5c;--jade:#69d8b4;--ember:#ff9d5c;--danger:#ff6b61}}*{{box-sizing:border-box}}body{{margin:0;background:radial-gradient(circle at 16% 0,#253126 0,transparent 28%),#0a0e0b;color:var(--ink);font:15px/1.6 system-ui,"Noto Sans SC",sans-serif}}main{{max-width:1180px;margin:auto;padding:28px}}header{{display:flex;justify-content:space-between;gap:20px;align-items:end;border-bottom:1px solid var(--line);padding-bottom:18px}}h1,h2,h3,p{{margin-top:0}}h1{{font:500 clamp(28px,5vw,58px)/1.05 Georgia,"Noto Serif SC",serif;margin-bottom:8px}}h2{{font:500 21px Georgia,"Noto Serif SC",serif}}.eyebrow,.muted,small{{color:var(--muted)}}.score{{font:500 72px/1 Georgia,serif;color:var(--moss)}}.score small{{font:16px system-ui;color:var(--muted)}}.grade{{text-align:right}}.grid{{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(310px,.65fr);gap:22px;margin-top:22px}}.panel{{background:color-mix(in srgb,var(--panel) 94%,transparent);border:1px solid var(--line);border-radius:18px;padding:20px}}.image-wrap{{position:relative;overflow:hidden;border-radius:12px;background:#050805;min-height:420px;display:grid;place-items:center}}.image-wrap img{{display:block;max-width:100%;max-height:700px;object-fit:contain}}.evidence-box{{position:absolute;border:2px solid var(--moss);box-shadow:0 0 0 9999px #0000}}.evidence-box b{{position:absolute;left:-2px;top:-26px;background:var(--moss);color:#101510;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px}}.radar{{width:100%;max-width:330px;display:block;margin:auto}}.grid polygon,.grid line{{fill:none;stroke:var(--line);stroke-width:1}}.radar-fill{{fill:color-mix(in srgb,var(--moss) 28%,transparent);stroke:var(--moss);stroke-width:2}}.radar text{{fill:var(--muted);font-size:11px}}.bar-row{{margin:12px 0}}.bar-head{{display:flex;justify-content:space-between}}.bar-head small{{font-weight:400}}.track{{height:7px;background:#293229;border-radius:9px;overflow:hidden}}.track i{{display:block;height:100%;background:linear-gradient(90deg,var(--jade),var(--moss))}}.quote{{font:500 22px/1.5 Georgia,"Noto Serif SC",serif;border-left:3px solid var(--moss);padding-left:18px}}.quote.improve{{border-color:var(--ember)}}.detail-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:22px}}ul{{padding-left:20px}}.evidence-list{{counter-reset:e}}.evidence-list li{{margin:8px 0}}.evidence-list b{{color:var(--moss)}}.timeline{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}}.action{{border-top:1px solid var(--line);padding:12px 0}}.action>div{{display:flex;justify-content:space-between;gap:10px}}.action p{{margin:5px 0}}.risk{{font-size:12px;padding:1px 8px;border-radius:99px;border:1px solid var(--line)}}.risk.high{{color:var(--danger)}}.risk.medium{{color:var(--ember)}}footer{{margin:28px 0;color:var(--muted);font-size:12px}}@media(max-width:800px){{main{{padding:16px}}header{{align-items:start}}.score{{font-size:54px}}.grid,.detail-grid,.timeline{{grid-template-columns:1fr}}.image-wrap{{min-height:300px}}}}
</style></head><body><main>
<header><div><div class="eyebrow">BONSAI / VISUAL ASSESSMENT</div><h1>{esc(data['subject']['display_name'])}</h1><p>{esc(data['verdict']['one_liner'])}</p><small>{esc(data['subject']['form_style'])} · {esc(data['subject']['school_profile'])} · {esc(species_text)}</small></div><div class="grade"><div class="score">{scores['final_total']:g}<small>/100</small></div><b>{esc(scores['grade'])}</b><div class="muted">置信度 {data['assessment_confidence']}% · ±{scores['uncertainty']}</div></div></header>
<section class="grid"><div class="panel"><div class="image-wrap"><img src="{uri}" alt="被评盆景图">{evidence_overlay(data['evidence'])}</div></div><div class="panel"><h2>四观与流派</h2>{radar(scores)}{bars(scores)}<p class="muted">健康闸门：{esc(data['health_gate'])} · 四观基础 {scores['base_total']:g}/85</p></div></section>
<section class="detail-grid"><div class="panel"><h2>可取</h2><ul>{list_items(data['verdict']['strengths'])}</ul></div><div class="panel"><h2>可进</h2><ul>{list_items(data['verdict']['weaknesses'])}</ul></div><div class="panel"><h2>本图不可判</h2><ul>{list_items(data['verdict']['not_judged'])}</ul></div></section>
<section class="grid"><div class="panel"><h2>宗师评语</h2><p class="quote">{esc(data['matched_lines']['praise'])}</p><p class="quote improve">{esc(data['matched_lines']['improve'])}</p></div><div class="panel"><h2>证据索引</h2><ol class="evidence-list">{''.join(f'<li><b>{esc(e["label"])}</b> · {esc(e["observation"])} <span class="muted">{round(e["confidence"]*100)}%</span></li>' for e in data['evidence'])}</ol></div></section>
<section class="panel" style="margin-top:22px"><h2>因树施策</h2><div class="timeline"><div><h3>现在—7 天</h3>{actions(data['plan']['now_7_days'])}</div><div><h3>下一作业季</h3>{actions(data['plan']['next_season'])}</div><div><h3>一至三年</h3>{actions(data['plan']['one_to_three_years'])}</div></div></section>
<footer>本报告仅依据可见图像证据。浇水、病虫诊断、翻盆、重剪与根系处理需结合树种、当地物候、介质和连续观察。</footer>
</main></body></html>'''
    args.output.write_text(report, encoding="utf-8")
    print(args.output.resolve())


if __name__ == "__main__":
    main()
