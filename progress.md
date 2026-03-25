# Progress

## Completed

### Phase 1 — Core Framework (v0.1.0)
- [x] Declarative polling engine (`data-src`, `data-poll`)
- [x] Data binding (`data-bind`, `data-each`, `data-if`, `data-if-not`)
- [x] Seven-status system with consistent colours
- [x] Built-in formatters + custom formatter/transform API
- [x] App shell, responsive 12-column grid, dark/light themes
- [x] Reference demo with mock API layer

### Phase 2 — Filter Groups + Sparklines (v0.2.0)
- [x] `FilterGroupController` — shared filter state across panels
- [x] `SparklineRenderer` — inline SVG trend graphs (line/area)
- [x] Public `Vigil.sparkline()` API

### Phase 3 — WebSocket + Container Queries + Multi-page Demo (v0.3.0)
- [x] `WsPanelController` — WebSocket-based panels with auto-reconnect
- [x] CSS container queries on `.vg-panel`
- [x] Multi-page demo: Overview, Pipelines, Test Runs, Runners
- [x] Demo files separated into `demo/` subfolder
- [x] Open-source prep: LICENSE, CHANGELOG, .gitignore, Git init

### Phase 3.5 — Report Pages
- [x] Trends report page (7-day volume chart, daily breakdown, per-suite pass rate sparklines)
- [x] Failures report page (failure type breakdown, recent failures table, flakiest features)
- [x] Mock API endpoints for `/api/reports/trends` and `/api/reports/failures`
- [x] Sidebar nav updated across all demo pages
- [x] README and CHANGELOG updated

### Phase 3.6 — Settings Page (Form Controls Demo)
- [x] Settings page with comprehensive form controls
- [x] Input types: text, textarea, select, number, range slider, toggle switches, radio groups
- [x] Form layout: label+hint rows, sections, form actions with save confirmation
- [x] Quick toggles panel, notification integrations, runner config, danger zone
- [x] CSS: `.vg-input`, `.vg-toggle`, `.radio-group`, `.form-row`, `.settings-section`
- [x] All 7 sidebar nav links updated

### Phase 4 — API Integration Features
- [x] `Vigil.configure()` for global headers and proxy settings
- [x] `data-headers` attribute for per-panel fetch headers
- [x] `data-response-map` + `Vigil.registerResponseMap()` for panel-level response transforms
- [x] `data-proxy` attribute and global proxy config for CORS workaround
- [x] README updated with "Connecting to Real APIs" section and examples

### Phase 4.1 — Status Rename (pass → success)
- [x] Core CSS: `--vg-pass` → `--vg-success`, all `*--pass` classes → `*--success`
- [x] Core JS: STATUS_CLASSES updated, `successrate` formatter (with `passrate` alias)
- [x] Demo keeps test-domain language ("Pass Rate", "Passed") — status maps translate `"passed"` → `"success"`
- [x] README, CHANGELOG updated to reflect `success` as the framework status name

### Phase 5 — Component Primitives
- [x] Semantic surface tokens: `--vg-surface-hero`, `--vg-surface-soft`, `--vg-surface-tinted`, `--vg-surface-glass`
- [x] `--vg-info` / `--vg-info-bg` status colour for info-level banners
- [x] Section blocks: `vg-section`, `vg-section__title`, `vg-section__meta`
- [x] Card primitives: `vg-card` with header/body/footer and variants (muted, accent, tinted, flat, status-accented)
- [x] Surface layers: `vg-surface`, `vg-surface--muted`, `vg-surface--accent`, `vg-surface--hero`, `vg-surface--glass`
- [x] Form system promoted to core: `vg-form`, `vg-field`, `vg-label`, `vg-input`, `vg-checkbox`, `vg-toggle`, `vg-radio-group`, `vg-field-grid`, `vg-action-row`
- [x] Banner / alert: `vg-banner` with `--success`, `--fail`, `--warn`, `--info`, `--compact`
- [x] Hero / masthead: `vg-hero` with title, subtitle, toolbar
- [x] KPI alert variant: `vg-kpi--alert` with pulsing border
- [x] Auto-fit grids: `vg-card-grid`, `vg-metric-grid` with sizing variants
- [x] Chips: `vg-chip` with status variants and `--removable`
- [x] Inline metadata: `vg-meta-row`, `vg-toolbar`, `vg-cluster`
- [x] Empty state: `vg-empty` with icon, title, text, action
- [x] Brand block: `vg-brand`, `vg-brand__mark`
- [x] Components showcase demo page (`demo/components.html`)
- [x] Settings page migrated to framework classes
- [x] Form controls removed from demo.css, now in vigil.css
- [x] README, CHANGELOG updated with all new components

## Current State
- Version: **0.3.0**
- Demo: 8 pages (Overview, Pipelines, Test Runs, Runners, Trends, Failures, Settings, Components)
- All features functional with mock data layer
