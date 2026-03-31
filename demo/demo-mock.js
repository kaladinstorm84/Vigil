/**
 * DEMO-MOCK.JS — Mock data layer for the Vigil demo dashboard.
 * Patches window.fetch() and WebSocket to intercept API URLs and
 * return randomised test/pipeline/runner data.
 *
 * Every element query is guarded so this single file works across
 * all demo pages regardless of which panels are present.
 *
 * In production, remove this file and point data-src attributes
 * at real API endpoints.
 */

const SUITES   = ['auth', 'checkout', 'search', 'reports', 'admin', 'api'];
const FEATURES = [
  'User can log in with valid credentials',
  'Basket updates correctly on item removal',
  'Search returns filtered results by category',
  'PDF report generates with correct data',
  'Admin can deactivate user accounts',
  'API returns 401 on expired token',
  'Password reset flow sends email',
  'Checkout applies discount codes',
  'Product images load on PDP',
  'Pagination navigates correctly',
];
const BRANCHES  = ['main', 'develop', 'feat/login-v2', 'fix/basket-race', 'release/2.4'];
const RUNNERS   = ['runner-01', 'runner-02', 'runner-03', 'runner-04'];
const STATUSES  = ['passed','passed','passed','passed','failed','running','skipped','cancelled'];
const PIPE_STATUSES = ['passed','passed','running','failed','running','cancelled'];
const STAGES    = [
  {name:'lint',  pct:0.95},
  {name:'build', pct:0.9},
  {name:'unit',  pct:0.88},
  {name:'e2e',   pct:0.82},
  {name:'deploy',pct:0.92},
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return Math.random() * (max - min) + min; }

function pipelineStatus(stageStatuses) {
  if (stageStatuses.some(s => s === 'failed'))    return 'failed';
  if (stageStatuses.some(s => s === 'running'))   return 'running';
  if (stageStatuses.some(s => s === 'cancelled')) return 'cancelled';
  return 'passed';
}

function stageStatusFromPct(pct, isRunning) {
  if (isRunning) return 'running';
  return Math.random() < pct ? 'passed' : 'failed';
}

function makePipeline(i) {
  const isRunning = Math.random() < 0.3;
  const stageStatuses = STAGES.map((s, si) => {
    if (isRunning && si === STAGES.length - 1) return 'running';
    if (isRunning && si >= STAGES.length - 2 && Math.random() < 0.5) return 'skipped';
    return stageStatusFromPct(s.pct, false);
  });
  const overall = isRunning ? 'running' : pipelineStatus(stageStatuses);

  const stagesData = STAGES.map((s, si) => ({
    name: s.name,
    status: stageStatuses[si],
  }));

  return {
    id: i,
    name: 'Acme \u00b7 ' + rand(BRANCHES) + ' #' + randInt(100, 999),
    branch: rand(BRANCHES),
    triggered_by: '@' + rand(['matt','alice','ci-bot','scheduler']),
    status: overall,
    started: new Date(Date.now() - randInt(30000, 3600000)).toISOString(),
    duration: randInt(45000, 600000),
    _stages: stagesData,
  };
}

function makeTestRun() {
  const dur = randInt(800, 45000);
  return {
    feature:     rand(FEATURES),
    suite:       rand(SUITES),
    branch:      rand(BRANCHES),
    status:      rand(STATUSES),
    steps:       randInt(4, 32),
    duration_ms: dur,
    started:     new Date(Date.now() - randInt(5000, 7200000)).toISOString(),
  };
}

const _pipelines = Array.from({length: 6}, (_, i) => makePipeline(i));
const _testruns  = Array.from({length: 15}, makeTestRun);

function makeTrend(base, variance, count) {
  const arr = [];
  let val = base;
  for (let i = 0; i < (count || 12); i++) {
    val += randFloat(-variance, variance);
    val = Math.max(0, val);
    arr.push(Math.round(val * 10) / 10);
  }
  return arr;
}

