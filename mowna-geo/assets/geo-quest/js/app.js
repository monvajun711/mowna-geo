/* 魔女GEO · 应用逻辑层 */

const APP = (function () {

  let view = 'L1';   // 'P' 序章 | 'L1'..'L6' | 'F' 终章 | 'B' 徽章 | 'C' 证书
  let openNode = null;

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  /* ============ Toast ============ */
  let toastT = null;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ============ 顶部与段位 ============ */
  function renderTop() {
    const done = STORE.doneCount(), total = STORE.totalCount();
    const pct = STORE.progressPct();
    $('progPct').textContent = pct;
    $('progFill').style.width = pct + '%';
    $('mDone').textContent = done;
    $('mTotal').textContent = total;
    $('mBadge').textContent = STORE.earnedCount();

    const li = STORE.levelInfo();
    $('lvNum').textContent = li.cur.lv;
    $('lvName').textContent = li.cur.name;
    $('lvDesc').textContent = li.cur.desc;
    $('lvBar').style.width = li.pct + '%';
    $('mLevel').textContent = li.cur.name;
    $('lvNext').textContent = li.next
      ? `再完成 ${li.remain} 关 → ${li.next.name}`
      : '已达最高段位';

    const cr = $('mCert');
    if (STORE.get().cert.issued) {
      cr.textContent = '证书已签发 ' + STORE.get().cert.no;
    } else if (STORE.certReady()) {
      cr.textContent = '证书可签发';
    } else {
      cr.textContent = '证书未解锁';
    }
  }

  /* ============ 导航 ============ */
  function renderTabs() {
    const items = [
      { k: 'P', label: '序章 · 诊断' },
      ...GEO.LAYERS.map(l => ({ k: l.key, label: `${l.key} ${l.name}` })),
      { k: 'F', label: '终章 · 战役' },
      { k: 'B', label: '徽章墙' },
      { k: 'C', label: '证书' }
    ];
    $('tabs').innerHTML = items.map(it => {
      let dotClass = 'dot', cnt = '';
      if (it.k === 'P') { if (STORE.isDone(0)) dotClass = 'dot done'; }
      else if (it.k === 'F') { if (STORE.isDone(25)) dotClass = 'dot done'; }
      else if (it.k === 'B') { cnt = STORE.earnedCount() + '/14'; }
      else if (it.k === 'C') { if (STORE.certReady()) dotClass = 'dot done'; }
      else {
        const p = STORE.layerProgress(parseInt(it.k.slice(1), 10));
        cnt = p.done + '/' + p.total;
        if (p.done === p.total) dotClass = 'dot done';
      }
      return `<button class="tab ${view === it.k ? 'on' : ''} ${dotClass.includes('done') ? 'done' : ''}"
        onclick="APP.go('${it.k}')">
        <span class="${dotClass}"></span>${esc(it.label)}${cnt ? `<span class="cnt">${cnt}</span>` : ''}
      </button>`;
    }).join('');
  }

  /* ============ 关卡卡 ============ */
  function nodeHTML(n) {
    const st = STORE.nodeStatus(n.id);
    const d = STORE.nodeData(n.id);
    const cls = ['node', st === 2 ? 'done' : (st === 1 ? 'doing' : ''), openNode === n.id ? 'open' : ''].join(' ');
    const mark = st === 2 ? '✓' : (st === 1 ? '·' : '');
    const layer = GEO.LAYERS.find(l => l.id === n.layer);

    return `
    <div class="${cls}" id="node-${n.id}">
      <div class="node-hd" onclick="APP.toggle(${n.id})">
        <div class="chk">${mark}</div>
        <div class="node-ttl">
          <div class="t">${n.id}. ${esc(n.title)}</div>
          <div class="g">${esc(n.goal)}</div>
        </div>
        <div class="node-tag">${esc(n.tag)}</div>
        <div class="node-arrow">▶</div>
      </div>
      <div class="node-bd">
        <div class="sec">
          <h4>▸ 你要做的动作</h4>
          <ul>${n.actions.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
        </div>
        <div class="sec">
          <h4>▸ 交付物</h4>
          <div class="pill-row">${n.deliverables.map(x => `<span class="pill">${esc(x)}</span>`).join('')}</div>
        </div>
        <div class="sec">
          <h4>▸ 验收标准</h4>
          <ul>${n.accept.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
        </div>
        <div class="sec">
          <h4>▸ 常见坑</h4>
          <ul>${n.pitfalls.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
        </div>
        ${n.fact ? `<div class="fact"><b>为什么这么做 · </b>${esc(n.fact)}</div>` : ''}
        ${layer ? `<div class="redline"><b>合规提醒 · </b>禁止：${esc(GEO.RED_LINES[0])}、${esc(GEO.RED_LINES[1])}、${esc(GEO.RED_LINES[3])}。完整八条见 references/06-compliance-redlines.md</div>` : ''}

        <div class="note-box">
          <label>交付记录（文件路径 / 链接 / 截图说明）</label>
          <textarea placeholder="例：robots.txt 已上线，geo_scan 报告存于 /docs/L1-1_scan.txt；截图 Q0_豆包_比较_2026-09-02.png"
            onchange="APP.setNote(${n.id},'note',this.value)">${esc(d.note || '')}</textarea>
        </div>

        <div class="btn-row">
          <button class="btn" onclick="APP.setStatus(${n.id},1)">标记进行中</button>
          <button class="btn primary" onclick="APP.setStatus(${n.id},2)">标记已完成</button>
          ${st !== 0 ? `<button class="btn ghost" onclick="APP.setStatus(${n.id},0)">取消</button>` : ''}
        </div>
      </div>
    </div>`;
  }

  /* ============ 各视图 ============ */
  function viewPrologue() {
    return `
      <div class="layer-head" style="border-left-color:#8A6D3B">
        <h2>序章 · AI 可见度基线诊断</h2>
        <div class="q">在动任何东西之前，先把「AI 现在怎么看你」量化存档。</div>
        <div class="meta">没有 Before，就没有 After —— 这一关决定了你证书上写什么数字。<b>必做。</b></div>
      </div>
      ${nodeHTML(GEO.NODES[0])}
      <div class="sec" style="margin-top:20px;padding:16px 18px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius)">
        <h4>▸ 3 类中性 query 模板</h4>
        <ul>
          <li><b>① 产业比较型</b>：<code>推荐几家{城市}的{行业}{公司/号/店}</code>　<code>{行业}做得好的有哪些</code></li>
          <li><b>② 主题定义型</b>：<code>什么是{你专精的主题}</code>　<code>{主题}怎么做</code></li>
          <li><b>③ 品牌搜索型</b>：<code>帮我找{你的品牌}</code>　<code>{你的品牌}怎么样</code></li>
        </ul>
        <div class="redline"><b>⚠️ 必须是中性提问。</b>不能写「XX 好吗」这种自证式问题——那测不出真实召回，只会测出你自己的马屁。</div>
      </div>`;
  }

  function viewLayer(id) {
    const L = GEO.LAYERS.find(l => l.id === id);
    const p = STORE.layerProgress(id);
    const list = GEO.NODES.filter(n => n.layer === id);
    return `
      <div class="layer-head" style="border-left-color:${L.color}">
        <h2>${L.key} ${L.name} <span style="font-size:13px;color:var(--ink-3);font-weight:400">${L.en}</span></h2>
        <div class="q">${esc(L.question)}</div>
        <div class="meta">
          对应 RAG 环节：<b>${esc(L.rag)}</b>　·　进度 ${p.done}/${p.total}　·　漏了会怎样：<b>${esc(L.miss)}</b>
        </div>
        <div class="level-mini" style="max-width:none;margin-top:10px">
          <i style="width:${p.pct}%;background:${L.color}"></i>
        </div>
      </div>
      ${list.map(nodeHTML).join('')}
      <div class="fact" style="background:var(--${p.done === p.total ? 'ok' : 'purple'}-xl);border-left-color:var(--${p.done === p.total ? 'ok' : 'purple'})">
        ${p.done === p.total
          ? `<b>🎖 ${esc(L.badge)} 已解锁</b> —— ${esc(L.name)}四关全通。`
          : `<b>通关奖励 · </b>本层 ${p.total} 关全部完成，解锁层徽章「${esc(L.badge)}」。`}
      </div>`;
  }

  function viewFinale() {
    return `
      <div class="layer-head" style="border-left-color:var(--cinnabar)">
        <h2>终章 · GEO 战役 30 天</h2>
        <div class="q">把 24 关串成一场完整战役，并拿出 Before / After 证据。</div>
        <div class="meta">GEO 反馈周期一般 <b>15–30 天</b>，所以 30 天是能验证结果的最短周期。</div>
      </div>
      ${nodeHTML(GEO.NODES[25])}
      <div class="sec" style="margin-top:20px;padding:16px 18px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius)">
        <h4>▸ 30 天节奏</h4>
        <ul>
          <li><b>D1–D3 诊断</b>：跑关卡 0 的 18 次提问，建立 Before 基线</li>
          <li><b>D4–D10 基建</b>：L1 准入 + L2 解析 + L3 实体全部落地</li>
          <li><b>D11–D20 内容</b>：≥6 篇六类结构内容 + ≥3 平台适配 + 多模态素材</li>
          <li><b>D15–D25 信任</b>：L4 多源佐证 + 原创数据 + 第三方背书（并行）</li>
          <li><b>全程监测</b>：每周 1 次核心提示词复测，填入台账</li>
          <li><b>D28–D30 收口</b>：跑 After 基线（同样 query、同样平台），出战报</li>
        </ul>
        <div class="redline"><b>⚠️ 复测纪律 · </b>必须用完全相同的 query、相同的平台、相同的提问方式。唯一变量是你的优化动作，否则数据不可比。</div>
      </div>`;
  }

  function viewBadges() {
    const rows = STORE.earnedBadges();
    const layerB = rows.filter(r => r.badge.type === 'layer');
    const achvB = rows.filter(r => r.badge.type === 'achv');
    const card = r => `
      <div class="badge ${r.earned ? 'on' : 'off'}">
        <div class="ic">${r.badge.icon}</div>
        <div class="nm">${esc(r.badge.name)}</div>
        <div class="ds">${esc(r.badge.desc)}</div>
        <div class="st">${r.earned ? '✦ 已解锁' : (r.badge.type === 'layer' ? '完成该层 4 关解锁' : '达成后手动点亮')}</div>
        ${r.badge.type === 'achv' ? `<div class="tog"><button class="btn sm" onclick="APP.toggleBadge('${r.badge.id}')">${r.earned ? '取消点亮' : '点亮'}</button></div>` : ''}
      </div>`;
    return `
      <div class="panel-title">徽章墙 · ${STORE.earnedCount()} / 14</div>
      <div class="panel-desc">6 枚层徽章由系统自动解锁；8 枚成就徽章需你达成条件后手动点亮——请在有截图证据时点亮。</div>
      <div class="panel-title" style="font-size:14px;margin-top:8px">层徽章（6）</div>
      <div class="badge-grid">${layerB.map(card).join('')}</div>
      <div class="panel-title" style="font-size:14px;margin-top:22px">成就徽章（8）</div>
      <div class="badge-grid">${achvB.map(card).join('')}</div>

      <div class="cert-panel" style="margin-top:24px">
        <div class="panel-title" style="margin-top:0;font-size:15px">合规红线 · 八条禁止</div>
        <div class="panel-desc">触碰任一条即可能导致降权、平台处罚甚至法律风险。这条护栏不可移除。</div>
        <div class="pill-row">${GEO.RED_LINES.map(r => `<span class="pill warn">✕ ${esc(r)}</span>`).join('')}</div>
      </div>`;
  }

  function viewCert() {
    const S = STORE.get();
    const ready = STORE.certReady();
    const blockers = STORE.certBlockers();
    const mRow = (m, phase) => `<input type="text" placeholder="${esc(m.hint)}" value="${esc(S.metrics[phase][m.key])}" onchange="APP.setMetric('${phase}','${m.key}',this.value)">`;

    return `
      <div class="panel-title">结业证书</div>
      <div class="panel-desc">26 关全部完成 + Before/After 四项指标填完，即可签发《魔女GEO 实操认证证书》，支持直接打印或另存 PDF。</div>

      <div class="cert-panel">
        ${ready ? '' : `<div class="blocker"><b>还差：</b><ul>${blockers.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`}

        <div class="cert-form" style="margin-bottom:18px">
          <div><label>姓名 / 品牌名</label><input id="certName" value="${esc(S.profile.name)}" placeholder="证书上显示的名字"></div>
          <div><label>优化主体</label><input value="${esc(S.profile.subject)}" placeholder="号 / 店 / 产品名" onchange="APP.setProfileField('subject',this.value)"></div>
          <div><label>开始日期</label><input value="${esc(S.profile.startedAt)}" placeholder="2026-09-02" onchange="APP.setProfileField('startedAt',this.value)"></div>
        </div>

        <div class="panel-title" style="font-size:14px;margin:18px 0 4px">Before 四项核心指标（关卡 0 基线）</div>
        <div class="cert-form">${GEO.CORE_METRICS.map(m => `<div><label>${esc(m.name)}（${esc(m.unit)}）</label>${mRow(m, 'before')}</div>`).join('')}</div>

        <div class="panel-title" style="font-size:14px;margin:18px 0 4px">After 四项核心指标（关卡 25 复测）</div>
        <div class="cert-form">${GEO.CORE_METRICS.map(m => `<div><label>${esc(m.name)}（${esc(m.unit)}）</label>${mRow(m, 'after')}</div>`).join('')}</div>

        <div style="margin-top:18px">
          <label style="font-size:13.5px;display:flex;gap:8px;align-items:flex-start;cursor:pointer">
            <input type="checkbox" id="certClean" ${S.cert.confirmedClean ? 'checked' : ''} style="margin-top:4px">
            <span>我确认全程 <b>0 次</b>触碰《合规红线》八条中的任一条，所有数据、案例、评价均真实可核查。</span>
          </label>
        </div>

        <div class="btn-row">
          <button class="btn primary" onclick="APP.issue()">${S.cert.issued ? '重新生成证书' : '生成证书'}</button>
          ${S.cert.issued ? `<button class="btn" onclick="window.print()">打印 / 另存 PDF</button>` : ''}
        </div>
      </div>

      <div class="cert-sheet ${S.cert.issued ? 'show' : ''}" id="certSheet"></div>`;
  }

  function renderCertSheet() {
    const S = STORE.get();
    const sheet = $('certSheet');
    if (!sheet || !S.cert.issued) return;

    const delta = (k) => {
      const b = parseFloat(S.metrics.before[k]), a = parseFloat(S.metrics.after[k]);
      if (isNaN(b) || isNaN(a)) return { txt: '—', cls: '' };
      const d = a - b;
      if (Math.abs(d) < 0.01) return { txt: '持平', cls: '' };
      const better = (k === 'misinfo') ? d < 0 : d > 0;
      const sign = d > 0 ? '+' : '';
      return { txt: `${sign}${d}（${better ? '↑ 改善' : '↓ 退步'}）`, cls: better ? 'up' : 'down' };
    };

    const li = STORE.levelInfo();

    sheet.innerHTML = `
      <div class="cert-title">魔女 GEO 实操认证证书</div>
      <div class="cert-sub">MOWNA GEO · CERTIFICATE OF PRACTICAL COMPLETION</div>
      <div class="cert-rule"></div>
      <div class="cert-name">${esc(S.profile.name || '（未填写姓名）')}</div>
      <div class="cert-line">
        已完成 <b>GEO 实操落地课程</b> 全部 ${STORE.totalCount()} 个关卡<br>
        涵盖 AI 六层漏斗：准入 · 解析 · 实体 · 信任 · 应答 · 代理<br>
        提交《GEO 结业战报》并通过验收，达成段位 <b>${esc(li.cur.name)}</b>
        ${S.profile.subject ? `<br>优化主体：${esc(S.profile.subject)}` : ''}
      </div>

      <div class="cert-metrics">
        ${GEO.CORE_METRICS.map(m => {
          const d = delta(m.key);
          return `<div class="cert-metric">
            <div class="k">${esc(m.name)}</div>
            <div class="v">${esc(S.metrics.before[m.key] || '—')} → ${esc(S.metrics.after[m.key] || '—')}</div>
            <div class="d ${d.cls}">${d.txt}</div>
          </div>`;
        }).join('')}
      </div>

      <div class="cert-layers">
        ${GEO.LAYERS.map(L => {
          const p = STORE.layerProgress(L.id);
          return `<div class="cert-layer">${L.key} ${esc(L.name)} · <b>${p.done}/${p.total}</b></div>`;
        }).join('')}
      </div>

      <div class="cert-line" style="font-size:13px">
        徽章 ${STORE.earnedCount()} / 14　·　${S.cert.confirmedClean ? '✔ 合规守门人（全程 0 红线）' : '○ 未确认合规声明'}
      </div>

      <div class="cert-foot">
        <div>
          签发日期：${esc(S.cert.issuedAt)}<br>
          证书编号：${esc(S.cert.no)}
        </div>
        <div class="cert-seal">
          <div class="mk">🔮</div>
          <div class="no">魔女 GEO · v${esc(GEO.VERSION)}</div>
        </div>
      </div>`;
  }

  /* ============ 渲染主控 ============ */
  function render() {
    renderTop();
    renderTabs();
    const m = $('main');
    if (view === 'P') m.innerHTML = viewPrologue();
    else if (view === 'F') m.innerHTML = viewFinale();
    else if (view === 'B') m.innerHTML = viewBadges();
    else if (view === 'C') { m.innerHTML = viewCert(); renderCertSheet(); }
    else {
      const id = parseInt(view.slice(1), 10);
      m.innerHTML = viewLayer(id);
    }
    if (openNode != null) {
      const el = $('node-' + openNode);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ============ 交互 ============ */
  function go(k) { view = k; openNode = null; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function toggle(id) { openNode = (openNode === id) ? null : id; render(); }

  function setStatus(id, st) {
    STORE.setNodeStatus(id, st);
    if (st === 2) {
      const n = GEO.NODES.find(x => x.id === id);
      const L = GEO.LAYERS.find(l => l.id === n.layer);
      if (L && STORE.layerBadgeEarned(L.id)) toast(`🎖 解锁层徽章「${L.badge}」`);
      else toast(`✓ 关卡 ${id} 已完成`);
      if (STORE.certReady()) toast('🎉 全部关卡完成，可以生成证书了');
    }
    render();
  }

  function setNote(id, field, val) {
    STORE.setNodeField(id, field, val);
    toast('已保存');
  }

  function toggleBadge(id) { STORE.toggleManualBadge(id); render(); }

  function setMetric(phase, key, val) { STORE.setMetric(phase, key, val); render(); }

  function setProfileField(k, v) { STORE.setProfile({ [k]: v }); toast('已保存'); }

  function issue() {
    const name = ($('certName') && $('certName').value.trim()) || '';
    if (!STORE.certReady()) { toast('还有条件未满足'); return; }
    const clean = $('certClean') && $('certClean').checked;
    const c = STORE.issueCert(name, clean);
    if (c) { render(); toast('🎓 证书已签发 ' + c.no); }
    else toast('生成失败，请检查条件');
  }

  function exportData() {
    const blob = new Blob([STORE.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `魔女GEO_进度_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('已导出');
  }

  function importData() {
    const f = $('fileIn');
    f.value = '';
    f.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = ev => {
        const res = STORE.importJSON(ev.target.result);
        if (res.ok) { render(); toast('导入成功'); }
        else toast('导入失败：' + res.msg);
      };
      r.readAsText(file);
    };
    f.click();
  }

  function resetAll() {
    if (!confirm('确定要清空全部进度吗？此操作不可恢复，建议先导出备份。')) return;
    STORE.reset();
    view = 'L1'; openNode = null;
    render();
    toast('已重置');
  }

  /* ============ 启动 ============ */
  function init() {
    STORE.load();
    const S = STORE.get();
    if (!S.profile.createdAt) {
      STORE.setProfile({ createdAt: new Date().toISOString().slice(0, 10) });
    }
    const today = new Date().toISOString().slice(0, 10);
    $('heroTag').textContent = `建档于 ${S.profile.createdAt || today} · 进度存于本机`;
    render();
  }

  return {
    init, go, toggle, setStatus, setNote, toggleBadge,
    setMetric, setProfileField, issue, exportData, importData, resetAll
  };
})();

document.addEventListener('DOMContentLoaded', APP.init);
