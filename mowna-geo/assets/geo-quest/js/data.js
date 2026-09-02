/* 魔女GEO · 数据层
 * 26 个进度节点（序章 0 + L1–L6 各 4 关 = 24 + 终章 25）
 * 6 层 · 14 枚徽章 · 5 个段位
 * 所有内容可在此一处修改，页面逻辑在 store.js / app.js
 */

const GEO = {};

/* ============ 合规红线（不可移除 · 见 references/06-compliance-redlines.md） ============ */
GEO.RED_LINES = [
  '虚构 POI 点位、伪造办公地址、空壳公司虚假标注',
  '批量生成同质化内容、信息投毒、恶意堆砌关键词',
  '伪造资质、虚假案例、夸大服务效果（违反《广告法》）',
  '刷单刷评价、第三方虚假口碑（AI 已能精准识别并降权）',
  '负面压制、恶意抹黑竞品（不正当竞争）',
  '在内容中嵌入操纵模型的指令（提示词注入，违反平台条款）',
  '自建站群互相引用（引用农场，无可信证据且风险高）',
  '关键词堆砌（LLM 处理语义不做词频匹配，反而降低可引用性）'
];

/* ============ 六层 ============ */
GEO.LAYERS = [
  {
    id: 1, key: 'L1', name: '准入层', en: 'Access',
    question: 'AI 进得来吗？',
    rag: 'Crawl 爬取',
    miss: '内容再好，AI 根本没抓过你',
    badge: '准入钥匙',
    color: '#5A3D75'
  },
  {
    id: 2, key: 'L2', name: '解析层', en: 'Parse',
    question: 'AI 读得懂吗？',
    rag: 'Ingest 摄取 / 分块',
    miss: '抓到了但归错类，白抓',
    badge: '解析器',
    color: '#6B4E9B'
  },
  {
    id: 3, key: 'L3', name: '实体层', en: 'Entity',
    question: 'AI 认得「你是谁」吗？',
    rag: 'Entity Linking 实体关联',
    miss: '被当成另一家公司 / 媒体站',
    badge: '实体之印',
    color: '#2F6F7E'
  },
  {
    id: 4, key: 'L4', name: '信任层', en: 'Trust',
    question: 'AI 信你吗？',
    rag: 'Score + 交叉验证',
    miss: '孤证不立，直接降权',
    badge: '信任之盾',
    color: '#8A6D3B'
  },
  {
    id: 5, key: 'L5', name: '应答层', en: 'Answer',
    question: 'AI 用你的内容吗？',
    rag: 'Retrieve + Cite',
    miss: '有信任但没弹药，答不上',
    badge: '应答之矛',
    color: '#A04030'
  },
  {
    id: 6, key: 'L6', name: '代理层', en: 'Agent',
    question: 'AI 能替你成交吗？',
    rag: 'Act 行动',
    miss: '被提及但转化断层',
    badge: '代理之环',
    color: '#4B6B3C'
  }
];

