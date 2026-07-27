declare function GM_openInTab(
  url: string,
  options?: { active?: boolean; insert?: boolean; setParent?: boolean },
): unknown;

declare function GM_download(
  details:
    | string
    | {
        url: string;
        name?: string;
        saveAs?: boolean;
        onload?: () => void;
        onerror?: (error: unknown) => void;
        ontimeout?: () => void;
      },
): unknown;

declare function GM_getValue<T = unknown>(name: string, defaultValue?: T): T;

declare function GM_setValue(name: string, value: unknown): void;
