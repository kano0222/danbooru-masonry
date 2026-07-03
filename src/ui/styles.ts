import { CARD_WIDTH } from '../core/masonry';

export function installStyles(): void {
  if (document.getElementById('dmh-style')) return;
  const style = document.createElement('style');
  style.id = 'dmh-style';
  style.textContent = `
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: #f6f7f9; color: #1f2328; font-family: Arial, "Helvetica Neue", sans-serif; }
    body.dmh-no-scroll { overflow: hidden; }
    #dmh-app { min-height: 100vh; }
    .dmh-topbar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 10px 16px; background: rgba(255,255,255,.94); border-bottom: 1px solid #d8dee4; backdrop-filter: blur(10px); }
    .dmh-title { font-size: 22px; font-weight: 700; line-height: 1; white-space: nowrap; }
    .dmh-search { position: relative; display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
    .dmh-search input { width: min(560px, 100%); height: 36px; padding: 0 12px; border: 1px solid #afb8c1; border-radius: 6px; background: #fff; color: inherit; }
    .dmh-search button, .dmh-exit-button { height: 36px; padding: 0 12px; border: 1px solid #afb8c1; border-radius: 6px; background: #fff; color: #24292f; cursor: pointer; }
    .dmh-search button:hover, .dmh-exit-button:hover { background: #f0f3f6; }
    .dmh-exit-button { flex: 0 0 auto; }
    .dmh-status { margin-left: auto; color: #57606a; font-size: 13px; white-space: nowrap; }
    .dmh-grid { position: relative; width: calc(100vw - 24px); margin: 12px auto; }
    .dmh-layout { display: block; }
    .dmh-sidebar { display: none; }
    .dmh-card { position: absolute; width: ${CARD_WIDTH}px; overflow: hidden; border-radius: 6px; background: #d8dee4; box-shadow: 0 1px 2px rgba(27,31,36,.12); cursor: zoom-in; transition: left .18s ease, top .18s ease; }
    .dmh-card img { display: block; width: 100%; height: 100%; object-fit: cover; background: #d8dee4; }
    .dmh-card-meta { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; gap: 8px; padding: 5px 7px; color: #fff; font-size: 12px; background: linear-gradient(transparent, rgba(0,0,0,.68)); opacity: 0; transition: opacity .16s ease; }
    .dmh-card:hover .dmh-card-meta { opacity: 1; }
    .dmh-video-badge { position: absolute; top: 6px; right: 6px; padding: 2px 6px; color: #fff; font-size: 12px; border-radius: 4px; background: rgba(0,0,0,.62); }
    .dmh-message { padding: 24px; text-align: center; color: #57606a; }
    .dmh-ac { position: absolute; top: 42px; left: 0; z-index: 20; display: none; width: min(560px, 100%); max-height: 320px; overflow: auto; padding: 4px; border: 1px solid #d0d7de; border-radius: 6px; background: #fff; box-shadow: 0 8px 24px rgba(140,149,159,.32); }
    .dmh-ac.dmh-open { display: block; }
    .dmh-ac-item { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px; width: 100%; padding: 6px 8px; border: 0; border-radius: 4px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
    .dmh-ac-item:hover { background: #f6f8fa; }
    .dmh-ac-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
    .dmh-ac-cn, .dmh-ac-count, .dmh-ac-category { color: #57606a; font-size: 12px; white-space: nowrap; }
    .dmh-viewer { position: fixed; inset: 0; z-index: 100; display: none; align-items: center; justify-content: center; background: #fff; }
    .dmh-viewer.dmh-open { display: flex; }
    .dmh-viewer img, .dmh-viewer video { display: block; max-width: 100vw; max-height: 100vh; object-fit: contain; }
    .dmh-viewer video { background: #000; }
    .dmh-viewer.dmh-zoom-mode img { max-width: none; max-height: none; cursor: grab; user-select: none; }
    .dmh-viewer.dmh-zoom-mode img.dmh-dragging { cursor: grabbing; }
    .dmh-viewer-actions { position: absolute; top: 14px; right: 14px; z-index: 3; display: flex; gap: 8px; opacity: 1; transition: opacity .18s ease; }
    .dmh-viewer-button { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: #cfe8ff; color: #0969da; cursor: pointer; box-shadow: 0 2px 8px rgba(9,105,218,.18); transition: background .16s ease, color .16s ease, transform .16s ease, box-shadow .16s ease; }
    .dmh-viewer-button:hover { background: #8ecbff; color: #034f9f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(9,105,218,.24); }
    .dmh-viewer-button[disabled] { opacity: .45; cursor: not-allowed; }
    .dmh-viewer-button svg, .dmh-viewer-nav svg { width: 22px; height: 22px; fill: currentColor; }
    .dmh-viewer-button svg[fill="none"], .dmh-viewer-nav svg[fill="none"] { fill: none; }
    .dmh-viewer-button.dmh-favorited { background: #ffe5ea; color: rgb(255, 64, 96); box-shadow: 0 4px 12px rgba(255,64,96,.18); }
    .dmh-viewer-button.dmh-active { background: #8ecbff; color: #034f9f; }
    .dmh-viewer-nav { position: absolute; top: 50%; z-index: 3; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: #cfe8ff; color: #0969da; cursor: pointer; opacity: 1; transform: translateY(-50%); box-shadow: 0 2px 8px rgba(9,105,218,.18); transition: background .16s ease, color .16s ease, opacity .18s ease, transform .16s ease, box-shadow .16s ease; }
    .dmh-viewer-nav:hover { background: #8ecbff; color: #034f9f; transform: translateY(-50%) scale(1.06); box-shadow: 0 4px 12px rgba(9,105,218,.24); }
    .dmh-viewer-prev { left: 22px; }
    .dmh-viewer-next { right: 22px; }
    .dmh-viewer-info { position: absolute; top: 14px; left: 14px; z-index: 3; display: flex; flex-direction: column; align-items: flex-start; gap: 7px; max-width: min(360px, 36vw); max-height: 44vh; overflow: auto; opacity: 1; transform: translateY(0); transition: opacity .18s ease, transform .18s ease; pointer-events: none; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-info { opacity: 0; transform: translateY(-6px); pointer-events: none; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-actions, .dmh-viewer.dmh-chrome-hidden .dmh-viewer-nav { opacity: 0; pointer-events: none; }
    .dmh-info-pill { display: inline-flex; align-items: center; max-width: 100%; height: 24px; padding: 0 10px; border: 1px solid transparent; border-radius: 999px; font-size: 12px; font-weight: bold; line-height: 24px; text-decoration: none; pointer-events: auto; user-select: none; }
    .dmh-info-pill:hover { text-decoration: none; }
    .dmh-pill-id, .dmh-pill-id:visited { background: #bfe3ff; color: #0969da; }
    .dmh-pill-artist, .dmh-pill-artist:visited { color: rgb(201, 112, 0); background-color: rgb(255, 220, 176); border-color: rgb(255, 220, 176); }
    .dmh-pill-copyright, .dmh-pill-copyright:visited { color: rgb(174, 63, 193); background-color: rgb(249, 213, 255); border-color: rgb(249, 213, 255); }
    .dmh-pill-character, .dmh-pill-character:visited { color: rgb(12, 147, 18); background-color: rgb(196, 255, 199); border-color: rgb(196, 255, 199); }
    .dmh-tag-chip { display: inline-flex; max-width: 100%; padding: 2px 7px; border-radius: 999px; color: #fff; text-decoration: none; background: rgba(143, 119, 181, .9); }
    .dmh-tag-chip:hover { text-decoration: none; }
    .dmh-tag-artist { background: rgba(251, 140, 0, .9); }
    .dmh-tag-copyright { background: rgba(171, 71, 188, .9); }
    .dmh-tag-character { background: rgba(102, 187, 106, .9); }
    .dmh-tag-meta { background: rgba(84, 110, 122, .9); }
    @media (max-width: 700px) { .dmh-title { display: none; } .dmh-viewer-info { max-width: calc(100vw - 96px); max-height: 30vh; font-size: 12px; } .dmh-viewer-actions { flex-wrap: wrap; max-width: calc(100vw - 120px); } .dmh-viewer-button { width: 34px; height: 34px; } .dmh-viewer-button svg { width: 19px; height: 19px; } .dmh-viewer-nav { width: 42px; height: 42px; font-size: 26px; } .dmh-viewer-prev { left: 12px; } .dmh-viewer-next { right: 12px; } }
  `;
  document.head.appendChild(style);
}
