import type { SearchLibrary } from '../core/searchLibrary';

export function bindPinnedSearchSort(
  lists: HTMLElement | null,
  panel: HTMLElement | null,
  library: SearchLibrary,
  render: () => void,
) {
  const animations = new Map<HTMLElement, Animation>();
  let drag: {
    handle: HTMLButtonElement; entry: HTMLElement; pointerId: number;
    startX: number; startY: number; x: number; y: number;
    anchorX: number; anchorY: number;
    slots: DOMRect[]; scrollTop: number;
    preview: HTMLElement | null; app: HTMLElement; frame: number | null;
  } | null = null;

  function stopAnimations(): void {
    for (const animation of animations.values()) animation.cancel();
    animations.clear();
  }

  function animate(entry: HTMLElement, frames: Keyframe[], duration: number): void {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const animation = entry.animate(frames, { duration, easing: 'cubic-bezier(.2,.75,.25,1)' });
    animations.set(entry, animation);
    animation.onfinish = () => {
      if (animations.get(entry) === animation) animations.delete(entry);
    };
  }

  function cancel(): boolean {
    stopAnimations();
    if (!drag) return false;
    const { handle, entry, pointerId, preview, app, frame } = drag;
    drag = null;
    if (frame !== null) cancelAnimationFrame(frame);
    preview?.remove();
    app.classList.remove('dmh-search-sorting');
    entry.classList.remove('dmh-search-dragging');
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
    return true;
  }

  function focusHandle(query: string): HTMLButtonElement | undefined {
    const handle = Array.from(lists?.querySelectorAll<HTMLButtonElement>('.dmh-search-drag') || [])
      .find((item) => item.dataset.query === query);
    handle?.focus({ preventScroll: true });
    return handle;
  }

  function fixedEntries(): HTMLElement[] {
    return Array.from(lists?.querySelectorAll<HTMLElement>('.dmh-search-entry-pinned') || []);
  }

  function startPreview(): void {
    if (!drag) return;
    const rect = drag.entry.getBoundingClientRect();
    const preview = drag.entry.cloneNode(true) as HTMLElement;
    preview.classList.add('dmh-search-drag-preview');
    preview.setAttribute('aria-hidden', 'true');
    preview.inert = true;
    Object.assign(preview.style, {
      left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
    });
    // Keep the theme and entry styles without the panel's clipping.
    drag.app.appendChild(preview);
    drag.preview = preview;
    drag.entry.classList.add('dmh-search-dragging');
    drag.app.classList.add('dmh-search-sorting');
  }

  function updatePreview(scrollStep = 0): void {
    if (!drag?.preview || !lists) return;
    drag.preview.style.transform = `translate3d(${drag.x - drag.startX}px, ${drag.y - drag.startY}px, 0)`;
    const bounds = panel?.getBoundingClientRect();
    if (panel && bounds && drag.x >= bounds.left && drag.x <= bounds.right) {
      if (drag.y >= bounds.top - 24 && drag.y < bounds.top + 28) panel.scrollTop -= scrollStep;
      else if (drag.y > bounds.bottom - 28 && drag.y <= bounds.bottom + 24) panel.scrollTop += scrollStep;
    }
    if (bounds && (drag.x < bounds.left || drag.x > bounds.right || drag.y < bounds.top || drag.y > bounds.bottom)) return;

    // Target stable grid slots, not animated cards moving underneath the pointer.
    const scroll = (panel?.scrollTop ?? 0) - drag.scrollTop;
    const x = drag.x - drag.anchorX;
    const y = drag.y - drag.anchorY + scroll;
    const left = Math.min(...drag.slots.map((rect) => rect.left));
    const right = Math.max(...drag.slots.map((rect) => rect.right));
    if (x < left || x > right || y < drag.slots[0].top || y > drag.slots.at(-1)!.bottom) return;
    let targetIndex = 0;
    let distance = Infinity;
    drag.slots.forEach((rect, index) => {
      const next = Math.hypot(x - rect.left - rect.width / 2, y - rect.top - rect.height / 2);
      if (next < distance) { distance = next; targetIndex = index; }
    });
    const entries = fixedEntries();
    const index = entries.indexOf(drag.entry);
    if (index === targetIndex) return;
    const target = entries[targetIndex];
    const before = new Map(entries.map((entry) => [entry, entry.getBoundingClientRect()]));
    stopAnimations();
    target.parentElement!.insertBefore(drag.entry, index < targetIndex ? target.nextSibling : target);
    drag.handle.setPointerCapture(drag.pointerId);
    drag.handle.focus({ preventScroll: true });
    for (const entry of entries) {
      if (entry === drag.entry) continue;
      const from = before.get(entry)!;
      const to = entry.getBoundingClientRect();
      if (from.left === to.left && from.top === to.top) continue;
      animate(entry, [
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` },
        { transform: 'translate(0, 0)' },
      ], 160);
    }
  }

  function frame(): void {
    if (!drag?.preview) return;
    updatePreview(8);
    drag.frame = requestAnimationFrame(frame);
  }

  lists?.addEventListener('pointerdown', (event) => {
    const handle = (event.target as Element).closest<HTMLButtonElement>('.dmh-search-drag');
    const entry = handle?.closest<HTMLElement>('.dmh-search-entry-pinned');
    const app = lists.closest<HTMLElement>('#dmh-app');
    if (!handle || !entry || !app || event.button !== 0 || !event.isPrimary || drag) return;
    event.preventDefault();
    stopAnimations();
    handle.focus({ preventScroll: true });
    handle.setPointerCapture(event.pointerId);
    const rect = entry.getBoundingClientRect();
    drag = {
      handle, entry, pointerId: event.pointerId, app,
      startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY,
      anchorX: event.clientX - rect.left - rect.width / 2, anchorY: event.clientY - rect.top - rect.height / 2,
      slots: fixedEntries().map((item) => item.getBoundingClientRect()), scrollTop: panel?.scrollTop ?? 0,
      preview: null, frame: null,
    };
  });

  lists?.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (!drag.preview) {
      if (Math.hypot(drag.x - drag.startX, drag.y - drag.startY) < 5) return;
      startPreview();
      drag.frame = requestAnimationFrame(frame);
    }
    updatePreview();
  });

  lists?.addEventListener('pointerup', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const { entry, handle, preview } = drag;
    const query = handle.dataset.query!;
    const from = preview?.getBoundingClientRect();
    // The next hidden fixed entry remains the anchor in a collapsed list.
    const next = entry.nextElementSibling as HTMLElement | null;
    const visible = fixedEntries();
    const positions = new Map(visible.map((item) => [item.dataset.query, item.getBoundingClientRect()]));
    const hiddenNext = library.data.pinned.find((item) => !visible.some((entry) => entry.dataset.query === item));
    const before = next?.classList.contains('dmh-search-entry-pinned') ? next.dataset.query! : hiddenNext ?? null;
    cancel();
    if (preview) library.movePinnedBefore(query, before);
    render();
    focusHandle(query);
    if (preview) for (const item of fixedEntries()) {
      const dropped = item.dataset.query === query;
      const previous = dropped ? from : positions.get(item.dataset.query);
      if (!previous) continue;
      const to = item.getBoundingClientRect();
      if (!dropped && previous.left === to.left && previous.top === to.top) continue;
      animate(item, [
        { transform: `translate(${previous.left - to.left}px, ${previous.top - to.top}px)`, ...(dropped ? { boxShadow: '0 8px 24px var(--dmh-shadow)', zIndex: 1 } : {}) },
        { transform: 'translate(0, 0)', ...(dropped ? { boxShadow: '0 0 0 transparent', zIndex: 1 } : {}) },
      ], 180);
    }
  });

  for (const type of ['pointercancel', 'lostpointercapture']) {
    lists?.addEventListener(type, (event) => {
      if (drag && (event as PointerEvent).pointerId === drag.pointerId && cancel()) render();
    });
  }
  for (const type of ['blur', 'resize']) {
    window.addEventListener(type, () => { if (cancel()) render(); });
  }

  lists?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drag) {
      event.preventDefault();
      event.stopPropagation();
      const query = drag.handle.dataset.query!;
      cancel();
      render();
      focusHandle(query);
      return;
    }
    const handle = (event.target as Element).closest<HTMLButtonElement>('.dmh-search-drag');
    if (!handle || drag || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    library.refresh();
    const query = handle.dataset.query!;
    const index = library.data.pinned.indexOf(query);
    const columns = getComputedStyle(handle.closest('.dmh-search-chips')!).gridTemplateColumns.split(' ').length;
    const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' ? -columns : columns;
    const target = index + delta;
    const visibleCount = fixedEntries().length;
    if (index < 0 || target < 0 || target >= visibleCount) return;
    const remaining = library.data.pinned.filter((item) => item !== query);
    library.movePinnedBefore(query, remaining[target] ?? null);
    render();
    focusHandle(query);
  });

  return { cancel };
}
