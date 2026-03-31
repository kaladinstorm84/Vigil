# Changelog

All notable changes to Vigil are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.6.0] — 2026-03-25

### Added — Binding & Rendering
- **Attribute binding** — `data-bind-attr="href:url, src:image"` sets element attributes from data
- **HTML binding** — `data-bind-html` for opt-in innerHTML rendering (XSS warning documented)
- **Conditional class binding** — `data-class="active:is_active, vg-text-fail:has_errors"`
- **Template expressions** — `data-bind-template="{passed} / {total} tests ({rate|percent})"`
- **data-each-limit** — `data-each-limit="20"` caps rendered items; container gets `data-each-total`
- **Nested data-each** — inner `data-each` lists render correctly inside outer templates

### Added — Engine Hardening
- **Vigil.unmount(el)** — destroy controller and stop polling for dynamically removed panels
- **Vigil.scan(rootEl)** — scan a subtree for new Vigil elements (avoids re-mounting via `data-vg-mounted` marker)
- **MutationObserver mode** — `Vigil.configure({ observe: true })` auto-scans inserted DOM nodes
- **HTTP method/body** — `data-method="POST"` and `data-body` for non-GET requests
- **Debounced filters** — text inputs in filter groups auto-debounce (300ms default); `data-vg-debounce` overrides
- **Configurable retry** — `staleThreshold`, `errorThreshold`, `maxBackoff` in global config and per-panel
- **Auth error hook** — `Vigil.configure({ onAuthError })` intercepts 401/403 responses for token refresh
- **Version property** — `Vigil.version` returns the current library version

### Added — UI Components
- **Tabs** — `data-vg-tabs` with `.vg-tabs__list`, `.vg-tabs__tab`, `.vg-tabs__panel`, keyboard arrow navigation, ARIA roles
- **Toast notifications** — `Vigil.toast(message, { type, duration, dismissible })` with auto-dismiss progress bar and stacking
- **Modal dialogs** — `Vigil.modal({ title, body, footer, size, onClose })` with focus trap, Escape close, backdrop dismiss
- **Tooltips** — `data-vg-tooltip` with `data-vg-tooltip-pos` (top/bottom/left/right) and `aria-describedby`
- **Dropdowns** — `data-vg-dropdown` with click-outside close, Escape dismiss, `aria-expanded`
- **Avatars** — `vg-avatar` (CSS-only) with `--sm/md/lg`, image support, status dots
- **Timeline / Stepper** — `vg-timeline` with `is-complete`, `is-active`, `is-pending` states and connector lines
- **Pagination** — `data-vg-paginate` with `data-vg-page-size`, prev/next/number buttons, `vigil:page-change` event

### Added — Table Enhancements
- **Client-side search** — `data-vg-table-search` filters rows by text content (debounced 200ms) with empty state
- **Row selection** — `vg-table--selectable` with select-all header checkbox, row highlight, `vigil:selection-change` event, `Vigil.getSelectedRows()`
- **Responsive table wrap** — `vg-table-wrap` with horizontal scroll and gradient overflow indicator

### Added — Accessibility
- ARIA attributes on collapsible panels (`aria-expanded`, `aria-controls`, `role="region"`), tabs (`role="tablist/tab/tabpanel"`, `aria-selected`), modals (`role="dialog"`, `aria-modal`), toasts (`role="alert"`), table sort (`aria-sort`)
- `:focus-visible` ring styles on buttons, nav items, chips, tabs, dropdowns, pagination, form controls
- `vg-skip-link` — visible-on-focus skip navigation link
- `aria-live="polite"` on toast container

### Added — Build & Distribution
- **Build script** — `npm run build` produces `dist/vigil.min.js`, `dist/vigil.min.css`, `dist/vigil.esm.js`
- **ESM export** — `dist/vigil.esm.js` with `export default Vigil`
- **TypeScript declarations** — `vigil.d.ts` with full interface coverage
- **Test suite** — `npm test` runs unit tests for `deepGet`, formatters, template expressions

### Added — Polish
- **Print styles** — `@media print` hides sidebar/topbar, removes shadows, full-width panels
- **Sidebar sub-navigation** — `vg-nav-group` with `vg-nav-group__toggle` and `vg-nav-item--child`
- **Components demo page** updated with demos for every new feature
- CDN documentation in README (unpkg + jsDelivr URLs)

