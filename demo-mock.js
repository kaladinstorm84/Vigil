/**
 * DEMO-MOCK.JS — Mock data layer for the Vigil QMate demo.
 * Patches window.fetch() to intercept API URLs and return
 * randomised test/pipeline/runner data.
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
    name: 'QMate \u00b7 ' + rand(BRANCHES) + ' #' + randInt(100, 999),
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
const MOCK_API = {
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
};

// ── Patch fetch ──────────────────────────────────────────────
const _origFetch = window.fetch.bind(window);
window.fetch = (url, opts) => {
  const parsed = new URL(url, window.location.origin);
  const path   = parsed.pathname;

  if (MOCK_API[path]) {
    return new Promise(res => {
      setTimeout(() => {
        let data = MOCK_API[path]();

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
      }, randInt(80, 300));
    });
  }
  return _origFetch(url, opts);
};

// ── Pipeline stages renderer ─────────────────────────────────
document.querySelector('[data-src="/api/pipelines"]').addEventListener('vigil:update', e => {
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

// ── Runner load bar fix ──────────────────────────────────────
document.querySelector('[data-src="/api/runners"]').addEventListener('vigil:update', e => {
  const rows = document.querySelectorAll('#runners-body .runner-row');
  e.detail.runners.forEach((r, i) => {
    const row = rows[i];
    if (!row) return;
    const bar = row.querySelector('.vg-progress__bar');
    if (bar) bar.style.width = r.load_pct.toFixed(0) + '%';
  });
});

// ── Summary ring + trend chart ───────────────────────────────
let _summaryData = { passed: 0, failed: 0, skipped: 0, running: 0 };

function updateSummary() {
  const total   = randInt(130, 165);
  const running = randInt(2, 8);
  const failed  = randInt(6, 22);
  const skipped = randInt(8, 18);
  const passed  = total - failed - skipped - running;
  const rate    = (passed / (passed + failed)) * 100;

  _summaryData = { passed, failed, skipped, running, rate };

  document.getElementById('sum-passed').textContent  = passed;
  document.getElementById('sum-failed').textContent  = failed;
  document.getElementById('sum-skipped').textContent = skipped;
  document.getElementById('sum-running').textContent = running;

  const arc  = document.getElementById('rate-arc');
  const text = document.getElementById('rate-text');
  arc.setAttribute('stroke-dasharray', rate.toFixed(1) + ' 100');
  arc.setAttribute('stroke', rate > 90 ? '#3fb950' : rate > 75 ? '#d29922' : '#f85149');
  text.textContent = rate.toFixed(0) + '%';
}

function buildTrendChart() {
  const chart  = document.getElementById('trend-chart');
  const labels = document.getElementById('trend-labels');
  chart.innerHTML = '';
  labels.innerHTML = '';

  const now = new Date();
  for (let h = 23; h >= 0; h--) {
    const pct  = randFloat(0.6, 1.0);
    const bar  = document.createElement('div');
    bar.className = 'chart-bar';
    const height = randInt(20, 58);
    bar.style.height = height + 'px';
    bar.style.background = pct > 0.9 ? 'var(--vg-pass)' : pct > 0.75 ? 'var(--vg-warn)' : 'var(--vg-fail)';
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

// ── Live log ─────────────────────────────────────────────────
const LOG_EVENTS = [
  ['pass', 'PASS', f => `[${rand(SUITES)}] ${f} \u2713`],
  ['fail', 'FAIL', f => `[${rand(SUITES)}] ${f} \u2014 assertion failed`],
  ['info', 'INFO', _  => `Pipeline #${randInt(100,999)} started on ${rand(BRANCHES)}`],
  ['warn', 'WARN', _  => `Runner ${rand(RUNNERS)} CPU at ${randInt(85,98)}%`],
  ['info', 'INFO', _  => `Deployment to staging completed in ${randInt(12,60)}s`],
  ['pass', 'PASS', _  => `Scenario: ${rand(FEATURES)}`],
];

function addLogEntry() {
  const logEl   = document.getElementById('log-entries');
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

// ── Sidebar nav badge update ─────────────────────────────────
function updateNavBadge() {
  const running = _pipelines.filter(p => p.status === 'running').length;
  const badge = document.getElementById('nav-running-count');
  if (badge) badge.textContent = running;
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
            service: 'qmate-' + rand(['api', 'web', 'worker', 'gateway']),
            version: 'v' + randInt(2, 4) + '.' + randInt(0, 9) + '.' + randInt(0, 20),
            status:  rand(['pass', 'running', 'fail', 'pass', 'pass']),
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
