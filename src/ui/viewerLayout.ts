import { t } from './i18n';
import { saveViewerLayout, type AppState } from '../core/state';
import { parseViewerLayout, type ViewerLayout } from '../core/viewerLayout';
import { byId } from '../utils/dom';

export function renderViewerLayoutSettings(layout: ViewerLayout): string {
  return `<label class="dmh-setting-row" for="dmh-viewer-toolbar-position">
    <span class="dmh-setting-copy"><span class="dmh-setting-label" data-i18n="操作栏位置">${t("操作栏位置")}</span><span class="dmh-setting-help" data-i18n="选择底部时，上下翻转详情布局">${t("选择底部时，上下翻转详情布局")}</span></span>
    <select class="dmh-setting-select" id="dmh-viewer-toolbar-position">
      <option value="top" ${layout === 'top' ? 'selected' : ''} data-i18n="顶部">${t("顶部")}</option>
      <option value="bottom" ${layout === 'bottom' ? 'selected' : ''} data-i18n="底部">${t("底部")}</option>
    </select>
  </label>`;
}

export function applyViewerLayout(state: AppState): void {
  const viewer = byId('dmh-viewer');
  if (viewer) viewer.dataset.toolbarPosition = state.viewerLayout;
}

export function bindViewerLayout(state: AppState): void {
  applyViewerLayout(state);
  const input = byId<HTMLSelectElement>('dmh-viewer-toolbar-position');
  input?.addEventListener('change', () => {
    state.viewerLayout = parseViewerLayout(input.value);
    saveViewerLayout(state.viewerLayout);
    applyViewerLayout(state);
  });
}
