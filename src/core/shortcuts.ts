import type { AppState } from './state';
import { onViewerKeydown } from './viewer';

export function installShortcuts(state: AppState): void {
  window.addEventListener('keydown', (event) => onViewerKeydown(state, event));
}
