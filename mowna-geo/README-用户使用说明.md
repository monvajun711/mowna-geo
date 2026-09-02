# 魔女GEO · 用户使用说明

> 一套「学完就能让 AI 引用你」的 GEO 实操落地课程。自带进度台、徽章、段位与结业证书。

## 一、怎么触发

在 WorkBuddy 对话里说下面任意一句即可进入课程：

- 「学 GEO」「GEO 课程」「帮我学 GEO」
- 「怎么做 GEO」「让 AI 推荐我 / 引用我」「AI 搜索优化」
- 「GEO 诊断」（指向 `scripts/geo_scan.py` 自检你的站点）
- 「打开魔女GEO」

## 二、一次学习长什么样

1. **序章 · 基线诊断**：跑 `geo_scan.py` 对你的官网/博客做 GEO 体检，得到 Before 四项指标（Top 引用率 / 提及率 / 正向率 / 失真率）。
2. **L1–L6 六层 24 关**：每关都有「目标 → 动作清单 → 交付物 → 验收标准 → 常见坑」。你在真实站点上动手做，打勾即过。
   - L1 准入：AI 爬虫放行、robots 审计、llms.txt
   - L2 解析：SSR、Schema.org、JSON-LD
   - L3 实体：品牌实体、知识图谱占位、全网实体档案
   - L4 信任：E-E-A-T、多源交叉佐证
   - L5 应答：提示词调研、六类高引用内容结构
   - L6 代理：AX、MCP、提示词追踪、六大中文平台适配
3. **进度可见**：打开 `assets/geo-quest/index.html`（或直接说「打开学习台」），总体进度条、6 层分层进度、26 关勾选、14 枚徽章墙、5 段位实时更新，数据存本机，可导出/导入。
4. **终章 · 30 天战役**：跑满监测台账，回填 After 四项指标，与 Before 对比。
5. **结业证书**：26 关全通 + Before/After 填完 → 自动生成带编号的《魔女GEO 实操认证证书》，可打印。

## 三、进阶玩法

- **多站点对比**：把不同域名分别存档 `geo_scan.py` 结果，横向看谁更被 AI 偏爱。
- **团队协作**：导出学习台 JSON 进度，发给同事继续做或存档。
- **六大平台分投**：L6 给出豆包/DeepSeek/文心/通义/Kimi/元宝的差异化信源偏好，按平台分别投喂内容。
- **季度复测**：每 90 天重跑基线诊断，观察失真率是否回升，触发热修。

## 四、常见问题 FAQ

**Q1：需要联网或 API Key 吗？**
不需要。学习台、自检脚本、模板全部本地运行，零外部依赖，不会因缺 Key 卡死。

**Q2：我的进度会丢吗？**
不会。学习台用浏览器 `localStorage` 存储，关掉再打开仍在；也可手动导出 JSON 备份。

**Q3：26 关太多，能跳关吗？**
不建议。六层对应 RAG 链路，是 MECE 结构，漏一层就断链。但你可以按自己的站点现状，先跑「序章诊断」看哪层最弱，再重点突破。

**Q4：可以商用吗？**
课程与模板可用于你的个人/企业 GEO 实操。请勿将本 Skill 整体转售或冒名上架。

**Q5：和 SEO 有什么区别？**
SEO 让真人搜得到、点得进；GEO 让 AI 在生成答案时引用你、描述你、附上你的链接。两者互补，GEO 是 AI 搜索时代的增量战场。

## 五、目录速览

```
mowna-geo/
├─ SKILL.md                 课程大脑（触发/骨架/工作流/语风）
├─ references/              8 份深读材料（按需加载）
│  ├─ 01-curriculum.md     26 关逐关详解
│  ├─ 02-platform-playbook.md  六大中文平台适配手册
│  ├─ 03-tech-implementation.md 技术落地代码库
│  ├─ 04-content-weapons.md  内容武器库（六类高引用结构）
│  ├─ 05-measurement.md    度量体系（四项指标）
│  ├─ 06-compliance-redlines.md 8 条合规红线
│  ├─ 07-market-scan.md     市面书籍/课程全景扫描
│  └─ 08-skill-benchmark.md GitHub·SkillHub 对标
├─ assets/geo-quest/       零依赖学习台（进度/徽章/证书）
├─ scripts/                geo_scan.py 自检 / deploy.py 部署
├─ templates/              llms.txt / robots.txt / 提示词库 / 台账
├─ icon.svg                技能图标
└─ skillhub-listing.md     上架文案
```