// ── Mock API responses ───────────────────────────────────────
var _mockReqCount = 0;
const MOCK_API = {
  '/api/binding-demo': () => ({
    title: 'Dashboard Metrics',
    url: 'https://example.com/report',
    avatar: 'https://i.pravatar.cc/40?u=demo',
    progress_style: 'width:' + randInt(40, 95) + '%',
    html_content: '<strong>Server uptime</strong> is <code>99.97%</code> — all regions <em>healthy</em>.',
    is_active: Math.random() > 0.5,
    has_errors: Math.random() > 0.7,
    is_healthy: Math.random() > 0.3,
    passed: randInt(180, 220),
    total: 248,
    rate: randFloat(82, 96),
    items: Array.from({ length: 50 }, (_, i) => ({
      name: FEATURES[i % FEATURES.length],
      status: rand(['passed', 'failed', 'running']),
      duration: randInt(500, 15000),
    })),
    suites: SUITES.map(s => ({
      name: s,
      tests: Array.from({ length: randInt(2, 5) }, () => ({
        name: rand(FEATURES),
        status: rand(['passed', 'passed', 'passed', 'failed']),
      })),
    })),
  }),
  '/api/post-demo': () => ({ message: 'POST received', echo: { method: 'POST' }, timestamp: new Date().toISOString() }),
  '/api/retry-demo': () => {
    _mockReqCount++;
    if (_mockReqCount % 3 === 0) throw new Error('Simulated 500');
    return { value: randInt(10, 99), status: 'ok' };
  },
  '/api/auth-demo': () => {
    return { _status: 401 };
  },
  '/api/skeleton-demo': () => {
    return { label: 'Build Queue', value: randInt(3, 18), sub: 'Across ' + randInt(2, 4) + ' runners', _delay: 2000 };
  },
  '/api/health-ok': () => {
    return { status: 'ok', uptime: randInt(1000, 9999) + 's' };
  },
  '/api/health-fail': () => {
    return { _status: 503 };
  },
  '/api/kpi/runs': () => ({
    total: randInt(140, 165),
    delta_label: '\u2191 ' + randInt(5, 20) + ' vs yesterday',
    trend: makeTrend(150, 12),
  }),
  '/api/kpi/passrate': () => ({
    rate: randFloat(81, 96),
    period: 'Last 24 hours',
    trend: makeTrend(90, 4),
  }),
  '/api/kpi/failures': () => ({
    count: randInt(3, 18),
    most_common: rand(['assertion', 'timeout', 'element not found', 'network']),
    trend: makeTrend(10, 5),
  }),
  '/api/kpi/runners': () => {
    const active = randInt(2, 4);
    return {
      active,
      status_label: active + ' of 4 running jobs',
      trend: makeTrend(3, 1, 12),
    };
  },
  '/api/pipelines': () => {
    _pipelines.forEach((p, i) => {
      if (Math.random() < 0.15) {
        const updated = makePipeline(i);
        Object.assign(p, updated);
      }
    });
    return { items: _pipelines };
  },
  '/api/runners': () => ({
    healthy_count: randInt(3, 4) + ' healthy',
    runners: RUNNERS.map(name => {
      const load = randFloat(5, 95);
      return {
        name,
        status: load > 80 ? 'busy' : (Math.random() < 0.05 ? 'offline' : 'online'),
        job_count: randInt(0, 3) + ' jobs',
        load_pct: load,
      };
    }),
  }),
  '/api/testruns': () => {
    if (Math.random() < 0.3) {
      _testruns.unshift(makeTestRun());
      if (_testruns.length > 20) _testruns.pop();
    }
    return {
      items: _testruns.slice(0, 12),
      total: _testruns.length + 103 + ' runs today',
    };
  },
  '/api/reports/trends': () => {
    const days = [];
    const now = new Date();
    for (let d = 6; d >= 0; d--) {
      const dt = new Date(now.getTime() - d * 86400000);
      const label = dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      const total = randInt(120, 180);
      const passed = total - randInt(8, 30);
      const failed = total - passed - randInt(0, 8);
      const skipped = total - passed - Math.max(0, failed);
      days.push({
        label,
        total,
        passed: Math.max(0, passed),
        failed: Math.max(0, Math.min(failed, total - passed)),
        skipped: Math.max(0, skipped),
        rate: Math.round((passed / total) * 1000) / 10,
        avg_duration: randInt(8, 28) + 's',
      });
    }
    const suiteRates = SUITES.map(s => ({
      suite: s,
      rate: randFloat(72, 98),
      runs: randInt(40, 120),
      trend: makeTrend(randFloat(80, 95), 3, 7),
    }));
    return {
      days,
      total_7d: days.reduce((s, d) => s + d.total, 0),
      avg_rate: Math.round(days.reduce((s, d) => s + d.rate, 0) / days.length * 10) / 10,
      avg_duration: randInt(12, 22) + 's',
      suites: suiteRates,
    };
  },
  '/api/reports/failures': () => {
    const types = [
      { type: 'Assertion failed', count: randInt(15, 40), pct: 0 },
      { type: 'Element not found', count: randInt(8, 25), pct: 0 },
      { type: 'Timeout exceeded', count: randInt(5, 18), pct: 0 },
      { type: 'Network error', count: randInt(2, 10), pct: 0 },
      { type: 'Script error', count: randInt(1, 6), pct: 0 },
    ];
    const totalFail = types.reduce((s, t) => s + t.count, 0);
    types.forEach(t => { t.pct = Math.round((t.count / totalFail) * 1000) / 10; });
    types.sort((a, b) => b.count - a.count);

    const recentFailures = Array.from({ length: 8 }, () => {
      const r = makeTestRun();
      r.status = 'failed';
      r.error_type = rand(['assertion', 'timeout', 'element not found', 'network', 'script']);
      return r;
    });

    const flaky = FEATURES.map(f => ({
      name: f,
      total_runs: randInt(20, 60),
      fail_count: randInt(3, 15),
      rate: 0,
    }));
    flaky.forEach(f => { f.rate = Math.round(((f.total_runs - f.fail_count) / f.total_runs) * 1000) / 10; });
    flaky.sort((a, b) => a.rate - b.rate);

    return {
      total_failures: totalFail,
      most_common: types[0].type,
      mttr: randInt(4, 45) + 'm',
      types,
      items: recentFailures,
      flaky: flaky.slice(0, 6),
    };
  },
};

