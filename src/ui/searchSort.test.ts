import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchLibrary, type SearchLibraryData } from '../core/searchLibrary';
import { bindPinnedSearchSort } from './searchSort';

type Listener = (event: any) => void;
let storage: SearchLibraryData;
let entries: Entry[];
let previews: Entry[];
let listeners: Map<string, Listener>;
let windowListeners: Map<string, Listener>;
let frames: Map<number, FrameRequestCallback>;
let render: ReturnType<typeof vi.fn<() => void>>;
let library: SearchLibrary;
let sort: ReturnType<typeof bindPinnedSearchSort>;
let visibleCount: number;
let columns: number;
let reducedMotion: boolean;
function classList() {
  const classes = new Set(['dmh-search-entry-pinned']);
  return { add: (s: string) => classes.add(s), remove: (s: string) => classes.delete(s), contains: (s: string) => classes.has(s) };
}
const app = { classList: classList(), appendChild: (entry: Entry) => previews.push(entry) };
function rect(left: number, top: number, width = 200, height = 44): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) };
}
function slot(index: number): DOMRect {
  return rect(10 + (index % columns) * 208, 20 + Math.floor(index / columns) * 52);
}
class Entry {
  dataset: { query: string };
  classList = classList();
  style: Record<string, string> = {};
  inert = false;
  attributes: Record<string, string> = {};
  setAttribute = (key: string, value: string) => { this.attributes[key] = value; };
  closest = () => this;
  get nextElementSibling(): Entry | null { return entries[entries.indexOf(this) + 1] ?? null; }
  get nextSibling(): Entry | null { return this.nextElementSibling; }
  parentElement = {
    insertBefore: (moving: Entry, before: Entry | null) => {
      entries.splice(entries.indexOf(moving), 1);
      entries.splice(before ? entries.indexOf(before) : entries.length, 0, moving);
    },
  };
  handle = {
    dataset: { query: '' }, focus: vi.fn(), closest: () => this,
    setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn(),
  };
  animate = vi.fn(() => ({ cancel: vi.fn(), onfinish: null }));
  cloneNode = () => new Entry(this.dataset.query, true);
  remove = () => { previews = previews.filter((entry) => entry !== this); };
  getBoundingClientRect = (): DOMRect => {
    if (!this.preview) return slot(entries.indexOf(this));
    const delta = this.style.transform?.match(/translate3d\(([-.\d]+)px, ([-.\d]+)px/);
    return rect(parseFloat(this.style.left) + Number(delta?.[1] || 0), parseFloat(this.style.top) + Number(delta?.[2] || 0));
  };
  constructor(query: string, private preview = false) {
    this.dataset = { query };
    this.handle.dataset.query = query;
  }
}
function pointer(type: string, query: string, x?: number, y?: number, pointerId = 1) {
  const item = entries.find((item) => item.dataset.query === query)!;
  const r = item.getBoundingClientRect();
  listeners.get(type)!({
    target: { closest: () => item.handle }, pointerId, isPrimary: true, button: 0,
    clientX: x ?? r.left + r.width / 2, clientY: y ?? r.top + r.height / 2, preventDefault: vi.fn(),
  });
}
function moveTo(query: string, index: number) {
  const r = slot(index);
  pointer('pointermove', query, r.left + r.width / 2, r.top + r.height / 2);
}
function tick() {
  const [id, fn] = frames.entries().next().value!;
  frames.delete(id);
  fn(16);
}
function bind(panel: HTMLElement | null = null) {
  const lists = {
    addEventListener: (type: string, fn: Listener) => listeners.set(type, fn), closest: () => app,
    querySelectorAll: (selector: string) => selector === '.dmh-search-entry-pinned' ? entries : entries.map((item) => item.handle),
  } as unknown as HTMLElement;
  return bindPinnedSearchSort(lists, panel, library, render);
}
beforeEach(() => {
  storage = { pinned: ['a', 'b', 'c', 'd'], recent: ['recent'] };
  visibleCount = 4; columns = 2; reducedMotion = false;
  previews = []; frames = new Map(); listeners = new Map(); windowListeners = new Map();
  let frameId = 0;
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => { frames.set(++frameId, fn); return frameId; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('GM_getValue', () => structuredClone(storage));
  vi.stubGlobal('GM_setValue', vi.fn((_key, value) => { storage = structuredClone(value); }));
  vi.stubGlobal('window', {
    addEventListener: (type: string, fn: Listener) => windowListeners.set(type, fn),
    matchMedia: () => ({ matches: reducedMotion }),
  });
  vi.stubGlobal('getComputedStyle', () => ({ gridTemplateColumns: Array(columns).fill('200px').join(' ') }));
  library = new SearchLibrary();
  render = vi.fn(() => { entries = library.data.pinned.slice(0, visibleCount).map((query) => new Entry(query)); });
  render(); sort = bind();
});
afterEach(() => { sort.cancel(); vi.unstubAllGlobals(); });
describe('fixed search sorting', () => {
  it('floats a non-interactive copy, previews stable slots and saves once on release', () => {
    pointer('pointerdown', 'a'); moveTo('a', 3);
    expect(previews).toHaveLength(1);
    expect(previews[0].inert).toBe(true);
    expect(previews[0].attributes['aria-hidden']).toBe('true');
    expect(previews[0].style.transform).toBe('translate3d(208px, 52px, 0)');
    expect(app.classList.contains('dmh-search-sorting')).toBe(true);
    expect(entries[3].classList.contains('dmh-search-dragging')).toBe(true);
    expect(entries.map((item) => item.dataset.query)).toEqual(['b', 'c', 'd', 'a']);
    expect(entries[0].animate).toHaveBeenCalled();
    expect(GM_setValue).not.toHaveBeenCalled();
    tick(); tick();
    expect(entries.map((item) => item.dataset.query)).toEqual(['b', 'c', 'd', 'a']);
    moveTo('a', 1); pointer('pointerup', 'a');
    expect(storage).toEqual({ pinned: ['b', 'a', 'c', 'd'], recent: ['recent'] });
    expect(GM_setValue).toHaveBeenCalledOnce();
    expect(entries[1].handle.focus).toHaveBeenCalled();
    expect(entries[1].animate).toHaveBeenCalled();
    expect(previews).toHaveLength(0);
    expect(frames.size).toBe(0);
    expect(app.classList.contains('dmh-search-sorting')).toBe(false);
  });
  it('keeps hidden fixed entries behind reordered visible entries', () => {
    visibleCount = 2; render(); pointer('pointerdown', 'a'); moveTo('a', 1); pointer('pointerup', 'a');
    expect(storage.pinned).toEqual(['b', 'a', 'c', 'd']);
  });
  it('uses the card center instead of the handle position to choose a slot', () => {
    pointer('pointerdown', 'a', 200, 42);
    pointer('pointermove', 'a', 220, 42);
    expect(entries.map((item) => item.dataset.query)).toEqual(['a', 'b', 'c', 'd']);
    pointer('pointermove', 'a', 408, 42);
    pointer('pointerup', 'a');
    expect(storage.pinned).toEqual(['b', 'a', 'c', 'd']);
  });
  it('supports single-column geometry and reduced motion', () => {
    columns = 1; reducedMotion = true;
    pointer('pointerdown', 'a'); moveTo('a', 2);
    expect(entries.every((item) => item.animate.mock.calls.length === 0)).toBe(true);
    pointer('pointerup', 'a');
    expect(storage.pinned).toEqual(['b', 'c', 'a', 'd']);
    expect(entries[2].animate).not.toHaveBeenCalled();
  });
  it('ignores small movements and unrelated pointers', () => {
    pointer('pointerdown', 'a'); pointer('pointermove', 'a', 318, 94, 2); pointer('pointermove', 'a', 113, 42); pointer('pointerup', 'a');
    expect(GM_setValue).not.toHaveBeenCalled(); expect(previews).toHaveLength(0);
    expect(storage.pinned).toEqual(['a', 'b', 'c', 'd']);
  });
  it('follows outside the grid without changing order', () => {
    pointer('pointerdown', 'a'); pointer('pointermove', 'a', 800, 800);
    expect(previews[0].style.transform).toBe('translate3d(690px, 758px, 0)');
    expect(entries.map((item) => item.dataset.query)).toEqual(['a', 'b', 'c', 'd']);
  });
  it.each(['pointercancel', 'lostpointercapture', 'Escape', 'blur', 'resize'])('discards and cleans up on %s', (type) => {
    pointer('pointerdown', 'a'); moveTo('a', 2);
    if (type === 'Escape') listeners.get('keydown')!({ key: 'Escape', preventDefault: vi.fn(), stopPropagation: vi.fn() });
    else if (type === 'blur' || type === 'resize') windowListeners.get(type)!({});
    else pointer(type, 'a');
    expect(entries.map((item) => item.dataset.query)).toEqual(['a', 'b', 'c', 'd']);
    expect(GM_setValue).not.toHaveBeenCalled(); expect(previews).toHaveLength(0); expect(frames.size).toBe(0);
    expect(app.classList.contains('dmh-search-sorting')).toBe(false);
  });
  it('continues scrolling at the panel edge with a stationary pointer', () => {
    const panel = { scrollTop: 0, getBoundingClientRect: () => rect(0, 0, 450, 100) };
    sort = bind(panel as unknown as HTMLElement);
    pointer('pointerdown', 'a'); moveTo('a', 3);
    const initial = panel.scrollTop; tick(); tick();
    expect(panel.scrollTop).toBeGreaterThan(initial); expect(GM_setValue).not.toHaveBeenCalled();
    sort.cancel(); expect(frames.size).toBe(0);
  });
  it('releases capture when the panel closes or rerenders', () => {
    const handle = entries[0].handle;
    pointer('pointerdown', 'a'); moveTo('a', 1);
    expect(sort.cancel()).toBe(true); expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(sort.cancel()).toBe(false); expect(GM_setValue).not.toHaveBeenCalled();
    expect(previews).toHaveLength(0); expect(frames.size).toBe(0);
  });
  it('moves by column or row using arrow keys and keeps focus', () => {
    const key = (key: string) => listeners.get('keydown')!({
      key, target: { closest: () => entries.find((item) => item.dataset.query === 'a')!.handle }, preventDefault: vi.fn(),
    });
    key('ArrowDown'); expect(storage.pinned).toEqual(['b', 'c', 'a', 'd']);
    expect(entries[2].handle.focus).toHaveBeenCalled();
    key('ArrowLeft'); expect(storage.pinned).toEqual(['b', 'a', 'c', 'd']);
    visibleCount = 2; render(); key('ArrowRight'); expect(storage.pinned).toEqual(['b', 'a', 'c', 'd']);
  });
});
