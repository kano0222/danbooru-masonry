import { localizeText } from '../ui/i18n';
export function byId<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function setText(id: string, text: string): void {
  const el = byId(id);
  if (el) localizeText(el, text);
}

// Language refreshes retain the same controls in the same order, but may replace their nodes.
export function preserveFocus(root: HTMLElement | null, render: () => void): void {
  const selector = 'a[href], button, input, select, textarea, [tabindex]';
  const active = document.activeElement;
  const index = active && root?.contains(active)
    ? Array.from(root.querySelectorAll<HTMLElement>(selector)).indexOf(active as HTMLElement)
    : -1;
  render();
  if (index >= 0 && root && !root.contains(active)) {
    root.querySelectorAll<HTMLElement>(selector)[index]?.focus({ preventScroll: true });
  }
}

export function openInTab(url: string): void {
  if (typeof GM_openInTab === 'function') {
    GM_openInTab(url, { active: true, insert: true });
    return;
  }
  window.open(url, '_blank', 'noreferrer');
}
