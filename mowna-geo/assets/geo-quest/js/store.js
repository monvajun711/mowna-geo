/* 魔女GEO · 状态层
 * localStorage 持久化 · 徽章判定 · 段位计算 · 导入导出
 * 数据结构见 STORE.defaultState()
 */

const STORE = (function () {
  const KEY = 'mowna_geo_progress_v1';

  function defaultState() {
    return {
      version: 1,
      profile: { name: '', subject: '', startedAt: '', createdAt: '' },
      nodes: {},          // { [id]: {status: 0|1|2, note:'', doneAt:'', proof:''} } 0未开始 1进行中 2已完成
      manualBadges: {},   // { [badgeId]: true }
      metrics: {          // 证书四项指标
        before: { topRate: '', mentionRate: '', positiveRate: '', misinfo: '' },
        after: { topRate: '', mentionRate: '', positiveRate: '', misinfo: '' }
      },
      cert: { issued: false, no: '', issuedAt: '', confirmedClean: false },
      ui: { currentLayer: 1, currentNode: null }
    };
  }

  let S = defaultState();

  /* ---------- 持久化 ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        S = Object.assign(defaultState(), parsed);
        S.nodes = parsed.nodes || {};
        S.manualBadges = parsed.manualBadges || {};
        S.metrics = Object.assign(defaultState().metrics, parsed.metrics || {});
        S.cert = Object.assign(defaultState().cert, parsed.cert || {});
        S.ui = Object.assign(defaultState().ui, parsed.ui || {});
        S.profile = Object.assign(defaultState().profile, parsed.profile || {});
      }
    } catch (e) {
      console.warn('读取进度失败，已重置：', e);
      S = defaultState();
    }
    return S;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {
      console.warn('保存进度失败：', e);
    }
  }

  /* ---------- 关卡状态 ---------- */
  function setNodeStatus(id, status) {
    if (!S.nodes[id]) S.nodes[id] = { status: 0, note: '', doneAt: '', proof: '' };
    S.nodes[id].status = status;
    if (status === 2 && !S.nodes[id].doneAt) {
      S.nodes[id].doneAt = new Date().toISOString().slice(0, 10);
    }
    if (status !== 2) S.nodes[id].doneAt = '';
    save();
  }

  function setNodeField(id, field, value) {
    if (!S.nodes[id]) S.nodes[id] = { status: 0, note: '', doneAt: '', proof: '' };
    S.nodes[id][field] = value;
    save();
  }

  function nodeStatus(id) {
    return (S.nodes[id] && S.nodes[id].status) || 0;
  }

  function nodeData(id) {
    return S.nodes[id] || { status: 0, note: '', doneAt: '', proof: '' };
  }

  function isDone(id) { return nodeStatus(id) === 2; }

  /* ---------- 进度计算 ---------- */
  function doneCount() {
    return GEO.NODES.filter(n => isDone(n.id)).length;
  }

  function totalCount() { return GEO.NODES.length; }

  function progressPct() {
    return Math.round((doneCount() / totalCount()) * 100);
  }

  function layerProgress(layerId) {
    const list = GEO.NODES.filter(n => n.layer === layerId);
    const done = list.filter(n => isDone(n.id)).length;
    return { done, total: list.length, pct: list.length ? Math.round(done / list.length * 100) : 0 };
  }

  /* 序章 layer=0，终章 layer=7，不属于六层 */
  function prologueDone() { return isDone(0); }
  function finaleDone() { return isDone(25); }

  /* ---------- 段位 ---------- */
  function levelInfo() {
    const n = doneCount();
    let cur = GEO.LEVELS[0];
    for (const l of GEO.LEVELS) {
      if (n >= l.min && n <= l.max) { cur = l; break; }
    }
    if (n > GEO.LEVELS[GEO.LEVELS.length - 1].max) cur = GEO.LEVELS[GEO.LEVELS.length - 1];
    const idx = GEO.LEVELS.indexOf(cur);
    const next = GEO.LEVELS[idx + 1] || null;
    const span = cur.max - cur.min + 1;
    const inLevel = n - cur.min;
    return {
      cur, next,
      pct: Math.min(100, Math.round((inLevel / span) * 100)),
      remain: next ? Math.max(0, next.min - n) : 0
    };
  }

  /* ---------- 徽章判定 ---------- */
  function layerBadgeEarned(layerId) {
    const p = layerProgress(layerId);
    return p.total > 0 && p.done === p.total;
  }

  function earnedBadges() {
    const out = [];
    GEO.BADGES.forEach(b => {
      if (b.type === 'layer') {
        out.push({ badge: b, earned: layerBadgeEarned(b.layer) });
      } else {
        out.push({ badge: b, earned: !!S.manualBadges[b.id] });
      }
    });
    return out;
  }

  function earnedCount() {
    return earnedBadges().filter(x => x.earned).length;
  }

  function toggleManualBadge(id) {
    S.manualBadges[id] = !S.manualBadges[id];
    if (!S.manualBadges[id]) delete S.manualBadges[id];
    save();
  }

  /* ---------- 指标 ---------- */
  function setMetric(phase, key, value) {
    S.metrics[phase][key] = value;
    save();
  }

  function metricsFilled(phase) {
    return GEO.CORE_METRICS.every(m => String(S.metrics[phase][m.key]).trim() !== '');
  }

  /* ---------- 证书 ---------- */
  function certReady() {
    return doneCount() === totalCount() && metricsFilled('before') && metricsFilled('after');
  }

  function certBlockers() {
    const b = [];
    const un = totalCount() - doneCount();
    if (un > 0) b.push(`还有 ${un} 个关卡未完成`);
    if (!metricsFilled('before')) b.push('Before 四项指标未填完');
    if (!metricsFilled('after')) b.push('After 四项指标未填完');
    return b;
  }

  function makeCertNo(name) {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    let h = 0;
    const seed = (name || 'GEO') + stamp + doneCount();
    for (let i = 0; i < seed.length; i++) {
      h = (h * 31 + seed.charCodeAt(i)) & 0xffffff;
    }
    return `GEO-${stamp}-${h.toString(16).toUpperCase().padStart(6, '0')}`;
  }

  function issueCert(name, confirmedClean) {
    if (!certReady()) return null;
    S.cert.issued = true;
    S.cert.no = makeCertNo(name);
    S.cert.issuedAt = new Date().toISOString().slice(0, 10);
    S.cert.confirmedClean = !!confirmedClean;
    S.profile.name = name;
    save();
    return S.cert;
  }

  /* ---------- 档案 ---------- */
  function setProfile(patch) {
    Object.assign(S.profile, patch);
    save();
  }

  /* ---------- 导入导出 ---------- */
  function exportJSON() {
    return JSON.stringify(S, null, 2);
  }

  function importJSON(text) {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') throw new Error('格式不正确');
      localStorage.setItem(KEY, JSON.stringify(parsed));
      load();
      return { ok: true };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  function reset() {
    S = defaultState();
    save();
  }

  function get() { return S; }

  return {
    load, save, get, reset,
    setNodeStatus, setNodeField, nodeStatus, nodeData, isDone,
    doneCount, totalCount, progressPct, layerProgress, prologueDone, finaleDone,
    levelInfo, layerBadgeEarned, earnedBadges, earnedCount, toggleManualBadge,
    setMetric, metricsFilled, certReady, certBlockers, issueCert, setProfile,
    exportJSON, importJSON
  };
})();
