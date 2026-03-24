# Changelog

All notable changes to Vigil are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.0] — 2026-03-24

### Added
- **WebSocket panels** — `data-ws` attribute for push-based live updates with automatic reconnection (exponential backoff, 1s–30s)
- **WebSocket event filtering** — `data-ws-event` to filter incoming messages by event type
- **CSS container queries** on `.vg-panel` for self-responsive layouts (compact at <320px, spacious at >600px)
- **Multi-page demo** — Overview, Pipelines, Test Runs, Runners, Trends, and Failures pages under `demo/`
- Deployment Feed demo panel showcasing WebSocket integration with a `MockWebSocket` shim
- Runner card grid layout on the dedicated Runners page
- **Trends report page** — 7-day run volume chart, daily breakdown table, pass rate by suite with sparklines
- **Failures report page** — failure type breakdown with progress bars, recent failures table, flakiest features analysis
- **Settings page** — comprehensive form controls demo (text inputs, selects, toggles, radio groups, range slider, number inputs, textareas, danger zone)

### Changed
- Demo files moved to `demo/` subfolder to separate framework source from demo
- Version strings bumped to 0.3.0 across `vigil.js`, `vigil.css`, `package.json`

## [0.2.0] — 2026-03-23

### Added
- **Filter groups** — `data-vg-filter-group` and `data-vg-src-param` for shared filter state across panels
- **Sparklines** — `vg-sparkline` SVG component with `line`/`area` types, colour customisation, and size classes (`--sm`, `--md`, `--lg`, `--xl`)
- `Vigil.sparkline()` public API for programmatic sparkline rendering

## [0.1.0] — 2026-03-23

### Added
- Core declarative polling engine (`data-src`, `data-poll`)
- Data binding (`data-bind`, `data-each`, `data-if`, `data-if-not`)
- Seven-status system (`pass`, `fail`, `running`, `warn`, `skipped`, `cancelled`, `unknown`)
- Built-in formatters: `duration`, `relative`, `number`, `percent`, `passrate`, `date`, `short_date`, `uppercase`, `lowercase`
- Custom formatter and transform registration API
- `data-transform` attribute for pre-format value transforms
- App shell layout (sidebar, topbar, main grid)
- Responsive 12-column grid with `vg-col-md-*` / `vg-col-lg-*` breakpoints
- Dark/light theme toggle via `data-vg-theme`
- Data density modes (`compact` / `comfortable`)
- Table column sorting
- Sidebar collapse toggle
- Pause/resume/refresh global actions
- Refresh indicator with pulse animation
- Reference demo dashboard with mock API layer
