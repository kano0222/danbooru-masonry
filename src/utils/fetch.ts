export async function fetchJson<T>(url: string, init: RequestInit = {}, label = 'request'): Promise<T> {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${label} failed`);
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const snippet = text.replace(/\s+/g, ' ').slice(0, 180);
    throw new Error(
      `${label} did not return JSON. You may be logged out, lack permission, hit Cloudflare/interception, or were redirected. ${snippet}`,
    );
  }
  return (await response.json()) as T;
}

export async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}