// ── Patch fetch ──────────────────────────────────────────────
const _origFetch = window.fetch.bind(window);
window.fetch = (url, opts) => {
  const parsed = new URL(url, window.location.origin);
  const path   = parsed.pathname;

  if (MOCK_API[path]) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        let data;
        try { data = MOCK_API[path](); }
        catch (e) {
          res({ ok: false, status: 500, json: () => Promise.resolve({ error: e.message }) });
          return;
        }
        if (data && data._status) {
          res({ ok: false, status: data._status, json: () => Promise.resolve({ error: 'HTTP ' + data._status }) });
          return;
        }
        if (data && data._delay) delete data._delay;

        if (path === '/api/testruns' && data.items) {
          const branchFilter = parsed.searchParams.get('branch');
          const suiteFilter  = parsed.searchParams.get('suite');
          if (branchFilter) data.items = data.items.filter(r => r.branch === branchFilter);
          if (suiteFilter)  data.items = data.items.filter(r => r.suite === suiteFilter);
          data.total = data.items.length + ' runs (filtered)';
        }

        res({
          ok: true,
          json: () => Promise.resolve(data),
        });
      }, path === '/api/skeleton-demo' ? 2000 : randInt(80, 300));
    });
  }
  return _origFetch(url, opts);
};

// ── Pipeline stages renderer (guarded) ───────────────────────
const _pipelinePanel = document.querySelector('[data-src="/api/pipelines"]');
if (_pipelinePanel) {
  _pipelinePanel.addEventListener('vigil:update', e => {
    const items = e.detail.items;
    const rows  = document.querySelectorAll('.vg-pipeline-run');
    rows.forEach((row, i) => {
      const pipeline = items[i];
      if (!pipeline) return;
      const stagesEl = row.querySelector('.vg-pipeline-run__stages');
      if (!stagesEl || !pipeline._stages) return;

      stagesEl.innerHTML = pipeline._stages.map((s, si) =>
        `<div class="vg-stage vg-stage--${s.status}">
          <div class="vg-stage__bar" title="${s.name}: ${s.status}"></div>
          <div class="vg-stage__label">${s.name.slice(0,4)}</div>
        </div>` +
        (si < pipeline._stages.length - 1 ? '<div class="vg-stage-connector"></div>' : '')
      ).join('');
    });
  });
}

