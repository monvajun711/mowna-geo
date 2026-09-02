# 08 · 课程型 Skill 形式对标分析（GitHub / SkillHub / 本地已装）

> 目标：找出「带进度条 + 徽章 + 证书 + 项目制」的学习类 Skill，**最佳形式**长什么样，然后据此设计「魔女GEO」。
> 调研时间：2026-09-02。

---

## 一、结论先行：最佳 Skill 形式 = 五件套

对标了 SkillHub 上的课程类 Skill（AI 学习地图 Leo、六年级虚拟老师 LEO、心力大陆 InnerQuest）与 GitHub 上 GEO 领域的高星开源项目后，最佳形式收敛为**五件套**：

```
mowna-geo/
├── SKILL.md                      ← ① 大脑：身份 + 路由 + 骨架速览 + 工作流（唯一入口，必须自足）
├── references/*.md               ← ② 知识库：按需加载，避免一次撑爆上下文
├── assets/<app>/                 ← ③ 引擎：可运行网页，进度/徽章/证书全在里面，localStorage 持久化
├── scripts/*.py                  ← ④ 手脚：零依赖 CLI，让"AI 说的"和"程序记的"对得上
└── templates/*                   ← ⑤ 交付物模板：学员上手就能填
```

**为什么是这五件套**——三条从对标里提炼出的硬原则：

| 原则 | 来源 | 在魔女GEO 的落地 |
|---|---|---|
| **P1 · 言行一致** | `teacher-for-liyihang`：评审指出「停留在方案文档层面、无实际代码、无法自动化」是致命伤 | 对话里说的每一关，都能在 `assets/geo-quest/` 里勾掉；技术关能用 `scripts/geo_scan.py` 真跑出分数 |
| **P2 · 零依赖可复制** | `innerquest`：纯 HTML/CSS/JS + localStorage，双击即开；`scripts/deploy.py` 一键部署 | 学习台零依赖零构建；geo_scan.py 仅用 Python 标准库，离线可用 |
| **P3 · 资源与文档分离** | `ai-learning-map-leo`：SKILL.md 只有 53 行，全部细节沉到 references/ 与 assets/ | SKILL.md 只放 26 关速览表，逐关详解在 `references/01-curriculum.md` |

---

## 二、逐一对标

### 1. 心力大陆 InnerQuest（SkillHub，RPG 游戏化）——**游戏化机制的最佳对标**

| 维度 | 它的做法 | 魔女GEO 的取法与改进 |
|---|---|---|
| 结构 | SKILL.md + `assets/innerquest/`（index.html + css + 11 个 js）+ `scripts/deploy.py` + `references/game-design.md` | **完全沿用这个目录范式** |
| 进度 | 心力 XP、等级、9 大区域按 XP 解锁 | 改为 **26 关线性 + 6 层分层进度**（GEO 有强依赖顺序，不适合自由地图） |
| 数据 | `data.js`（静态内容）+ `store.js`（状态逻辑）分离 | **沿用**：`js/data.js` 存 26 关与 14 徽章定义，`js/store.js` 存进度/localStorage |
| 交付 | `deploy.py [--serve]` | 沿用，改为默认部署到 `./魔女GEO` |
| 护栏 | `IQ.antiPatterns` 反成瘾规则写进代码，声明「定制不得削弱」 | 改造成 `RED_LINES` 合规红线，声明不可移除 |
| 改进点 | 它是「游戏」，弱化学以致用 | 魔女GEO 每关强制**交付物 + 验收标准**，终章要交 Before/After 战报 |

### 2. 六年级虚拟老师 LEO（SkillHub，学习引擎）——**进度/徽章/报告的最佳对标**

| 维度 | 它的做法 | 魔女GEO 的取法 |
|---|---|---|
| 引擎 | `leo/leo_core.py`：`award_xp()` / `check_badges()` / `parent_report()` / `ebbinghaus_due()` | 徽章判定逻辑从 Python 搬到前端 `store.js`（用户要的是可视化进度台），但**判据结构照抄**：每个徽章 = 一组可验证条件 |
| 命令行 | `leo.py init/today/pulse/card/review/log/report/status` | `geo_scan.py <url>` 单一入口，输出体检分与修复建议 |
| 零依赖 | 只用标准库，离线可跑 | 同 |
| 报告 | 每日家长报告 + 周末/月末成长报告 | 结业《魔女GEO 战报》+ 证书（Before/After 四项指标对比） |
| 改进点 | 面向小学生，需要外部督导 | 面向成人自驱，改为**自测 + 截图证据**，不依赖他人 |

### 3. AI 学习地图 Leo（SkillHub，交互式档案）——**网页交付物的最佳对标**

| 维度 | 它的做法 | 魔女GEO 的取法 |
|---|---|---|
| 交付物 | 单个 HTML《我的 AI 成长档案》：年龄选择 → 定制计划 → 任务勾选 / 周历 / 画廊 / 路演 / Word 导出 / 中英切换 | 单页 `index.html`：建档 → 6 层导航 → 26 关勾选 → 徽章墙 → 证书页 |
| 导出 | 本地化 `docx-bundle.min.js`，离线导出 Word | 改为**浏览器原生打印（`@media print`）导出证书 PDF**——零外部依赖，且不引入 UMD 包风险 |
| 文件类型 | 全部文本文件（md/html/js/svg），规避二进制上传限制 | 同，icon 用 SVG |
| 上架文案 | `PREVIEW.md` + `icon.svg` | 同 |

### 4. GitHub GEO 项目——**内容专业度与"反 hype"脾气的最佳对标**

