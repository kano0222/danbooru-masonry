export type ViewerLayout = 'top' | 'bottom';

export function parseViewerLayout(value: unknown): ViewerLayout {
  return value === 'bottom' ? 'bottom' : 'top';
}