/* ============ 26 个节点 ============ */
GEO.NODES = [
  /* ---------- 序章 ---------- */
  {
    id: 0, layer: 0, title: 'AI 可见度基线诊断（Before）',
    tag: '序章',
    goal: '在动任何东西之前，把「AI 现在怎么看你」量化存档。没有 Before 就没有 After。',
    actions: [
      '准备 3 类中性 query，每类 2 条：① 产业比较型 ② 主题定义型 ③ 品牌搜索型',
      '在 6 个平台（豆包 / DeepSeek / 文心一言 / 通义千问 / Kimi / 腾讯元宝）各问一遍',
      '每次回答全屏截图，命名 Q0_{平台}_{类型}_{日期}.png',
      '填写 templates/ai-visibility-tracker.csv 的 Baseline 工作表'
    ],
    deliverables: ['≥18 张截图包', '填写完成的基线台账'],
    accept: [
      '首推率 = 排第 1 的次数 / 18',
      '提及率 = 被提到次数 / 18',
      '正向占比 = 正向条数 / 被提及条数',
      '误述条数 = AI 说错的关于你的事实条数'
    ],
    pitfalls: [
      '用自证式提问（「XX 好吗」）→ 测出来全是好话，毫无意义',
      '只测一个平台 → 六大平台信源池差异极大，会误导整轮策略',
      '忘了存日期 → 30 天后无法证明变化来自优化还是算法波动'
    ]
  },

  /* ---------- L1 准入层 ---------- */
  {
    id: 1, layer: 1, title: 'AI 爬虫白名单审计',
    tag: 'L1-1',
    goal: '确保 8 大 AI 爬虫能进你的站，且能读到该读的内容。',
    actions: [
      '打开 /robots.txt 逐条检查，复制 templates/robots.txt 改写',
      '检索型 bot 必须放行：OAI-SearchBot / ChatGPT-User / Claude-SearchBot / Claude-User / PerplexityBot / Perplexity-User / Googlebot',
      '训练型 bot 按公司政策自选：GPTBot / Google-Extended / CCBot / Bytespider / ClaudeBot',
      '上传后用 python scripts/geo_scan.py https://你的域名 复核',
      '1 周内查服务器日志确认 bot 真的进来了'
    ],
    deliverables: ['上线后的 robots.txt', 'geo_scan.py 放行报告'],
    accept: ['6 个检索型 bot 全部显式 Allow', '无 Disallow: / 通配误伤', 'geo_scan 输出「AI 爬虫放行：正常」'],
    pitfalls: [
      '只有 User-agent: * 的笼统设置，从没人管过',
      '早年怕被爬设了整站 Disallow: /，把 AI bot 一起挡了',
      '「我以为 IT 管」「我以为市场管」→ 结果没人管'
    ],
    fact: 'Rutgers / Wharton 研究：全面屏蔽 AI 爬虫的发布方流量下降超 23%，且并未换来引用下降——因为屏蔽同时打中了检索型 bot。'
  },
  {
    id: 2, layer: 1, title: '可渲染性体检（SSR vs CSR）',
    tag: 'L1-2',
    goal: '确认 AI 爬虫拿到的是有内容的 HTML，不是空壳。',
    actions: [
      '打开页面 → 右键 → 查看网页源代码（Ctrl+U，不是 F12）',
      'Ctrl+F 搜一段中文正文',
      '找得到 = SSR 正常；找不到 = 纯 CSR，AI 可能读到空壳',
      '3 个核心页面全部测一遍：首页 / 内容页 / 服务或产品页'
    ],
    deliverables: ['3 个页面的 View Source 截图 + 结论表'],
    accept: ['3 个页面全部判定为「内容在初始 HTML 中可读」'],
    pitfalls: [
      '用 F12 检查——F12 显示 JS 执行后的 DOM，会骗过你。必须用 View Source',
      'Next.js / Nuxt 配错退化成纯 CSR'
    ],
    fact: '绝大多数 AI 爬虫不执行 JavaScript。纯前端渲染的站点，你花在动效上的预算，AI 一分钱都看不到。'
  },
  {
    id: 3, layer: 1, title: 'llms.txt + llms-full.txt 部署',
    tag: 'L1-3',
    goal: '给 AI 一份导航地图，主动告诉它你是谁、重点页面在哪。',
    actions: [
      '复制 templates/llms.txt 填写：品牌描述（50–100 字）/ 核心页面 / 主题分类 / 引用建议',
      '部署到站点根目录 /llms.txt',
      '进阶：生成 llms-full.txt 把重点内容全文内联',
      '设 Content-Type: text/plain + Cache-Control: public, max-age=3600',
      '做成动态路由自动生成，别手写静态文件（会过期）'
    ],
    deliverables: ['上线的 llms.txt（+ 可选 llms-full.txt）', '浏览器访问截图'],
    accept: ['根路径可访问且返回纯文本', '四类信息齐全', '链接全部 200 可访问'],
    pitfalls: [
      '当成流量杠杆 → 2026 年研究显示主流域名采用率仅 9–10%，且多数 AI 抓取引用时并不主动取它',
      '手写静态文件 → 内容更新后立刻过期'
    ],
    fact: '诚实预期：llms.txt 今天真正稳定生效的地方是编码智能体（Cursor / Claude Code / Copilot 会例行抓取文档站）。把它当半天工期的低成本押注，不是流量杠杆。'
  },
  {
    id: 4, layer: 1, title: '可发现性织网',
    tag: 'L1-4',
    goal: '让 AI 认定你在某主题上有深度，而不是只有一两篇散文章。',
    actions: [
      '按主题簇重组内容：每个核心主题 1 篇支柱页 + 5–10 篇子页',
      '子页必须内链回支柱页，支柱页链出所有子页',
      '更新 XML sitemap，确保全部收录',
      '补 BreadcrumbList 结构化数据'
    ],
    deliverables: ['主题簇地图', '更新后的 sitemap'],
    accept: ['≥2 个主题簇，每簇 ≥5 篇', '所有子页有指向支柱页的内链', 'sitemap 覆盖全部簇内页面'],
    pitfalls: ['只堆数量不做内链 → 内容孤立，AI 判断不出主题权威'],
    fact: '2026 年分析：拥有强内链主题簇的站点，获得的 AI 引用多于内容量相当但彼此孤立的站点。'
  },

  /* ---------- L2 解析层 ---------- */
  {
    id: 5, layer: 2, title: 'Schema.org 类型精准命中',
    tag: 'L2-1',
    goal: '别让 AI 把你的服务页误判成媒体文章。',
    actions: [
      '逐页核对当前 Schema 类型，对照 03-tech-implementation.md 的对照表',
      '机构页 → Organization / LocalBusiness；服务页 → Service + Offer',
      '产品页 → Product + AggregateRating；案例页 → CreativeWork',
      '博客 → BlogPosting（不是 Article）；FAQ → FAQPage；联系页 → ContactPage',
      '作者页 → Person + knowsAbout + sameAs'
    ],
    deliverables: ['全站页面 × Schema 类型对照表'],
    accept: ['核心页面类型命中率 100%', '无「全站 Article」现象'],
    pitfalls: ['SEO 插件默认把所有页面标成 Article / WebPage'],
    fact: '真实教训：一家健康食品客户服务页、产品页、案例页全被默认标成 Article，AI 建索引时把这家公司归成「媒体网站」——用户问「推荐健康食品品牌」时它根本不在候选名单里。'
  },
  {
    id: 6, layer: 2, title: 'JSON-LD 落地与校验',
    tag: 'L2-2',
    goal: '把上一关的表变成真实代码，并做到 0 错误。',
    actions: [
      '从 03-tech-implementation.md 复制对应 JSON-LD 片段',
      '至少部署三类：Organization（全站头部）/ BlogPosting（所有文章）/ 业务必需的 Product 或 Service',
      'Organization 务必带 sameAs，指向已验证的社交与评测平台主页',
      '用 Google Rich Results Test + Schema.org Validator 校验到 0 错误'
    ],
    deliverables: ['部署后的 JSON-LD 代码', '校验工具 0 错误截图'],
    accept: ['校验器 0 错误', '0 必填字段缺失警告'],
    pitfalls: ['Organization 缺 sameAs → AI 无法做实体对齐，等于白标'],
    fact: 'sameAs 是 Organization 的灵魂——它是 AI 做实体对齐的关键锚点。没有它，AI 很难确认「网上的你」和「站上的你」是同一个。'
  },
  {
    id: 7, layer: 2, title: '内容分块重构',
    tag: 'L2-3',
    goal: '让每个段落能被单独抽出来当答案。',
    actions: [
      '每个 H2 写成读者（或模型）真正会问的那个问题',
      'H2 下 1–2 句话内直接给答案，背景/前提/例外放答案之后',
      '每个 chunk 自足：单独摘出去仍能完整回答问题',
      '优先使用清单、表格、步骤、定义块'
    ],
    deliverables: ['3 篇改写前后对照（保留原稿）'],
    accept: ['任意抽取一个 H2 + 其下首段，能独立回答该 H2 的问题'],
    pitfalls: ['把铺垫写在答案前面 → AI 抽取时抓不到答案本体'],
    fact: '这一处编辑对 AI Overview 入选率的贡献超过几乎任何其他内容改动——因为它精确匹配了系统的抽取方式：一个能独立完整回答问题的自足块。'
  },
  {
    id: 8, layer: 2, title: '结构化密度升级',
    tag: 'L2-4',
    goal: '给 AI 更多可抽取的硬事实。',
    actions: [
      '每篇补 ≥1 个数据表格（参数 / 对比 / 价格 / 时间线）',
      '补定义块：使用「X 是……」的显式句式',
      '每个数据后附原始出处链接（政府站 / 学术 / 行业报告），≥3 处',
      '标注 datePublished + 尤其 dateModified',
      '图片加 alt 与图表说明，用实景图不用网图'
    ],
    deliverables: ['3 篇升级后文章', '结构化元素清点表'],
    accept: ['每篇 ≥1 表格、≥1 清单、≥3 处带链接外部来源、有明确更新时间'],
    pitfalls: ['只写定性描述不写数字 → AI 无法引用'],
    fact: '「我们最好」毫无意义；「每天追踪 7 个 AI 模型、150 条提示词」才可引用。显式事实 > 暗示语义。'
  },

  /* ---------- L3 实体层 ---------- */
  {
    id: 9, layer: 3, title: '实体身份统一（NAP / PQI）',
    tag: 'L3-1',
    goal: '品牌全称、地址、电话在全网零冲突。',
    actions: [
      '列出你出现的所有平台，逐项核对 Name / Address / Phone',
      '与营业执照 100% 匹配，禁止简写、别名、缩写',
      '检查工商平台（爱企查 / 天眼查 / 企查查）主体信息：经营范围、注册地址、法人、变更记录',
      '清理全网过期地址、废弃电话、旧 Logo'
    ],
    deliverables: ['NAP 全网一致性核对表（≥5 平台截图比对）'],
    accept: ['NAP 一致率 100%'],
    pitfalls: ['不同平台用了不同的品牌简称 → PQI 校验直接降权'],
    fact: '2026 年 8 月算法：PQI 实体校验强化，多版本信息直接降权；AI 会反向核验工商、地图、信用平台，冲突即判定可信度低。'
  },
  {
    id: 10, layer: 3, title: '知识图谱占位',
    tag: 'L3-2',
    goal: '让 AI 在知识库里有你的身份证。',
    actions: [
      '合规百科词条：企业百科、人物百科，内容客观无夸大',
      'Wikidata / 维基数据（有国际业务必做）——Claude、ChatGPT、Perplexity 共用的实体锚点',
      '确保工商信息、信用公示系统信息准确',
      '行业垂直平台入驻：行业协会、官方服务平台、招投标平台'
    ],
    deliverables: ['已建成的实体占位清单（平台名 + 链接 + 状态）'],
    accept: ['≥3 个第三方实体占位生效'],
    pitfalls: ['百科词条写成广告 → 审核不过，且拉低信任'],
    fact: 'AI 引用它能自信识别的来源。你的品牌名、作者名、核心话题必须一致地出现在站内、社交资料与第三方提及中——不能只在你自己的内容里出现。'
  },
  {
    id: 11, layer: 3, title: '地图 POI 认领与校准',
    tag: 'L3-3',
    goal: '拿下本地场景的 AI 推荐权重。',
    actions: [
      '国内三平台免费认领商户：百度地图 / 高德地图 / 腾讯地图（拒绝第三方付费加急代办）',
      '严格统一 NAP，定位到门店正门（不要定位到马路）',
      '上传门头实拍与店内实景，拒绝网图',
      '完善经营类目、服务半径、营业时间',
      '境外：Google Business Profile / Apple Business Connect / OpenStreetMap'
    ],
    deliverables: ['≥3 个地图平台认领成功截图', 'NAP 校准前后对比'],
    accept: ['国内三平台至少认领 2 个', 'NAP 100% 匹配执照'],
    pitfalls: ['定位到马路或楼后 → 本地推荐直接失效'],
    fact: '豆包本地推荐算法中地理权重占比约 35%。地图 POI 属于高权重地理信源，NAP 统一度直接决定本地场景的推荐优先级。'
  },
  {
    id: 12, layer: 3, title: '作者与机构实体化',
    tag: 'L3-4',
    goal: '把「人」也变成可被引用的实体——个人 IP 的胜负手。',
    actions: [
      '建作者页：Person schema，含 knowsAbout（专精话题数组）、sameAs（已验证主页）',
      '每篇文章署名，链接回作者页',
      '作者页写清：真实从业年限、可验证履历、一手经验证据',
      '机构同步补全 Organization 的 sameAs'
    ],
    deliverables: ['作者页上线链接', 'Person JSON-LD 代码'],
    accept: ['作者页可被索引', 'knowsAbout ≥3 个话题', 'sameAs ≥3 个已验证主页'],
    pitfalls: ['用笔名且不关联任何真实主页 → AI 无法建立实体'],
    fact: 'E-E-A-T 的「可验证」是关键。AI 不看你自称多厉害，看的是页面上有没有可验证的信号。'
  },

  /* ---------- L4 信任层 ---------- */
  {
    id: 13, layer: 4, title: 'E-E-A-T / DSS 合规三原则落地',
    tag: 'L4-1',
    goal: '把信任从形容词变成可核查的清单。',
    actions: [
      'D — Data Authenticity：页面上每个数字都能指出处',
      'S — Structured Consistency：复用关卡 9 的 NAP 产出',
      'S — Source Diversification：走向关卡 14',
      '补 E-E-A-T 四签名：作者署名 / 更新日期 / 外部权威引用 / 一手案例数据'
    ],
    deliverables: ['DSS + E-E-A-T 自检表（逐条打勾，附证据链接）'],
    accept: ['7 项全部落地且有页面证据'],
    pitfalls: ['只在首页说「我们专业」，但文章没署名没日期'],
    fact: '「根据 24 年、3000+ 客户实际数据」胜于「我们经验丰富」。原创新增信息是 AI 最愿意引用的东西。'
  },
  {
    id: 14, layer: 4, title: '多源交叉佐证网络',
    tag: 'L4-2',
    goal: '从「孤证」变成「多源共识」。',
    actions: [
      '搭四层信源矩阵，每层至少 2 个落点',
      '第一层 基础主体信源（工商、官网 Schema、llms.txt）——已完成',
      '第二层 地理 POI 信源（地图、点评、本地生活）——已完成',
      '第三层 第三方权威背书（百科、行业平台、媒体报道、招投标、公开案例）——本关重点',
      '第四层 自有内容矩阵（官网 / 公众号 / 视频号 / 知识库）——进行中'
    ],
    deliverables: ['四层信源矩阵图', '第三层 ≥2 个新落点的证据链接'],
    accept: ['四个层级全部有落点', '第三层 ≥2 个第三方平台'],
    pitfalls: ['只在自家公众号发一百篇 → 仍是孤证'],
    fact: '2026 年 8 月算法：精采信模式落地，孤证不立。且生成式引擎对 earned media（第三方报道）存在系统性偏好，高于品牌自有内容。'
  },
  {
    id: 15, layer: 4, title: '原创数据注入',
    tag: 'L4-3',
    goal: '用别人没有的一手数据，换 AI 的引用偏好。',
    actions: [
      '三选一：① 跑一次 50 份以上的小调研并发布原始结果',
      '② 脱敏公开经营数据（服务客户数、案例数、时间跨度）',
      '③ 做一次可复现实测（如跑 N 次查询得到数据表）并公开发布',
      '标明采集方法与时间'
    ],
    deliverables: ['1 篇含一手原始数据的内容（已发布链接）', '数据表'],
    accept: ['含 ≥1 组别处查不到的原始数据', '标明采集方法与时间'],
    pitfalls: ['编数据 → 合规红线，且 AI 已能识别'],
    fact: '普林斯顿 GEO 研究：引用来源 + 统计数据 + 专家引语三类手法，可见度提升最高约 40%。'
  },
  {
    id: 16, layer: 4, title: '第三方背书攻坚',
    tag: 'L4-4',
    goal: '拿下关卡 14 里最难的第三层。',
    actions: [
      '垂直行业平台入驻：行业协会、官方服务平台、招投标平台',
      '正规媒体客观报道：企业动态、服务案例、行业观点，拒绝软文硬广',
      '真实案例沉淀：公开可核查的服务案例、客户见证、项目成果',
      '真实口碑引导：引导真实评价，及时处理负面（绝不刷评）'
    ],
    deliverables: ['≥2 个新增第三方背书链接', '获取过程记录'],
    accept: ['第三方平台真实发布', '内容客观', '可公开核查'],
    pitfalls: ['买软文发稿 → AI 能识别且降权，钱白花'],
    fact: '四级信源权重体系：同一品牌信息发布在央媒等权威信源的采信概率，是普通小站点的 5–8 倍。但宁愿少而真，不要多而假。'
  },

  /* ---------- L5 应答层 ---------- */
  {
    id: 17, layer: 5, title: '提示词（Prompt）调研与四级词库',
    tag: 'L5-1',
    goal: '从「找关键词」转向「搜集用户真会问的问题」。',
    actions: [
      '五个来源收集问题：AI 联想追问 / 客服私信原话 / 竞品 FAQ 与评论区 / 知乎小红书真实提问 / 站内搜索词',
      '原话摘录，不要改写成书面语',
      '用 templates/prompt-bank.md 建四级词库：L1 品牌词 / L2 地域词 / L3 行业词 / L4 痛点长尾词',
      '按「商业价值 ÷ 拿下难度」排序，从 L4 长尾开始打'
    ],
    deliverables: ['四级词库（≥40 条问题，每条标注级别与优先级）'],
    accept: ['≥40 条问句式提示词', 'L4 长尾 ≥15 条'],
    pitfalls: ['只做 L3 行业大词 → 竞争不过权威站，白费力气'],
    fact: '用户会问「小公司没预算能做 GEO 吗」，不会问「中小企业 GEO 预算优化方案」。前者才是你要优化的对象。'
  },
  {
    id: 18, layer: 5, title: '六类高引用内容结构',
    tag: 'L5-2',
    goal: '掌握 AI 最偏爱的六种内容骨架。',
    actions: [
      '① 答案与定义型 —— 对应「X 是什么」，抽取成本最低',
      '② 论证与框架型 —— 建立思想领导力，被当成方法论复述',
      '③ 清单与榜单型 —— 收获最高 AI 引用率的格式，表格须在前 1/3',
      '④ 案例与故事型 —— 具体数字 + 可核查过程，对应 E-E-A-T 的 Experience',
      '⑤ 对比与纠错型 —— 对应决策型 query，提供增量信息',
      '⑥ 权威与专家型 —— 专家引语是普林斯顿研究验证的三手法之一'
    ],
    deliverables: ['6 篇成稿（已发布链接）', '每篇标注对应模式'],
    accept: ['六类各 ≥1 篇', '每篇符合对应模板结构要求'],
    pitfalls: ['六篇都写成同一种结构 → 覆盖的 query 类型受限'],
    fact: 'How-to 指南、对比、用例类内容在 Agent 评估中表现优于泛泛的品牌描述。'
  },
  {
    id: 19, layer: 5, title: '六大中文 AI 平台差异化适配',
    tag: 'L5-3',
    goal: '同一份内容，按平台口味改写。一刀切的 GEO 策略必然失败。',
    actions: [
      '先读 references/02-platform-playbook.md',
      '豆包：FAQ + 列表对比 + 抖音短视频字幕，1–2 周内时效，4–7 天见效',
      'DeepSeek：5000 字以上深度长文 + 参数表 + 代码块，15–30 天',
      '文心一言：首段定义 + 数据段落，百家号与百科，7–12 天',
      '通义千问：表格 + 列表模块化，数据必须可追溯，10–18 天',
      'Kimi：长文本 + 多源标注 + PDF 白皮书，新鲜度优先，3–7 天',
      '元宝：列表式 + 问答式，公众号 + 视频号 + 真实社交互动，7–14 天'
    ],
    deliverables: ['≥3 个平台的适配版内容（链接）', '平台适配对照表'],
    accept: ['每个覆盖平台按对应「最佳结构 + 植入口吻」改写', '而非只是换标题分发'],
    pitfalls: ['一套内容全平台群发 → 必然在部分模型失效'],
    fact: '六个模型的引用偏好差异显著——DeepSeek 偏好数据+逻辑，豆包偏好生活化场景，Kimi 偏好深度长文，文心偏好百度生态信源。单模型覆盖还有算法波动风险：一旦该模型大版本更新，出现率可能断崖下跌。'
  },
  {
    id: 20, layer: 5, title: '多模态 GEO',
    tag: 'L5-4',
    goal: '拿下 2026 年权重上升最快的部分。',
    actions: [
      '短视频：品牌介绍 / 产品测评 / 行业知识 / 客户案例四类，字幕与描述自然嵌入核心关键词',
      'PDF / 白皮书：带目录、可公开下载、可被检索（Kimi 对文档类信源引用率高）',
      '播客 / 音频：必须提供文字转写稿（音频本身文本模型解析不了）',
      '图片：alt 文本 + 图表说明，用实景图不用网图'
    ],
    deliverables: ['≥1 条带关键词字幕的短视频', '≥1 份可下载 PDF', '全站图片 alt 补全记录'],
    accept: ['三类素材各 ≥1', '视频字幕含核心关键词', 'PDF 可被公开检索到'],
    pitfalls: ['用网图 / 素材库图 → 2026 年算法直接过滤'],
    fact: '2026 年 8 月算法已升级多模态抓取：实景图片、短视频、实拍素材权重提升；网图与同质化素材直接过滤。'
  },

  /* ---------- L6 代理层 ---------- */
  {
    id: 21, layer: 6, title: 'AX 评分与 Agent 就绪度',
    tag: 'L6-1',
    goal: '量化你的站点对 AI 智能体的友好程度。',
    actions: [
      '六维自检打分（各 0–100，取均值）：',
      'Crawlability 可爬性：robots.txt 放行、sitemap、无 JS 依赖',
      'Structured Data 结构化数据：Organization / Product / Service / FAQ 完整度',
      'Content Quality 内容质量：自足 chunk、显式事实、来源标注、90 天内更新',
      'Agent Interaction 智能体交互：是否有机器可读的动作入口',
      'Discoverability 可发现性：llms.txt、主题簇、NAP 一致',
      'Security 安全：HTTPS、无注入风险、权限边界'
    ],
    deliverables: ['6 维评分表（当前分 / 目标分 / 差距项）'],
    accept: ['6 维全部完成打分', '识别出 ≥3 个最高杠杆差距项'],
    pitfalls: ['只优化内容不管交互入口 → 智能体无法行动，转化断层'],
    fact: '智能体只推荐 1–3 个选项，不是 10 条蓝链。没被智能体优化，你得到的不是曝光减少，而是归零。但这也是最公平的战场——多数大企业还没做。'
  },
  {
    id: 22, layer: 6, title: 'MCP 端点与实时数据（前沿红利）',
    tag: 'L6-2',
    goal: '从「被静态抓取」升级为「被实时调用」。',
    actions: [
      '先做判断题：业务是否数据密集（价格 / 库存 / 档期 / 目录 / 预约）？',
      '是（电商、酒店、餐饮、医美、教育排课、B2B SaaS）→ 值得做',
      '否（咨询、个人 IP、内容号、纯品牌展示）→ 跳过，把精力放回 L5',
      '若做：提供干净的 REST API（JSON，响应 < 200ms）→ 包一层 MCP server → 公开端点',
      '技术文档与 API 文档本身要做 GEO（编码智能体会例行抓取文档站的 llms.txt）'
    ],
    deliverables: ['MCP 可行性评估结论（做/不做 + 理由）', '若做：端点文档链接'],
    accept: ['评估结论有明确理由', '若执行：端点可被公开发现，文档可被编码智能体抓取'],
    pitfalls: ['为了「前沿」而做 → 数据密度低的业务做了没用，白投'],
    fact: 'MCP 是 Anthropic 2024 年末提出的开放标准。提供 MCP 服务端的品牌会获得「实时数据源」的优先定位——这是目前投入产出比最高的前沿卡位，但只对数据密集型业务成立。'
  },
  {
    id: 23, layer: 6, title: '幻觉与误述治理',
    tag: 'L6-3',
    goal: 'AI 说错你的时候，能修。',
    actions: [
      '复测 18 次提问，列出所有误述（地址错、业务错、名字错、年份错、把别人的事安在你头上）',
      '溯源：① 自己的旧信息 ② 第三方错误信息 ③ 同名实体混淆。先定位来源再动手',
      '源头是自己 → 更新全平台 NAP 与业务描述（回关卡 9）',
      '源头是第三方 → 联系更正 + 自有阵地发布权威事实页（用模式①骨架）',
      '源头是实体混淆 → 强化 sameAs 与 knowsAbout（回关卡 12）+ 发布定义型内容',
      '月度问一组关于你的事实性问题，记录错误率'
    ],
    deliverables: ['误述清单（含来源判定）', '处置记录', '复测对比'],
    accept: ['误述条数较基线下降', '处置过程 0 次触碰合规红线'],
    pitfalls: ['用批量发内容压制负面 → 信息投毒，监管整治重点'],
    fact: 'AI 提你但说错了，比不提你更糟。幻觉监测指标比提及率更该被盯紧。'
  },
  {
    id: 24, layer: 6, title: 'GEO × 私域 × 转化闭环',
    tag: 'L6-4',
    goal: '把 AI 提及变成真实生意，并证明它。',
    actions: [
      '在分析里区分 AI 来源流量（chat.openai.com / perplexity.ai / 各 AI 平台域名）',
      '为 AI 来源流量准备专门落地页——直接回答、直接给下一步，别让他们再逛一遍首页',
      '把 AI 来源用户导向私域（公众号 / 企微 / 社群），做长期心智资产',
      '进阶：把 GEO 内容与 AI 智能体结合，做自动化内容分发与线索预处理'
    ],
    deliverables: ['AI 来源流量归因报表', '落地页改造前后对比', '私域承接路径图'],
    accept: ['可区分 AI 来源流量', '有明确的承接路径设计'],
    pitfalls: ['AI 来源用户落在首页 → 高意图流量被浪费'],
    fact: 'Adobe Analytics：AI 来源购物者转化率高出约 42%。如果你站上 AI 来源转化率不高于搜索来源转化率，说明你的产品/服务页没接住这批高意图流量——这是你自己的问题，不是 GEO 的问题。'
  },

  /* ---------- 终章 ---------- */
  {
    id: 25, layer: 7, title: 'GEO 战役 30 天（结业实战）',
    tag: '终章',
    goal: '把 24 关串成一场完整战役，并拿出 Before/After 证据。',
    actions: [
      'D1–D3 诊断：跑关卡 0 的 18 次提问，建立 Before 基线',
      'D4–D10 基建：L1 准入 + L2 解析 + L3 实体全部落地',
      'D11–D20 内容：≥6 篇六类结构内容 + ≥3 平台适配 + 多模态素材',
      'D15–D25 信任：L4 多源佐证 + 原创数据 + 第三方背书（并行）',
      '全程监测：每周 1 次核心提示词复测，填入台账',
      'D28–D30 收口：跑 After 基线（同样的 query、同样的平台），出战报'
    ],
    deliverables: ['《魔女GEO 结业战报》', 'After 基线台账', 'Before/After 对比'],
    accept: ['18 次提问 Before/After 全部完成', '战报四项数据完整', '≥1 张 AI 引用你的截图'],
    pitfalls: ['复测换了 query 或平台 → 数据不可比，证书数字无意义'],
    fact: 'GEO 反馈周期一般 15–30 天，所以 30 天是能验证结果的最短周期。'
  }
];

