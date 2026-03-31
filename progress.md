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

### Phase 5.1 — Collapsible Panels
- [x] CSS: `vg-panel--collapsible`, `vg-panel--collapsed`, chevron indicator, smooth height transition
- [x] JS: `data-vg-collapsible` attribute scanning and header click toggle
- [x] Accordion groups: `data-vg-collapse-group` — opening one closes siblings
- [x] Start collapsed: `data-vg-collapsed` attribute
- [x] Persistence: `data-vg-collapse-persist` saves state to localStorage
- [x] Wrapper element `vg-panel__collapsible-body` for animated expand/collapse
- [x] Components demo updated with collapsible panel + accordion examples
- [x] README, CHANGELOG updated

### Phase 6 — Binding & Rendering Enhancements (v0.6.0)
- [x] Attribute binding: `data-bind-attr="href:url, src:image"`
- [x] HTML binding: `data-bind-html` (opt-in innerHTML)
- [x] Conditional class binding: `data-class="active:is_active"`
- [x] Template expressions: `data-bind-template="{passed} / {total}"`
- [x] data-each-limit: cap rendered items, expose `data-each-total`
- [x] Nested data-each: inner lists render correctly inside outer templates
- [x] Components demo page updated with all binding examples

### Phase 7 — Engine Hardening (v0.6.0)
- [x] `Vigil.unmount(el)` — destroy controller, stop polling
- [x] `Vigil.scan(rootEl)` — scan subtree for new Vigil elements
- [x] MutationObserver mode: `Vigil.configure({ observe: true })`
- [x] HTTP method/body: `data-method="POST"`, `data-body`
- [x] Debounced filters: 300ms default for text inputs, `data-vg-debounce` override
- [x] Configurable retry: `staleThreshold`, `errorThreshold`, `maxBackoff`
- [x] Auth error hook: `onAuthError` in config
- [x] `Vigil.version` property
- [x] Components demo: dynamic mount/unmount, POST panel, retry config panel

### Phase 8 — UI Components (v0.6.0)
- [x] Tabs: `data-vg-tabs`, `.vg-tabs__tab`, `.vg-tabs__panel`, keyboard nav, ARIA
- [x] Toast notifications: `Vigil.toast()` with stacking, auto-dismiss, progress bar
- [x] Modal dialogs: `Vigil.modal()` with focus trap, Escape, backdrop close
- [x] Tooltips: `data-vg-tooltip` with positional variants
- [x] Dropdowns: `data-vg-dropdown` with click-outside/Escape close
- [x] Avatars: `vg-avatar` CSS-only, sizes, image, status dots
- [x] Timeline / Stepper: `vg-timeline` with status states, connector lines
- [x] Pagination: `data-vg-paginate` with page controls, events
- [x] Components demo: all UI components demonstrated

### Phase 9 — Table Enhancements (v0.6.0)
- [x] Client-side search: `data-vg-table-search`, debounced, "No results" state
- [x] Row selection: `vg-table--selectable`, select-all, events, `Vigil.getSelectedRows()`
- [x] Responsive table: `vg-table-wrap` with gradient overflow indicator
- [x] Components demo: search + selection + pagination on a 20-row table

### Phase 10 — Accessibility (v0.6.0)
- [x] ARIA on collapsible panels: `aria-expanded`, `aria-controls`, `role="region"`
- [x] ARIA on tabs: `role="tablist/tab/tabpanel"`, `aria-selected`, `aria-controls`
- [x] ARIA on modals: `role="dialog"`, `aria-modal`, `aria-labelledby`
- [x] ARIA on toasts: `role="alert"`, `aria-live="polite"`
- [x] ARIA on tooltips: `aria-describedby`
- [x] ARIA on dropdowns: `aria-expanded`, `aria-haspopup`
- [x] ARIA on table sort: `aria-sort`
- [x] `:focus-visible` ring on all interactive elements
- [x] `vg-skip-link` — visible-on-focus skip nav
- [x] Components demo: focus indicator showcase

