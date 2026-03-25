# Vigil

**Declarative live dashboards from plain HTML — zero dependencies, one script tag.**

A lightweight framework for building live dashboards from plain HTML. Drop in two files, add `data-` attributes, and any JSON API becomes a real-time dashboard — no build step, no framework lock-in. Works for ops monitoring, CI/CD, IoT, analytics, support queues, or anything with an API.

## Features

- **Zero dependencies** — two files (`vigil.js` + `vigil.css`), no build step
- **Declarative polling** — `data-src` + `data-poll` on any element
- **Data binding** — `data-bind`, `data-each`, `data-if`, `data-if-not`
- **Seven-status system** — `success` · `fail` · `running` · `warn` · `skipped` · `cancelled` · `unknown`
- **WebSocket panels** — `data-ws` for push-based live feeds with auto-reconnect
- **Filter groups** — shared filter state across panels via `data-vg-filter-group`
- **Sparklines** — inline SVG trend graphs with `line` and `area` modes
- **Container queries** — panels self-adapt to their width, not the viewport
- **Dark & light themes** — dark-first with a toggle; data-density modes
- **Responsive grid** — 12-column with `md` / `lg` breakpoints
- **Form system** — `vg-form`, `vg-field`, `vg-label`, `vg-input`, `vg-checkbox`, `vg-toggle`, `vg-radio-group`, `vg-field-grid`, `vg-action-row`
- **Card primitives** — `vg-card` with `--muted`, `--accent`, `--tinted`, and status-accented variants
- **Banner / alert** — `vg-banner` with `--success`, `--fail`, `--warn`, `--info` semantic variants
- **Nested surfaces** — `vg-surface` layers (`--muted`, `--accent`, `--hero`, `--glass`) for sub-panel interiors
- **Hero / masthead** — `vg-hero` with title, subtitle, and toolbar alignment
- **Auto-fit grids** — `vg-card-grid`, `vg-metric-grid` with `repeat(auto-fit, ...)` sizing
- **Chips & metadata** — `vg-chip`, `vg-meta-row`, `vg-toolbar`, `vg-cluster` inline layout primitives
- **Section blocks** — `vg-section` with `__title` and `__meta` for reusable headings
- **Empty state** — `vg-empty` with icon, title, text, and action slot
- **Brand block** — `vg-brand` + `vg-brand__mark` identity row
- **~8 KB JS · ~20 KB CSS** (ungzipped)

## Quick Start

```html
<link rel="stylesheet" href="vigil.css">
<script src="vigil.js"></script>

<div class="vg-shell">
  <main class="vg-main">
    <div class="vg-panel" data-src="/api/builds" data-poll="5000">
      <div class="vg-panel__header">
        <h2 class="vg-panel__title">Recent Builds</h2>
      </div>
      <div class="vg-panel__body">
        <table class="vg-table">
          <tbody data-each="items">
            <template>
              <tr>
                <td data-bind="name"></td>
                <td data-bind="duration_ms" data-format="duration"></td>
                <td data-bind="started" data-format="relative"></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="vg-panel__loading"><span class="vg-spinner"></span></div>
    </div>
  </main>
</div>
```

Open the page — `Vigil.init()` fires on `DOMContentLoaded` and starts polling automatically.

## Running the Demo

```bash
npx serve . -p 3000
# Open http://localhost:3000/demo/
```

The demo is a multi-page dashboard showcasing every Vigil feature:

| Page | URL | Features demonstrated |
|------|-----|----------------------|
| **Overview** | `demo/index.html` | KPI cards, sparklines, pipeline summary, runner summary, live log |
| **Pipelines** | `demo/pipelines.html` | Full pipeline list with stage bars, WebSocket deployment feed |
| **Test Runs** | `demo/testruns.html` | Filterable table, filter groups, pass-rate ring, 24h trend chart, flaky features |
| **Runners** | `demo/runners.html` | Runner card grid, progress bars, container queries, activity log |
| **Trends** | `demo/trends.html` | 7-day run volume chart, daily breakdown table, pass rate by suite with sparklines |
| **Failures** | `demo/failures.html` | Failure type breakdown, recent failures table, flakiest features analysis |
| **Settings** | `demo/settings.html` | Text inputs, selects, toggles, radio groups, range slider, number inputs, textareas, form layout |
| **Components** | `demo/components.html` | Full component library: hero, banners, cards, chips, surfaces, sections, brand, empty state, metric grid, form system |

All pages share a mock API layer (`demo/demo-mock.js`) that patches `fetch()` and `WebSocket` in-browser. Sidebar navigation links work across all eight pages.

## Architecture