// ── Runner load bar fix (guarded) ────────────────────────────
const _runnerPanel = document.querySelector('[data-src="/api/runners"]');
if (_runnerPanel) {
  _runnerPanel.addEventListener('vigil:update', e => {
    const rows = document.querySelectorAll('.runner-row');
    if (!e.detail.runners) return;
    e.detail.runners.forEach((r, i) => {
      const row = rows[i];
      if (!row) return;
      const bar = row.querySelector('.vg-progress__bar');
      if (bar) bar.style.width = r.load_pct.toFixed(0) + '%';
    });
  });
}

// ── Summary ring + trend chart (guarded) ─────────────────────
let _summaryData = { passed: 0, failed: 0, skipped: 0, running: 0 };

function updateSummary() {
  if (!document.getElementById('rate-arc')) return;
  const total   = randInt(130, 165);
  const running = randInt(2, 8);
  const failed  = randInt(6, 22);
  const skipped = randInt(8, 18);
  const passed = total - failed - skipped - running;
  const rate   = (passed / (passed + failed)) * 100;

  _summaryData = { passed, failed, skipped, running, rate };

  const el = (id) => document.getElementById(id);
  if (el('sum-passed'))  el('sum-passed').textContent  = passed;
  if (el('sum-failed'))  el('sum-failed').textContent  = failed;
  if (el('sum-skipped')) el('sum-skipped').textContent = skipped;
  if (el('sum-running')) el('sum-running').textContent = running;

  const arc  = el('rate-arc');
  const text = el('rate-text');
  if (arc) {
    arc.setAttribute('stroke-dasharray', rate.toFixed(1) + ' 100');
    arc.setAttribute('stroke', rate > 90 ? '#3fb950' : rate > 75 ? '#d29922' : '#f85149');
  }
  if (text) text.textContent = rate.toFixed(0) + '%';
}

function buildTrendChart() {
  const chart  = document.getElementById('trend-chart');
  const labels = document.getElementById('trend-labels');
  if (!chart || !labels) return;
  chart.innerHTML = '';
  labels.innerHTML = '';

  const now = new Date();
  for (let h = 23; h >= 0; h--) {
    const pct  = randFloat(0.6, 1.0);
    const bar  = document.createElement('div');
    bar.className = 'chart-bar';
    const height = randInt(20, 58);
    bar.style.height = height + 'px';
    bar.style.background = pct > 0.9 ? 'var(--vg-success)' : pct > 0.75 ? 'var(--vg-warn)' : 'var(--vg-fail)';
    const hr = new Date(now.getTime() - h * 3600000).getHours();
    bar.setAttribute('data-tip', hr + ':00 \u2014 ' + (pct*100).toFixed(0) + '% pass');
    chart.appendChild(bar);

    const lbl = document.createElement('span');
    lbl.textContent = h % 6 === 0 ? hr + 'h' : '';
    labels.appendChild(lbl);
  }
}

function buildFlakyList() {
  const container = document.getElementById('flaky-list');
  if (!container) return;
  container.innerHTML = '';
  const flaky = FEATURES.slice(0, 4).map(f => ({
    name: f,
    rate: randFloat(60, 85),
  })).sort((a, b) => a.rate - b.rate);

  flaky.forEach(f => {
    const div = document.createElement('div');
    div.className = 'flaky-item';
    div.innerHTML = `
      <div class="flaky-item__header">
        <span class="vg-font-sm vg-text-muted vg-truncate flaky-item__name" title="${f.name}">${f.name}</span>
        <span class="vg-font-sm vg-font-data vg-text-warn">${f.rate.toFixed(0)}%</span>
      </div>
      <div class="vg-progress">
        <div class="vg-progress__bar vg-progress__bar--warn" style="width:${f.rate}%"></div>
      </div>
    `;
    container.appendChild(div);
  });
}

