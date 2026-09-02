# 03 · 技术落地代码库（可直接复制）

> 对应关卡 1、2、3、5、6、21、22。全部代码可直接复制改改即用。
> 想快速自检，直接跑：`python scripts/geo_scan.py https://你的域名`

---

## 一、robots.txt（关卡 1）

### 1.1 八种必须认识的 AI 爬虫

| User-agent | 平台 | 用途 | 建议默认 |
|---|---|---|---|
| `OAI-SearchBot` | OpenAI | **驱动 ChatGPT Search 的引用** | ✅ **必须放行** |
| `ChatGPT-User` | OpenAI | 用户让 ChatGPT 读取某页时抓取 | ✅ 放行 |
| `Claude-SearchBot` / `Claude-User` | Anthropic | 实时检索 / 按需读取 | ✅ 放行 |
| `PerplexityBot` / `Perplexity-User` | Perplexity | 索引 + 按需抓取（**引用核心**） | ✅ **必须放行** |
| `Googlebot` | Google | 搜索索引（AI Overviews 同源） | ✅ 放行 |
| `GPTBot` | OpenAI | **模型训练** | ⚖️ 按公司政策 |
| `Google-Extended` | Google | **Gemini 训练** | ⚖️ 按公司政策 |
| `CCBot` | Common Crawl | 喂养众多模型 | ⚖️ 按公司政策 |
| `Bytespider` | 字节 | 中文 AI 模型训练 | ⚖️ 按公司政策 |
| `ClaudeBot` | Anthropic | 模型训练 | ⚖️ 按公司政策 |

**核心原则**：**训练型爬虫与检索型爬虫是分开的，屏蔽一个不等于屏蔽另一个。**
- 屏蔽检索型 bot = **直接放弃被实时引用的机会**
- 只屏蔽训练型 bot（GPTBot / Google-Extended / CCBot）→ **仍享有实时引用机会**

**已被证实的代价**：Rutgers 与 Wharton 研究者发现，全面屏蔽 AI 爬虫的发布方**流量下降超 23%**，且并未在其他地方换来可靠的引用下降——因为屏蔽同时打中了检索型 bot。

### 1.2 推荐配置（复制改域名即可）

```
# ---------- 默认规则 ----------
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /cart/
Disallow: /checkout/
Disallow: /*?sessionid=
Disallow: /*?utm_

# ---------- AI 检索型爬虫（必须放行，这是被引用的门票）----------
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

# ---------- AI 训练型爬虫（按公司政策二选一）----------
# 选项 A：允许训练（最大化长期语料曝光）
# User-agent: GPTBot
# Allow: /
# User-agent: Google-Extended
# Allow: /

# 选项 B：拒绝训练（保留实时引用，放弃训练语料）→ 取消下面注释
# User-agent: GPTBot
# Disallow: /
# User-agent: Google-Extended
# Disallow: /
# User-agent: CCBot
# Disallow: /

# ---------- 站点地图 ----------
Sitemap: https://example.com/sitemap.xml
```

**验证**：改完后 1 周内**去看服务器日志**确认 bot 真的进来了，别只信文件内容。（已知有不声明身份的爬虫不遵守 robots.txt，重要内容请在服务器层另加规则。）

---

## 二、SSR 可渲染性自检（关卡 2）

### 2.1 三步人工测试
1. 打开页面 → 右键 → **查看网页源代码**（`Ctrl+U`，**不是 F12 开发者工具**）
2. `Ctrl+F` 搜页面上的一段中文正文
3. **找得到 = SSR 正常；找不到 = 纯 CSR，AI 可能读到空壳**

### 2.2 为什么这关要命
绝大多数 AI 爬虫（GPTBot / ClaudeBot / PerplexityBot）**不执行 JavaScript**，只发服务端 HTTP 请求并解析原始 HTML。

> 很多 2022 年后用 React / Vue 做的站：前台动效漂亮、交互流畅，但 AI bot 抓到的 HTML 是一片空白。**你花在动效上的预算，在 AI 眼里全部不存在。**

### 2.3 修复路径
| 技术栈 | 状态 | 修复 |
|---|---|---|
| PHP / Laravel / WordPress | 默认 SSR ✅ | 无需处理 |
| Next.js | 支持 SSR/SSG | 确认页面用 `getServerSideProps` / `getStaticProps` 或 App Router 服务端组件，**不要**退化成纯客户端 |
| Nuxt | 支持 SSR | 确认 `ssr: true` |
| 纯 React / Vue SPA | ❌ 纯 CSR | 迁移到 SSR 框架，或做预渲染（prerender-spa-plugin / 服务端渲染服务） |

