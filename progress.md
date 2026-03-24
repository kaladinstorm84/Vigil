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

## Current State
- Version: **0.3.0**
- Demo: 7 pages (Overview, Pipelines, Test Runs, Runners, Trends, Failures, Settings)
- All features functional with mock data layer
