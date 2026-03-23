/**
 * VIGIL.JS — Live Monitoring Dashboard Framework v0.3
 * Declarative polling, data binding, and status mapping.
 */

(function (global) {
  'use strict';

  // ── Constants ──────────────────────────────────────────────
  const ATTR_SRC        = 'data-src';
  const ATTR_POLL       = 'data-poll';
  const ATTR_BIND       = 'data-bind';
  const ATTR_EACH       = 'data-each';
  const ATTR_IF         = 'data-if';
  const ATTR_IF_NOT     = 'data-if-not';
  const ATTR_FORMAT     = 'data-format';
  const ATTR_STATUS_MAP = 'data-status-map';
  const ATTR_ROW_STATUS = 'data-row-status';
  const ATTR_TRANSFORM  = 'data-transform';

  const STATUS_CLASSES = [
    'vg-dot--pass','vg-dot--fail','vg-dot--running','vg-dot--warn',
    'vg-dot--skipped','vg-dot--cancelled','vg-dot--unknown',
    'vg-badge--pass','vg-badge--fail','vg-badge--running','vg-badge--warn',
    'vg-badge--skipped','vg-badge--cancelled',
    'vg-row--pass','vg-row--fail','vg-row--running','vg-row--warn',
    'vg-row--cancelled',
  ];

  // ── Transforms ─────────────────────────────────────────────
  const transforms = {};

  // ── Formatters ─────────────────────────────────────────────
  const formatters = {
    number(v)   { return Number(v).toLocaleString(); },
    percent(v)  { return Number(v).toFixed(1) + '%'; },
    duration(v) {
      const ms = Number(v);
      if (isNaN(ms)) return v;
      if (ms < 1000) return ms + 'ms';
      const s = Math.floor(ms / 1000);
      if (s < 60)  return s + 's';
      const m = Math.floor(s / 60), rs = s % 60;
      if (m < 60)  return m + 'm ' + rs + 's';
      const h = Math.floor(m / 60), rm = m % 60;
      return h + 'h ' + rm + 'm';
    },
    relative(v) {
      const d = new Date(v);
      if (isNaN(d)) return v;
      const diff = Date.now() - d.getTime();
      if (diff < 5000)  return 'just now';
      if (diff < 60000) return Math.floor(diff / 1000) + 's ago';
      if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
      return Math.floor(diff / 3600000) + 'h ago';
    },
    date(v) {
      const d = new Date(v);
      return isNaN(d) ? v : d.toLocaleString();
    },
    short_date(v) {
      const d = new Date(v);
      return isNaN(d) ? v : d.toLocaleDateString();
    },
    passrate(v) {
      const n = Number(v);
      return isNaN(n) ? v : n.toFixed(1) + '%';
    },
    uppercase(v) { return String(v).toUpperCase(); },
    lowercase(v) { return String(v).toLowerCase(); },
  };

  // ── Deep get from dot-path ─────────────────────────────────
  function deepGet(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
  }

  // ── Apply status class ──────────────────────────────────────
  function applyStatusClass(el, prefix, value) {
    // Remove existing status classes for this prefix
    el.classList.forEach(c => {
      if (c.startsWith(prefix + '--')) el.classList.remove(c);
    });
    if (value) el.classList.add(prefix + '--' + value);
  }

  // ── Render template node with data ─────────────────────────
  function renderNode(root, data) {
    // data-if / data-if-not
    const ifField    = root.getAttribute && root.getAttribute(ATTR_IF);
    const ifNotField = root.getAttribute && root.getAttribute(ATTR_IF_NOT);
    if (ifField    && !deepGet(data, ifField))  { root.style.display = 'none'; return; }
    if (ifNotField &&  deepGet(data, ifNotField)) { root.style.display = 'none'; return; }
    root.style.display = '';

    // data-bind on this element itself
    const bindField = root.getAttribute && root.getAttribute(ATTR_BIND);
    if (bindField !== null) {
      let val = deepGet(data, bindField);

      // Apply transform before formatting
      const txName = root.getAttribute(ATTR_TRANSFORM);
      if (txName && transforms[txName] && val !== undefined && val !== null) {
        val = transforms[txName](val, data);
      }

      // Preserve raw value for auto-refreshing relative timestamps
      const fmt = root.getAttribute(ATTR_FORMAT);
      if (fmt === 'relative' && val !== undefined && val !== null) {
        root.setAttribute('data-live-value', val);
      }

      // Apply format
      if (fmt && formatters[fmt] && val !== undefined && val !== null) {
        val = formatters[fmt](val);
      }

      // Apply status-map (sets class, optionally text)
      const rawMap = root.getAttribute(ATTR_STATUS_MAP);
      if (rawMap) {
        try {
          const map  = JSON.parse(rawMap);
          const rawVal = deepGet(data, bindField);
          const mapped = map[rawVal] || map['*'] || rawVal;
          if (root.classList.contains('vg-dot'))   applyStatusClass(root, 'vg-dot', mapped);
          if (root.classList.contains('vg-badge'))  applyStatusClass(root, 'vg-badge', mapped);
          if (!root.classList.contains('vg-dot')) {
            root.textContent = fmt ? val : (rawVal ?? '');
          }
        } catch (e) { /* invalid JSON */ }
        return;
      }

      // Sparkline: render SVG instead of setting text
      if (root.classList && root.classList.contains('vg-sparkline') && Array.isArray(val)) {
        renderSparkline(root, val, {
          color: root.getAttribute('data-sparkline-color') || undefined,
          type:  root.getAttribute('data-sparkline-type')  || 'line',
        });
        return;
      }

      // Default: set text
      if (val !== undefined && val !== null) {
        root.textContent = val;
      }
    }

    // data-row-status: map field value → row status class
    const rowStatus = root.getAttribute && root.getAttribute(ATTR_ROW_STATUS);
    if (rowStatus) {
      const rawMap = root.getAttribute(ATTR_STATUS_MAP);
      if (rawMap) {
        try {
          const map = JSON.parse(rawMap);
          const rawVal = deepGet(data, rowStatus);
          const mapped = map[rawVal] || map['*'] || rawVal;
          applyStatusClass(root, 'vg-row', mapped);
        } catch (e) {}
      }
    }

    // Recurse into children, handling data-each
    const children = Array.from(root.children || []);
    for (const child of children) {
      const eachField = child.getAttribute && child.getAttribute(ATTR_EACH);
      if (eachField !== null) {
        renderEach(child, deepGet(data, eachField) || []);
      } else {
        renderNode(child, data);
      }
    }
  }

  // ── Render a list container with data-each ──────────────────
  function renderEach(container, items) {
    const tmpl = container.querySelector(':scope > template');
    if (!tmpl) return;

    // Remove previously rendered nodes (not the template)
    Array.from(container.children).forEach(c => {
      if (c !== tmpl) c.remove();
    });

    items.forEach((item, idx) => {
      const clone = tmpl.content.cloneNode(true);
      // Handle data-row-status on <tr> inside clone
      clone.querySelectorAll('[data-row-status]').forEach(el => {
        const field = el.getAttribute(ATTR_ROW_STATUS);
        const rawMap = el.getAttribute(ATTR_STATUS_MAP);
        if (rawMap) {
          try {
            const map = JSON.parse(rawMap);
            const rawVal = deepGet(item, field);
            const mapped = map[rawVal] || map['*'] || rawVal;
            applyStatusClass(el, 'vg-row', mapped);
          } catch (e) {}
        }
      });
      // Render all bind nodes in clone
      clone.querySelectorAll('[data-bind]').forEach(el => renderNode(el, item));
      // Render nested data-if
      clone.querySelectorAll('[data-if]').forEach(el => {
        const field = el.getAttribute(ATTR_IF);
        if (!deepGet(item, field)) el.style.display = 'none';
      });
      clone.querySelectorAll('[data-if-not]').forEach(el => {
        const field = el.getAttribute(ATTR_IF_NOT);
        if (deepGet(item, field)) el.style.display = 'none';
      });
      container.appendChild(clone);
    });
  }

  // ── PanelController ─────────────────────────────────────────
  class PanelController {
    constructor(el, options) {
      this.el           = el;
      this.src          = el.getAttribute(ATTR_SRC);
      this.pollInterval = parseInt(el.getAttribute(ATTR_POLL), 10) || 0;
      this.options      = options || {};

      this._timer        = null;
      this._consecutive_errors = 0;
      this._paused       = false;
      this._lastUpdated  = null;

      // Find loading overlay if present
      this._loadingEl = el.querySelector('.vg-panel__loading');
      this._metaEl    = el.querySelector('.vg-panel__meta[data-role="updated"]');
    }

    start() {
      this._fetch(true); // initial load
      if (this.pollInterval > 0) {
        this._timer = setInterval(() => {
          if (!this._paused && !document.hidden) this._fetch();
        }, this.pollInterval);
      }

      // Pause on tab hidden
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !this._paused && this.pollInterval > 0) {
          this._fetch(); // immediate refresh on tab focus
        }
      });
    }

    pause()  { this._paused = true; }
    resume() { this._paused = false; this._fetch(); }
    refresh(){ this._fetch(); }

    destroy() {
      if (this._timer) clearInterval(this._timer);
    }

    async _fetch(isInitial = false) {
      if (!this.src) return;
      if (isInitial) this._setLoading(true);

      try {
        const res = await fetch(this.src, {
          headers: { 'Accept': 'application/json', 'X-Vigil-Poll': '1' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        this._consecutive_errors = 0;
        this._lastUpdated = new Date();
        this._render(data);
        this._setStale(false);
        this._setError(false);
        this._flashRefresh();
        this._updateMeta();

        this.el.dispatchEvent(new CustomEvent('vigil:update', { detail: data, bubbles: true }));
      } catch (err) {
        this._consecutive_errors++;
        if (this._consecutive_errors >= 2) this._setStale(true);
        if (this._consecutive_errors >= 4) this._setError(true);
        this.el.dispatchEvent(new CustomEvent('vigil:error', { detail: err, bubbles: true }));
        console.warn('[Vigil] Fetch error for', this.src, err);
      } finally {
        if (isInitial) this._setLoading(false);
      }
    }

    _render(data) {
      // Find all data-each containers at top level
      const eachEls = this.el.querySelectorAll('[data-each]');
      eachEls.forEach(container => {
        const field = container.getAttribute(ATTR_EACH);
        renderEach(container, deepGet(data, field) || []);
      });

      // Bind all top-level data-bind elements (not inside data-each)
      this.el.querySelectorAll('[data-bind]').forEach(el => {
        // Skip if inside a data-each (those are rendered per-item)
        if (el.closest('[data-each]')) return;
        renderNode(el, data);
      });

      // Handle data-if at panel level
      this.el.querySelectorAll('[data-if]').forEach(el => {
        if (el.closest('[data-each]')) return;
        const field = el.getAttribute(ATTR_IF);
        el.style.display = deepGet(data, field) ? '' : 'none';
      });
    }

    _setLoading(on) {
      this.el.classList.toggle('vg-panel--loading', on);
    }

    _setStale(on) {
      this.el.classList.toggle('vg-panel--stale', on);
    }

    _setError(on) {
      this.el.classList.toggle('vg-panel--error', on);
    }

    _flashRefresh() {
      this.el.classList.remove('vg-panel--refreshed');
      void this.el.offsetWidth; // reflow
      this.el.classList.add('vg-panel--refreshed');
      setTimeout(() => this.el.classList.remove('vg-panel--refreshed'), 500);
    }

    _updateMeta() {
      if (this._metaEl && this._lastUpdated) {
        this._metaEl.textContent = 'Updated ' + formatters.relative(this._lastUpdated);
      }
    }
  }

  // ── KPI Controller (lighter weight) ────────────────────────
  class KpiController {
    constructor(el) {
      this.el           = el;
      this.src          = el.getAttribute(ATTR_SRC);
      this.pollInterval = parseInt(el.getAttribute(ATTR_POLL), 10) || 0;
      this._timer       = null;
      this._paused      = false;
    }

    start() {
      this._fetch();
      if (this.pollInterval > 0) {
        this._timer = setInterval(() => {
          if (!this._paused && !document.hidden) this._fetch();
        }, this.pollInterval);
      }
    }

    pause()  { this._paused = true; }
    resume() { this._paused = false; this._fetch(); }
    refresh(){ this._fetch(); }
    destroy(){ if (this._timer) clearInterval(this._timer); }

    async _fetch() {
      try {
        const res  = await fetch(this.src, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        this._render(data);
        this.el.dispatchEvent(new CustomEvent('vigil:update', { detail: data, bubbles: true }));
      } catch (err) {
        console.warn('[Vigil] KPI fetch error', this.src, err);
      }
    }

    _render(data) {
      this.el.querySelectorAll('[data-bind]').forEach(el => renderNode(el, data));
      // Update accent colour from data
      const status = deepGet(data, 'status');
      if (status) {
        ['vg-kpi--pass','vg-kpi--fail','vg-kpi--warn','vg-kpi--running'].forEach(c =>
          this.el.classList.remove(c));
        if (['pass','fail','warn','running'].includes(status)) {
          this.el.classList.add('vg-kpi--' + status);
        }
      }
    }
  }

  // ── Global Refresh Indicator ────────────────────────────────
  class RefreshIndicator {
    constructor(el) {
      this.dot  = el.querySelector('.vg-topbar__refresh-dot');
      this.text = el.querySelector('.vg-topbar__refresh-text');
      this._lastUpdate = null;
      this._timer = setInterval(() => this._tick(), 5000);
    }

    update() {
      this._lastUpdate = new Date();
      if (this.dot) {
        this.dot.className = 'vg-topbar__refresh-dot vg-topbar__refresh-dot--active';
        setTimeout(() => {
          if (this.dot) this.dot.className = 'vg-topbar__refresh-dot';
        }, 800);
      }
      this._tick();
    }

    _tick() {
      if (this.text && this._lastUpdate) {
        this.text.textContent = formatters.relative(this._lastUpdate);
      }
    }

    error() {
      if (this.dot) this.dot.className = 'vg-topbar__refresh-dot vg-topbar__refresh-dot--stale';
    }

    destroy() { clearInterval(this._timer); }
  }

  // ── FilterGroupController ───────────────────────────────────
  class FilterGroupController {
    constructor(groupEl) {
      this.el        = groupEl;
      this.groupName = groupEl.getAttribute('data-vg-filter-group');
      this._params   = {};
      this._paramEls = [];

      groupEl.querySelectorAll('[data-vg-src-param]').forEach(el => {
        const paramName = el.getAttribute('data-vg-src-param');
        this._paramEls.push({ el, paramName });
        if (el.value) this._params[paramName] = el.value;

        el.addEventListener('change', () => {
          this._params[paramName] = el.value || '';
          this._applyFilters();
        });
      });
    }

    _applyFilters() {
      const controllersInGroup = _controllers.filter(c =>
        this.el.contains(c.el) || c.el.closest('[data-vg-filter-group="' + this.groupName + '"]')
      );

      controllersInGroup.forEach(c => c.pause());

      controllersInGroup.forEach(c => {
        if (!c._baseSrc) c._baseSrc = c.src;
        const url = new URL(c._baseSrc, window.location.origin);
        for (const [k, v] of Object.entries(this._params)) {
          if (v) url.searchParams.set(k, v);
          else url.searchParams.delete(k);
        }
        c.src = url.pathname + url.search;
      });

      controllersInGroup.forEach(c => c.resume());
    }
  }

  // ── SparklineRenderer ──────────────────────────────────────
  function renderSparkline(svgEl, values, options) {
    if (!Array.isArray(values) || values.length < 2) return;

    const nums = values.map(Number).filter(n => !isNaN(n));
    if (nums.length < 2) return;

    const w = svgEl.getAttribute('width')  || svgEl.clientWidth  || 80;
    const h = svgEl.getAttribute('height') || svgEl.clientHeight || 20;
    svgEl.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svgEl.setAttribute('preserveAspectRatio', 'none');

    const min   = Math.min(...nums);
    const max   = Math.max(...nums);
    const range = max - min || 1;
    const pad   = 1;

    const points = nums.map((v, i) => {
      const x = (i / (nums.length - 1)) * (w - pad * 2) + pad;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    });

    const color = options.color || 'var(--vg-accent)';
    const type  = options.type  || 'line';

    while (svgEl.firstChild) svgEl.firstChild.remove();

    if (type === 'area') {
      const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const areaPoints = pad + ',' + h + ' ' + points.join(' ') + ' ' + (w - pad) + ',' + h;
      area.setAttribute('points', areaPoints);
      area.setAttribute('fill', color);
      area.setAttribute('opacity', '0.15');
      svgEl.appendChild(area);
    }

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('points', points.join(' '));
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    svgEl.appendChild(line);
  }

  // ── WsPanelController ──────────────────────────────────────
  class WsPanelController {
    constructor(el, options) {
      this.el          = el;
      this.wsUrl       = el.getAttribute('data-ws');
      this.wsEvent     = el.getAttribute('data-ws-event') || null;
      this.options     = options || {};

      this._ws         = null;
      this._paused     = false;
      this._destroyed  = false;
      this._retryCount = 0;
      this._retryTimer = null;
      this._lastUpdated = null;

      this._loadingEl = el.querySelector('.vg-panel__loading');
      this._metaEl    = el.querySelector('.vg-panel__meta[data-role="updated"]');
    }

    start() {
      this._setLoading(true);
      this._connect();
    }

    pause()  { this._paused = true; }
    resume() { this._paused = false; }

    refresh() {
      if (this._ws) {
        this._ws.close();
        this._ws = null;
      }
      this._retryCount = 0;
      this._connect();
    }

    destroy() {
      this._destroyed = true;
      if (this._retryTimer) clearTimeout(this._retryTimer);
      if (this._ws) {
        this._ws.close();
        this._ws = null;
      }
    }

    _connect() {
      if (this._destroyed || !this.wsUrl) return;

      try {
        this._ws = new WebSocket(this.wsUrl);
      } catch (err) {
        console.warn('[Vigil] WebSocket connection error', this.wsUrl, err);
        this._scheduleReconnect();
        return;
      }

      this._ws.addEventListener('open', () => {
        this._retryCount = 0;
        this._setLoading(false);
        this.el.classList.remove('vg-panel--stale', 'vg-panel--error');
      });

      this._ws.addEventListener('message', (event) => {
        if (this._paused) return;
        try {
          const msg = JSON.parse(event.data);

          if (this.wsEvent) {
            const eventType = msg.event || msg.type || msg._event;
            if (eventType !== this.wsEvent) return;
          }

          const data = msg.data || msg.payload || msg;
          this._lastUpdated = new Date();
          this._render(data);
          this._updateMeta();

          this.el.dispatchEvent(new CustomEvent('vigil:update', { detail: data, bubbles: true }));
        } catch (err) {
          console.warn('[Vigil] WebSocket message parse error', err);
        }
      });

      this._ws.addEventListener('close', () => {
        if (!this._destroyed) this._scheduleReconnect();
      });

      this._ws.addEventListener('error', () => {
        this.el.classList.add('vg-panel--stale');
        this.el.dispatchEvent(new CustomEvent('vigil:error', { detail: new Error('WebSocket error'), bubbles: true }));
      });
    }

    _scheduleReconnect() {
      if (this._destroyed) return;
      this._retryCount++;
      const delay = Math.min(1000 * Math.pow(2, this._retryCount - 1), 30000);
      if (this._retryCount >= 2) this.el.classList.add('vg-panel--stale');
      if (this._retryCount >= 4) this.el.classList.add('vg-panel--error');
      this._retryTimer = setTimeout(() => this._connect(), delay);
    }

    _render(data) {
      const eachEls = this.el.querySelectorAll('[data-each]');
      eachEls.forEach(container => {
        const field = container.getAttribute(ATTR_EACH);
        renderEach(container, deepGet(data, field) || []);
      });

      this.el.querySelectorAll('[data-bind]').forEach(el => {
        if (el.closest('[data-each]')) return;
        renderNode(el, data);
      });
    }

    _setLoading(on) {
      this.el.classList.toggle('vg-panel--loading', on);
    }

    _updateMeta() {
      if (this._metaEl && this._lastUpdated) {
        this._metaEl.textContent = 'Updated ' + formatters.relative(this._lastUpdated);
      }
    }
  }

  // ── Sidebar collapse toggle ─────────────────────────────────
  function initSidebar() {
    document.querySelectorAll('[data-vg-toggle="sidebar"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const shell = document.querySelector('.vg-shell');
        if (shell) shell.classList.toggle('vg-shell--collapsed');
      });
    });
  }

  // ── Table sort ─────────────────────────────────────────────
  function initTableSort() {
    document.querySelectorAll('.vg-table thead th.vg-col-sort').forEach(th => {
      th.addEventListener('click', () => {
        const table = th.closest('.vg-table');
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const col = Array.from(th.parentElement.children).indexOf(th);
        const isAsc = th.classList.contains('asc');

        th.parentElement.querySelectorAll('th').forEach(t =>
          t.classList.remove('asc', 'desc'));

        th.classList.add(isAsc ? 'desc' : 'asc');

        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort((a, b) => {
          const av = (a.cells[col] || {}).textContent || '';
          const bv = (b.cells[col] || {}).textContent || '';
          const n  = Number(av) - Number(bv);
          if (!isNaN(n)) return isAsc ? -n : n;
          return isAsc ? bv.localeCompare(av) : av.localeCompare(bv);
        });
        rows.forEach(r => tbody.appendChild(r));
      });
    });
  }

  // ── Manual refresh button ───────────────────────────────────
  function initRefreshButtons() {
    document.querySelectorAll('[data-vg-action="refresh"]').forEach(btn => {
      btn.addEventListener('click', () => Vigil.refresh());
    });
    document.querySelectorAll('[data-vg-action="pause"]').forEach(btn => {
      let paused = false;
      btn.addEventListener('click', () => {
        paused = !paused;
        if (paused) { Vigil.pause(); btn.textContent = '▶'; btn.title = 'Resume'; }
        else        { Vigil.resume(); btn.textContent = '⏸'; btn.title = 'Pause'; }
      });
    });
  }

  // ── Global relative-time ticker ────────────────────────────
  function initRelativeTimes() {
    setInterval(() => {
      document.querySelectorAll('[data-format="relative"][data-live-value]').forEach(el => {
        const val = el.getAttribute('data-live-value');
        el.textContent = formatters.relative(val);
      });
    }, 10000);
  }

  // ── Public API ─────────────────────────────────────────────
  const _controllers    = [];
  const _filterGroups   = [];
  let   _indicator      = null;

  const Vigil = {
    formatters,
    transforms,

    /**
     * Register a custom formatter.
     * Vigil.registerFormatter('myFmt', v => v.toUpperCase())
     */
    registerFormatter(name, fn) {
      formatters[name] = fn;
    },

    /**
     * Register a custom transform.
     * Transforms run before formatters on data-bind values.
     * Vigil.registerTransform('truncate', (v, data) => String(v).slice(0, 50))
     */
    registerTransform(name, fn) {
      transforms[name] = fn;
    },

    /**
     * Manually initialise a specific element as a polled panel.
     * Elements with data-ws use WebSocket; data-src uses HTTP polling.
     */
    mount(el, options) {
      let ctrl;

      if (el.getAttribute('data-ws')) {
        ctrl = new WsPanelController(el, options);
      } else {
        const role = el.getAttribute('data-vg-role') || 'panel';
        if (role === 'kpi' || el.classList.contains('vg-kpi')) {
          ctrl = new KpiController(el, options);
        } else {
          ctrl = new PanelController(el, options);
        }
      }

      _controllers.push(ctrl);
      ctrl.start();

      el.addEventListener('vigil:update', () => {
        if (_indicator) _indicator.update();
      });
      el.addEventListener('vigil:error', () => {
        if (_indicator) _indicator.error();
      });

      return ctrl;
    },

    /** Force all polled components to fetch immediately. */
    refresh() {
      _controllers.forEach(c => c.refresh());
    },

    /** Pause all polling. */
    pause() {
      _controllers.forEach(c => c.pause());
    },

    /** Resume all polling. */
    resume() {
      _controllers.forEach(c => c.resume());
    },

    /** Render arbitrary data into an element right now. */
    render(el, data) {
      renderEach; // ensure loaded
      renderNode(el, data);
    },

    /** Expose formatters directly for use in custom code. */
    format(name, value) {
      return formatters[name] ? formatters[name](value) : value;
    },

    /** Programmatically render a sparkline into an SVG element. */
    sparkline(svgEl, values, options) {
      renderSparkline(svgEl, values, options || {});
    },

    /**
     * Auto-scan the DOM and initialise all polled/WS elements.
     * Called automatically on DOMContentLoaded.
     */
    init() {
      const indicatorEl = document.querySelector('[data-vg-role="refresh-indicator"]');
      if (indicatorEl) _indicator = new RefreshIndicator(indicatorEl);

      // HTTP-polled elements
      document.querySelectorAll('[data-src]').forEach(el => {
        this.mount(el);
      });

      // WebSocket elements (that don't also have data-src)
      document.querySelectorAll('[data-ws]:not([data-src])').forEach(el => {
        this.mount(el);
      });

      // Filter groups
      document.querySelectorAll('[data-vg-filter-group]').forEach(el => {
        _filterGroups.push(new FilterGroupController(el));
      });

      initSidebar();
      initTableSort();
      initRefreshButtons();
      initRelativeTimes();
    },
  };

  document.addEventListener('DOMContentLoaded', () => Vigil.init());
  global.Vigil = Vigil;

})(window);
