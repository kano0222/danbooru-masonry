import type { Post } from '../adapters/types';
import type { AppState } from '../core/state';
import { scheduleLayoutMasonry } from '../core/masonry';
import { escapeAttr, escapeHtml } from '../utils/escape';

export function renderPosts(
  state: AppState,
  posts: Post[],
  startIndex: number,
  onOpen: (index: number) => void,
): void {
  const grid = document.getElementById('dmh-grid');
  if (!grid) return;
  const fragment = document.createDocumentFragment();
  posts.forEach((post, index) => {
    const postIndex = startIndex + index;
    const card = document.createElement('article');
    card.className = 'dmh-card';
    card.dataset.id = post.id;
    card.dataset.index = String(postIndex);
    card.innerHTML = `
      <img loading="lazy" alt="" src="${escapeAttr(post.listUrl || post.viewerUrl || post.previewUrl)}">
      <div class="dmh-card-error" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10,6 C10,4.8954305 10.8954305,4 12,4 C13.1045695,4 14,4.8954305 14,6 L14,12.5 C14,13.6045695 13.1045695,14.5 12,14.5 C10.8954305,14.5 10,13.6045695 10,12.5 L10,6 Z M12,20 C10.7573593,20 9.75,18.9926407 9.75,17.75 C9.75,16.5073593 10.7573593,15.5 12,15.5 C13.2426407,15.5 14.25,16.5073593 14.25,17.75 C14.25,18.9926407 13.2426407,20 12,20 Z"></path></svg>
        <span>加载失败</span>
      </div>
      ${post.isVideo ? '<div class="dmh-video-badge">video</div>' : ''}
      <div class="dmh-card-meta">
        <span>#${escapeHtml(post.id)}</span>
        <span>${escapeHtml(post.width)} x ${escapeHtml(post.height)}</span>
      </div>
    `;
    card.addEventListener('click', () => onOpen(postIndex));
    card.querySelector('img')?.addEventListener('load', (event) => {
      const image = event.currentTarget as HTMLImageElement;
      card.querySelector<HTMLElement>('.dmh-card-error')?.setAttribute('hidden', '');
      if (!post.width && image.naturalWidth) {
        post.width = image.naturalWidth;
        post.height = image.naturalHeight;
        post.aspectRatio = post.width / post.height;
        scheduleLayoutMasonry(state);
      }
    });
    card.querySelector('img')?.addEventListener('error', (event) => {
      const image = event.currentTarget as HTMLImageElement;
      image.hidden = true;
      card.querySelector<HTMLElement>('.dmh-card-error')?.removeAttribute('hidden');
    });
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
}