### Changed
- Version bumped to 0.6.0 across vigil.js, vigil.css, package.json
- `PanelController._render()` and `WsPanelController._render()` now handle all binding types
- `initCollapsiblePanels`, `initTableSort` accept optional root parameter for scoped scanning
- Demo sidebar updated to collapsible nav groups across all pages
- Demo pages include skip-link for accessibility

---

## [0.3.0] — 2026-03-24

### Added
- **Global fetch headers** — `Vigil.configure({ headers: { Authorization: 'Bearer xxx' } })` sets headers on all fetches
- **Per-panel fetch headers** — `data-headers` attribute for panel-specific HTTP headers (merged with global)
- **Response maps** — `data-response-map` + `Vigil.registerResponseMap(name, fn)` to reshape raw API JSON before rendering
- **CORS proxy** — `data-proxy` attribute and `Vigil.configure({ proxy: '...' })` to route fetches through a CORS proxy
- **WebSocket panels** — `data-ws` attribute for push-based live updates with automatic reconnection (exponential backoff, 1s–30s)
- **WebSocket event filtering** — `data-ws-event` to filter incoming messages by event type
- **CSS container queries** on `.vg-panel` for self-responsive layouts (compact at <320px, spacious at >600px)
- **Multi-page demo** — Overview, Pipelines, Test Runs, Runners, Trends, and Failures pages under `demo/`
- Deployment Feed demo panel showcasing WebSocket integration with a `MockWebSocket` shim
- Runner card grid layout on the dedicated Runners page
- **Trends report page** — 7-day run volume chart, daily breakdown table, pass rate by suite with sparklines
- **Failures report page** — failure type breakdown with progress bars, recent failures table, flakiest features analysis
- **Settings page** — comprehensive form controls demo (text inputs, selects, toggles, radio groups, range slider, number inputs, textareas, danger zone)

- **Form system** — `vg-form`, `vg-field`, `vg-label`, `vg-input`, `vg-checkbox`, `vg-toggle`, `vg-radio-group`, `vg-field-grid`, `vg-action-row` as first-class framework primitives
- **Card primitives** — `vg-card` with header/body/footer and variants (`--muted`, `--accent`, `--tinted`, `--flat`, `--success`, `--fail`, `--warn`, `--info`)
- **Banner / alert** — `vg-banner` component with `--success`, `--fail`, `--warn`, `--info`, `--compact` semantic variants
- **Nested surfaces** — `vg-surface` with `--muted`, `--accent`, `--hero`, `--glass` for sub-panel interiors
- **Hero / masthead** — `vg-hero` component with title, subtitle, and toolbar alignment
- **Auto-fit grids** — `vg-card-grid` and `vg-metric-grid` with `repeat(auto-fit, ...)` sizing
- **Chips** — `vg-chip` with status variants and `--removable` modifier
- **Inline metadata** — `vg-meta-row`, `vg-toolbar`, `vg-cluster` layout primitives
- **Section blocks** — `vg-section` with `__title` and `__meta`
- **Empty state** — `vg-empty` with icon, title, text, and action slot
- **Brand block** — `vg-brand` with `vg-brand__mark` identity row
- **Semantic surface tokens** — `--vg-surface-hero`, `--vg-surface-soft`, `--vg-surface-tinted`, `--vg-surface-glass`, `--vg-info`, `--vg-info-bg`
- **KPI alert variant** — `vg-kpi--alert` with pulsing border animation
- **Collapsible panels** — `data-vg-collapsible` attribute for toggle-on-header-click panels, with accordion groups (`data-vg-collapse-group`), start-collapsed (`data-vg-collapsed`), and localStorage persistence (`data-vg-collapse-persist`)
- **Components demo page** — full component library showcase at `demo/components.html`

### Changed
- **Status rename** — `pass` → `success` in core CSS/JS (CSS variable `--vg-success`, classes `vg-*--success`, formatter `successrate`). `passrate` retained as backward-compatible alias.
- Form controls promoted from demo-only CSS (`demo.css`) to core framework (`vigil.css`)
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
- Seven-status system (`success`, `fail`, `running`, `warn`, `skipped`, `cancelled`, `unknown`)
- Built-in formatters: `duration`, `relative`, `number`, `percent`, `successrate`, `passrate` (alias), `date`, `short_date`, `uppercase`, `lowercase`
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
