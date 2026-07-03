export function getCsrfToken(): string {
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
}

export function csrfHeaders(): HeadersInit {
  const token = getCsrfToken();
  return token ? { 'X-CSRF-Token': token } : {};
}