/* ============ 14 枚徽章 ============ */
GEO.BADGES = [
  /* 6 枚层徽章 */
  { id: 'b_l1', type: 'layer', layer: 1, name: '准入钥匙', desc: 'L1 准入层四关全通 · AI 进得来了', icon: '🔑' },
  { id: 'b_l2', type: 'layer', layer: 2, name: '解析器', desc: 'L2 解析层四关全通 · AI 读得懂你了', icon: '🔍' },
  { id: 'b_l3', type: 'layer', layer: 3, name: '实体之印', desc: 'L3 实体层四关全通 · AI 认得你是谁了', icon: '🏛' },
  { id: 'b_l4', type: 'layer', layer: 4, name: '信任之盾', desc: 'L4 信任层四关全通 · AI 开始信你了', icon: '🛡' },
  { id: 'b_l5', type: 'layer', layer: 5, name: '应答之矛', desc: 'L5 应答层四关全通 · 你的内容成了弹药', icon: '⚔' },
  { id: 'b_l6', type: 'layer', layer: 6, name: '代理之环', desc: 'L6 代理层四关全通 · AI 能替你成交了', icon: '💠' },

  /* 8 枚成就徽章 */
  { id: 'b_first', type: 'achv', name: '首引猎人', desc: '第一次在任一 AI 平台被引用 / 提及（附截图）', icon: '🎯', manual: true },
  { id: 'b_triple', type: 'achv', name: '三平台通吃', desc: '同时在 ≥3 个中文 AI 平台被正向提及', icon: '🌐', manual: true },
  { id: 'b_nap', type: 'achv', name: '实体统一者', desc: 'NAP 全网一致率 100%（≥5 个平台核验）', icon: '📐', manual: true },
  { id: 'b_schema', type: 'achv', name: 'Schema 工匠', desc: '全站 JSON-LD 校验 0 错误', icon: '🧩', manual: true },
  { id: 'b_data', type: 'achv', name: '原创数据派', desc: '发布 1 份带一手原始数据的内容并被引用', icon: '📊', manual: true },
  { id: 'b_hallu', type: 'achv', name: '幻觉猎手', desc: '成功纠正 ≥1 处 AI 对你的错误描述', icon: '🪝', manual: true },
  { id: 'b_30d', type: 'achv', name: '三十日不辍', desc: '连续 30 天完成 AI 可见度监测台账', icon: '🔥', manual: true },
  { id: 'b_clean', type: 'achv', name: '合规守门人', desc: '全程 0 次触碰合规红线任一条', icon: '⚖', manual: true }
];

