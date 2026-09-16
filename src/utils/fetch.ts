export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorType: string,
    public readonly serverMessage: string,
    label: string,
  ) {
    super(serverMessage || `请求失败（HTTP ${status}，${label}）`);
    this.name = 'ApiError';
  }
}

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
    let body: Record<string, unknown> = {};
    try {
      const data: unknown = await response.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        body = data as Record<string, unknown>;
      }
    } catch {
      // HTML error pages and empty responses still have a useful HTTP status.
    }
    throw new ApiError(
      response.status,
      typeof body.error === 'string' ? body.error : '',
      typeof body.message === 'string' ? body.message : typeof body.reason === 'string' ? body.reason : '',
      label,
    );
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError(response.status, 'UnexpectedResponse', '', label);
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