// ── Live log (guarded) ───────────────────────────────────────
const LOG_EVENTS = [
  ['success', 'PASS', f => `[${rand(SUITES)}] ${f} \u2713`],
  ['fail', 'FAIL', f => `[${rand(SUITES)}] ${f} \u2014 assertion failed`],
  ['info', 'INFO', _  => `Pipeline #${randInt(100,999)} started on ${rand(BRANCHES)}`],
  ['warn', 'WARN', _  => `Runner ${rand(RUNNERS)} CPU at ${randInt(85,98)}%`],
  ['info', 'INFO', _  => `Deployment to staging completed in ${randInt(12,60)}s`],
  ['success', 'PASS', _  => `Scenario: ${rand(FEATURES)}`],
];

function addLogEntry() {
  const logEl = document.getElementById('log-entries');
  if (!logEl) return;
  const [cls, level, msg] = rand(LOG_EVENTS);
  const text    = msg(rand(FEATURES));
  const now     = new Date();
  const time    = now.toTimeString().slice(0,8);

  const entry = document.createElement('div');
  entry.className = `vg-log-entry vg-log-entry--${cls} vg-anim-fade-in`;
  entry.innerHTML = `
    <span class="vg-log-entry__time">${time}</span>
    <span class="vg-log-entry__level">${level}</span>
    <span class="vg-log-entry__msg">${text}</span>
  `;

  logEl.insertBefore(entry, logEl.firstChild);
  while (logEl.children.length > 40) logEl.lastChild.remove();
}

// ── Sidebar nav badge update (guarded) ───────────────────────
function updateNavBadge() {
  const badge = document.getElementById('nav-running-count');
  if (!badge) return;
  const running = _pipelines.filter(p => p.status === 'running').length;
  badge.textContent = running;
}

// ── Theme toggle ─────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  html.setAttribute('data-vg-theme',
    html.getAttribute('data-vg-theme') === 'light' ? '' : 'light'
  );
}

// ── Mock WebSocket for deployment feed demo ─────────────────
const DEPLOY_ENVS    = ['staging', 'production', 'preview', 'canary'];
const DEPLOY_ACTIONS = ['deployed', 'rolled back', 'scaled up', 'restarted'];

class MockWebSocket {
  constructor(url) {
    this.url        = url;
    this.readyState = 0;
    this._listeners = { open: [], message: [], close: [], error: [] };
    this._closed    = false;

    setTimeout(() => {
      if (this._closed) return;
      this.readyState = 1;
      this._emit('open', {});
      this._startPushing();
    }, randInt(100, 400));
  }

  addEventListener(type, fn)    { (this._listeners[type] || []).push(fn); }
  removeEventListener(type, fn) { this._listeners[type] = (this._listeners[type] || []).filter(f => f !== fn); }
  _emit(type, evt) { (this._listeners[type] || []).forEach(fn => fn(evt)); }

  close() {
    this._closed = true;
    this.readyState = 3;
    clearInterval(this._interval);
    this._emit('close', {});
  }

  _startPushing() {
    const push = () => {
      if (this._closed) return;
      const msg = {
        event: 'deploy.update',
        data: {
          items: Array.from({ length: randInt(2, 5) }, () => ({
            env:     rand(DEPLOY_ENVS),
            action:  rand(DEPLOY_ACTIONS),
            service: 'acme-' + rand(['api', 'web', 'worker', 'gateway']),
            version: 'v' + randInt(2, 4) + '.' + randInt(0, 9) + '.' + randInt(0, 20),
            status:  rand(['success', 'running', 'fail', 'success', 'success']),
            time:    new Date().toISOString(),
            actor:   '@' + rand(['matt', 'alice', 'ci-bot', 'scheduler']),
          })),
        },
      };
      this._emit('message', { data: JSON.stringify(msg) });
    };
    push();
    this._interval = setInterval(push, randInt(3000, 6000));
  }
}

