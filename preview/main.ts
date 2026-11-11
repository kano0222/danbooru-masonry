import { boot } from '../src/main';
import { showSnackbar, showViewer } from '../src/core/viewer';
import { PreviewAdapter } from './adapter';
import { createPreviewPosts, popularSearches, translations } from './fixtures';
import { createPreviewFetch } from './requests';

const pageUrl = new URL(location.href);
pageUrl.search = '';
pageUrl.hash = '';
const posts = createPreviewPosts(pageUrl.toString());
const storageKey = 'danbooru-masonry.preview.settings';
const settings: Record<string, unknown> = {
  'danbooru-masonry.searchLibrary': {
    pinned: ['landscape', 'original'], recent: ['1girl solo', 'sky clouds', 'hiten', 'night'],
  },
};
try {
  Object.assign(settings, JSON.parse(localStorage.getItem(storageKey) || '{}'));
} catch { /* Defaults remain usable when browser storage is unavailable. */ }

// Userscript storage is isolated from the real extension and other local applications.
Object.assign(globalThis, {
  GM_getValue: <T>(name: string, defaultValue?: T): T =>
    (settings[name] === undefined ? defaultValue : structuredClone(settings[name])) as T,
  GM_setValue: (name: string, value: unknown) => {
    settings[name] = structuredClone(value);
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Session only. */ }
  },
  GM_openInTab: (url: string) => window.open(url, '_blank', 'noreferrer'),
  GM_download: (details: Parameters<typeof GM_download>[0]) => {
    if (typeof details === 'string') return;
    const url = new URL(details.url, pageUrl);
    if (url.origin !== pageUrl.origin || !posts.some((post) => post.fileUrl === url.href)) {
      details.onerror?.(new Error('Only local preview images can be downloaded'));
      return;
    }
    const link = document.createElement('a');
    link.href = url.href;
    link.download = details.name || 'preview.jpg';
    link.click();
    details.onload?.();
  },
});

// Supply the same login context that the real page exposes.
Object.assign(document.body.dataset, {
  currentUserId: '1', currentUserName: 'Preview_User', currentUserIsAnonymous: 'false',
});
window.fetch = createPreviewFetch({
  origin: location.origin, translations, popular: popularSearches,
  readBlacklist: () => GM_getValue('blacklistText', 'spoilers'),
  saveBlacklist: (text) => GM_setValue('blacklistText', text),
});

const requestedPost = location.hash.match(/^#post-(\d+)$/)?.[1];
const observer = new MutationObserver(() => {
  const brand = document.querySelector('.dmh-brand');
  if (brand && !document.getElementById('dmh-preview-label')) {
    const label = document.createElement('span');
    label.id = 'dmh-preview-label';
    label.className = 'dmh-page-label';
    label.textContent = '演示';
    label.title = '模拟已登录状态；标签、评分与分级为演示数据，操作仅影响本地预览。';
    brand.appendChild(label);
    document.title = 'Danbooru Masonry · 演示预览';
  }
  if (brand) observer.disconnect();
});
observer.observe(document.body, { childList: true, subtree: true });

// Exiting a demo has no original Danbooru page to return to.
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element) || !event.target.closest('#dmh-title-exit, #dmh-exit')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showSnackbar('当前为演示预览');
}, true);

boot(new PreviewAdapter(posts, pageUrl.toString()), {
  autoStart: true,
  standalone: true,
  onStarted: (state) => {
    if (!requestedPost || state.viewerIndex >= 0) return;
    const index = state.posts.findIndex((post) => post.id === requestedPost);
    if (index >= 0) showViewer(state, index);
  },
});
