import type { ThemeMode } from '../core/state';
import { icons } from './icons';

export function applyTheme(themeMode: ThemeMode): void {
  const root = document.documentElement;
  root.dataset.dmhTheme = themeMode;
  const button = document.getElementById('dmh-theme-toggle');
  if (!button) return;
  const label = getThemeToggleLabel(themeMode);
  button.innerHTML = getThemeToggleIcon(themeMode);
  button.setAttribute('aria-label', label);
  button.setAttribute('data-dmh-tooltip', label);
}

export function getNextThemeMode(themeMode: ThemeMode): ThemeMode {
  return themeMode === 'dark' ? 'light' : 'dark';
}

export function getThemeToggleLabel(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? '切换到浅色模式' : '切换到深色模式';
}

export function getThemeToggleIcon(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? icons.sun : icons.moon;
}
