import { CARD_WIDTH } from '../core/masonry';

export function installStyles(): void {
  if (document.getElementById('dmh-style')) return;
  const style = document.createElement('style');
  style.id = 'dmh-style';
  style.textContent = `
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; overflow-x: hidden; scrollbar-width: none; background: #f6f7f9; color: #1f2328; font-family: Arial, "Helvetica Neue", sans-serif; }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
    body.dmh-no-scroll { overflow: hidden; }
    #dmh-app { min-height: 100vh; }
    .dmh-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 10; min-height: 56px; background: rgba(255,255,255,.94); border-bottom: 1px solid #d8dee4; backdrop-filter: blur(10px); overflow: visible; }
    .dmh-toolbar-content { display: grid; grid-template-columns: minmax(0, 1fr) minmax(180px, 496px) minmax(0, 1fr); align-items: center; gap: 12px; width: 100%; min-width: 0; min-height: 56px; padding: 10px 16px; overflow: visible; white-space: nowrap; }
    .dmh-brand { display: flex; align-items: center; justify-self: start; gap: 25px; min-width: 0; }
    .dmh-title { font-size: 22px; font-weight: 700; line-height: 1; white-space: nowrap; }
    .dmh-search { display: block; justify-self: center; width: min(496px, 100%); min-width: 0; max-width: 496px; }
    .dmh-search-form { position: relative; display: grid; grid-template-columns: minmax(0, 450px) 38px; align-items: center; gap: 8px; width: 100%; min-width: 0; }
    #dmh-app .dmh-search input { width: 100%; height: 36px; padding: 0 12px; border: 1px solid #afb8c1; border-radius: 6px; background: #fff; color: inherit; }
    .dmh-page-group { display: flex; align-items: center; gap: 6px; min-width: 0; color: #57606a; font-size: 12px; font-weight: 700; }
    .dmh-page-label { user-select: none; }
    .dmh-page-control { display: flex; align-items: center; justify-content: center; height: 28px; padding: 0; border: 1px solid #d0d7de; border-radius: 999px; background: #f6f8fa; color: #57606a; }
    .dmh-page-control:focus-within { border-color: #0969da; background: #fff; box-shadow: 0 0 0 3px rgba(9,105,218,.12); }
    .dmh-page-input { width: 42px; min-width: 42px; height: 26px; padding: 0; border: 0; border-radius: 0; background: transparent; color: #24292f; text-align: center; font-weight: 700; outline: 0; appearance: textfield; }
    .dmh-page-input::-webkit-inner-spin-button, .dmh-page-input::-webkit-outer-spin-button { margin: 0; appearance: none; }
    #dmh-app .dmh-search-form > button, #dmh-app .dmh-exit-button { height: 36px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: #57606a; cursor: pointer; box-shadow: none; }
    #dmh-app .dmh-icon-button { display: inline-flex; align-items: center; justify-content: center; width: 38px; min-width: 38px; padding: 0; }
    .dmh-icon-button svg { width: 22px; height: 22px; fill: none; stroke: currentColor; }
    #dmh-app [data-dmh-tooltip] { position: relative; }
    #dmh-app [data-dmh-tooltip]::after { content: attr(data-dmh-tooltip); position: absolute; top: calc(100% + 8px); left: 50%; z-index: 200; max-width: min(520px, 90vw); padding: 6px 10px; border-radius: 4px; background: rgba(33,33,33,.95); color: #fff; font-size: 12px; font-weight: 500; line-height: 1.35; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; pointer-events: none; transform: translate(-50%, -4px); transition: opacity .14s ease, transform .14s ease; }
    #dmh-app [data-dmh-tooltip]:hover::after, #dmh-app [data-dmh-tooltip]:focus-visible::after { opacity: 1; transform: translate(-50%, 0); }
    #dmh-app .dmh-search-form > button:hover, #dmh-app .dmh-exit-button:hover { background: rgba(9,105,218,.08); color: #0969da; }
    #dmh-app .dmh-search-form > button:focus-visible, #dmh-app .dmh-exit-button:focus-visible { outline: 2px solid rgba(9,105,218,.38); outline-offset: 2px; }
    .dmh-exit-button { flex: 0 0 auto; }
    .dmh-toolbar-actions { display: flex; align-items: center; justify-self: end; gap: 8px; min-width: 0; }
    .dmh-status { min-width: 112px; overflow: hidden; color: #57606a; font-size: 13px; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
    .dmh-grid { position: relative; width: calc(100% - 32px); margin: 68px 16px 12px; overflow: hidden; }
    .dmh-layout { display: block; }
    .dmh-sidebar { display: none; }
    .dmh-card { position: absolute; width: ${CARD_WIDTH}px; overflow: hidden; border-radius: 6px; background: #d8dee4; box-shadow: 0 1px 2px rgba(27,31,36,.12); cursor: zoom-in; transition: left .18s ease, top .18s ease, width .18s ease; }
    .dmh-card img { display: block; width: 100%; height: 100%; object-fit: cover; background: #d8dee4; }
    .dmh-card-error { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #f6f8fa; color: #57606a; text-align: center; }
    .dmh-card-error[hidden] { display: none; }
    .dmh-card-error svg { width: 42px; height: 42px; fill: currentColor; }
    .dmh-card-error span { font-size: 13px; font-weight: 700; color: #24292f; }
    .dmh-card-meta { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; gap: 8px; padding: 5px 7px; color: #fff; font-size: 12px; background: linear-gradient(transparent, rgba(0,0,0,.68)); opacity: 0; transition: opacity .16s ease; }
    .dmh-card:hover .dmh-card-meta { opacity: 1; }
    .dmh-video-badge { position: absolute; top: 6px; right: 6px; padding: 2px 6px; color: #fff; font-size: 12px; border-radius: 4px; background: rgba(0,0,0,.62); }
    .dmh-message { padding: 24px; text-align: center; color: #57606a; }
    .dmh-snackbar { position: fixed; top: 72px; left: 50%; z-index: 220; max-width: min(520px, calc(100vw - 32px)); padding: 10px 18px; border-radius: 4px; background: #323232; color: #fff; font-size: 14px; line-height: 1.45; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 6px 18px rgba(27,31,36,.22); opacity: 0; pointer-events: none; transform: translate(-50%, -12px); transition: opacity .18s ease, transform .18s ease; }
    .dmh-snackbar.dmh-open { opacity: 1; transform: translate(-50%, 0); }
    .dmh-ac { position: absolute; top: 42px; left: 0; z-index: 20; width: min(450px, 100%); max-height: 320px; overflow: auto; scrollbar-width: none; padding: 4px; border: 1px solid #d0d7de; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(140,149,159,.32); opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(-6px) scale(.98); transform-origin: top center; transition: opacity .16s ease, transform .16s ease, visibility 0s linear .16s; }
    .dmh-ac::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-ac.dmh-open { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0) scale(1); transition-delay: 0s; }
    .dmh-ac-item { display: flex; align-items: center; width: 100%; min-height: 32px; padding: 0 12px; border: 0; border-radius: 4px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
    .dmh-ac-item:hover { background: #f6f8fa; box-shadow: none; }
    .dmh-ac-item.dmh-selected, .dmh-ac-item.dmh-selected:hover { background: #eef6ff; box-shadow: inset 3px 0 0 #0969da; }
    .dmh-ac-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
    .dmh-ac-cn { color: #57606a; font-size: 12px; white-space: nowrap; }
    .dmh-viewer { position: fixed; inset: 0; z-index: 100; display: none; align-items: center; justify-content: center; background: #fff; }
    .dmh-viewer.dmh-open { display: flex; }
    .dmh-viewer img, .dmh-viewer video { display: block; max-width: 100vw; max-height: 100vh; object-fit: contain; }
    .dmh-viewer video { background: #000; }
    .img_detail_loading { position: absolute; top: 0; left: 0; z-index: 1; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; margin: 0; pointer-events: none; }
    .img_detail_loading[hidden] { display: none; }
    .img_detail_loading::after { content: ''; position: absolute; z-index: 1; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(2px); }
    #dmh-viewer-progress { position: absolute; top: 50%; left: 50%; z-index: 10; transform: translate(-50%, -50%); }
    .img_detail_loading .v-progress-circular { width: 100px; height: 100px; border: 6px solid rgba(26, 115, 232, .18); border-top-color: #1a73e8; border-radius: 50%; color: #1a73e8 !important; caret-color: #1a73e8 !important; animation: dmh-progress-circular .82s linear infinite; }
    @keyframes dmh-progress-circular { to { transform: translate(-50%, -50%) rotate(360deg); } }
    .dmh-viewer-error { position: absolute; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #57606a; }
    .dmh-viewer-error[hidden] { display: none; }
    .dmh-viewer-error h1 { margin: 0; font-size: 24px; line-height: 1.2; font-weight: 700; color: #24292f; }
    .fieitW { stroke: none; fill: currentcolor; width: 72px; height: 72px; line-height: 0; font-size: 0; vertical-align: middle; }
    .img_detail_loading img { object-fit: cover; }
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
    .dmh-viewer-info { position: absolute; top: 14px; left: 14px; z-index: 3; display: flex; flex-direction: column; align-items: flex-start; gap: 7px; max-width: min(360px, 36vw); max-height: 44vh; overflow-x: hidden; overflow-y: auto; scrollbar-width: none; opacity: 1; transform: translateY(0); transition: opacity .18s ease, transform .18s ease; pointer-events: none; }
    .dmh-viewer-info::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-info { opacity: 0; transform: translateY(-6px); pointer-events: none; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-actions, .dmh-viewer.dmh-chrome-hidden .dmh-viewer-nav { opacity: 0; pointer-events: none; }
    .dmh-info-pill { display: block; max-width: 100%; height: 24px; padding: 0 10px; overflow: hidden; border: 1px solid transparent; border-radius: 999px; font-size: 12px; font-weight: bold; line-height: 24px; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; pointer-events: auto; user-select: none; }
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
    @media (max-width: 980px) { .dmh-title { display: none; } .dmh-brand { gap: 0; } }
    @media (max-width: 760px) { .dmh-toolbar-content { grid-template-columns: minmax(0, .6fr) minmax(120px, 1fr) max-content; gap: 8px; padding: 10px; } .dmh-search { justify-self: stretch; max-width: none; } .dmh-search-form { grid-template-columns: minmax(0, 1fr) 38px; } .dmh-status { display: none; } .dmh-viewer-info { max-width: calc(100vw - 96px); max-height: 30vh; font-size: 12px; } .dmh-viewer-actions { flex-wrap: wrap; max-width: calc(100vw - 120px); } .dmh-viewer-button { width: 34px; height: 34px; } .dmh-viewer-button svg { width: 19px; height: 19px; } .dmh-viewer-nav { width: 42px; height: 42px; font-size: 26px; } .dmh-viewer-prev { left: 12px; } .dmh-viewer-next { right: 12px; } }
  `;
  document.head.appendChild(style);
}
