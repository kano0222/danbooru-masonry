import type { AppState } from './state';

export const LOAD_OFFSET_PX = 900;
export const CARD_WIDTH = 220;
export const CARD_GAP = 12;

export function layoutMasonry(state: AppState): void {
  const grid = document.getElementById('dmh-grid');
  if (!grid) return;
  const availableWidth = Math.max(0, grid.clientWidth);
  const columnCount = Math.max(1, Math.floor((availableWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
  const layoutWidth = availableWidth;
  const columnWidth = Math.max(80, (layoutWidth - (columnCount - 1) * CARD_GAP) / columnCount);
  const columnHeights = Array.from({ length: columnCount }, () => 0);
  const cards = grid.querySelectorAll<HTMLElement>('.dmh-card');

  for (const card of cards) {
    const post = state.posts[Number(card.dataset.index)];
    if (!post) continue;
    const columnIndex = findShortestColumn(columnHeights);
    const left = columnIndex * (columnWidth + CARD_GAP);
    const top = columnHeights[columnIndex];
    const height = getCardHeight(post.width, post.height, columnWidth);
    card.style.width = `${columnWidth}px`;
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.height = `${height}px`;
    columnHeights[columnIndex] += height + CARD_GAP;
  }

  grid.style.height = `${Math.max(0, ...columnHeights) || 0}px`;
}

export function scheduleLayoutMasonry(state: AppState): void {
  if (!state.started) return;
  cancelAnimationFrame(state.resizeRaf);
  state.resizeRaf = requestAnimationFrame(() => layoutMasonry(state));
}

export function shouldLoadMore(): boolean {
  const remaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
  return remaining < LOAD_OFFSET_PX;
}

export function shouldFillViewport(): boolean {
  return document.documentElement.scrollHeight <= window.innerHeight + LOAD_OFFSET_PX;
}

function findShortestColumn(columnHeights: number[]): number {
  let shortestIndex = 0;
  for (let index = 1; index < columnHeights.length; index += 1) {
    if (columnHeights[index] < columnHeights[shortestIndex]) shortestIndex = index;
  }
  return shortestIndex;
}

function getCardHeight(width: number, height: number, cardWidth: number): number {
  if (!width || !height) return cardWidth;
  return Math.max(80, Math.round((cardWidth * height) / width));
}
