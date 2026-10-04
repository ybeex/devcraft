/**
 * Typed wrapper around Next.js's extended global fetch.
 *
 * Next.js augments the global `fetch` with a `next` option for ISR caching.
 * TypeScript's standard `RequestInit` type doesn't include this — so a direct
 * `fetch(url, { next: { revalidate: 300 } })` call raises a type error.
 *
 * This module provides the correct type and a small helper so every server
 * component can import one clean, typed function instead of repeating casts.
 */

/** Next.js ISR fetch options layered on top of standard RequestInit */
export type NextFetchInit = Omit<RequestInit, "cache"> & {
  cache?: RequestCache;
  /** Next.js-specific ISR / cache-tag options */
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

/**
 * Typed fetch that accepts Next.js `next` cache options.
 * The `as RequestInit` cast is intentional and contained here — consumers
 * use the strongly-typed NextFetchInit.
 */
export function nextFetch(
  input: string | URL | globalThis.Request,
  init?: NextFetchInit
): Promise<Response> {
  return fetch(input, init as RequestInit);
}

/**
 * ISR-aware JSON fetcher for server components.
 * Returns `null` on any error so callers don't need try/catch.
 *
 * @example
 * const projects = await fetchJSON<Project[]>(`${API}/projects`, { revalidate: 300 });
 */
export async function fetchJSON<T>(
  url: string,
  opts: { revalidate?: number; tags?: string[]; init?: Omit<NextFetchInit, "next"> } = {}
): Promise<T | null> {
  try {
    const res = await nextFetch(url, {
      ...opts.init,
      next: {
        revalidate: opts.revalidate ?? 300,
        ...(opts.tags ? { tags: opts.tags } : {}),
      },
    });

    if (!res.ok) {
      console.warn(`[fetchJSON] ${res.status} ${res.statusText} — ${url}`);
      return null;
    }

    const json = (await res.json()) as { data?: T; ok?: boolean };
    return json.data ?? null;
  } catch (err) {
    console.error(`[fetchJSON] fetch failed — ${url}`, err);
    return null;
  }
}

/**
 * Convenience — always returns an array (never null).
 * Useful for project/blog list endpoints that feed React list renders.
 */
export async function fetchList<T>(
  url: string,
  opts: { revalidate?: number; tags?: string[] } = {}
): Promise<T[]> {
  return (await fetchJSON<T[]>(url, opts)) ?? [];
}