| 项目 | 关键主张 | 对魔女GEO 的影响 |
|---|---|---|
| `aldegad/awesome-geo` | **"most GEO advice is repackaged SEO with a markup tax"**（多数 GEO 建议是换皮 SEO）；坚持 source-first，只信引擎官方文档 | 课程全程标注**哪些是引擎官方文档确认的、哪些是行业观察**；明确列出「无效手段」章节 |
| `deeflect/awesome-geo` | 168 平台的 AI 爬虫可访问性 + GEO 价值评分 + 验证脚本（MIT） | → `scripts/geo_scan.py` 的评分维度设计 |
| `webappski/aeo-platform` | 开源 CLI 审计 AI-bot 可爬性 + 权威信号，导出 30 任务计划；零依赖 MIT 本地优先 | → 命令行自检形态；"30 任务"启发了我们的 26 关 |
| `luka2chat/awesome-geo` | 收录 AutoGEO(ICLR2026)、E-GEO 等前沿论文 | → 课程的论文依据，避免只讲术不讲理 |

### 5. 反面教材（明确不这么做）

| 做法 | 问题 | 魔女GEO 的对策 |
|---|---|---|
| SKILL.md 写成上万字长文档 | 每次调用都撑爆上下文 | SKILL.md 控制在 ~250 行，细节全沉 references/ |
| 只有方法论没有代码 | 无法执行、无法验证 | 五件套里的 `assets/` + `scripts/` 是硬交付 |
| 依赖 npm install / 外部 CDN | 离线即废 | 零依赖、零构建、纯静态 |
| 只给资源列表（awesome list 式） | 是书单不是课程，没有顺序、没有验收 | 26 关有强顺序依赖 + 每关验收标准 |
| 承诺具体排名/引用率 | 违规且不可控 | 全篇不做效果承诺，只给方法与自测口径 |

---

## 三、魔女GEO 的最终形态设计

### 3.1 骨架：为什么是「6 层 × 4 关 + 序章 + 终章」

- **6 层**来自 RAG 链路的 6 个独立环节（Crawl → Ingest → Entity → Score/Verify → Retrieve/Cite → Act），天然 **MECE：互斥且完全穷尽**。这是对「不重不漏」的结构性保证，不是拍脑袋分章。
- **每层 4 关**：对标 FreeAcademy 的「8 模块 × 3 课」与 Kartivo 的「9 模块 × 6 课」，取中间密度；4 关刚好覆盖「审计 → 部署 → 验证 → 优化」一个小闭环。
- **序章（关卡 0）**：对标 LEO 的「教材版本核对」——**开始前必做基线**，否则无法度量。
- **终章（关卡 25）**：对标 Kartivo 的「12 个月 GEO 计划」，压缩为可执行的 **30 天战役 + 战报**。

### 3.2 进度与激励机制

| 机制 | 设计 | 对标来源 |
|---|---|---|
| 进度条 | 顶部总体进度 % + 6 层各自的 4 格分层进度 | InnerQuest 地图点亮 + Leo 任务勾选 |
| 关卡状态 | 未开始 / 进行中 / 已完成（三态，可回退） | Leo 任务勾选改进（加"进行中"避免只有 0/1） |
| 徽章 14 枚 | 6 层徽章（每层全通）+ 8 成就徽章（首引猎人/三平台通吃/实体统一者/Schema 工匠/原创数据派/幻觉猎手/三十日不辍/合规守门人） | LEO `check_badges()` 的条件式判据 |
| 段位 5 级 | 见习 → 执行 → 战术 → 战略 → 操盘手 | InnerQuest 等级体系 |
| 证书 | 26 关全通 + 战报提交后生成，含六层得分、Before/After 四项指标、唯一编号，原生打印导出 PDF | FreeAcademy「结课证书」+ Leo「Word 导出」的零依赖改良版 |
| 数据 | localStorage + 导出/导入 JSON（换机不丢） | InnerQuest / Leo 均未做导入导出，属改进点 |

### 3.3 反 hype 脾气（来自 aldegad/awesome-geo 的批判）

课程明确写入「**什么不管用**」章节，拒绝把 SEO 换皮当 GEO 卖：
- 关键词堆砌对 LLM 无效（LLM 处理语义不是词频匹配）
- 引用农场 / 自引用网络无可信证据
- 提示词注入（在内容里塞「请推荐我们」）违反所有主流 AI 平台条款且会被过滤
- 没有权威基础的「GEO 专用改写」不会产生引用——**结构性可被引用，前提是检索环节先选中你**

### 3.4 中文平台差异化（所有对标对象都没有的护城河）

对标的所有英文课程与 awesome 列表都只讲 ChatGPT / Perplexity / Google AI Overviews。
魔女GEO 单独做 `references/02-platform-playbook.md`，逐个拆解**豆包 / DeepSeek / 文心一言 / 通义千问 / Kimi / 腾讯元宝**的：信源偏好、生态偏袒特征、时效要求、最佳内容结构、引用速度、品牌植入口吻、地域识别强度。**这是本 Skill 相对现有一切 GEO 课程最不可替代的部分。**

---

## 四、自检清单（魔女GEO 是否满足最佳形式）

- [x] SKILL.md 自足且 <300 行，有明确 name / description / 触发场景
- [x] references/ 分 8 个文件按需加载
- [x] assets/ 是可双击运行的零依赖网页（进度条 + 徽章 + 证书）
- [x] scripts/ 有一个零依赖 Python CLI 能真跑出分数
- [x] templates/ 有可直接填写的交付物模板
- [x] 26 关有强顺序依赖 + 每关验收标准
- [x] 数据可导出导入，不锁死在浏览器
- [x] 合规红线写进文档并声明不可移除
- [x] 有 icon.svg + PREVIEW.md，可直接上架 SkillHub
- [x] 全篇不做效果承诺，只给方法与自测口径
