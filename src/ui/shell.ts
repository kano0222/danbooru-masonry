import type { AppState } from '../core/state';
import { escapeAttr } from '../utils/escape';
import { icons } from './icons';

export function renderShell(state: AppState): void {
  document.title = 'Danbooru Masonry';
  document.body.innerHTML = `
    <div id="dmh-app">
      <header class="dmh-topbar">
        <div class="dmh-title">danbooru</div>
        <form class="dmh-search" id="dmh-search">
          <input id="dmh-tags" type="search" autocomplete="off" placeholder="tags" value="${escapeAttr(state.tags)}">
          <button class="dmh-button" type="submit">Search</button>
          <div class="dmh-ac" id="dmh-ac"></div>
        </form>
        <div class="dmh-status" id="dmh-status">已加载 0 张</div>
        <button class="dmh-exit-button" id="dmh-exit" type="button">退出瀑布流</button>
      </header>
      <main class="dmh-grid" id="dmh-grid"></main>
      <div class="dmh-message" id="dmh-message"></div>
      <div class="dmh-viewer" id="dmh-viewer" aria-hidden="true">
        <div class="dmh-viewer-info" id="dmh-viewer-info"></div>
        <div class="dmh-viewer-actions">
          <button class="dmh-viewer-button" id="dmh-favorite" type="button" title="收藏" aria-label="收藏">${icons.heart}</button>
          <button class="dmh-viewer-button" id="dmh-zoom-toggle" type="button" title="查看大图" aria-label="查看大图">${icons.zoom}</button>
          <button class="dmh-viewer-button" id="dmh-open-post" type="button" title="详情" aria-label="详情">${icons.info}</button>
          <button class="dmh-viewer-button" id="dmh-open-source" type="button" title="来源" aria-label="来源">${icons.external}</button>
          <button class="dmh-viewer-button" id="dmh-close" type="button" title="关闭" aria-label="关闭">${icons.close}</button>
        </div>
        <button class="dmh-viewer-nav dmh-viewer-prev" id="dmh-prev" type="button" title="上一张" aria-label="上一张">${icons.prev}</button>
        <button class="dmh-viewer-nav dmh-viewer-next" id="dmh-next" type="button" title="下一张" aria-label="下一张">${icons.next}</button>
        <img id="dmh-viewer-img" alt="" draggable="true">
        <video id="dmh-viewer-video" controls autoplay loop playsinline hidden></video>
      </div>
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