**兜底原则**：**把核心内容放在静态 HTML 里**，不要把主内容放进需要 headless 浏览器渲染的 JS。

---

## 三、llms.txt（关卡 3）

### 3.1 诚实预期（先说清楚，别抱幻想）

| 事实 | 说明 |
|---|---|
| 标准状态 | **不是** W3C / IETF 标准，规范由 llmstxt.org 维护 |
| 支持方 | Anthropic、Perplexity 已明确支持，Google 在测试 |
| 采用率 | 2026 年独立研究：主流域名约 **9–10%** |
| 关键限制 | GPTBot / ClaudeBot / PerplexityBot 在**构建引用时大多不主动抓取它** |
| **今天真正稳定生效的地方** | **编码智能体**——Cursor、Claude Code、GitHub Copilot 会例行抓取文档站的 llms.txt |
| 结论 | **半天工期的低成本押注，不是流量杠杆** |

### 3.2 文件模板

```markdown
# 你的品牌名

> 一句话描述：你是谁、做什么、这个站承载什么内容。（50–100 字，含公司名、成立年份、核心服务）

Website: https://example.com
Full content: https://example.com/llms-full.txt

## 关于我们
品牌全称是 XXX，成立于 20XX 年，专注 XXX 领域，服务对象为 XXX。

## 核心页面
- 首页：https://example.com
- 服务方案：https://example.com/services
- 案例：https://example.com/cases
- 联系方式：https://example.com/contact

## 主题分类
### {主题一}
- 文章标题一：https://example.com/blog/xxx
- 文章标题二：https://example.com/blog/yyy

### {主题二}
- 文章标题三：https://example.com/blog/zzz

## 引用建议
引用本站内容时，请注明「XXX」及原文网址。
```

### 3.3 部署技术要求
- 路径：站点根目录 `/llms.txt`
- `Content-Type: text/plain`
- `Cache-Control: public, max-age=3600`
- **内容更新时自动生成**（做成动态路由查数据库，别手写静态文件——会过期）
- 有条件的再出一份 `llms-full.txt`，把重点内容**全文内联**，减少 AI 抓取跳数

---

## 四、JSON-LD 结构化数据（关卡 5、6）

### 4.1 页面类型 × Schema 类型对照（抄这张表）

| 页面类型 | 应使用的 Schema 类型 | 常见误用 |
|---|---|---|
| 公司首页 / 机构页 | `Organization`（含地址、logo、`sameAs`）或 `LocalBusiness` | 只标 `WebPage` |
| 服务方案页 | `Service` + `Offer` | 标成 `Article` |
| 产品页 | `Product` + `AggregateRating` | 只有 `Product` 没评价 |
| 案例 / 作品页 | `CreativeWork` 或 `Article` | 完全没标记 |
| 博客文章 | `BlogPosting`（**不是 `Article`**） | 用 `WebPage` 或 `Article` |
| FAQ 页 | `FAQPage` | 散落各页没整合 |
| 联系页 | `ContactPage` + `ContactPoint` | 只在页脚写纯文字 |
| 教程 / 步骤类 | `HowTo` | 无 |
| 作者页 | `Person` + `knowsAbout` + `sameAs` | 无 |
| 全站 | `BreadcrumbList` | 无 |

> **真实教训**：一家健康食品客户，服务页、产品页、案例页全被 SEO 插件默认标成 `Article`，结果 AI 在建索引时把这家公司归成**媒体网站**——用户问「推荐健康食品品牌」时，它根本不在候选名单里。