| File | Description |
|------|-------------|
| `vigil.css` | Design tokens, component styles, animations, light/dark themes, container queries |
| `vigil.js` | Runtime engine: polling, data binding, formatters, WebSocket, sparklines, filter groups |
| `demo/` | Multi-page reference dashboard with all components demonstrated |
| `demo/demo.css` | Demo-specific styles (runner rows, chart bars, KPI grid, runner cards) |
| `demo/demo-mock.js` | Mock API + WebSocket layer that patches `fetch()` and `WebSocket` for the demo |

### Design Principles

- **Declarative first** — polling, binding, and status mapping are expressed in HTML attributes
- **Data density by default** — compact, monospace-for-numbers, information-dense layouts
- **Status as a first-class concept** — seven semantic statuses with consistent colours everywhere
- **Zero vendor lock-in** — chart-library-agnostic; provides container primitives only
- **Dark-first** — light theme is a toggle, not the default

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| `data-src` | URL to fetch (JSON). Polled via `fetch()` with `Accept: application/json`. |
| `data-poll` | Polling interval in milliseconds. Omit to fetch once on load. |
| `data-bind` | Dot-path into JSON response to bind to element text. e.g. `data-bind="item.name"` |
| `data-each` | Dot-path to a JSON array. Repeats child `<template>` for each item. |
| `data-if` | Hides element if the named field is falsy. |
| `data-if-not` | Hides element if the named field is truthy. |
| `data-format` | Named formatter to apply before rendering. |
| `data-status-map` | JSON object mapping API values to Vigil status names. |
| `data-row-status` | On a `<tr>`, maps a field value to a `vg-row--*` class. |
| `data-transform` | Name of a registered transform function applied to the raw value before formatting. |
| `data-vg-filter-group` | Groups panels and filter controls into a shared filter scope. |
| `data-vg-src-param` | On a `<select>` or `<input>`, names the query parameter added to `data-src` URLs in the same filter group. |
| `data-ws` | WebSocket URL. Element receives pushed data instead of HTTP polling. |
| `data-ws-event` | Filter WebSocket messages by event type (checks `event`, `type`, or `_event` fields). |
| `data-sparkline-color` | CSS colour for sparkline stroke/fill. Default: `var(--vg-accent)`. |
| `data-sparkline-type` | `line` (default) or `area`. Area adds a filled polygon beneath the line. |
| `data-headers` | JSON object of extra HTTP headers to send with this panel's fetch. Merged with global headers. |
| `data-response-map` | Name of a registered response map function that reshapes the raw JSON before rendering. |
| `data-proxy` | CORS proxy URL prefix. The `data-src` path is appended to this URL. Overrides global proxy for this panel. |

## Built-in Formatters

| Name | Example | Description |
|------|---------|-------------|
| `duration` | `2m 34s` | Milliseconds to human-readable duration |
| `relative` | `3m ago` | ISO date to relative time (auto-refreshes every 10s) |
| `number` | `12,345` | Locale-formatted integer |
| `percent` | `94.2%` | Fixed to 1 decimal place |
| `successrate` | `88.0%` | Alias for percent, semantic for success-rate KPIs |
| `passrate` | `88.0%` | Alias for `successrate` (backward-compatible) |
| `date` | `23/01/2025, 14:30` | Full locale date/time |
| `short_date` | `23/01/2025` | Date only |
| `uppercase` | `MAIN` | Uppercases string value |
| `lowercase` | `main` | Lowercases string value |

Custom formatters:

```js
Vigil.registerFormatter("sha", v => v.slice(0, 7));
Vigil.registerFormatter("mb",  v => (v / 1048576).toFixed(1) + " MB");
```

## JavaScript API

### Global Methods

