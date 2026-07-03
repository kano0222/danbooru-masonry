export function byId<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function setText(id: string, text: string): void {
  const el = byId(id);
  if (el) el.textContent = text;
}

export function openInTab(url: string): void {
  if (typeof GM_openInTab === 'function') {
    GM_openInTab(url, { active: true, insert: true });
    return;
  }
  window.open(url, '_blank', 'noreferrer');
}
