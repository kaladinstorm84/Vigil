/**
 * VIGIL.JS — TypeScript declarations
 */

interface VigilConfig {
  headers?: Record<string, string>;
  proxy?: string | null;
  staleThreshold?: number;
  errorThreshold?: number;
  maxBackoff?: number;
  onAuthError?: (response: Response, ctrl: VigilPanelController) => Promise<Record<string, string> | void> | void;
  observe?: boolean;
}

interface VigilPanelController {
  el: HTMLElement;
  src: string;
  pollInterval: number;
  start(): void;
  pause(): void;
  resume(): void;
  refresh(): void;
  destroy(): void;
}

interface VigilToastOptions {
  type?: 'success' | 'fail' | 'warn' | 'info';
  duration?: number;
  dismissible?: boolean;
}

interface VigilToastHandle {
  el: HTMLElement;
  dismiss(): void;
}

interface VigilModalOptions {
  title?: string;
  body?: string;
  footer?: string;
  size?: 'sm' | 'lg';
  onClose?: () => void;
}

interface VigilModalHandle {
  el: HTMLElement;
  dialog: HTMLElement;
  close(): void;
}

interface VigilFormatters {
  number(v: unknown): string;
  percent(v: unknown): string;
  duration(v: unknown): string;
  relative(v: unknown): string;
  date(v: unknown): string;
  short_date(v: unknown): string;
  successrate(v: unknown): string;
  passrate(v: unknown): string;
  uppercase(v: unknown): string;
  lowercase(v: unknown): string;
  [key: string]: (v: unknown) => string;
}

interface VigilTransforms {
  [key: string]: (value: unknown, data: unknown) => unknown;
}

interface VigilResponseMaps {
  [key: string]: (data: unknown) => unknown;
}

interface Vigil {
  version: string;
  formatters: VigilFormatters;
  transforms: VigilTransforms;
  responseMaps: VigilResponseMaps;

  configure(opts: VigilConfig): void;
  registerFormatter(name: string, fn: (v: unknown) => string): void;
  registerTransform(name: string, fn: (v: unknown, data: unknown) => unknown): void;
  registerResponseMap(name: string, fn: (data: unknown) => unknown): void;

  mount(el: HTMLElement, options?: Record<string, unknown>): VigilPanelController;
  unmount(el: HTMLElement): void;
  scan(rootEl?: HTMLElement): void;

  init(): void;
  refresh(): void;
  pause(): void;
  resume(): void;

  collapse(el: HTMLElement): void;
  expand(el: HTMLElement): void;
  toggleCollapse(el: HTMLElement): void;

  toast(message: string, opts?: VigilToastOptions): VigilToastHandle;
  modal(opts?: VigilModalOptions): VigilModalHandle;

  getSelectedRows(tableEl: HTMLElement): HTMLElement[];

  navigateTo(pageId: string): void;

  render(el: HTMLElement, data: unknown): void;
  format(name: string, value: unknown): string;
  sparkline(svgEl: SVGElement, values: number[], options?: { color?: string; type?: 'line' | 'area' }): void;
}

declare const Vigil: Vigil;
export default Vigil;