### Phase 11 — Build & Distribution (v0.6.0)
- [x] Build script: `build.js` → `dist/vigil.min.js`, `dist/vigil.min.css`, `dist/vigil.esm.js`
- [x] ESM export: `dist/vigil.esm.js`
- [x] TypeScript declarations: `vigil.d.ts`
- [x] CDN documentation in README (unpkg + jsDelivr)
- [x] Test suite: `tests/run.js` — 19 unit tests (deepGet, formatters, templates)
- [x] `npm run build` and `npm test` scripts in package.json

### Phase 12 — Polish (v0.6.0)
- [x] Print styles: `@media print` hides chrome, clean panel output
- [x] Sidebar sub-nav: `vg-nav-group`, `vg-nav-group__toggle`, `vg-nav-item--child`
- [x] Demo sidebar updated to collapsible nav groups on all 8 pages
- [x] Skip-link added to all demo pages
- [x] Print button on components page
- [x] README, CHANGELOG, progress.md updated with all new features

### Lazy Tab Loading
- [x] `data-vg-tab-lazy` attribute — inactive tab panels are not scanned until first activated
- [x] `data-vg-lazy-refresh="false"` attribute — pauses polling when tab is hidden, resumes on re-activation
- [x] `_isInsideLazyInactivePanel()` helper skips data sources in inactive lazy panels during initial scan
- [x] `_pausePanel()` / `_resumePanel()` in `initTabs` leverages existing controller `pause()`/`resume()` methods
- [x] Demo: "Tabs — Lazy Loading" example on components page with live, static, and deferred tabs
- [x] README updated with `data-vg-tab-lazy` and `data-vg-lazy-refresh` attributes

### Declarative Navigation
- [x] `data-vg-nav="page-id"` attribute on clickable elements — shows target page, hides siblings
- [x] `data-vg-nav-container` wrapper scopes `.vg-nav-page` children
- [x] `.vg-nav-page` CSS class — hidden by default, `is-active` shows
- [x] URL hash sync — `history.pushState` on navigate, `popstate` listener for back/forward
- [x] Lazy scanning — inactive pages not scanned until first navigated to
- [x] `data-vg-lazy-refresh="false"` works on nav pages (pause/resume polling)
- [x] `Vigil.navigateTo(pageId)` public API for programmatic navigation
- [x] `vigil:navigate` custom event fired on page change
- [x] `_isInsideLazyInactivePanel()` extended to also skip elements in inactive nav pages
- [x] Demo: "Declarative Navigation" panel on components page with 3 pages, lazy metrics, and JS API button
- [x] README, TypeScript declarations updated

### Row-click Detail
- [x] `data-vg-row-detail="panel-id"` on a `<table>` — click row to show detail panel
- [x] `data-field` on `<td>` elements maps values to `data-bind` in the detail panel
- [x] `data-vg-row-id` on `<tr>` for row identification, available as `_id`
- [x] `data-vg-detail-src="/api/entity/{id}"` for fetching full detail data via API
- [x] `data-vg-detail-close` button to dismiss the detail panel
- [x] `.vg-table__row--active` highlight on clicked row, click again to dismiss
- [x] `.vg-detail-panel` CSS with slide-in animation
- [x] `vigil:row-detail` custom event with `{ row, data }`
- [x] Escape key closes the detail panel
- [x] Demo: Runner table with row-click detail on components page

### Health Badge
- [x] `data-vg-health="/api/status"` polls a status endpoint
- [x] `data-vg-health-poll="30"` configurable interval (default 30s)
- [x] `data-vg-health-field` + `data-vg-health-value` for field-level health checks
- [x] Three states: `vg-health--checking` (amber pulse), `vg-health--connected` (green glow), `vg-health--disconnected` (red glow)
- [x] `.vg-health__text` element auto-updates with status text
- [x] `role="status"` for accessibility
- [x] Demo: Three health badges (healthy API, failing DB, healthy WS) on components page
- [x] Mock endpoints `/api/health-ok` and `/api/health-fail`

## Current State
- Version: **0.6.0**
- Demo: 9 pages (Overview, Pipelines, Test Runs, Runners, Trends, Failures, Settings, Components, ESM Test)
- All features functional with mock data layer
- Build produces minified dist/ output
- 19 unit tests passing