const _OrigWebSocket = window.WebSocket;
window.WebSocket = function(url) {
  if (url.includes('mock')) return new MockWebSocket(url);
  return new _OrigWebSocket(url);
};

// ── Report: 7-day trend chart builder (guarded) ─────────────
function build7DayChart(days) {
  const chart  = document.getElementById('trend-7d-chart');
  const labels = document.getElementById('trend-7d-labels');
  if (!chart || !labels || !days) return;
  chart.innerHTML = '';
  labels.innerHTML = '';

  const maxTotal = Math.max(...days.map(d => d.total));
  days.forEach(d => {
    const pct = d.rate / 100;
    const bar = document.createElement('div');
    bar.className = 'chart-bar chart-bar--wide';
    bar.style.height = Math.round((d.total / maxTotal) * 80) + 'px';
    bar.style.background = pct > 0.9 ? 'var(--vg-success)' : pct > 0.75 ? 'var(--vg-warn)' : 'var(--vg-fail)';
    bar.setAttribute('data-tip', d.label + ' \u2014 ' + d.total + ' runs, ' + d.rate + '% pass');
    chart.appendChild(bar);

    const lbl = document.createElement('span');
    lbl.textContent = d.label.split(' ')[0];
    labels.appendChild(lbl);
  });
}

function buildFailureBreakdown(types) {
  const container = document.getElementById('failure-breakdown');
  if (!container || !types) return;
  container.innerHTML = '';
  types.forEach(t => {
    const div = document.createElement('div');
    div.className = 'failure-type-row';
    div.innerHTML = `
      <div class="failure-type-row__header">
        <span class="vg-font-sm">${t.type}</span>
        <span class="vg-font-sm vg-font-data">${t.count} <span class="vg-text-subtle">(${t.pct}%)</span></span>
      </div>
      <div class="vg-progress">
        <div class="vg-progress__bar vg-progress__bar--fail" style="width:${t.pct}%"></div>
      </div>
    `;
    container.appendChild(div);
  });
}

function buildFlakyTable(features) {
  const container = document.getElementById('flaky-table-body');
  if (!container || !features) return;
  container.innerHTML = '';
  features.forEach(f => {
    const cls = f.rate > 90 ? 'success' : f.rate > 75 ? 'warn' : 'fail';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="feature-name">${f.name}</div></td>
      <td class="vg-col-num vg-col-mono">${f.total_runs}</td>
      <td class="vg-col-num vg-col-mono vg-text-fail">${f.fail_count}</td>
      <td class="vg-col-num vg-col-mono vg-text-${cls}">${f.rate}%</td>
    `;
    container.appendChild(tr);
  });
}

// ── Report data listeners (guarded) ─────────────────────────
const _trendsPanel = document.querySelector('[data-src="/api/reports/trends"]');
if (_trendsPanel) {
  _trendsPanel.addEventListener('vigil:update', e => {
    build7DayChart(e.detail.days);
  });
}

const _failuresPanel = document.querySelector('[data-src="/api/reports/failures"]');
if (_failuresPanel) {
  _failuresPanel.addEventListener('vigil:update', e => {
    buildFailureBreakdown(e.detail.types);
    buildFlakyTable(e.detail.flaky);
  });
}

// ── Bootstrap demo ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateSummary();
  buildTrendChart();
  buildFlakyList();

  for (let i = 0; i < 8; i++) addLogEntry();

  setInterval(addLogEntry, 2200);

  setInterval(() => {
    updateSummary();
    buildTrendChart();
    buildFlakyList();
    updateNavBadge();
  }, 7000);

  document.addEventListener('vigil:update', () => {
    const txt = document.querySelector('.vg-topbar__refresh-text');
    if (txt) txt.classList.remove('vg-hidden');
  }, { once: true });
});
