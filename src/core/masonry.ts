import type { AppState } from './state';

export const LOAD_OFFSET_PX = 900;
export const CARD_WIDTH = 220;
export const DEFAULT_CARD_WIDTH = 280;
export const CARD_GAP = 12;
export const LAYOUT_OPTIONS = [
  { key: 'masonry', label: '瀑布流' },
  { key: 'grid', label: '网格' },
  { key: 'justified', label: '等高排列' },
  { key: 'virtual', label: '虚拟瀑布流' },
] as const;
export type ListLayout = (typeof LAYOUT_OPTIONS)[number]['key'];
export const CARD_SIZE_OPTIONS = [
  { key: 'small', label: '小', value: 180 },
  { key: 'medium', label: '中', value: CARD_WIDTH },
  { key: 'big', label: '大', value: DEFAULT_CARD_WIDTH },
] as const;

export interface CardPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function calculateLayout(
  posts: ReadonlyArray<{ width: number; height: number }>,
  availableWidth: number,
  targetCardWidth: number,
  layout: ListLayout,
): CardPosition[] {
  if (availableWidth <= 0) return [];
  if (layout === 'justified') {
    const positions: CardPosition[] = [];
    let top = 0;
    let row: number[] = [];
    let ratioSum = 0;
    const flush = () => {
      const height = Math.min(targetCardWidth, (availableWidth - (row.length - 1) * CARD_GAP) / ratioSum);
      let left = 0;
      for (const ratio of row) {
        const width = ratio * height;
        positions.push({ left, top, width, height });
        left += width + CARD_GAP;
      }
      top += height + CARD_GAP;
      row = [];
      ratioSum = 0;
    };
    for (const post of posts) {
      const ratio = post.width > 0 && post.height > 0 ? post.width / post.height : 1;
      // Avoid adding more gaps than the container can accommodate.
      if (row.length && (row.length * CARD_GAP >= availableWidth)) flush();
      row.push(ratio);
      ratioSum += ratio;
      if (ratioSum * targetCardWidth + (row.length - 1) * CARD_GAP >= availableWidth) flush();
    }
    if (row.length) flush();
    return positions;
  }
  const columnCount = Math.max(
    1,
    Math.floor((availableWidth + CARD_GAP) / (targetCardWidth + CARD_GAP)),
  );
  const columnWidth = (availableWidth - (columnCount - 1) * CARD_GAP) / columnCount;
  const columnHeights = Array.from({ length: columnCount }, () => 0);
  return posts.map((post, index) => {
    const columnIndex = layout === 'grid' ? index % columnCount : findShortestColumn(columnHeights);
    const left = columnIndex * (columnWidth + CARD_GAP);
    const top = columnHeights[columnIndex];
    const height = layout === 'grid' ? columnWidth : getCardHeight(post.width, post.height, columnWidth);
    columnHeights[columnIndex] += height + CARD_GAP;
    return { left, top, width: columnWidth, height };
  });
}

const positionsByState = new WeakMap<AppState, CardPosition[]>();
const virtualFrames = new WeakMap<AppState, number>();

export function layoutMasonry(state: AppState): void {
  const grid = document.getElementById('dmh-grid');
  if (!grid) return;
  const positions = calculateLayout(state.posts, grid.clientWidth, state.cardWidth, state.listLayout);
  positionsByState.set(state, positions);
  grid.dataset.layout = state.listLayout;
  grid.style.height = `${positions.reduce((bottom, item) => Math.max(bottom, item.top + item.height + CARD_GAP), 0)}px`;
  updateLayoutCards(state, grid, positions);
}

export function getVisibleCardIndices(positions: CardPosition[], top: number, height: number): number[] {
  const indices: number[] = [];
  positions.forEach((item, index) => {
    if (item.top + item.height >= top - height && item.top <= top + height * 2) indices.push(index);
  });
  return indices;
}

function updateLayoutCards(state: AppState, grid: HTMLElement, positions: CardPosition[]): void {
  const indices = state.listLayout === 'virtual'
    ? getVisibleCardIndices(positions, -grid.getBoundingClientRect().top, window.innerHeight)
    : positions.map((_, index) => index);
  state.renderLayoutCards?.(indices);
  for (const card of grid.querySelectorAll<HTMLElement>('.dmh-card')) {
    const position = positions[Number(card.dataset.index)];
    if (!position) continue;
    card.style.width = `${position.width}px`;
    card.style.left = `${position.left}px`;
    card.style.top = `${position.top}px`;
    card.style.height = `${position.height}px`;
  }
}

export function scheduleVirtualMasonry(state: AppState): void {
  if (!state.started || state.listLayout !== 'virtual' || virtualFrames.has(state)) return;
  virtualFrames.set(state, requestAnimationFrame(() => {
    virtualFrames.delete(state);
    const grid = document.getElementById('dmh-grid');
    const positions = positionsByState.get(state);
    if (grid && positions && state.started && state.listLayout === 'virtual') {
      updateLayoutCards(state, grid, positions);
    }
  }));
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

export function findShortestColumn(
  columnHeights: number[],
  tieTolerance = CARD_GAP,
): number {
  const shortestHeight = Math.min(...columnHeights);
  return columnHeights.findIndex((height) => height <= shortestHeight + tieTolerance);
}

function getCardHeight(width: number, height: number, cardWidth: number): number {
  if (!width || !height) return cardWidth;
  return Math.max(80, Math.round((cardWidth * height) / width));
}
