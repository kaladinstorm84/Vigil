# Vigil

**Declarative live dashboards from plain HTML — zero dependencies, one script tag.**

A lightweight framework for building live monitoring dashboards, purpose-built for CI/CD pipelines, test automation results, and infrastructure health. Drop in two files, add `data-` attributes, and your dashboard is live.

## Features

- **Zero dependencies** — two files (`vigil.js` + `vigil.css`), no build step
- **Declarative polling** — `data-src` + `data-poll` on any element
- **Data binding** — `data-bind`, `data-each`, `data-if`, `data-if-not`
- **Seven-status system** — `pass` · `fail` · `running` · `warn` · `skipped` · `cancelled` · `unknown`
- **WebSocket panels** — `data-ws` for push-based live feeds with auto-reconnect
- **Filter groups** — shared filter state across panels via `data-vg-filter-group`
- **Sparklines** — inline SVG trend graphs with `line` and `area` modes
- **Container queries** — panels self-adapt to their width, not the viewport
- **Dark & light themes** — dark-first with a toggle; data-density modes
- **Responsive grid** — 12-column with `md` / `lg` breakpoints
- **~8 KB JS · ~15 KB CSS** (ungzipped)

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

All pages share a mock API layer (`demo/demo-mock.js`) that patches `fetch()` and `WebSocket` in-browser. Sidebar navigation links work across all pages.

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
| `data-bind` | Dot-path into JSON response to bind to element text. e.g. `data-bind="pipeline.name"` |
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

## Built-in Formatters

| Name | Example | Description |
|------|---------|-------------|
| `duration` | `2m 34s` | Milliseconds to human-readable duration |
| `relative` | `3m ago` | ISO date to relative time (auto-refreshes every 10s) |
| `number` | `12,345` | Locale-formatted integer |
| `percent` | `94.2%` | Fixed to 1 decimal place |
| `passrate` | `88.0%` | Alias for percent, semantic for pass rate KPIs |
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
| `Vigil.refresh()` | Force all polled components to fetch immediately |
| `Vigil.pause()` | Pause all polling |
| `Vigil.resume()` | Resume all polling and immediately fetch |
| `Vigil.mount(el, opts)` | Manually init an element as a polled component; returns controller |
| `Vigil.render(el, data)` | Render JSON data into an element without polling |
| `Vigil.format(name, value)` | Apply a named formatter and return the result |
| `Vigil.registerFormatter(name, fn)` | Register a custom formatter |
| `Vigil.registerTransform(name, fn)` | Register a custom transform function |
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
     data-sparkline-color="var(--vg-pass)"
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

## Container Queries

Panels use CSS container queries for self-responsive layout. A narrow panel (<320px) automatically compacts its header, table cells, and wraps pipeline stages. Wide panels (>600px) gain extra padding.

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
| `pass` | `#3FB950` | Successful build, passing test, healthy runner |
| `fail` | `#F85149` | Failed build, failing test, runner error |
| `running` | `#388BFD` | In-progress pipeline, active test, busy runner |
| `warn` | `#D29922` | Stale data, high load, degraded state |
| `skipped` | `#6E7681` | Deliberately skipped step or scenario |
| `cancelled` | `#8957E5` | Manually cancelled pipeline or run |
| `unknown` | `#484F58` | No data, pending first fetch |

## Browser Support

Vigil targets modern evergreen browsers (Chrome, Firefox, Safari, Edge). Internet Explorer is not supported. Container queries require Chrome 105+, Firefox 110+, Safari 16+.

## License

[MIT](LICENSE) — QMate 2026
