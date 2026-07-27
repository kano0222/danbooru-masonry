import { icons } from './icons';
import { escapeAttr } from '../utils/escape';
import { DOWNLOAD_FILENAME_TEMPLATE_OPTIONS, type AppState } from '../core/state';
import { CARD_SIZE_OPTIONS } from '../core/masonry';

export function renderShell(state: AppState): void {
  document.title = 'Danbooru Masonry';
  const cardSize = CARD_SIZE_OPTIONS.find((option) => option.value === state.cardWidth)?.key || 'medium';
  const cardSizeOptions = CARD_SIZE_OPTIONS.map(
    (option) =>
      `<option value="${option.key}"${option.value === state.cardWidth ? ' selected' : ''}>${option.label}</option>`,
  ).join('');
  const downloadFilenameTemplateInputs = DOWNLOAD_FILENAME_TEMPLATE_OPTIONS.map(
    (option) => `
              <label class="dmh-download-template-row" for="dmh-download-template-${option.key}">
                <span class="dmh-download-template-label">${option.label}</span>
                <input class="dmh-download-template-input" id="dmh-download-template-${option.key}" type="text" data-download-template="${option.key}" value="${escapeAttr(state.downloadFilenameTemplates[option.key])}">
              </label>`,
  ).join('');
  document.body.innerHTML = `
    <div id="dmh-app" data-card-size="${cardSize}" data-show-thumbnail-info="${state.showThumbnailInfo}" data-show-thumbnail-buttons="${state.showThumbnailButtons}">
      <header class="dmh-topbar" id="dmh-topbar">
        <div class="dmh-toolbar-content">
          <div class="dmh-brand">
            <div class="dmh-title">danbooru</div>
            <div class="dmh-page-group">
              <span class="dmh-page-label">page</span>
              <label class="dmh-page-control" title="Page" aria-label="Page">
                <input class="dmh-page-input" id="dmh-page" type="text" inputmode="numeric" pattern="[0-9]*" size="1" value="${state.page}">
              </label>
            </div>
          </div>
          <div class="dmh-search">
            <form class="dmh-search-form" id="dmh-search">
              <input id="dmh-tags" type="search" autocomplete="off" placeholder="tags" value="${escapeAttr(state.tags)}">
              <button class="dmh-button dmh-icon-button" type="submit" data-dmh-tooltip="搜索" aria-label="搜索">${icons.search}</button>
              <div class="dmh-ac" id="dmh-ac"></div>
            </form>
          </div>
          <div class="dmh-toolbar-actions">
            <div class="dmh-status" id="dmh-status">已加载 0 张</div>
            <button class="dmh-settings-button dmh-icon-button" id="dmh-settings-toggle" type="button" data-dmh-tooltip="设置" aria-label="设置" aria-expanded="false" aria-controls="dmh-settings-panel">${icons.settings}</button>
            <button class="dmh-exit-button dmh-icon-button" id="dmh-exit" type="button" data-dmh-tooltip="退出瀑布流" aria-label="退出瀑布流">${icons.exit}</button>
          </div>
        </div>
      </header>
      <main class="dmh-grid" id="dmh-grid"></main>
      <div class="dmh-message" id="dmh-message"></div>
      <div class="dmh-settings-overlay" id="dmh-settings-overlay" aria-hidden="true"></div>
      <aside class="dmh-settings-panel" id="dmh-settings-panel" role="dialog" aria-modal="true" aria-labelledby="dmh-settings-title" aria-hidden="true">
        <div class="dmh-settings-header">
          <h2 id="dmh-settings-title">设置</h2>
          <button class="dmh-settings-close" id="dmh-settings-close" type="button" aria-label="关闭设置">${icons.close}</button>
        </div>
        <div class="dmh-settings-content">
          <section class="dmh-setting-section">
            <label class="dmh-setting-row" for="dmh-card-size">
              <span class="dmh-setting-label">瀑布流图片大小</span>
              <select class="dmh-setting-select" id="dmh-card-size">
${cardSizeOptions}
              </select>
            </label>
          </section>
          <section class="dmh-setting-section">
            <label class="dmh-setting-row">
              <span class="dmh-setting-label">缩略图按钮默认显示</span>
              <span class="dmh-setting-switch">
                <input id="dmh-show-thumbnail-buttons" type="checkbox" ${state.showThumbnailButtons ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </span>
            </label>
          </section>
          <section class="dmh-setting-section">
            <label class="dmh-setting-row">
              <span class="dmh-setting-label">缩略图信息默认关闭</span>
              <span class="dmh-setting-switch">
                <input id="dmh-show-thumbnail-info" type="checkbox" ${state.showThumbnailInfo ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </span>
            </label>
          </section>
          <section class="dmh-setting-section">
            <label class="dmh-setting-row">
              <span class="dmh-setting-label">滚动切图</span>
              <span class="dmh-setting-switch">
                <input id="dmh-viewer-wheel-navigation" type="checkbox" ${state.viewerWheelNavigation ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </span>
            </label>
          </section>
          <section class="dmh-setting-section">
            <label class="dmh-setting-row">
              <span class="dmh-setting-label">详情使用原图</span>
              <span class="dmh-setting-switch">
                <input id="dmh-viewer-use-original" type="checkbox" ${state.viewerUseOriginal ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </span>
            </label>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-stack">
              <span class="dmh-setting-label">下载文件名格式</span>
              <div class="dmh-download-template-list">
${downloadFilenameTemplateInputs}
              </div>
              <div class="dmh-template-help">
                <div><code>{original}</code> 原文件名，不含后缀</div>
                <div><code>{artist}</code> Danbooru 画师标签</div>
                <div><code>{username}</code> 来源 URL 可解析到的用户名，缺失时回退到画师标签</div>
                <div><code>{userid}</code> 来源 URL 可解析到的用户 ID</div>
                <div><code>{id}</code> 来源作品 ID，缺失时回退到 Danbooru ID</div>
                <div><code>{postid}</code> Danbooru ID</div>
                <div><code>{ext}</code> 文件后缀</div>
              </div>
            </div>
          </section>
        </div>
      </aside>
      <div class="dmh-viewer" id="dmh-viewer" aria-hidden="true">
        <div class="dmh-viewer-info" id="dmh-viewer-info"></div>
        <div class="dmh-viewer-actions">
          <button class="dmh-viewer-button" id="dmh-open-source" type="button" data-dmh-tooltip="来源" aria-label="来源">${icons.external}</button>
          <button class="dmh-viewer-button" id="dmh-favorite" type="button" data-dmh-tooltip="收藏" aria-label="收藏">${icons.heart}</button>
          <button class="dmh-viewer-button" id="dmh-zoom-toggle" type="button" data-dmh-tooltip="查看大图" aria-label="查看大图">${icons.zoom}</button>
          <button class="dmh-viewer-button" id="dmh-open-post" type="button" data-dmh-tooltip="详情" aria-label="详情">${icons.info}</button>
          <button class="dmh-viewer-button" id="dmh-download" type="button" data-dmh-tooltip="下载原图" aria-label="下载原图">${icons.download}</button>
          <button class="dmh-viewer-button" id="dmh-close" type="button" data-dmh-tooltip="关闭" aria-label="关闭">${icons.close}</button>
        </div>
        <button class="dmh-viewer-nav dmh-viewer-prev" id="dmh-prev" type="button" aria-label="上一张">${icons.prev}</button>
        <button class="dmh-viewer-nav dmh-viewer-next" id="dmh-next" type="button" aria-label="下一张">${icons.next}</button>
        <img id="dmh-viewer-img" alt="" draggable="true">
        <video id="dmh-viewer-video" controls autoplay loop playsinline hidden></video>
        <div class="img_detail_loading" id="dmh-viewer-loading" hidden aria-hidden="true">
          <div class="v-progress-circular" id="dmh-viewer-progress" role="status" aria-label="Loading image"></div>
          <div class="dmh-viewer-error" id="dmh-viewer-error" hidden>
            <div class="sc-13hg6mj-1 bsMYYv">
              <svg viewBox="0 0 24 24" size="72" class="sc-11csm01-0 fieitW"><path d="M10,6 C10,4.8954305 10.8954305,4 12,4 C13.1045695,4 14,4.8954305 14,6 L14,12.5 C14,13.6045695 13.1045695,14.5 12,14.5 C10.8954305,14.5 10,13.6045695 10,12.5 L10,6 Z M12,20 C10.7573593,20 9.75,18.9926407 9.75,17.75 C9.75,16.5073593 10.7573593,15.5 12,15.5 C13.2426407,15.5 14.25,16.5073593 14.25,17.75 C14.25,18.9926407 13.2426407,20 12,20 Z" transform=""></path></svg>
            </div>
            <h1>加载失败</h1>
          </div>
        </div>
      </div>
      <div class="dmh-snackbar" id="dmh-snackbar" role="status" aria-live="polite"></div>
    </div>
  `;
}

export function installLaunchButton(onStart: () => void): void {
  if (document.getElementById('dmh-launch')) return;
  const button = document.createElement('button');
  button.id = 'dmh-launch';
  button.type = 'button';
  button.textContent = '瀑布流模式';
  button.style.cssText = [
    'position:fixed',
    'right:12px',
    'top:12px',
    'z-index:99999',
    'height:40px',
    'padding:0 16px',
    'border:0',
    'border-radius:8px',
    'background:linear-gradient(to right, #ff758c 0%, #ff7eb3 100%)',
    'color:#fff',
    'box-shadow:0 1px 2px rgba(27,31,36,.08)',
    'font:600 13px Arial,sans-serif',
    'cursor:pointer',
  ].join(';');
  button.addEventListener('click', onStart);
  document.body.appendChild(button);
}
