import { TAG_TRANSLATION_URL } from '../src/data/tagTranslation';

interface PreviewRequests {
  origin: string;
  translations: Record<string, string>;
  popular: [string, number][];
  readBlacklist: () => string;
  saveBlacklist: (text: string) => void;
}

/** Replace API requests in the demo without forwarding anything to a real account. */
export function createPreviewFetch(options: PreviewRequests): typeof fetch {
  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input), options.origin);
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (url.href === TAG_TRANSLATION_URL && method === 'GET') {
      return Response.json(options.translations);
    }
    if (url.origin === options.origin) {
      if (url.pathname === '/explore/posts/searches.json' && method === 'GET') {
        return Response.json(options.popular);
      }
      if (url.pathname === '/users/1.json' && method === 'GET') {
        return Response.json({ id: 1, blacklisted_tags: options.readBlacklist() });
      }
      if (url.pathname === '/users/1.json' && method === 'PATCH') {
        const body = input instanceof Request && init?.body === undefined
          ? await input.text() : String(init?.body ?? '');
        options.saveBlacklist(new URLSearchParams(body).get('user[blacklisted_tags]') ?? '');
        return Response.json({});
      }
    }
    throw new TypeError(`Unsupported preview request: ${method} ${url.pathname}`);
  };
}
