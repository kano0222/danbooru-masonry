import { icons } from './icons';
import { escapeAttr, escapeHtml } from '../utils/escape';
import { DOWNLOAD_FILENAME_TEMPLATE_OPTIONS, type AppState } from '../core/state';
import { CARD_SIZE_OPTIONS } from '../core/masonry';

export function renderShell(state: AppState): void {
  document.title = 'Danbooru Masonry';
  const canSaveBlacklist = Boolean(
    state.blacklistAvailable && document.body.dataset.currentUserId &&
      document.body.dataset.currentUserIsAnonymous !== 'true',
  );
  const cardSize = CARD_SIZE_OPTIONS.find((option) => option.value === state.cardWidth)?.key || 'medium';
  const cardSizeOptions = CARD_SIZE_OPTIONS.map(
    (option) =>
      `<option value="${option.key}"${option.value === state.cardWidth ? ' selected' : ''}>${option.label}</option>`,
  ).join('');
  const downloadFilenameTemplateInputs = DOWNLOAD_FILENAME_TEMPLATE_OPTIONS.map(
    (option) => `
              <label class="dmh-download-template-row" for="dmh-download-template-${option.key}">
                <span class="dmh-download-template-heading">
                  <span class="dmh-download-template-label">${option.label}</span>
                  <span class="dmh-setting-help dmh-download-preview" id="dmh-download-preview-${option.key}"></span>
                </span>
                <input class="dmh-download-template-input" id="dmh-download-template-${option.key}" type="text" data-download-template="${option.key}" value="${escapeAttr(state.downloadFilenameTemplates[option.key])}" aria-describedby="dmh-download-preview-${option.key}">
              </label>`,
  ).join('');
  document.body.innerHTML = `
    <div id="dmh-app" data-card-size="${cardSize}" data-show-thumbnail-info="${state.showThumbnailInfo}" data-show-thumbnail-buttons="${state.showThumbnailButtons}">
      <header class="dmh-topbar" id="dmh-topbar">
        <div class="dmh-toolbar-content">
          <div class="dmh-brand">
            <button class="dmh-title" id="dmh-title-exit" type="button" aria-label="退出瀑布流">danbooru</button>
            <div class="dmh-page-group">
              <span class="dmh-page-label">页码</span>
              <label class="dmh-page-control" title="页码" aria-label="页码">
                <input class="dmh-page-input" id="dmh-page" type="text" inputmode="numeric" pattern="[0-9]*" size="1" value="${state.page}">
              </label>
            </div>
          </div>
          <div class="dmh-search">
            <form class="dmh-search-form" id="dmh-search">
              <input id="dmh-tags" type="search" autocomplete="off" placeholder="搜索标签" value="${escapeAttr(state.tags)}">
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
        <div class="dmh-loading-progress" id="dmh-loading-progress" role="progressbar" aria-label="正在加载瀑布流" aria-hidden="true" hidden>
          <div class="dmh-loading-progress-bar"></div>
        </div>
      </header>
      <main class="dmh-grid" id="dmh-grid"></main>
      <div class="dmh-message" id="dmh-message"></div>
      <div class="dmh-scrollbar" id="dmh-scrollbar" role="scrollbar" aria-label="瀑布流滚动位置" aria-controls="dmh-grid" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
        <div class="dmh-scrollbar-thumb" id="dmh-scrollbar-thumb"></div>
      </div>
      <button class="dmh-back-to-top" id="dmh-back-to-top" type="button" aria-label="回到顶部" title="回到顶部">${icons.arrowUp}</button>
      <div class="dmh-settings-overlay" id="dmh-settings-overlay" aria-hidden="true"></div>
      <aside class="dmh-settings-panel" id="dmh-settings-panel" role="dialog" aria-modal="true" aria-labelledby="dmh-settings-title" aria-hidden="true">
        <div class="dmh-settings-header">
          <h2 id="dmh-settings-title">设置</h2>
          <button class="dmh-settings-close" id="dmh-settings-close" type="button" aria-label="关闭设置">${icons.close}</button>
        </div>
        <div class="dmh-settings-content">
          <h3 class="dmh-settings-group-title">瀑布流</h3>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">自动进入瀑布流</span><span class="dmh-setting-help">打开原站图片列表页时自动使用瀑布流浏览</span></span>
              <label class="dmh-setting-switch" aria-label="自动进入瀑布流">
                <input id="dmh-auto-enter-masonry" type="checkbox" ${state.autoEnterMasonry ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <label class="dmh-setting-row" for="dmh-card-size">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">缩略图大小</span><span class="dmh-setting-help">调整列表中图片卡片的宽度</span></span>
              <select class="dmh-setting-select" id="dmh-card-size">
${cardSizeOptions}
              </select>
            </label>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">显示 NSFW</span><span class="dmh-setting-help">包含敏感、限制级内容</span></span>
              <label class="dmh-setting-switch" aria-label="显示 NSFW">
                <input id="dmh-show-nsfw" type="checkbox" ${!state.hideNsfw ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">显示缩略图操作按钮</span><span class="dmh-setting-help">在图片卡片上显示收藏和下载按钮</span></span>
              <label class="dmh-setting-switch" aria-label="显示缩略图操作按钮">
                <input id="dmh-show-thumbnail-buttons" type="checkbox" ${state.showThumbnailButtons ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">显示缩略图信息</span><span class="dmh-setting-help">在图片卡片上显示作品信息</span></span>
              <label class="dmh-setting-switch" aria-label="显示缩略图信息">
                <input id="dmh-show-thumbnail-info" type="checkbox" ${state.showThumbnailInfo ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">显示瀑布流滚动条</span><span class="dmh-setting-help">在页面右侧显示滚动条</span></span>
              <label class="dmh-setting-switch" aria-label="显示瀑布流滚动条">
                <input id="dmh-show-scrollbar" type="checkbox" ${state.showScrollbar ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <h3 class="dmh-settings-group-title">详情页</h3>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">使用滚轮切换图片</span><span class="dmh-setting-help">在详情查看器中滚动切换上一张或下一张</span></span>
              <label class="dmh-setting-switch" aria-label="使用滚轮切换图片">
                <input id="dmh-viewer-wheel-navigation" type="checkbox" ${state.viewerWheelNavigation ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">加载原图</span><span class="dmh-setting-help">打开详情页时直接加载高质量原图</span></span>
              <label class="dmh-setting-switch" aria-label="加载原图">
                <input id="dmh-viewer-use-original" type="checkbox" ${state.viewerUseOriginal ? 'checked' : ''}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <label class="dmh-setting-row" for="dmh-viewer-preload-count">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">预加载数量</span><span class="dmh-setting-help">提前加载后续图片；设为 0 可关闭</span></span>
              <select class="dmh-setting-select" id="dmh-viewer-preload-count">
                ${[0, 1, 2, 3, 4, 5].map((count) => `<option value="${count}" ${state.viewerPreloadCount === count ? 'selected' : ''}>${count === 0 ? '0（关闭）' : count}</option>`).join('')}
              </select>
            </label>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <label class="dmh-setting-copy" for="dmh-tag-click-behavior"><span class="dmh-setting-label">标签点击行为</span><span class="dmh-setting-help">选择点击详情标签后的搜索方式</span></label>
              <select class="dmh-setting-select dmh-tag-click-select" id="dmh-tag-click-behavior">
                ${[
                  ['masonry-current-tab', '当前页瀑布流搜索'],
                  ['masonry-new-tab', '新标签页瀑布流搜索'],
                ]
                  .map(
                    ([value, label]) =>
                      `<option value="${value}"${state.tagClickBehavior === value ? ' selected' : ''}>${label}</option>`,
                  )
                  .join('')}
              </select>
            </div>
          </section>
          <h3 class="dmh-settings-group-title">其他</h3>
          <button class="dmh-setting-editor-button" id="dmh-blacklist-editor-open" type="button" aria-haspopup="dialog" aria-controls="dmh-blacklist-editor"><span class="dmh-setting-copy"><span>Danbooru 黑名单规则</span><span class="dmh-setting-help">编辑用于过滤图片的原站规则</span></span><span aria-hidden="true">›</span></button>
          <button class="dmh-setting-editor-button" id="dmh-download-editor-open" type="button" aria-haspopup="dialog" aria-controls="dmh-download-editor"><span class="dmh-setting-copy"><span>下载文件名模板</span><span class="dmh-setting-help">按图片来源自定义下载文件名</span></span><span aria-hidden="true">›</span></button>
        </div>
        <div class="dmh-settings-footer">
          <a class="dmh-settings-github" href="https://github.com/kano0222/danbooru-masonry" target="_blank" rel="noreferrer" aria-label="打开 GitHub 仓库" title="GitHub">${icons.github}</a>
        </div>
      </aside>
      <dialog class="dmh-settings-editor" id="dmh-blacklist-editor" aria-labelledby="dmh-blacklist-editor-title">
        <div class="dmh-settings-header">
          <h2 id="dmh-blacklist-editor-title">Danbooru 黑名单规则</h2>
          <button class="dmh-settings-close" id="dmh-blacklist-editor-close" type="button" aria-label="关闭Danbooru 黑名单规则" autofocus>${icons.close}</button>
        </div>
        <div class="dmh-settings-editor-content">
          <section class="dmh-setting-section">
            <div class="dmh-setting-stack">
              <textarea class="dmh-blacklist-rules" id="dmh-blacklist-rules" aria-labelledby="dmh-blacklist-editor-title" rows="7" spellcheck="false" ${canSaveBlacklist ? '' : 'readonly'}>${escapeHtml(state.blacklistText)}</textarea>
              <div class="dmh-template-help">每行一条规则，关闭窗口或取消会放弃未保存修改。</div>
              <div class="dmh-blacklist-actions">
                <span class="dmh-blacklist-status" id="dmh-blacklist-status" role="status">${!state.blacklistAvailable ? '未能读取原站黑名单，请刷新原站后重试' : canSaveBlacklist ? '' : '登录 Danbooru 后可修改'}</span>
                <div class="dmh-blacklist-buttons">
                  <button class="dmh-template-reset" id="dmh-blacklist-cancel" type="button">取消</button>
                  <button class="dmh-blacklist-save" id="dmh-blacklist-save" type="button" ${canSaveBlacklist ? '' : 'disabled'}>保存</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </dialog>
      <dialog class="dmh-settings-editor" id="dmh-download-editor" aria-labelledby="dmh-download-editor-title">
        <div class="dmh-settings-header">
          <h2 id="dmh-download-editor-title">下载文件名模板</h2>
          <button class="dmh-settings-close" id="dmh-download-editor-close" type="button" aria-label="关闭下载文件名模板" autofocus>${icons.close}</button>
        </div>
        <div class="dmh-settings-editor-content">
          <section class="dmh-setting-section">
            <div class="dmh-setting-stack">
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
                <div>关闭窗口或取消会放弃未保存修改。</div>
              </div>
              <div class="dmh-download-template-actions">
                <span class="dmh-download-template-status" id="dmh-download-template-status" role="status" aria-live="polite"></span>
                <div class="dmh-download-template-buttons">
                  <button class="dmh-template-reset" id="dmh-download-template-reset" type="button">恢复默认</button>
                  <button class="dmh-template-reset" id="dmh-download-cancel" type="button">取消</button>
                  <button class="dmh-blacklist-save" id="dmh-download-save" type="button">保存</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </dialog>
      <div class="dmh-viewer" id="dmh-viewer" aria-hidden="true">
        <div class="dmh-viewer-tags" id="dmh-viewer-tags" hidden>
          <section class="dmh-viewer-tags-panel" id="dmh-viewer-tags-panel" aria-label="图片标签" hidden>
            <div class="dmh-viewer-tags-list" id="dmh-viewer-tags-list"></div>
          </section>
          <button class="dmh-info-pill dmh-pill-id" id="dmh-viewer-tags-toggle" type="button" aria-expanded="false" aria-controls="dmh-viewer-tags-panel">显示标签</button>
        </div>
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
          <div class="v-progress-circular" id="dmh-viewer-progress" role="status" aria-label="正在加载图片"></div>
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
