# 魔女一寸山河

面向 Codex 的赛博盆景 Skill：把盆景图片转成可解释的量化评分、四观审美诊断、地域流派匹配、因树施策养护建议和可视化评鉴报告，并支持选择驱动的赛博盆景游戏规则。

## 魔女花道：插花作品评分 Skill

[witch-floral-judge/](witch-floral-judge/) 是可单独上架 GitHub 的 Codex Skill，面向插花、花艺、池坊/花道和中国传统插花作品的图片评分与改进反馈。

它提供：

- 默认 100 分四域量表：创意与题意、构成与空间、色彩与表达、技术与材料；
- 中国传统插花、现代花艺、Ikenobo 等流派适配；
- 正面/侧面/背面/底部等图片证据协议，照片不足时自动降级为暂定视觉评分；
- 规则合规与审美分离、证据 ID、置信度、未评项目和可复算 JSON 输出；
- scripts/calculate_score.py 评分复算与 scripts/self_test.py 包结构自检。

直接调用：

    $witch-floral-judge

完整说明见 [witch-floral-judge/SKILL.md](witch-floral-judge/SKILL.md)。

## 直接使用

Skill 入口在 [`bonsai-vision-master/SKILL.md`](bonsai-vision-master/SKILL.md)。将整个 `bonsai-vision-master` 文件夹放入 Codex 的 skills 目录，或在项目中按本地 Skill 使用：

```text
$bonsai-vision-master
```

给 Skill 一张盆景图片，它会输出：

- 100 分量化评分：四观基础 85 分 + 流派校准 15 分；
- 图像证据框、四观雷达图和健康闸门；
- 岭南、扬派、苏派、川派、海派、徽派、通派、浙派等风格匹配；
- 树种候选、分阶段修剪与养护方案；
- 从 120 条原创评语模板中匹配的评价句；
- 可由 `scripts/render_report.py` 生成的离线 HTML 评分报告。

## 开发赛博盆景游戏

从 [`docs/赛博盆景在线游戏_产品与开发蓝图.md`](docs/赛博盆景在线游戏_产品与开发蓝图.md) 末尾的 Codex 开工提示词开始。首个可玩版本建议只做一株榔榆、两种风格、一个完整季节循环，再扩展树种、流派、任务和展览。

## 目录

```text
bonsai-vision-master/
├── SKILL.md                         # Codex Skill 入口
├── agents/openai.yaml               # UI 名称：魔女一寸山河
├── references/                      # 评分、流派、养护、游戏规则与来源
├── scripts/calculate_score.py       # 可复算评分器
├── scripts/render_report.py         # 离线可视化报告生成器
└── assets/                          # 示例盆景图与示例评分数据
docs/
└── 赛博盆景在线游戏_产品与开发蓝图.md
```

## 可信度与版权边界

评分只描述图片可支持的判断；单张图不能替代现场诊断。大截干、换盆、去叶、舍利制作等操作必须经过季节、树种和健康状态确认。`critique-lines.json` 中的 120 条内容是原创评价模板，不冒充历史名句；书籍、协会和官方资料均在 `references/sources.md` 中列出，开发时请按许可重新核对图片与文本素材。

## 本地校验

```text
python bonsai-vision-master/scripts/self_test.py
```

预期输出：`OK: 13 required files, 120 critique lines, demo score 76/100`。

## GitHub 发布

仓库建议命名为 `mo-nv-yi-cun-shan-he`，显示标题使用“魔女一寸山河”。在本地完成登录后执行：

```text
git init
git add .
git commit -m "feat: create 魔女一寸山河 bonsai skill"
git branch -M main
git remote add origin https://github.com/<你的用户名>/mo-nv-yi-cun-shan-he.git
git push -u origin main
```

如果你把 GitHub 仓库 URL 发给我，我可以继续完成 remote 配置和推送；当前环境没有可用的 GitHub CLI 登录态，因此不会猜测账号或向未知仓库上传。
