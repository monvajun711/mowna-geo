#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
魔女GEO · 站点 GEO 自检器（零依赖，仅用 Python 标准库）

用法:
    python geo_scan.py https://example.com
    python geo_scan.py example.com --json
    python geo_scan.py example.com --timeout 20

检查项（对应课程关卡 1 / 2 / 3 / 5）:
    [关卡1] robots.txt 是否放行 6 大 AI 检索型爬虫
    [关卡2] 首页是否 SSR（内容在初始 HTML 中可读）
    [关卡3] llms.txt 是否存在且格式合规
    [关卡5] JSON-LD 结构化数据有哪些类型、缺哪些关键类型

输出: 可读报告 + 0-100 可访问性评分 + 修复建议

注意: 仅对你自己拥有或已获授权的域名发起公开 HTTP 请求，
      不做登录、越权或高频抓取。
"""

import argparse
import json
import re
import ssl
import sys
import urllib.error
import urllib.request
from urllib.parse import urlparse

UA = "MownaGEO-Scanner/1.0 (+https://github.com/mowna-geo; GEO course self-audit)"

# 检索型爬虫：放行 = 有被 AI 实时引用的机会
SEARCH_BOTS = [
    ("OAI-SearchBot", "OpenAI", "ChatGPT Search 引用核心"),
    ("ChatGPT-User", "OpenAI", "用户请求 ChatGPT 读取页面"),
    ("Claude-SearchBot", "Anthropic", "Claude 实时检索"),
    ("Claude-User", "Anthropic", "用户请求 Claude 读取页面"),
    ("PerplexityBot", "Perplexity", "索引 + 引用核心"),
    ("Perplexity-User", "Perplexity", "按需抓取"),
]

# 训练型爬虫：按公司政策自选，不影响实时引用
TRAIN_BOTS = [
    ("GPTBot", "OpenAI", "模型训练"),
    ("Google-Extended", "Google", "Gemini 训练"),
    ("CCBot", "Common Crawl", "喂养众多模型"),
    ("Bytespider", "字节", "中文 AI 模型训练"),
    ("ClaudeBot", "Anthropic", "模型训练"),
]

KEY_SCHEMAS = {
    "Organization": "机构实体（全站头部必放，须含 sameAs）",
    "LocalBusiness": "本地商户（有线下门店时必放）",
    "WebSite": "站点实体",
    "BlogPosting": "博客文章（不要用 Article 代替）",
    "Article": "通用文章（优于无，但博客应用 BlogPosting）",
    "Product": "产品页",
    "Service": "服务页（不要用 Article 代替）",
    "FAQPage": "问答页",
    "HowTo": "教程/步骤类",
    "Person": "作者实体（个人 IP 必需）",
    "BreadcrumbList": "面包屑（主题簇信号）",
    "ContactPage": "联系页",
}


def _ctx():
    try:
        return ssl.create_default_context()
    except Exception:
        return None


def fetch(url, timeout=15):
    """返回 (status, body_text, final_url, error)"""
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,text/plain,*/*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_ctx()) as r:
            raw = r.read()
            enc = r.headers.get_content_charset() or "utf-8"
            return r.status, raw.decode(enc, errors="replace"), r.geturl(), None
    except urllib.error.HTTPError as e:
        return e.code, "", url, "HTTP %s" % e.code
    except Exception as e:
        return 0, "", url, str(e)


def normalize(target):
    if not re.match(r"^https?://", target, re.I):
        target = "https://" + target
    p = urlparse(target)
    return "%s://%s" % (p.scheme or "https", p.netloc or p.path)


# ---------------------------------------------------------------- robots.txt
def parse_robots(txt):
    """返回 {agent_lower: {'allow':[], 'disallow':[]}}，保留顺序"""
    groups, cur = {}, None
    for line in txt.splitlines():
        line = line.split("#", 1)[0].strip()
        if not line:
            continue
        m = re.match(r"(?i)^(user-agent)\s*:\s*(.+)$", line)
        if m:
            cur = m.group(2).strip().lower()
            groups.setdefault(cur, {"allow": [], "disallow": []})
            continue
        m = re.match(r"(?i)^(allow|disallow|crawl-delay|sitemap)\s*:\s*(.*)$", line)
        if m and cur is not None:
            key, val = m.group(1).lower(), m.group(2).strip()
            if key in ("allow", "disallow"):
                groups[cur][key].append(val)
    return groups


def bot_blocked(groups, bot):
    """判定某 bot 是否被阻断。返回 (blocked: bool, reason: str)"""
    b = bot.lower()
    spec = groups.get(b)
    star = groups.get("*")

    def _blocked_by(g):
        if not g:
            return None
        for d in g["disallow"]:
            if d == "/":
                # 有更具体的 Allow 覆盖则不判全站封禁
                for a in g["allow"]:
                    if a and a != "/":
                        return False, "Disallow: / 但存在更具体的 Allow: %s" % a
                return True, "Disallow: /（整站封禁）"
        return False, ""

    if spec is not None:
        blocked, reason = _blocked_by(spec)
        if blocked is not None:
            if blocked:
                return True, "专属规则：" + reason
            return False, reason or "专属规则已放行"

    if star is not None:
        blocked, reason = _blocked_by(star)
        if blocked:
            return True, "通配符规则：" + reason
        if blocked is False and spec is None:
            return False, "通配符 * 放行（无专属规则）"

    if spec is None and star is None:
        return False, "无相关规则（默认允许）"
    return False, ""


# ---------------------------------------------------------------- SSR 判定
def check_ssr(html):
    """估算初始 HTML 中的可见文本量，判定是否 SSR。
    返回 (verdict, visible_len, detail)"""
    body = html

    # 去掉 script / style / noscript / template / svg
    body = re.sub(r"(?is)<script\b.*?</script>", " ", body)
    body = re.sub(r"(?is)<style\b.*?</style>", " ", body)
    body = re.sub(r"(?is)<noscript\b.*?</noscript>", " ", body)
    body = re.sub(r"(?is)<template\b.*?</template>", " ", body)
    body = re.sub(r"(?is)<svg\b.*?</svg>", " ", body)

    # 去注释
    body = re.sub(r"(?s)<!--.*?-->", " ", body)

    text = re.sub(r"(?s)<[^>]+>", " ", body)
    text = re.sub(r"&nbsp;?", " ", text)
    text = re.sub(r"&[a-zA-Z#0-9]+;", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    # 中文按字计，英文按词计
    cjk = len(re.findall(r"[\u4e00-\u9fff]", text))
    words = len(re.findall(r"[A-Za-z]{2,}", text))
    score = cjk + words

    if score >= 500:
        v = "正常（SSR / 静态 HTML）"
    elif score >= 150:
        v = "偏低（疑似部分内容依赖 JS 渲染）"
    else:
        v = "异常（疑似纯 CSR，AI 可能读到空壳）"
    return v, score, "可见文本量≈%d（中文 %d 字 + 英文 %d 词）" % (score, cjk, words)


# ---------------------------------------------------------------- JSON-LD
def parse_jsonld(html):
    types, errors = [], []
    blocks = re.findall(r'(?is)<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html)
    for b in blocks:
        b = b.strip()
        if not b:
            continue
        try:
            data = json.loads(b)
        except Exception as e:
            errors.append("JSON-LD 解析失败：%s" % str(e)[:80])
            continue

        def walk(o):
            if isinstance(o, dict):
                t = o.get("@type")
                if isinstance(t, str):
                    types.append(t)
                elif isinstance(t, list):
                    types.extend([x for x in t if isinstance(x, str)])
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)

        walk(data)
    return sorted(set(types)), errors, len(blocks)


# ---------------------------------------------------------------- 主流程
def scan(target, timeout=15):
    base = normalize(target)
    out = {"url": base, "checks": {}, "score": 0, "advice": []}

    # --- robots.txt ---
    st, txt, _, err = fetch(base + "/robots.txt", timeout)
    if st == 200 and txt:
        groups = parse_robots(txt)
        rows = []
        for bot, vendor, purpose in SEARCH_BOTS:
            blocked, reason = bot_blocked(groups, bot)
            rows.append({"bot": bot, "vendor": vendor, "purpose": purpose,
                         "blocked": blocked, "reason": reason})
        trows = []
        for bot, vendor, purpose in TRAIN_BOTS:
            blocked, reason = bot_blocked(groups, bot)
            trows.append({"bot": bot, "vendor": vendor, "purpose": purpose,
                          "blocked": blocked, "reason": reason})
        out["checks"]["robots"] = {"exists": True, "search_bots": rows, "train_bots": trows}
    else:
        out["checks"]["robots"] = {"exists": False, "error": err or ("HTTP %s" % st)}

    # --- llms.txt ---
    st2, ltxt, _, err2 = fetch(base + "/llms.txt", timeout)
    if st2 == 200 and ltxt:
        has_brand = len(ltxt.strip()) > 30
        links = re.findall(r"https?://\S+", ltxt)
        out["checks"]["llms"] = {"exists": True, "chars": len(ltxt),
                                 "links": len(links), "has_brand": has_brand}
    else:
        out["checks"]["llms"] = {"exists": False, "error": err2 or ("HTTP %s" % st2)}

    # --- 首页 HTML ---
    st3, html, final, err3 = fetch(base + "/", timeout)
    if st3 == 200 and html:
        verdict, score_len, detail = check_ssr(html)
        out["checks"]["ssr"] = {"verdict": verdict, "detail": detail, "len": score_len}
        types, jerrors, nblocks = parse_jsonld(html)
        out["checks"]["schema"] = {"types": types, "errors": jerrors, "blocks": nblocks}
        html_ok = True
    else:
        out["checks"]["ssr"] = {"verdict": "无法判定", "detail": err3 or ("HTTP %s" % st3), "len": 0}
        out["checks"]["schema"] = {"types": [], "errors": [], "blocks": 0}
        html_ok = False

    # --- 评分 ---
    s = 0
    rb = out["checks"]["robots"]
    if rb.get("exists"):
        blocked_n = sum(1 for r in rb["search_bots"] if r["blocked"])
        ratio = 1 - (blocked_n / len(SEARCH_BOTS))
        s += round(40 * ratio)
    else:
        s += 0

    lm = out["checks"]["llms"]
    if lm.get("exists"):
        s += 10
        if lm.get("links", 0) >= 3:
            s += 5
    else:
        s += 0

    sr = out["checks"]["ssr"]
    if sr["len"] >= 500:
        s += 25
    elif sr["len"] >= 150:
        s += 12
    else:
        s += 0

    sc = out["checks"]["schema"]
    if sc["types"]:
        s += 10
        if "Organization" in sc["types"]:
            s += 5
        if "BlogPosting" in sc["types"] or "Article" in sc["types"]:
            s += 5
    out["score"] = max(0, min(100, s))

    # --- 建议 ---
    a = out["advice"]
    if not rb.get("exists"):
        a.append("[关卡1·高] 未找到 robots.txt，或无法访问。请创建并显式 Allow 6 大检索型爬虫。")
    else:
        for r in rb["search_bots"]:
            if r["blocked"]:
                a.append("[关卡1·高] %s 被阻断（%s）——这会直接失去被 %s 实时引用的机会，建议放行。"
                         % (r["bot"], r["reason"], r["vendor"]))

    if not lm.get("exists"):
        a.append("[关卡3·中] 未找到 llms.txt。半天工期的低成本押注，建议部署（对编码智能体尤其有效）。")
    elif lm.get("links", 0) < 3:
        a.append("[关卡3·低] llms.txt 链接数偏少（%s 条），建议补足核心页面链接。" % lm.get("links", 0))

    if sr["len"] < 150 and html_ok:
        a.append("[关卡2·高] %s（%s）。AI 爬虫不执行 JS，纯 CSR 站点在 AI 眼里可能是空壳——"
                 "请用 View Source 复核，必要时改 SSR/SSG。"
                 % (sr["verdict"], sr["detail"]))

    if html_ok:
        if not sc["types"]:
            a.append("[关卡5·高] 未检测到任何 JSON-LD 结构化数据。至少部署 Organization + BlogPosting。")
        else:
            if "Organization" not in sc["types"]:
                a.append("[关卡5·高] 缺少 Organization schema（全站头部必放，且须含 sameAs）")
            if not ({"BlogPosting", "Article"} & set(sc["types"])):
                a.append("[关卡5·中] 缺少 BlogPosting / Article schema")
            if "BreadcrumbList" not in sc["types"]:
                a.append("[关卡5·低] 缺少 BreadcrumbList（主题簇信号，关卡 4 会用到）")
    for e in sc.get("errors", []):
        a.append("[关卡6·高] " + e)

    if not a:
        a.append("未发现明显阻断项。建议继续用 Google Rich Results Test 与 Schema.org Validator 做 0 错误校验。")

    return out


def render(res):
    L = []
    base = res["url"]
    L.append("=" * 68)
    L.append("魔女GEO · 站点 GEO 自检报告")
    L.append("目标：%s" % base)
    L.append("=" * 68)

    rb = res["checks"]["robots"]
    L.append("")
    L.append("【关卡 1】AI 爬虫准入")
    if rb.get("exists"):
        L.append("  robots.txt：已找到")
        L.append("  -- 检索型爬虫（必须放行，否则失去被引用机会）--")
        for r in rb["search_bots"]:
            mark = "✗ 阻断" if r["blocked"] else "✓ 放行"
            L.append("    %-20s %-12s %s" % (r["bot"], mark, r["reason"]))
        L.append("  -- 训练型爬虫（按公司政策自选，不影响实时引用）--")
        for r in rb["train_bots"]:
            mark = "阻断" if r["blocked"] else "放行"
            L.append("    %-20s %-12s %s" % (r["bot"], mark, r["purpose"]))
    else:
        L.append("  robots.txt：未找到或无法访问（%s）" % rb.get("error", "未知"))

    lm = res["checks"]["llms"]
    L.append("")
    L.append("【关卡 3】llms.txt")
    if lm.get("exists"):
        L.append("  状态：已部署 · %d 字符 · %d 条链接" % (lm["chars"], lm["links"]))
    else:
        L.append("  状态：未找到（%s）" % lm.get("error", "未知"))

    sr = res["checks"]["ssr"]
    L.append("")
    L.append("【关卡 2】可渲染性（SSR）")
    L.append("  判定：%s" % sr["verdict"])
    L.append("  %s" % sr["detail"])
    L.append("  复核方法：打开页面 → Ctrl+U 查看源代码 → 搜一段中文正文。找得到才算 SSR。")

    sc = res["checks"]["schema"]
    L.append("")
    L.append("【关卡 5】JSON-LD 结构化数据")
    if sc["types"]:
        L.append("  检测到 %d 个 ld+json 块，类型：%s" % (sc["blocks"], "、".join(sc["types"])))
        missing = [k for k in KEY_SCHEMAS if k not in sc["types"]]
        if missing:
            L.append("  尚缺（按你的页面类型判断是否需要）：")
            for k in missing:
                L.append("    - %-16s %s" % (k, KEY_SCHEMAS[k]))
    else:
        L.append("  未检测到任何 JSON-LD 结构化数据。")

    L.append("")
    L.append("【评分】可访问性 %d / 100" % res["score"])
    L.append("")
    L.append("【修复建议】")
    for i, x in enumerate(res["advice"], 1):
        L.append("  %d. %s" % (i, x))
    L.append("")
    L.append("-" * 68)
    L.append("说明：本工具仅检测技术层（L1/L2/L3/L5 的一部分）。")
    L.append("      GEO 成效还需结合关卡 0 的 18 次提问基线测试来判断。")
    L.append("      合规红线见 references/06-compliance-redlines.md")
    L.append("-" * 68)
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser(description="魔女GEO · 站点 GEO 自检器（零依赖）")
    ap.add_argument("url", help="要检查的域名或 URL，如 https://example.com")
    ap.add_argument("--json", action="store_true", help="以 JSON 输出")
    ap.add_argument("--timeout", type=int, default=15, help="请求超时秒数（默认 15）")
    args = ap.parse_args()

    res = scan(args.url, args.timeout)
    if args.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
    else:
        print(render(res))
    return 0


if __name__ == "__main__":
    sys.exit(main())