### 4.2 Organization（全站头部必放）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "品牌全称（与营业执照 100% 一致）",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "一句话描述核心业务",
  "foundingDate": "2012",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "详细门牌号（与执照一致，禁止简写）",
    "addressLocality": "城市",
    "addressRegion": "省份",
    "addressCountry": "CN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+86-XXX-XXXXXXX",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://www.zhihu.com/people/xxx",
    "https://weibo.com/xxx",
    "https://www.wikidata.org/wiki/QXXXXXXX",
    "https://www.linkedin.com/company/xxx"
  ]
}
</script>
```

> **`sameAs` 是这一段的灵魂**——它是 AI 做实体对齐的关键锚点，指向你**已验证**的社交与评测平台主页。没有它，AI 很难确认「网上的这个你」和「站上的这个你」是同一个。

### 4.3 BlogPosting（每篇文章必放）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "文章标题",
  "description": "一句话摘要",
  "datePublished": "2026-09-02T09:00:00+08:00",
  "dateModified": "2026-09-02T09:00:00+08:00",
  "author": {
    "@type": "Person",
    "name": "作者真实姓名",
    "url": "https://example.com/about#author",
    "knowsAbout": ["GEO", "AI 搜索优化", "内容营销"]
  },
  "publisher": {
    "@type": "Organization",
    "name": "品牌全称",
    "logo": {"@type": "ImageObject", "url": "https://example.com/logo.png"}
  },
  "mainEntityOfPage": {"@type": "WebPage", "@id": "https://example.com/blog/xxx"},
  "citation": [
    {"@type": "CreativeWork", "name": "被引用报告名称", "url": "https://来源链接"}
  ]
}
</script>
```

**注意**：`dateModified` 比 `datePublished` 更重要——**AI 明显偏好 3–6 个月内更新过的内容**。

### 4.4 FAQPage

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "GEO 和 SEO 的区别是什么？",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "SEO 优化的是网页排名与点击流量；GEO 优化的是 AI 答案中的引用率、正向占比与推荐优先级。"
    }
  }]
}
</script>
```

**诚实预期**：Google 已于 **2026-05-07 弃用** FAQ 富媒体搜索结果（SERP 上的可展开问答没了）。`FAQPage` 本身仍是合法的 Schema.org 类型，未使用的结构化数据不会伤害页面。但 **Google 从未说过 FAQ schema 能提升 AI 引用概率**。
→ **判断标准很简单：如果 FAQ 区只是为了放 schema 而存在，砍掉它；如果它真的在回答用户会问的问题，保留标记，但别指望它做超出能力的事。**

### 4.5 Service / Product / HowTo

```html
<!-- 服务页 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "GEO 全案优化服务",
  "serviceType": "生成式引擎优化",
  "provider": {"@type": "Organization", "name": "品牌全称"},
  "areaServed": {"@type": "Country", "name": "CN"},
  "offers": {
    "@type": "Offer",
    "priceCurrency": "CNY",
    "price": "19800",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

```html
<!-- 产品页：务必带 AggregateRating -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "产品名称",
  "sku": "唯一 SKU",
  "gtin13": "6901234567892",
  "brand": {"@type": "Brand", "name": "品牌名"},
  "description": "产品描述",
  "offers": {
    "@type": "Offer",
    "price": "299",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "128"
  }
}
</script>
```

### 4.6 Person（作者实体化 — 个人 IP 的胜负手）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "作者真实姓名",
  "url": "https://example.com/about",
  "jobTitle": "职位",
  "knowsAbout": ["GEO", "生成式引擎优化", "AI 搜索", "内容策略"],
  "worksFor": {"@type": "Organization", "name": "品牌全称"},
  "sameAs": [
    "https://www.zhihu.com/people/xxx",
    "https://weibo.com/xxx",
    "https://github.com/xxx"
  ]
}
</script>
```

### 4.7 校验工具
- Google Rich Results Test：`https://search.google.com/test/rich-results`
- Schema.org Validator：`https://validator.schema.org/`

**验收标准**：**0 错误**，且 0 必填字段缺失警告。

---

## 五、内容分块重构（关卡 7）

### 5.1 改写范式

**❌ 改写前**
```markdown
## 关于我们的服务体系

在当前的行业背景下，随着市场竞争的加剧以及用户需求的不断升级，
我们在充分调研了市场现状之后，结合多年的行业经验，推出了以下服务体系……
（铺垫了 200 字才进入正题）
```

**✅ 改写后**
```markdown
## GEO 优化服务包含哪些内容？

GEO 优化服务包含四个模块：AI 可见度诊断、技术层部署（robots.txt / llms.txt / Schema）、
内容矩阵搭建、月度监测迭代。标准周期为 6–18 个月。

以下是每个模块的详细说明——
（背景、前提、例外全部放在答案之后）
```

