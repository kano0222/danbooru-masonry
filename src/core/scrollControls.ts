import type { AppState } from './state';

export const MIN_SCROLLBAR_THUMB_PX = 36;
export const BACK_TO_TOP_THRESHOLD_PX = 300;

export interface ScrollMetrics {
  scrollable: boolean;
  maxScroll: number;
  thumbHeight: number;
  thumbOffset: number;
  maxThumbOffset: number;
  progress: number;
}

let updateRaf = 0;
let resizeObserver: ResizeObserver | null = null;

export function calculateScrollMetrics(
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
  trackHeight: number,
  minThumbHeight = MIN_SCROLLBAR_THUMB_PX,
): ScrollMetrics {
  const viewport = nonNegative(viewportHeight);
  const documentSize = Math.max(viewport, nonNegative(documentHeight));
  const track = nonNegative(trackHeight);
  const maxScroll = Math.max(0, documentSize - viewport);
  if (maxScroll === 0 || track === 0) {
    return {
      scrollable: false,
      maxScroll,
      thumbHeight: track,
      thumbOffset: 0,
      maxThumbOffset: 0,
      progress: 0,
    };
  }

  const thumbHeight = Math.min(
    track,
    Math.max(nonNegative(minThumbHeight), (track * viewport) / documentSize),
  );
  const maxThumbOffset = Math.max(0, track - thumbHeight);
  const clampedScroll = clamp(nonNegative(scrollY), 0, maxScroll);
  const progress = clampedScroll / maxScroll;
  return {
    scrollable: true,
    maxScroll,
    thumbHeight,
    thumbOffset: maxThumbOffset * progress,
    maxThumbOffset,
    progress,
  };
}

export function scrollTopFromThumbOffset(
  thumbOffset: number,
  maxThumbOffset: number,
  maxScroll: number,
): number {
  const availableThumbTravel = nonNegative(maxThumbOffset);
  const availableScroll = nonNegative(maxScroll);
  if (availableThumbTravel === 0 || availableScroll === 0) return 0;
  return (clamp(nonNegative(thumbOffset), 0, availableThumbTravel) / availableThumbTravel) * availableScroll;
}

export function scrollTopFromTrackPoint(
  point: number,
  trackHeight: number,
  thumbHeight: number,
  maxScroll: number,
): number {
  const maxThumbOffset = Math.max(0, nonNegative(trackHeight) - nonNegative(thumbHeight));
  return scrollTopFromThumbOffset(nonNegative(point) - nonNegative(thumbHeight) / 2, maxThumbOffset, maxScroll);
}

export function shouldShowBackToTop(showBackToTop: boolean, scrollY: number): boolean {
  return showBackToTop && nonNegative(scrollY) > BACK_TO_TOP_THRESHOLD_PX;
}

export function bindScrollControls(state: AppState): void {
  const track = document.getElementById('dmh-scrollbar');
  const thumb = document.getElementById('dmh-scrollbar-thumb');
  const backToTop = document.getElementById('dmh-back-to-top') as HTMLButtonElement | null;
  if (!track || !thumb || !backToTop) return;

  let drag: { pointerId: number; startY: number; startOffset: number } | null = null;

  track.addEventListener('pointerdown', (event) => {
    if (!state.showScrollbar) return;
    const metrics = currentMetrics(track);
    if (!metrics.scrollable) return;
    event.preventDefault();
    if (event.target === thumb) {
      drag = { pointerId: event.pointerId, startY: event.clientY, startOffset: metrics.thumbOffset };
      track.setPointerCapture(event.pointerId);
      track.classList.add('dmh-dragging');
      return;
    }
    const rect = track.getBoundingClientRect();
    window.scrollTo({
      top: scrollTopFromTrackPoint(event.clientY - rect.top, rect.height, metrics.thumbHeight, metrics.maxScroll),
      behavior: 'auto',
    });
  });

  track.addEventListener('pointermove', (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const metrics = currentMetrics(track);
    window.scrollTo({
      top: scrollTopFromThumbOffset(
        drag.startOffset + event.clientY - drag.startY,
        metrics.maxThumbOffset,
        metrics.maxScroll,
      ),
      behavior: 'auto',
    });
  });

  const endDrag = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    drag = null;
    track.classList.remove('dmh-dragging');
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  track.addEventListener('keydown', (event) => {
    const metrics = currentMetrics(track);
    let nextScroll: number | null = null;
    if (event.key === 'ArrowUp') nextScroll = window.scrollY - 40;
    if (event.key === 'ArrowDown') nextScroll = window.scrollY + 40;
    if (event.key === 'PageUp') nextScroll = window.scrollY - window.innerHeight * 0.9;
    if (event.key === 'PageDown') nextScroll = window.scrollY + window.innerHeight * 0.9;
    if (event.key === 'Home') nextScroll = 0;
    if (event.key === 'End') nextScroll = metrics.maxScroll;
    if (nextScroll === null) return;
    event.preventDefault();
    window.scrollTo({ top: clamp(nextScroll, 0, metrics.maxScroll), behavior: 'auto' });
  });

  backToTop.addEventListener('click', () => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  window.addEventListener('scroll', () => scheduleScrollControlsUpdate(state), { passive: true });
  window.addEventListener('resize', () => scheduleScrollControlsUpdate(state));
  resizeObserver?.disconnect();
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => scheduleScrollControlsUpdate(state));
    const grid = document.getElementById('dmh-grid');
    const topbar = document.getElementById('dmh-topbar');
    if (grid) resizeObserver.observe(grid);
    if (topbar) resizeObserver.observe(topbar);
  }
  updateScrollControls(state);
}

export function scheduleScrollControlsUpdate(state: AppState): void {
  cancelAnimationFrame(updateRaf);
  updateRaf = requestAnimationFrame(() => updateScrollControls(state));
}

export function updateScrollControls(state: AppState): void {
  const track = document.getElementById('dmh-scrollbar');
  const thumb = document.getElementById('dmh-scrollbar-thumb');
  const backToTop = document.getElementById('dmh-back-to-top') as HTMLButtonElement | null;
  if (!track || !thumb || !backToTop) return;

  const topbarBottom = document.getElementById('dmh-topbar')?.getBoundingClientRect().bottom || 0;
  track.style.top = `${Math.ceil(topbarBottom) + 12}px`;
  const metrics = currentMetrics(track);
  track.hidden = !state.showScrollbar;
  thumb.style.height = `${metrics.thumbHeight}px`;
  thumb.style.transform = `translateY(${metrics.thumbOffset}px)`;
  track.setAttribute('aria-valuenow', String(Math.round(metrics.progress * 100)));

  backToTop.hidden = !state.showBackToTop;
  backToTop.classList.toggle('dmh-visible', shouldShowBackToTop(state.showBackToTop, window.scrollY));
}

function currentMetrics(track: HTMLElement): ScrollMetrics {
  const renderedHeight = track.getBoundingClientRect().height;
  const configuredTop = Number.parseFloat(track.style.top) || 0;
  const trackHeight = renderedHeight || Math.max(0, window.innerHeight - configuredTop - 16);
  return calculateScrollMetrics(
    window.scrollY,
    window.innerHeight,
    document.documentElement.scrollHeight,
    trackHeight,
  );
}

function nonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
