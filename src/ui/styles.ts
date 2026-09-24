import { CARD_WIDTH } from '../core/masonry';

export function installStyles(): void {
  if (document.getElementById('dmh-style')) return;
  const style = document.createElement('style');
  style.id = 'dmh-style';
  style.textContent = `
    html {
      --dmh-bg: #f6f7f9;
      --dmh-surface: #fff;
      --dmh-surface-translucent: rgba(255,255,255,.94);
      --dmh-surface-muted: #f6f8fa;
      --dmh-surface-hover: #eaeef2;
      --dmh-accent-soft: #eef6ff;
      --dmh-text: #1f2328;
      --dmh-text-strong: #24292f;
      --dmh-text-muted: #57606a;
      --dmh-border: #d0d7de;
      --dmh-border-strong: #afb8c1;
      --dmh-border-subtle: #d8dee4;
      --dmh-accent: #0969da;
      --dmh-accent-hover: #075bbd;
      --dmh-accent-active: #054da2;
      --dmh-accent-muted: rgba(9,105,218,.18);
      --dmh-focus-shadow: rgba(9,105,218,.12);
      --dmh-focus-glow: rgba(9,105,218,.18);
      --dmh-focus-ring: rgba(9,105,218,.38);
      --dmh-accent-control: #cfe8ff;
      --dmh-accent-control-hover: #8ecbff;
      --dmh-accent-control-text: #034f9f;
      --dmh-danger: #cf222e;
      --dmh-card-placeholder: #d8dee4;
      --dmh-switch-thumb: #fff;
      --dmh-scroll-track: rgba(87,96,106,.18);
      --dmh-scroll-track-hover: rgba(87,96,106,.28);
      --dmh-scroll-thumb: rgba(87,96,106,.68);
      --dmh-scroll-thumb-hover: #57606a;
      --dmh-favorite: rgb(255, 64, 96);
      --dmh-favorite-bg: #ffe5ea;
      --dmh-favorite-shadow: rgba(255,64,96,.18);
      --dmh-snackbar-bg: #323232;
      --dmh-snackbar-border: transparent;
      --dmh-tag-artist: rgb(201, 112, 0);
      --dmh-tag-copyright: rgb(174, 63, 193);
      --dmh-tag-character: rgb(12, 147, 18);
      --dmh-tag-artist-bg: rgb(255, 220, 176);
      --dmh-tag-copyright-bg: rgb(249, 213, 255);
      --dmh-tag-character-bg: rgb(196, 255, 199);
      --dmh-overlay: rgba(31,35,40,.32);
      --dmh-dialog-overlay: rgba(31,35,40,.4);
      --dmh-shadow: rgba(27,31,36,.18);
      --dmh-shadow-strong: rgba(27,31,36,.24);
      color-scheme: light;
    }
    html[data-dmh-theme="dark"] {
      --dmh-bg: #0d1117;
      --dmh-surface: #161b22;
      --dmh-surface-translucent: rgba(22,27,34,.94);
      --dmh-surface-muted: #21262d;
      --dmh-surface-hover: #30363d;
      --dmh-accent-soft: rgba(56,139,253,.16);
      --dmh-text: #e6edf3;
      --dmh-text-strong: #f0f6fc;
      --dmh-text-muted: #8b949e;
      --dmh-border: #3d444d;
      --dmh-border-strong: #484f58;
      --dmh-border-subtle: #30363d;
      --dmh-accent: #58a6ff;
      --dmh-accent-hover: #79c0ff;
      --dmh-accent-active: #388bfd;
      --dmh-accent-muted: rgba(88,166,255,.24);
      --dmh-focus-shadow: rgba(88,166,255,.24);
      --dmh-focus-glow: rgba(88,166,255,.32);
      --dmh-focus-ring: rgba(88,166,255,.65);
      --dmh-accent-control: #1f3a5a;
      --dmh-accent-control-hover: #234f7d;
      --dmh-accent-control-text: #79c0ff;
      --dmh-danger: #ff7b72;
      --dmh-card-placeholder: #30363d;
      --dmh-switch-thumb: #f0f6fc;
      --dmh-scroll-track: rgba(139,148,158,.22);
      --dmh-scroll-track-hover: rgba(139,148,158,.36);
      --dmh-scroll-thumb: rgba(139,148,158,.72);
      --dmh-scroll-thumb-hover: #b1bac4;
      --dmh-favorite: #ff7b9c;
      --dmh-favorite-bg: rgba(255,123,156,.18);
      --dmh-favorite-shadow: rgba(255,123,156,.28);
      --dmh-snackbar-bg: #30363d;
      --dmh-snackbar-border: #484f58;
      --dmh-tag-artist: #d29922;
      --dmh-tag-copyright: #d2a8ff;
      --dmh-tag-character: #3fb950;
      --dmh-tag-artist-bg: rgba(210,153,34,.18);
      --dmh-tag-copyright-bg: rgba(210,168,255,.18);
      --dmh-tag-character-bg: rgba(63,185,80,.18);
      --dmh-overlay: rgba(1,4,9,.6);
      --dmh-dialog-overlay: rgba(1,4,9,.72);
      --dmh-shadow: rgba(1,4,9,.55);
      --dmh-shadow-strong: rgba(1,4,9,.7);
      color-scheme: dark;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; scrollbar-width: none; background: var(--dmh-bg); color: var(--dmh-text); font-family: Arial, "Helvetica Neue", sans-serif; }
    html { overflow-x: hidden; }
    body { overflow-x: clip; }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
    html.dmh-no-scroll { overflow: hidden; }
    #dmh-app { min-height: 100vh; }
    .dmh-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 10; min-height: 56px; background: var(--dmh-surface-translucent); border-bottom: 1px solid var(--dmh-border-subtle); backdrop-filter: blur(10px); overflow: visible; }
    .dmh-loading-progress { position: absolute; right: 0; bottom: -1px; left: 0; height: 3px; overflow: hidden; background: var(--dmh-accent-muted); pointer-events: none; }
    .dmh-loading-progress[hidden] { display: none; }
    .dmh-loading-progress-bar { width: 42%; height: 100%; background: var(--dmh-accent); transform: translateX(-110%); animation: dmh-loading-progress 1.15s ease-in-out infinite; }
    @keyframes dmh-loading-progress { 0% { transform: translateX(-110%); } 55% { transform: translateX(135%); } 100% { transform: translateX(265%); } }
    .dmh-toolbar-content { display: grid; grid-template-columns: minmax(0, 1fr) minmax(180px, 496px) minmax(0, 1fr); align-items: center; gap: 12px; width: 100%; min-width: 0; min-height: 56px; padding: 10px 16px; overflow: visible; white-space: nowrap; }
    .dmh-brand { display: flex; align-items: center; justify-self: start; gap: 25px; min-width: 0; }
    #dmh-app .dmh-title, #dmh-app .dmh-title:hover, #dmh-app .dmh-title:active, #dmh-app .dmh-title:focus, #dmh-app .dmh-title:focus-visible { margin: -11px -12px; padding: 11px 12px; border: 0; border-radius: 0; outline: 0; background: transparent; color: inherit; box-shadow: none; font: inherit; font-size: 22px; font-weight: 700; line-height: 1; white-space: nowrap; cursor: pointer; appearance: none; -webkit-tap-highlight-color: transparent; user-select: none; }
    .dmh-search { display: block; justify-self: center; width: min(496px, 100%); min-width: 0; max-width: 496px; }
    .dmh-search-form { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) repeat(3, 38px); align-items: center; gap: 8px; width: 100%; min-width: 0; }
    #dmh-app .dmh-search input { width: 100%; height: 36px; padding: 0 12px; border: 1px solid var(--dmh-border-strong); border-radius: 6px; background: var(--dmh-surface); color: inherit; }
    .dmh-page-group { display: flex; align-items: center; gap: 6px; min-width: 0; color: var(--dmh-text-muted); font-size: 12px; font-weight: 700; }
    .dmh-page-label { user-select: none; }
    .dmh-page-control { display: flex; align-items: center; justify-content: center; height: 28px; padding: 0; border: 1px solid var(--dmh-border); border-radius: 999px; background: var(--dmh-surface-muted); color: var(--dmh-text-muted); }
    .dmh-page-control:focus-within { border-color: var(--dmh-accent); background: var(--dmh-surface); box-shadow: 0 0 0 3px var(--dmh-focus-shadow); }
    .dmh-page-input { width: 42px; min-width: 42px; height: 26px; padding: 0; border: 0; border-radius: 0; background: transparent; color: var(--dmh-text-strong); text-align: center; font-weight: 700; outline: 0; appearance: textfield; }
    .dmh-page-input::-webkit-inner-spin-button, .dmh-page-input::-webkit-outer-spin-button { margin: 0; appearance: none; }
    #dmh-app .dmh-search-form > button, #dmh-app .dmh-theme-button, #dmh-app .dmh-settings-button, #dmh-app .dmh-exit-button { height: 36px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--dmh-text-muted); cursor: pointer; box-shadow: none; }
    #dmh-app .dmh-icon-button { display: inline-flex; align-items: center; justify-content: center; width: 38px; min-width: 38px; padding: 0; }
    .dmh-icon-button svg { width: 22px; height: 22px; fill: none; stroke: currentColor; }
    .dmh-hot-button svg { fill: currentColor; stroke: none; }
    .dmh-settings-button svg { fill: currentColor; stroke: none; }
    #dmh-app [data-dmh-tooltip] { position: relative; }
    #dmh-app [data-dmh-tooltip]::after { content: attr(data-dmh-tooltip); position: absolute; top: calc(100% + 8px); left: 50%; z-index: 200; max-width: min(520px, 90vw); padding: 6px 10px; border-radius: 4px; background: rgba(33,33,33,.95); color: #fff; font-size: 12px; font-weight: 500; line-height: 1.35; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; pointer-events: none; transform: translate(-50%, -4px); transition: opacity .14s ease, transform .14s ease; }
    #dmh-app [data-dmh-tooltip]:hover::after, #dmh-app [data-dmh-tooltip]:focus-visible::after { opacity: 1; transform: translate(-50%, 0); }
    #dmh-app .dmh-search-form > button:hover, #dmh-app .dmh-theme-button:hover, #dmh-app .dmh-settings-button:hover, #dmh-app .dmh-exit-button:hover { background: var(--dmh-accent-soft); color: var(--dmh-accent); }
    #dmh-app .dmh-search-form > button:focus-visible, #dmh-app .dmh-theme-button:focus-visible, #dmh-app .dmh-settings-button:focus-visible, #dmh-app .dmh-exit-button:focus-visible { outline: 2px solid var(--dmh-focus-ring); outline-offset: 2px; }
    #dmh-app .dmh-search-form > button:disabled { color: var(--dmh-border-strong); cursor: not-allowed; }
    #dmh-app .dmh-search-form > button:disabled:hover { background: transparent; color: var(--dmh-border-strong); }
    .dmh-exit-button { flex: 0 0 auto; }
    .dmh-toolbar-actions { display: flex; align-items: center; justify-self: end; gap: 8px; min-width: 0; }
    .dmh-status { min-width: 112px; overflow: hidden; color: var(--dmh-text-muted); font-size: 13px; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
    .dmh-grid { position: relative; width: calc(100% - 32px); margin: 68px 16px 12px; overflow: hidden; }
    .dmh-layout { display: block; }
    .dmh-sidebar { display: none; }
    .dmh-scrollbar { position: fixed; right: 0; bottom: 8px; z-index: 8; width: 16px; min-height: 48px; border-radius: 999px; background: transparent; cursor: pointer; touch-action: none; user-select: none; }
    .dmh-scrollbar::before { content: ''; position: absolute; inset: 0 4px; border-radius: 999px; background: var(--dmh-scroll-track); transition: background .16s ease; }
    .dmh-scrollbar:hover::before, .dmh-scrollbar.dmh-dragging::before { background: var(--dmh-scroll-track-hover); }
    .dmh-scrollbar[hidden] { display: none; }
    .dmh-scrollbar:focus-visible { outline: 2px solid var(--dmh-focus-ring); outline-offset: 2px; }
    .dmh-scrollbar-thumb { position: absolute; top: 0; left: 0; width: 16px; min-height: 36px; border-radius: 999px; background: transparent; will-change: transform; }
    .dmh-scrollbar-thumb::before { content: ''; position: absolute; inset: 0 4px; border-radius: 999px; background: var(--dmh-scroll-thumb); box-shadow: 0 1px 2px rgba(27,31,36,.15); transition: background .16s ease; }
    .dmh-scrollbar:hover .dmh-scrollbar-thumb::before, .dmh-scrollbar.dmh-dragging .dmh-scrollbar-thumb::before { background: var(--dmh-scroll-thumb-hover); }
    #dmh-app .dmh-back-to-top { position: fixed; right: 22px; bottom: 20px; z-index: 9; display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; padding: 0; border: 1px solid var(--dmh-border); border-radius: 50%; background: var(--dmh-surface-translucent); color: var(--dmh-text-muted); cursor: pointer; box-shadow: 0 3px 12px var(--dmh-shadow); opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(8px); transition: opacity .18s ease, visibility 0s linear .18s, transform .18s ease, background .16s ease, color .16s ease, border-color .16s ease; }
    #dmh-app .dmh-back-to-top[hidden] { display: none; }
    #dmh-app .dmh-back-to-top.dmh-visible { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0); transition-delay: 0s; }
    #dmh-app .dmh-back-to-top:hover { border-color: var(--dmh-accent); background: var(--dmh-accent-soft); color: var(--dmh-accent); }
    #dmh-app .dmh-back-to-top:focus-visible { outline: 2px solid var(--dmh-focus-ring); outline-offset: 2px; }
    .dmh-back-to-top svg { width: 23px; height: 23px; }
    .dmh-card { position: absolute; width: ${CARD_WIDTH}px; overflow: hidden; border-radius: 6px; background: var(--dmh-card-placeholder); box-shadow: 0 1px 2px var(--dmh-shadow); transition: left .18s ease, top .18s ease, width .18s ease; }
    .dmh-card img { display: block; width: 100%; height: 100%; object-fit: cover; background: var(--dmh-card-placeholder); pointer-events: none; }
    .dmh-card-error { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: var(--dmh-surface-muted); color: var(--dmh-text-muted); text-align: center; }
    .dmh-card-error[hidden] { display: none; }
    .dmh-card-error svg { width: 42px; height: 42px; fill: currentColor; }
    .dmh-card-error span { font-size: 13px; font-weight: 700; color: var(--dmh-text-strong); }
    .dmh-card-meta { position: absolute; left: 0; right: 0; top: 0; display: flex; justify-content: space-between; gap: 8px; padding: 5px 7px; color: #fff; font-size: 12px; background: linear-gradient(rgba(0,0,0,.68), transparent); opacity: 0; transform: translateY(-100%); transition: opacity .16s ease, transform .16s ease; }
    .dmh-card:hover .dmh-card-meta { opacity: 1; transform: translateY(0); }
    #dmh-app[data-show-thumbnail-info="true"] .dmh-card-meta { opacity: 1; transform: translateY(0); }
    .dmh-card-actions { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; display: flex; justify-content: space-between; opacity: 1; pointer-events: none; }
    #dmh-app[data-show-thumbnail-buttons="false"] .dmh-card-actions { display: none; }
    #dmh-app .dmh-card-actions .dmh-card-action { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 35px; height: 35px; padding: 5px; border: 0; border-radius: 5px; background: #9ca3af !important; background-color: #9ca3af !important; backdrop-filter: blur(4px); color: #fff; cursor: pointer; box-shadow: none !important; filter: none; transform: none !important; transition: none !important; pointer-events: auto; }
    #dmh-app .dmh-card-actions .dmh-card-action:hover, #dmh-app .dmh-card-actions .dmh-card-action:active, #dmh-app .dmh-card-actions .dmh-card-action:focus, #dmh-app .dmh-card-actions .dmh-card-action:focus-visible { background: #9ca3af !important; background-color: #9ca3af !important; color: #fff; outline: 0; box-shadow: none !important; filter: none; transform: none !important; transition: none !important; }
    .dmh-card-actions .dmh-card-action svg { width: 25px; height: 25px; fill: currentColor; color: #fff; }
    .dmh-card-actions .dmh-card-action svg[fill="none"] { fill: none; }
    #dmh-app[data-card-size="small"] .dmh-card-actions .dmh-card-action { width: 30px; height: 30px; padding: 4px; }
    #dmh-app[data-card-size="small"] .dmh-card-actions .dmh-card-action svg { width: 22px; height: 22px; }
    #dmh-app[data-card-size="small"] .dmh-card-actions .dmh-card-action.dmh-download-loading::after { width: 14px; height: 14px; }
    #dmh-app[data-card-size="big"] .dmh-card-actions .dmh-card-action { width: 40px; height: 40px; padding: 6px; }
    #dmh-app[data-card-size="big"] .dmh-card-actions .dmh-card-action svg { width: 28px; height: 28px; }
    #dmh-app[data-card-size="big"] .dmh-card-actions .dmh-card-action.dmh-download-loading::after { width: 18px; height: 18px; }
    #dmh-app .dmh-card-actions .dmh-card-action.dmh-favorited { color: var(--dmh-favorite); }
    #dmh-app .dmh-card-actions .dmh-card-action.dmh-download-loading svg { opacity: 0; }
    #dmh-app .dmh-card-actions .dmh-card-action.dmh-download-loading::after { content: ''; position: absolute; width: 16px; height: 16px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: dmh-download-spin .75s linear infinite; }
    @keyframes dmh-download-spin { to { transform: rotate(360deg); } }
    .dmh-video-badge { position: absolute; top: 6px; right: 6px; padding: 2px 6px; color: #fff; font-size: 12px; border-radius: 4px; background: rgba(0,0,0,.62); }
    .dmh-message { padding: 24px; text-align: center; color: var(--dmh-text-muted); }
    .dmh-settings-overlay { position: fixed; inset: 0; z-index: 300; background: var(--dmh-overlay); opacity: 0; pointer-events: none; transition: opacity .22s ease; }
    .dmh-settings-overlay.dmh-open { opacity: 1; pointer-events: auto; }
    .dmh-settings-panel { position: fixed; top: 50%; right: 12px; bottom: auto; z-index: 301; display: flex; flex-direction: column; height: fit-content; max-height: calc(100dvh - 24px); width: min(440px, calc(100vw - 32px)); padding: 0; border-left: 1px solid var(--dmh-border-subtle); background: var(--dmh-surface); box-shadow: -8px 0 24px var(--dmh-shadow); opacity: 0; pointer-events: none; transform: translate(100%, -50%); transition: transform .22s ease, opacity .22s ease; }
    .dmh-settings-panel.dmh-open { opacity: 1; pointer-events: auto; transform: translate(0, -50%); }
    .dmh-settings-header { display: flex; align-items: center; justify-content: space-between; min-height: 56px; flex: 0 0 auto; padding: 0 16px; border-bottom: 1px solid var(--dmh-border-subtle); }
    .dmh-settings-header h2 { margin: 0; font-size: 18px; font-weight: 700; line-height: 1; color: var(--dmh-text-strong); }
    .dmh-settings-close { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--dmh-text-muted); cursor: pointer; }
    .dmh-settings-close:hover { background: var(--dmh-accent-soft); color: var(--dmh-accent); }
    .dmh-settings-close:focus-visible { outline: 2px solid var(--dmh-focus-ring); outline-offset: 2px; }
    .dmh-settings-close svg { width: 22px; height: 22px; fill: currentColor; stroke: none; }
    .dmh-settings-content { display: flex; flex-direction: column; gap: 22px; min-height: 0; padding: 20px 18px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
    .dmh-settings-content > * { flex-shrink: 0; }
    .dmh-settings-content::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-settings-footer { display: flex; flex: 0 0 auto; justify-content: center; padding: 10px 18px; border-top: 1px solid var(--dmh-border-subtle); }
    #dmh-app .dmh-settings-github { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; color: var(--dmh-text-muted); text-decoration: none; }
    #dmh-app .dmh-settings-github:hover { background: var(--dmh-accent-soft); color: var(--dmh-accent); }
    #dmh-app .dmh-settings-github:focus-visible { outline: 2px solid var(--dmh-focus-ring); outline-offset: 2px; }
    .dmh-settings-github svg { width: 22px; height: 22px; fill: currentColor; }
    #dmh-app .dmh-settings-editor { position: fixed; inset: 0; width: min(580px, calc(100vw - 32px)); max-width: none; height: fit-content; max-height: calc(100dvh - 32px); margin: auto; padding: 0; border: 1px solid var(--dmh-border-subtle); border-radius: 12px; background: var(--dmh-surface); color: var(--dmh-text-strong); box-shadow: 0 16px 48px var(--dmh-shadow-strong); overflow: hidden; }
    #dmh-app .dmh-settings-editor:not([open]) { display: none; }
    #dmh-app .dmh-settings-editor[open] { display: flex; flex-direction: column; }
    .dmh-settings-editor::backdrop { background: var(--dmh-dialog-overlay); }
    .dmh-settings-editor .dmh-settings-header { flex: 0 0 auto; }
    .dmh-settings-editor-content { min-height: 0; padding: 20px; overflow-y: auto; overscroll-behavior: contain; }
    #dmh-app .dmh-setting-editor-button { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 42px; padding: 10px 12px; border: 1px solid var(--dmh-border); border-radius: 6px; background: var(--dmh-surface-muted); color: var(--dmh-text-strong); font: 700 13px Arial, sans-serif; cursor: pointer; box-shadow: none; }
    #dmh-app .dmh-setting-editor-button:hover { background: var(--dmh-surface-hover); }
    #dmh-app .dmh-setting-editor-button:focus-visible { outline: 2px solid var(--dmh-accent); outline-offset: 2px; }
    .dmh-settings-group-title { margin: 2px 0 -10px; color: var(--dmh-text-muted); font-size: 12px; font-weight: 700; line-height: 1.2; letter-spacing: .08em; }
    .dmh-blacklist-rules { box-sizing: border-box; width: 100%; min-height: 132px; resize: vertical; padding: 9px 10px; border: 1px solid var(--dmh-border-strong); border-radius: 6px; background: var(--dmh-surface); color: var(--dmh-text-strong); font: 13px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; }
    .dmh-blacklist-rules:focus { border-color: var(--dmh-accent); outline: 2px solid var(--dmh-focus-glow); }
    .dmh-blacklist-rules[readonly] { background: var(--dmh-surface-muted); color: var(--dmh-text-muted); }
    .dmh-setting-help { color: var(--dmh-text-muted); font-size: 12px; line-height: 1.45; }

    .dmh-blacklist-status { min-width: 0; color: var(--dmh-text-muted); font-size: 12px; line-height: 1.35; }
    .dmh-blacklist-status.dmh-error { color: var(--dmh-danger); }
    #dmh-app .dmh-blacklist-save { flex: 0 0 auto; min-height: 32px; padding: 0 12px; border: 1px solid var(--dmh-accent); border-radius: 6px; background: var(--dmh-accent); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: none; transition: background .16s ease, border-color .16s ease; }
    #dmh-app .dmh-blacklist-save:hover { border-color: var(--dmh-accent-hover); background: var(--dmh-accent-hover); color: #fff; }
    #dmh-app .dmh-blacklist-save:active { border-color: var(--dmh-accent-active); background: var(--dmh-accent-active); }
    #dmh-app .dmh-blacklist-save:focus-visible { outline: 2px solid var(--dmh-focus-ring); outline-offset: 2px; }
    #dmh-app .dmh-blacklist-save:disabled, #dmh-app .dmh-blacklist-save:disabled:hover { border-color: var(--dmh-accent); background: var(--dmh-accent); color: #fff; opacity: .6; cursor: default; }
    .dmh-setting-section { display: flex; flex-direction: column; gap: 10px; }
    .dmh-setting-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 36px; }
    .dmh-setting-copy { display: flex; flex: 1 1 auto; min-width: 0; flex-direction: column; gap: 3px; text-align: left; }
    .dmh-setting-copy .dmh-setting-help { overflow-wrap: anywhere; }
    .dmh-setting-stack { display: flex; flex-direction: column; gap: 10px; }
    .dmh-setting-label { color: var(--dmh-text-strong); font-size: 13px; font-weight: 700; line-height: 1.3; }
    .dmh-setting-select { width: 148px; height: 34px; padding: 0 30px 0 10px; border: 1px solid var(--dmh-border); border-radius: 6px; background: var(--dmh-surface); color: var(--dmh-text-strong); font: 700 13px Arial, "Helvetica Neue", sans-serif; outline: 0; cursor: pointer; }
    .dmh-setting-select option { font: 700 13px Arial, "Helvetica Neue", sans-serif; }
    .dmh-setting-select:focus-visible { border-color: var(--dmh-accent); box-shadow: 0 0 0 3px var(--dmh-focus-shadow); }
    .dmh-setting-select-full { width: 100%; }
    .dmh-tag-click-select { width: 210px; }
    .dmh-setting-switch { display: inline-flex; flex: 0 0 auto; align-items: center; width: 48px; height: 28px; cursor: pointer; }
    .dmh-setting-switch input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
    .dmh-setting-switch-track { position: relative; width: 48px; height: 28px; border-radius: 999px; background: var(--dmh-border); transition: background .18s ease, box-shadow .18s ease; }
    .dmh-setting-switch-track::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: var(--dmh-switch-thumb); box-shadow: 0 1px 3px var(--dmh-shadow); transition: transform .18s ease; }
    .dmh-setting-switch input:checked + .dmh-setting-switch-track { background: var(--dmh-accent); }
    .dmh-setting-switch input:checked + .dmh-setting-switch-track::after { transform: translateX(20px); }
    .dmh-setting-switch input:focus-visible + .dmh-setting-switch-track { box-shadow: 0 0 0 3px var(--dmh-focus-glow); }
    .dmh-download-template-list { display: flex; flex-direction: column; gap: 10px; }
    .dmh-download-template-row { display: flex; flex-direction: column; gap: 5px; }
    .dmh-download-template-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
    .dmh-download-template-heading .dmh-download-template-label { flex: 0 0 auto; }
    .dmh-download-preview { min-width: 0; overflow-wrap: anywhere; text-align: right; }

    .dmh-download-template-label { color: var(--dmh-text-muted); font-size: 12px; font-weight: 700; line-height: 1.2; }
    .dmh-download-template-input { width: 100%; height: 34px; padding: 0 10px; border: 1px solid var(--dmh-border); border-radius: 6px; background: var(--dmh-surface); color: var(--dmh-text-strong); font: 600 12px Consolas, "Courier New", monospace; outline: 0; }
    .dmh-download-template-input:focus { border-color: var(--dmh-accent); box-shadow: 0 0 0 3px var(--dmh-focus-shadow); }
    .dmh-download-template-input:invalid { border-color: var(--dmh-danger); }
    .dmh-template-help { display: flex; flex-direction: column; gap: 5px; padding: 10px 12px; border: 1px solid var(--dmh-border); border-radius: 6px; background: var(--dmh-surface-muted); color: var(--dmh-text-muted); font-size: 12px; line-height: 1.45; }
    .dmh-template-help code { color: var(--dmh-accent); font: 700 12px Consolas, "Courier New", monospace; }
    .dmh-download-template-actions, .dmh-blacklist-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12px; }
    .dmh-download-template-actions > [role="status"], .dmh-blacklist-actions > [role="status"] { flex: 1; min-width: 0; overflow-wrap: anywhere; }
    .dmh-download-template-status { min-width: 0; color: var(--dmh-text-muted); font-size: 12px; line-height: 1.35; }
    .dmh-download-template-buttons, .dmh-blacklist-buttons { display: flex; flex-shrink: 0; justify-content: flex-end; align-items: center; gap: 8px; }


    #dmh-app .dmh-template-reset { min-height: 32px; padding: 0 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: none; }
    #dmh-app .dmh-template-reset { border: 1px solid var(--dmh-border); background: var(--dmh-surface-muted); color: var(--dmh-text-strong); }
    #dmh-app .dmh-template-reset:hover { border-color: var(--dmh-border-strong); background: var(--dmh-surface-hover); color: var(--dmh-text-strong); }
    #dmh-app .dmh-template-reset:focus-visible { outline: 2px solid var(--dmh-focus-ring); outline-offset: 2px; }
    .dmh-snackbar { position: fixed; top: 72px; left: 50%; z-index: 220; max-width: min(520px, calc(100vw - 32px)); padding: 10px 18px; border: 1px solid var(--dmh-snackbar-border); border-radius: 4px; background: var(--dmh-snackbar-bg); color: #fff; font-size: 14px; line-height: 1.45; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 6px 18px var(--dmh-shadow-strong); opacity: 0; pointer-events: none; transform: translate(-50%, -12px); transition: opacity .18s ease, transform .18s ease; }
    .dmh-snackbar.dmh-open { opacity: 1; transform: translate(-50%, 0); }
    .dmh-ac { position: absolute; top: 42px; left: 0; z-index: 20; width: min(450px, 100%); max-height: 320px; overflow: auto; scrollbar-width: none; padding: 4px; border: 1px solid var(--dmh-border); border-radius: 8px; background: var(--dmh-surface); box-shadow: 0 8px 24px var(--dmh-shadow); opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(-6px) scale(.98); transform-origin: top center; transition: opacity .16s ease, transform .16s ease, visibility 0s linear .16s; }
    .dmh-ac::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-ac.dmh-open { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0) scale(1); transition-delay: 0s; }
    .dmh-ac-item { display: flex; align-items: center; width: 100%; min-height: 32px; padding: 0 12px; border: 0; border-radius: 4px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
    .dmh-ac-item:hover { background: var(--dmh-surface-muted); box-shadow: none; }
    .dmh-ac-item.dmh-selected, .dmh-ac-item.dmh-selected:hover { background: var(--dmh-accent-soft); box-shadow: inset 3px 0 0 var(--dmh-accent); }
    .dmh-ac-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
    .dmh-ac-artist { color: var(--dmh-tag-artist); }
    .dmh-ac-copyright { color: var(--dmh-tag-copyright); }
    .dmh-ac-character { color: var(--dmh-tag-character); }
    .dmh-ac-general { color: var(--dmh-accent); }
    .dmh-ac-meta { color: var(--dmh-text-muted); }
    .dmh-ac-cn { color: inherit; font-size: 12px; white-space: nowrap; }
    .dmh-viewer { position: fixed; inset: 0; z-index: 100; display: none; align-items: center; justify-content: center; background: var(--dmh-surface); }
    .dmh-viewer.dmh-open { display: flex; }
    .dmh-viewer img, .dmh-viewer video { display: block; max-width: 100vw; max-height: 100vh; object-fit: contain; }
    .dmh-viewer img[hidden], .dmh-viewer video[hidden] { display: none; }
    .dmh-viewer video { background: #000; }
    .img_detail_loading { position: absolute; top: 0; left: 0; z-index: 1; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; margin: 0; pointer-events: none; }
    .img_detail_loading[hidden] { display: none; }
    #dmh-viewer-progress { position: absolute; top: 50%; left: 50%; z-index: 10; transform: translate(-50%, -50%); }
    .img_detail_loading .v-progress-circular { width: 100px; height: 100px; border: 6px solid var(--dmh-accent-muted); border-top-color: var(--dmh-accent); border-radius: 50%; color: var(--dmh-accent) !important; caret-color: var(--dmh-accent) !important; animation: dmh-progress-circular .82s linear infinite; }
    @keyframes dmh-progress-circular { to { transform: translate(-50%, -50%) rotate(360deg); } }
    .dmh-viewer-error { position: absolute; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--dmh-text-muted); }
    .dmh-viewer-error[hidden] { display: none; }
    .dmh-viewer-error h1 { margin: 0; font-size: 24px; line-height: 1.2; font-weight: 700; color: var(--dmh-text-strong); }
    .fieitW { stroke: none; fill: currentcolor; width: 72px; height: 72px; line-height: 0; font-size: 0; vertical-align: middle; }
    .img_detail_loading img { object-fit: cover; }
    .dmh-viewer.dmh-zoom-mode img { max-width: none; max-height: none; cursor: grab; user-select: none; }
    .dmh-viewer.dmh-zoom-mode img.dmh-dragging { cursor: grabbing; }
    .dmh-viewer-actions { position: absolute; top: 14px; right: 14px; z-index: 3; display: flex; gap: 8px; opacity: 1; transition: opacity .18s ease; }
    .dmh-viewer-button { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: var(--dmh-accent-control); color: var(--dmh-accent); cursor: pointer; box-shadow: 0 2px 8px var(--dmh-accent-muted); transition: background .16s ease, color .16s ease, transform .16s ease, box-shadow .16s ease; }
    .dmh-viewer-button:hover { background: var(--dmh-accent-control-hover); color: var(--dmh-accent-control-text); transform: translateY(-1px); box-shadow: 0 4px 12px var(--dmh-focus-glow); }
    .dmh-viewer-button[disabled] { opacity: .45; cursor: not-allowed; }
    .dmh-viewer-button svg, .dmh-viewer-nav svg { width: 22px; height: 22px; fill: currentColor; }
    .dmh-viewer-button svg[fill="none"], .dmh-viewer-nav svg[fill="none"] { fill: none; }
    .dmh-viewer-button.dmh-favorited { background: var(--dmh-favorite-bg); color: var(--dmh-favorite); box-shadow: 0 4px 12px var(--dmh-favorite-shadow); }
    .dmh-viewer-button.dmh-active { background: var(--dmh-accent-control-hover); color: var(--dmh-accent-control-text); }
    .dmh-viewer-button.dmh-download-loading { background: var(--dmh-accent-control); color: var(--dmh-accent); transform: none; }
    .dmh-viewer-button.dmh-download-loading:hover { background: var(--dmh-accent-control); color: var(--dmh-accent); transform: none; box-shadow: 0 2px 8px var(--dmh-accent-muted); }
    .dmh-viewer-button.dmh-download-loading svg { opacity: 0; }
    .dmh-viewer-button.dmh-download-loading::before { content: ''; position: absolute; width: 18px; height: 18px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: dmh-download-spin .75s linear infinite; }
    #dmh-app .dmh-viewer-button.dmh-download-loading[data-dmh-tooltip]::after { display: none; content: none; }
    .dmh-viewer-nav { position: absolute; top: 50%; z-index: 3; display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; padding: 0; border: 0; border-radius: 50%; background: var(--dmh-accent-control); color: var(--dmh-accent); cursor: pointer; opacity: 1; transform: translateY(-50%); box-shadow: 0 2px 8px var(--dmh-accent-muted); transition: background .16s ease, color .16s ease, opacity .18s ease, transform .16s ease, box-shadow .16s ease; }
    .dmh-viewer-nav:hover { background: var(--dmh-accent-control-hover); color: var(--dmh-accent-control-text); transform: translateY(-50%) scale(1.06); box-shadow: 0 4px 12px var(--dmh-focus-glow); }
    .dmh-viewer-prev { left: 22px; }
    .dmh-viewer-next { right: 22px; }
    .dmh-viewer-info { position: absolute; top: 14px; left: 14px; z-index: 3; display: flex; flex-direction: column; align-items: flex-start; gap: 7px; max-width: min(360px, 36vw); max-height: calc(100vh - 96px); overflow-x: hidden; overflow-y: auto; scrollbar-width: none; opacity: 1; transform: translateY(0); transition: opacity .18s ease, transform .18s ease; pointer-events: none; }
    .dmh-viewer-info::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-info { opacity: 0; transform: translateY(-6px); pointer-events: none; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-info .dmh-info-pill { pointer-events: none; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-actions, .dmh-viewer.dmh-chrome-hidden .dmh-viewer-nav { opacity: 0; pointer-events: none; }
    .dmh-info-pill { display: block; flex: 0 0 auto; max-width: 100%; height: 24px; padding: 0 10px; overflow: hidden; border: 1px solid transparent; border-radius: 999px; font-size: 12px; font-weight: bold; line-height: 24px; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; pointer-events: auto; user-select: none; }
    .dmh-info-pill:hover { text-decoration: none; }
    .dmh-info-pill[data-viewer-tag] { transition: box-shadow .14s ease; }
    .dmh-info-pill[data-viewer-tag]:hover { box-shadow: 0 1px 4px rgba(31,35,40,.14); }
    .dmh-pill-id, .dmh-pill-id:visited { background: var(--dmh-accent-control); color: var(--dmh-accent); }
    .dmh-pill-artist, .dmh-pill-artist:visited { color: var(--dmh-tag-artist); background-color: var(--dmh-tag-artist-bg); border-color: var(--dmh-tag-artist-bg); }
    .dmh-pill-copyright, .dmh-pill-copyright:visited { color: var(--dmh-tag-copyright); background-color: var(--dmh-tag-copyright-bg); border-color: var(--dmh-tag-copyright-bg); }
    .dmh-pill-character, .dmh-pill-character:visited { color: var(--dmh-tag-character); background-color: var(--dmh-tag-character-bg); border-color: var(--dmh-tag-character-bg); }
    #dmh-app .dmh-pill-artist[data-viewer-tag]:hover { color: var(--dmh-tag-artist); background-color: var(--dmh-tag-artist-bg); border-color: var(--dmh-tag-artist-bg); }
    #dmh-app .dmh-pill-copyright[data-viewer-tag]:hover { color: var(--dmh-tag-copyright); background-color: var(--dmh-tag-copyright-bg); border-color: var(--dmh-tag-copyright-bg); }
    #dmh-app .dmh-pill-character[data-viewer-tag]:hover { color: var(--dmh-tag-character); background-color: var(--dmh-tag-character-bg); border-color: var(--dmh-tag-character-bg); }
    .dmh-viewer-tags { position: absolute; left: 28px; bottom: 36px; z-index: 4; max-width: calc(100vw - 56px); }
    .dmh-viewer-tags[hidden], .dmh-viewer-tags-panel[hidden] { display: none; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-tags { visibility: hidden; pointer-events: none; }
    .dmh-viewer-tags-panel { position: absolute; left: calc(100% + 6px); bottom: calc(100% + 4px); display: flex; flex-direction: column; width: 360px; max-width: calc(100vw - 150px); max-height: 35vh; padding: 8px; border: 1px solid rgba(255,255,255,.22); border-radius: 10px; background: rgba(255,255,255,.1); box-shadow: 0 2px 10px rgba(31,35,40,.1); backdrop-filter: blur(8px) saturate(1.1); }
    .dmh-viewer-tags-list { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 5px; overflow-y: auto; min-height: 0; overscroll-behavior: contain; scrollbar-width: none; }
    .dmh-viewer-tags-list::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-viewer-tags-list .dmh-info-pill, .dmh-viewer-tags-list .dmh-info-pill:visited { height: auto; padding: 0 8px; border-color: rgba(94,119,138,.12); border-radius: 10px; background: rgba(190,207,219,.7); color: #30485a; font-weight: 600; line-height: 22px; white-space: normal; overflow-wrap: anywhere; }
    #dmh-app .dmh-viewer-tags-list .dmh-info-pill:hover { border-color: rgba(94,119,138,.12); background: rgba(190,207,219,.7); color: #30485a; }
    #dmh-viewer-tags-toggle { min-width: 88px; height: 40px; padding: 0 14px; border-color: rgba(255,255,255,.28); background: rgba(190,207,219,.72); color: #30485a; font-size: 13px; line-height: 40px; cursor: pointer; box-shadow: 0 2px 8px rgba(31,35,40,.1); backdrop-filter: blur(6px); transition: background .14s ease, border-color .14s ease, color .14s ease, box-shadow .14s ease; }
    #dmh-viewer-tags-toggle:hover { border-color: rgba(255,255,255,.36); background: rgba(190,207,219,.84); color: #263f50; box-shadow: 0 2px 8px rgba(31,35,40,.12); }
    .dmh-tag-chip { display: inline-flex; max-width: 100%; padding: 2px 7px; border-radius: 999px; color: #fff; text-decoration: none; background: rgba(143, 119, 181, .9); }
    .dmh-tag-chip:hover { text-decoration: none; }
    .dmh-tag-artist { background: rgba(251, 140, 0, .9); }
    .dmh-tag-copyright { background: rgba(171, 71, 188, .9); }
    .dmh-tag-character { background: rgba(102, 187, 106, .9); }
    .dmh-tag-meta { background: rgba(84, 110, 122, .9); }
    html, body, .dmh-topbar { transition: background-color .16s ease, border-color .16s ease; }
    @media (max-width: 980px) { .dmh-title { display: none; } .dmh-brand { gap: 0; } }
    @media (max-width: 760px) { .dmh-toolbar-content { grid-template-columns: minmax(0, 1fr) max-content; gap: 8px; padding: 8px 10px; } .dmh-search { grid-column: 1 / -1; grid-row: 2; justify-self: stretch; width: 100%; max-width: none; } .dmh-search-form { grid-template-columns: minmax(0, 1fr) repeat(3, 38px); } .dmh-status { display: none; } .dmh-grid { margin-top: 108px; } #dmh-app .dmh-back-to-top { right: 16px; bottom: 16px; width: 40px; height: 40px; } .dmh-viewer-info { max-width: calc(100vw - 96px); max-height: calc(100vh - 104px); font-size: 12px; } .dmh-viewer-actions { flex-wrap: wrap; max-width: calc(100vw - 120px); } .dmh-viewer-button { width: 34px; height: 34px; } .dmh-viewer-button svg { width: 19px; height: 19px; } .dmh-viewer-nav { width: 50px; height: 50px; font-size: 26px; } .dmh-viewer-prev { left: 12px; } .dmh-viewer-next { right: 12px; } }
    @media (prefers-reduced-motion: reduce) { html, body, .dmh-topbar, #dmh-app .dmh-back-to-top { transition: none; } .dmh-loading-progress-bar { width: 100%; animation: none; transform: none; } }
  `;
  document.head.appendChild(style);
}