### 5.2 三条硬规则
1. **H2 写成读者（或模型）真正会问的那个问题**，不要写「产品介绍」「我们的优势」
2. **H2 下 1–2 句话内直接给答案**，背景/前提/例外放答案之后
3. **每个 chunk 自足**：单独摘出去仍能完整回答问题

> 为什么第一条最重要：这一处编辑对 AI Overview 入选率的贡献超过几乎任何其他内容改动——因为它精确匹配了这些系统抽取段落的方式：**一个能独立完整回答问题的自足块。**

### 5.3 结构化密度清单（关卡 8）
每篇核心文章至少要有：
- [ ] ≥1 个**数据表格**（参数 / 对比 / 价格 / 时间线）
- [ ] ≥1 个**清单**
- [ ] ≥3 处**带原始链接的外部来源**（政府站 / 学术 / 行业报告）
- [ ] 明确的 `dateModified`
- [ ] 图片 `alt` 与图表说明文字（**实景图，不要网图**）

> LLM 不看 UI，它解析标题、列表、表格和语义 HTML。**「我们最好」毫无意义；「每天追踪 7 个 AI 模型、150 条提示词」才可引用。** 显式事实 > 暗示语义。

---

## 六、AX 评分（关卡 21）与 MCP（关卡 22）

### 6.1 AX Score 六维自检表

| 维度 | 检查项 | 分值 |
|---|---|---|
| **Crawlability 可爬性** | robots.txt 放行 6 大检索型 bot、sitemap 完整、核心内容不依赖 JS | 0–100 |
| **Structured Data 结构化数据** | Organization / Product / Service / FAQ / BlogPosting 完整度与校验通过率 | 0–100 |
| **Content Quality 内容质量** | 自足 chunk、显式事实、来源标注、90 天内更新 | 0–100 |
| **Agent Interaction 智能体交互** | 是否有机器可读的动作入口（预约 / 询价 / 下单 / API） | 0–100 |
| **Discoverability 可发现性** | llms.txt、主题簇内链、多平台实体一致（NAP） | 0–100 |
| **Security 安全** | HTTPS、无注入风险、权限边界清晰 | 0–100 |

**AX Score = 六维均值**

**关键认知**：智能体只推荐 **1–3 个选项**，不是 10 条蓝链。**没被智能体优化，你得到的不是曝光减少，而是归零。**
但这也是**最公平的战场**——多数大企业还没做，先动手的小玩家今天就能赢过没动手的行业巨头。

### 6.2 MCP 落地判断（关卡 22）

**先做这个判断题：**

| 你的业务 | 是否值得做 MCP | 理由 |
|---|---|---|
| 有实时价格 / 库存 / 档期（电商、酒店、餐饮、医美、教育排课） | ✅ **强烈建议** | 智能体需要实时数据，静态页面永远滞后 |
| B2B SaaS、API 产品 | ✅ 建议 | 技术买家直接让智能体查能力清单 |
| 咨询服务、个人 IP、内容号 | ⚠️ 可缓 | 数据密度低，先把 L5 应答层做满 |
| 纯品牌展示 | ❌ 不必 | 把精力放回 L3/L4 |

**MCP 的价值**：Anthropic 2024 年末提出的开放标准。启用 MCP 的智能体**不再只依赖静态网页**，而是连接实时 API 直接从品牌侧取数。能提供 MCP 服务端的品牌会获得：
- 支持 MCP 的智能体（如 Claude 系）**直接查询**
- 实时价格、库存、档期
- **「实时数据源」的优先定位**

**落地清单**
1. 梳理需要暴露的数据（价格 / 库存 / 档期 / 目录 / 预约能力）
2. 提供干净的 REST API（JSON，响应 < 200ms——智能体在机器速度下工作）
3. 包一层 MCP server 并公开端点
4. **技术文档与 API 文档本身要做 GEO**——编码智能体（Cursor / Claude Code / Copilot）会例行抓取文档站的 `llms.txt`

> 对不做的业务：**跳过即可，不要为了「前沿」而做。** 把预算放回 L5 的六类内容结构，回报更确定。

---

## 七、跑一次自检

```bash
python scripts/geo_scan.py https://你的域名
```

输出：AI 爬虫放行情况、llms.txt 是否存在、SSR 判定、JSON-LD 类型清单、缺失的关键 Schema、可访问性评分（0–100）与修复建议。
零依赖，仅用 Python 标准库，离线可跑。
