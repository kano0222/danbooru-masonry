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
      ${post.isVideo ? '<div class="dmh-video-badge">video</div>' : ''}
      <div class="dmh-card-meta">
        <span>#${escapeHtml(post.id)}</span>
        <span>${escapeHtml(post.width)} x ${escapeHtml(post.height)}</span>
      </div>
    `;
    card.addEventListener('click', () => onOpen(postIndex));
    card.querySelector('img')?.addEventListener('load', (event) => {
      const image = event.currentTarget as HTMLImageElement;
      if (!post.width && image.naturalWidth) {
        post.width = image.naturalWidth;
        post.height = image.naturalHeight;
        post.aspectRatio = post.width / post.height;
        scheduleLayoutMasonry(state);
      }
    });
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
}
