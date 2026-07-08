declare function GM_openInTab(
  url: string,
  options?: { active?: boolean; insert?: boolean; setParent?: boolean },
): unknown;

declare function GM_download(
  details: string | { url: string; name?: string; saveAs?: boolean; onerror?: (error: unknown) => void },
): unknown;
