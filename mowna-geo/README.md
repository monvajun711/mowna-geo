# 魔女GEO · GEO 实操落地课程

> **一句话信念：GEO 不是「做内容让 AI 看见」，是「让 AI 敢引用你」。**

一套自带引擎、自带进度、自带证书的 **GEO（生成式引擎优化）实操课程**。
不是讲概念，是让你亲手把一件事做完：**让豆包、DeepSeek、文心一言、通义千问、Kimi、元宝在用户问到你所在领域时，稳定、正向、准确地提到你。**

---

## 60 秒上手

**方式一：打开学习台（推荐，有进度条 / 徽章 / 证书）**

```bash
python scripts/deploy.py ./魔女GEO --serve
# 浏览器访问 http://localhost:8000
```

或把 `assets/geo-quest/` 复制到任意位置，**双击 `index.html`** 即可（无需联网、无需 npm install）。

**方式二：对话式上课（不开网页）**

加载本技能后直接说：
- 「开始 GEO 课程」→ 从关卡 0 基线诊断开始
- 「我做到第 7 关了」→ 续上进度
- 「帮我诊断我的站」→ 跑 L1–L2 体检
- 「我的 AI 可见度怎么测」→ 走 18 次提问 SOP

**方式三：命令行自检**

```bash
python scripts/geo_scan.py https://你的域名
```

---

## 核心骨架：AI 六层漏斗（GEO-6L）

六层与 AI 的 RAG 检索链路一一对应，**天然 MECE（互斥且完全穷尽）**——漏一层断链，做重复浪费预算。

| 层 | 名字 | RAG 环节 | 回答什么问题 |
|---|---|---|---|
| L1 | 准入层 Access | Crawl | AI 进得来吗？ |
| L2 | 解析层 Parse | Ingest | AI 读得懂吗？ |
| L3 | 实体层 Entity | Entity Linking | AI 认得「你是谁」吗？ |
| L4 | 信任层 Trust | Score + 交叉验证 | AI 信你吗？ |
| L5 | 应答层 Answer | Retrieve + Cite | AI 用你的内容吗？ |
| L6 | 代理层 Agent | Act | AI 能替你成交吗？ |

**诊断口诀（倒着查最快）**：AI 完全不提你 → 查 L1；提了但归错类 → 查 L2/L3；提到但不被采信 → 查 L4；被信但不被引用 → 查 L5；被引用但不成交 → 查 L6。

---

## 26 个关卡

**序章（1）** 基线诊断 → **L1–L6 各 4 关（24）** → **终章（1）** 30 天战役

每关固定六段式：**目标 → 动作 → 交付物 → 验收标准 → 常见坑 → 为什么这么做**。

---

## 激励机制

- **进度**：总进度条 + 六层分层进度 + 26 关三态（未开始 / 进行中 / 已完成）
- **徽章 14 枚**：6 枚层徽章（自动解锁）+ 8 枚成就徽章（首引猎人 / 三平台通吃 / 实体统一者 / Schema 工匠 / 原创数据派 / 幻觉猎手 / 三十日不辍 / 合规守门人）
- **段位 5 级**：见习 → 执行 → 战术 → 战略 → **GEO 操盘手**
- **结业证书**：26 关全通 + 战报提交后生成，含六层得分、Before/After 四项指标、唯一编号，原生打印导出 PDF
- **数据**：localStorage 持久化，支持导出 / 导入 JSON

---

## 目录

```
mowna-geo/
├── SKILL.md                          课程大脑（唯一入口）
├── README.md                         本文件
├── icon.svg                          品牌封面
├── PREVIEW.md                        SkillHub 上架文案
├── references/
│   ├── 01-curriculum.md              26 关逐关详解
│   ├── 02-platform-playbook.md       六大中文平台 + 国际平台适配
│   ├── 03-tech-implementation.md     robots/llms/Schema/SSR/MCP 代码库
│   ├── 04-content-weapons.md         提示词调研 + 六类高引用结构
│   ├── 05-measurement.md             指标体系 + 18 次提问 SOP + 战报模板
│   ├── 06-compliance-redlines.md     合规红线（开工前必读）
│   ├── 07-market-scan.md             市面书籍/课程/白皮书/开源全景
│   └── 08-skill-benchmark.md         课程型 Skill 形式对标分析
├── assets/geo-quest/                 可运行学习台（零依赖）
├── scripts/
│   ├── deploy.py                     一键部署（可 --serve）
│   └── geo_scan.py                   零依赖站点 GEO 自检
└── templates/                        robots.txt / llms.txt / 词库 / 台账
```

---

## 三条开工纪律

1. **先读** `references/06-compliance-redlines.md`（5 分钟，八条红线）
2. **再跑** 关卡 0 的 18 次提问基线（没有 Before 就没有 After）
3. **然后** 打开学习台建档，从 L1 关卡 1 开始

---

## 边界声明

- 本 Skill 是教学与实操框架，**不对任何具体排名、引用率、转化效果做承诺**。
- AI 平台算法持续变动，须**按季度复测**。
- 学习台无后端、无追踪，数据全部存于本机浏览器。
- 合规红线已写入 `data.js` 的 `RED_LINES`，任何定制与二次开发**不得移除或削弱**。