| Method | Description |
|--------|-------------|
| `Vigil.configure(opts)` | Set global config: `headers`, `proxy`. See [Connecting to Real APIs](#connecting-to-real-apis). |
| `Vigil.refresh()` | Force all polled components to fetch immediately |
| `Vigil.pause()` | Pause all polling |
| `Vigil.resume()` | Resume all polling and immediately fetch |
| `Vigil.mount(el, opts)` | Manually init an element as a polled component; returns controller |
| `Vigil.render(el, data)` | Render JSON data into an element without polling |
| `Vigil.format(name, value)` | Apply a named formatter and return the result |
| `Vigil.registerFormatter(name, fn)` | Register a custom formatter |
| `Vigil.registerTransform(name, fn)` | Register a custom transform function |
| `Vigil.registerResponseMap(name, fn)` | Register a response map that reshapes raw JSON before rendering |
| `Vigil.sparkline(svgEl, values, opts)` | Render a sparkline into an SVG element programmatically |

### Controller API

```js
const ctrl = Vigil.mount(document.getElementById('my-panel'));
ctrl.refresh();   // Fetch now
ctrl.pause();     // Stop polling
ctrl.resume();    // Resume + immediate fetch
ctrl.destroy();   // Clear timer
```

### Custom Events

| Event | `detail` | Fired when |
|-------|----------|------------|
| `vigil:update` | Parsed JSON response | Every successful fetch |
| `vigil:error` | Error object | Every failed fetch |

### Data-Action Buttons

| Attribute | Behaviour |
|-----------|-----------|
| `data-vg-action="refresh"` | Calls `Vigil.refresh()` on click |
| `data-vg-action="pause"` | Toggles pause/resume |
| `data-vg-toggle="sidebar"` | Toggles `vg-shell--collapsed` |

## Filter Groups

Group panels with shared filter controls:

```html
<div data-vg-filter-group="test-runs">
  <select data-vg-src-param="branch">
    <option value="">All branches</option>
    <option value="main">main</option>
  </select>
  <div class="vg-panel" data-src="/api/runs" data-poll="5000">...</div>
</div>
```

When the select changes, all `data-src` panels in the group are re-fetched with `?branch=main` appended.

## Sparklines

Bind an array of numbers to an SVG with the `vg-sparkline` class:

```html
<svg class="vg-sparkline vg-sparkline--lg"
     data-bind="trend"
     data-sparkline-color="var(--vg-success)"
     data-sparkline-type="area"
     width="120" height="24"></svg>
```

Size classes: `--sm` (48×16), `--md` (80×20), `--lg` (120×28), `--xl` (160×36).

## WebSocket Panels

Use `data-ws` instead of `data-src` for push-based updates:

```html
<div class="vg-panel" data-ws="wss://api.example.com/builds">
  <div data-bind="name"></div>
  <div data-bind="status"></div>
</div>
```

Optionally filter by event type with `data-ws-event="build.updated"`. Reconnects automatically with exponential backoff (1s → 30s).

## Connecting to Real APIs

Vigil can hit external APIs directly from the browser — no server.js needed. Three features work together to make this possible:

### Global Headers (auth tokens)

Set headers once and they apply to every `data-src` fetch:

```js
Vigil.configure({
  headers: { Authorization: 'Bearer eyJhbG...' }
});
```

### Per-Panel Headers

Override or add headers on individual panels via `data-headers`:

```html
<div class="vg-panel"
     data-src="https://rp.example.com/api/v1/project/launches"
     data-headers='{"Authorization":"Bearer xxx","X-Project":"my-project"}'>
  ...
</div>
```

Per-panel headers are merged with global headers (panel wins on conflict).

### Response Maps (reshape API responses)

External APIs rarely return the exact shape your template expects. Register a response map to transform the raw JSON before Vigil renders it:

```js
Vigil.registerResponseMap('mapLaunches', raw => ({
  items: raw.content.map(launch => ({
    name:   launch.name,
    status: launch.status.toLowerCase(),
    total:  launch.statistics.executions.total,
    passed: launch.statistics.executions.passed,
    failed: launch.statistics.executions.failed,
    date:   launch.startTime,
  }))
}));
```

Then reference it on the panel:

```html
<div class="vg-panel"
     data-src="https://rp.example.com/api/v1/project/launch"
     data-response-map="mapLaunches"
     data-poll="30000">
  <table class="vg-table">
    <tbody data-each="items">
      <template>
        <tr>
          <td data-bind="name"></td>
          <td data-bind="status"></td>
          <td data-bind="passed"></td>
          <td data-bind="failed"></td>
        </tr>
      </template>
    </tbody>
  </table>
</div>
```

### CORS Proxy

If the target API doesn't send `Access-Control-Allow-Origin` headers, route requests through a CORS proxy:

```js
// Global — applies to all panels
Vigil.configure({
  proxy: 'https://cors-proxy.example.com/'
});
```

```html
<!-- Per-panel override -->
<div class="vg-panel"
     data-src="/api/v1/launches"
     data-proxy="https://my-proxy.example.com/">
  ...
</div>
```

With proxy set, a `data-src="/api/v1/launches"` becomes `fetch('https://cors-proxy.example.com/api/v1/launches')`.

Alternatively, enable CORS on your API server by adding `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers` response headers.

## Container Queries

Panels use CSS container queries for self-responsive layout. A narrow panel (<320px) automatically compacts its header and table cells. Wide panels (>600px) gain extra padding. Panels respond to their own width, not the viewport.

## Theming

### Dark (default)

No attribute needed. Uses `--vg-bg: #0D1117` and related dark tokens.

### Light

```html
<html data-vg-theme="light">
```

Or toggle via JS:

```js
document.documentElement.setAttribute('data-vg-theme',
  current === 'light' ? '' : 'light');
```

### Data Density

```html
<div data-vg-density="compact">...</div>
<div data-vg-density="comfortable">...</div>
```

## Responsive Grid

12-column grid with responsive breakpoints:

```html
<div class="vg-col-12 vg-col-md-6 vg-col-lg-4">...</div>
```

| Prefix | Breakpoint |
|--------|-----------|
| (none) | All sizes (mobile-first) |
| `vg-col-md-*` | ≥ 768px |
| `vg-col-lg-*` | ≥ 1200px |

On screens below 768px the sidebar hides and panels stack full-width.

## Status System

Seven semantic statuses with consistent colours across all components:

| Status | Colour | Use case |
|--------|--------|----------|
| `success` | `#3FB950` | Successful outcome, passing test, healthy runner |
| `fail` | `#F85149` | Failed build, failing test, runner error |
| `running` | `#388BFD` | In-progress task, active job, busy state |
| `warn` | `#D29922` | Stale data, high load, degraded state |
| `skipped` | `#6E7681` | Deliberately skipped step or scenario |
| `cancelled` | `#8957E5` | Manually cancelled task or job |
| `unknown` | `#484F58` | No data, pending first fetch |

## Component Primitives

### Cards

```html
<div class="vg-card vg-card--accent">
  <div class="vg-card__header"><span class="vg-card__title">Title</span></div>
  <div class="vg-card__body">Content</div>
  <div class="vg-card__footer">Footer</div>
</div>
```

Variants: `--muted`, `--accent`, `--tinted`, `--flat`, `--success`, `--fail`, `--warn`, `--info`.

### Banners

```html
<div class="vg-banner vg-banner--warn">
  <span class="vg-banner__icon">⚠</span>
  <div class="vg-banner__body">
    <div class="vg-banner__title">Heading</div>
    <div class="vg-banner__text">Detail text.</div>
  </div>
</div>
```

Variants: `--success`, `--fail`, `--warn`, `--info`, `--compact`.

### Surfaces

Nested backgrounds inside panels: `vg-surface`, `vg-surface--muted`, `vg-surface--accent`, `vg-surface--hero`, `vg-surface--glass`.

### Chips & Clusters

```html
<div class="vg-cluster">
  <span class="vg-chip vg-chip--success">passed</span>
  <span class="vg-chip vg-chip--fail vg-chip--removable">failed</span>
</div>
```

### Form System

```html
<div class="vg-form">
  <div class="vg-field">
    <div class="vg-label">
      <div class="vg-label__text">Name</div>
      <div class="vg-label__hint">Optional help text</div>
    </div>
    <div class="vg-field__control">
      <input type="text" class="vg-input">
    </div>
  </div>
  <div class="vg-action-row">
    <button class="vg-btn vg-btn--primary">Save</button>
  </div>
</div>
```

Also includes `vg-checkbox`, `vg-toggle`, `vg-radio-group`, `vg-input-group`, and `vg-field-grid` for multi-column layouts.

### Hero

```html
<div class="vg-hero">
  <div class="vg-hero__row">
    <div class="vg-hero__content">
      <div class="vg-hero__title">Dashboard</div>
      <div class="vg-hero__subtitle">Description text</div>
    </div>
    <div class="vg-hero__toolbar">
      <button class="vg-btn vg-btn--primary">Action</button>
    </div>
  </div>
</div>
```

### Auto-fit Grids

```html
<div class="vg-card-grid">...</div>      <!-- auto-fill, 240px min -->
<div class="vg-metric-grid--4">...</div>  <!-- fixed 4-column for KPIs -->
```

Variants: `vg-card-grid--sm` (180px), `vg-card-grid--lg` (320px), `vg-metric-grid--2`, `--3`, `--4`.

### Other Primitives

| Component | Description |
|-----------|-------------|
| `vg-section` | Grouped block with `__title` and `__meta` sub-elements |
| `vg-meta-row` | Inline key-value metadata pairs |
| `vg-toolbar` | Horizontal action strip with `__separator` and `__spacer` |
| `vg-empty` | Empty/no-data state with icon, title, text, and action slot |
| `vg-brand` | Identity row with `vg-brand__mark` and `vg-brand__name` |

## Browser Support

Vigil targets modern evergreen browsers (Chrome, Firefox, Safari, Edge). Internet Explorer is not supported. Container queries require Chrome 105+, Firefox 110+, Safari 16+.

## License

[MIT](LICENSE) — KaladinStorm84 2026