/* ============ 5 个段位 ============ */
GEO.LEVELS = [
  { lv: 1, name: '见习 GEOer', min: 0, max: 5, desc: '刚摸到 AI 搜索的门把手' },
  { lv: 2, name: '执行 GEOer', min: 6, max: 11, desc: '能把技术层部署到位' },
  { lv: 3, name: '战术 GEOer', min: 12, max: 17, desc: '实体与信任成型，开始被采信' },
  { lv: 4, name: '战略 GEOer', min: 18, max: 23, desc: '内容弹药充足，多平台开花' },
  { lv: 5, name: 'GEO 操盘手', min: 24, max: 26, desc: '跑通完整战役，拿得出 Before/After' }
];

/* ============ 证书四项核心指标 ============ */
GEO.CORE_METRICS = [
  { key: 'topRate', name: '首推率', hint: '在答案中排第 1 的次数 / 总提问次数', unit: '%' },
  { key: 'mentionRate', name: '提及率', hint: '被提到的次数 / 总提问次数', unit: '%' },
  { key: 'positiveRate', name: '正向占比', hint: '正向描述条数 / 被提及条数', unit: '%' },
  { key: 'misinfo', name: '误述条数', hint: 'AI 说错的关于你的事实条数（越低越好）', unit: '条' }
];

GEO.VERSION = '1.0.0';
