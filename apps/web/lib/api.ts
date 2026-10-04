import type {
  ApiResponse,
  Project,
  BlogPost,
  Subscriber,
  ContactMessage,
  AnalyticsOverview,
  SubscriberAnalytics,
  AuthTokens,
  EmailNotificationLog,
  SiteSettings,
  SiteSettingsInput,
  Review,
  ReviewCreateInput,
} from "@devcraft/types";

const BASE: string = process.env.NEXT_PUBLIC_API_URL!;

// ── AUTH TOKEN (sessionStorage cache over httpOnly refresh cookie) ────────────

const SESSION_KEY = "__dc_at";

let memoryToken: string | null = null;

export function setToken(t: string | null): void {
  memoryToken = t;
  try {
    if (t) sessionStorage.setItem(SESSION_KEY, t);
    else    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sessionStorage unavailable (SSR, privacy mode) — memory-only fallback
  }
}

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    const cached: string | null = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      memoryToken = cached;
      return cached;
    }
  } catch {
    // ignore
  }
  return null;
}

// ── QUERY STRING HELPER ────────────────────────────────────────────────────────
// URLSearchParams only accepts Record<string, string>. Callers often pass
// objects with optional/undefined/number/boolean fields, so this helper
// filters and stringifies them without an `as any` cast at every call site.

type QueryValue = string | number | boolean | undefined | null;

function toQueryString(params?: any): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    usp.set(key, String(value));
  }
  const qs: string = usp.toString();
  return qs ? `?${qs}` : "";
}

// ── CORE FETCH ────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  const tok: string | null = getToken();
  if (tok) headers["Authorization"] = `Bearer ${tok}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch (err: unknown) {
    // Network failure — offline, DNS error, CORS block, etc.
    // Return a typed ApiError instead of letting the exception propagate,
    // so every call site can rely on the { ok, data|error } contract.
    const message: string = err instanceof Error ? err.message : "Network request failed";
    return { ok: false, error: message, statusCode: 0 };
  }

  // Silent token refresh on 401 (never recurse on the refresh call itself)
  if (res.status === 401 && path !== "/auth/login" && path !== "/auth/refresh") {
    let refreshed: Response;
    try {
      refreshed = await fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" });
    } catch {
      setToken(null);
      return { ok: false, error: "Session expired. Please log in again.", statusCode: 401 };
    }

    if (refreshed.ok) {
      let data: ApiResponse<AuthTokens>;
      try {
        data = (await refreshed.json()) as ApiResponse<AuthTokens>;
      } catch {
        setToken(null);
        return { ok: false, error: "Session expired. Please log in again.", statusCode: 401 };
      }

      if (data.ok) {
        setToken(data.data.accessToken);
        headers["Authorization"] = `Bearer ${data.data.accessToken}`;
        try {
          const retry: Response = await fetch(`${BASE}${path}`, { ...init, headers, credentials: "include" });
          return (await retry.json()) as ApiResponse<T>;
        } catch (err: unknown) {
          const message: string = err instanceof Error ? err.message : "Network request failed";
          return { ok: false, error: message, statusCode: 0 };
        }
      }
    }

    // Refresh didn't succeed — the session is gone, don't fall through to
    // re-parsing the original 401 response (it may not be valid JSON).
    setToken(null);
    return { ok: false, error: "Session expired. Please log in again.", statusCode: 401 };
  }

  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    // Non-JSON or empty body (proxy error page, network hiccup, etc.) —
    // never let this throw, or callers awaiting apiFetch() get stuck.
    return { ok: false, error: "Unexpected response from server.", statusCode: res.status };
  }
}

// ── PUBLIC ────────────────────────────────────────────────────────────────────

interface ProjectListParams {
  era?:      string;
  featured?: boolean;
}

interface BlogListParams {
  tag?:  string;
  page?: number;
}

export const api = {
  projects: {
    list: (params?: ProjectListParams) =>
      apiFetch<Project[]>(`/projects${toQueryString(params)}`),
    get: (slug: string) => apiFetch<Project>(`/projects/${slug}`),
  },
  blog: {
    list: (params?: BlogListParams) =>
      apiFetch<{ posts: BlogPost[] }>(`/blog${toQueryString(params)}`),
    get: (slug: string) => apiFetch<{ post: BlogPost; related: BlogPost[] }>(`/blog/${slug}`),
  },
  subscribe: (email: string, name?: string) =>
    apiFetch<{ message: string }>("/subscribe", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    }),
  reviews: {
    list: () => apiFetch<Review[]>("/reviews"),
  },
  contact: (data: {
    name: string; email: string; subject: string; message: string; website?: string;
  }) =>
    apiFetch<{ message: string }>("/contact", { method: "POST", body: JSON.stringify(data) }),
  pageview: (path: string, referrer?: string) =>
    apiFetch<null>("/analytics/pageview", {
      method: "POST",
      body: JSON.stringify({ path, referrer }),
    }),
  settings: () => apiFetch<SiteSettings>("/settings"),
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────

interface SubscriberListParams {
  status?: "active" | "unsubscribed" | "all";
  page?:   number;
}

interface SubscriberListResult {
  subscribers: Subscriber[];
  counts:      { active: number; unsubscribed: number; total: number };
}

interface ContactListParams {
  read?: "true" | "false";
  page?: number;
}

interface ContactListResult {
  messages:    ContactMessage[];
  unreadCount: number;
  pagination:  { total: number; page: number; limit: number; pages: number };
}

export const adminApi = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<AuthTokens>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    logout:  () => apiFetch<null>("/auth/logout", { method: "POST" }),
    refresh: () => apiFetch<AuthTokens>("/auth/refresh", { method: "POST" }),
  },
  projects: {
    list:   () => apiFetch<Project[]>("/projects/admin/all"),
    create: (data: unknown) => apiFetch<Project>("/projects/admin", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      apiFetch<Project>(`/projects/admin/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    reorder: (items: { id: string; displayOrder: number }[]) =>
      apiFetch<null>("/projects/admin/reorder", { method: "PATCH", body: JSON.stringify(items) }),
    delete: (id: string, hard = false) =>
      apiFetch<null>(`/projects/admin/${id}?hard=${hard}`, { method: "DELETE" }),
  },
  blog: {
    list:   () => apiFetch<BlogPost[]>("/blog/admin/all"),
    get:    (id: string) => apiFetch<BlogPost>(`/blog/admin/${id}`),
    create: (data: unknown) => apiFetch<BlogPost>("/blog/admin", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      apiFetch<BlogPost>(`/blog/admin/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<null>(`/blog/admin/${id}`, { method: "DELETE" }),
  },
  subscribers: {
    list: (params?: SubscriberListParams) =>
      apiFetch<SubscriberListResult>(`/admin/subscribers${toQueryString(params)}`),
    remove: (id: string) => apiFetch<null>(`/admin/subscribers/${id}`, { method: "DELETE" }),
    export: (): string => `${BASE}/admin/subscribers/export`,
  },
  notify: {
    send: (type: "BLOG" | "PROJECT", referenceId: string) =>
      apiFetch<{ accepted: number; failed: number; errors?: string[] }>(
        "/admin/notify",
        { method: "POST", body: JSON.stringify({ type, referenceId }) }
      ),
    history: () => apiFetch<EmailNotificationLog[]>("/admin/notifications"),
  },
  analytics: {
    overview:    (days = 30) => apiFetch<AnalyticsOverview>(`/analytics/overview?days=${days}`),
    subscribers: (days = 30) => apiFetch<SubscriberAnalytics>(`/analytics/subscribers?days=${days}`),
  },
  contacts: {
    list: (params?: ContactListParams) =>
      apiFetch<ContactListResult>(`/admin/contacts${toQueryString(params)}`),
    markRead: (id: string, read = true) =>
      apiFetch<ContactMessage>(`/admin/contacts/${id}/read`, { method: "PATCH", body: JSON.stringify({ read }) }),
    delete: (id: string) => apiFetch<{ deleted: boolean }>(`/admin/contacts/${id}`, { method: "DELETE" }),
    unreadCount: () => apiFetch<{ count: number }>("/admin/contacts/unread-count"),
  },
  settings: {
    get: () => apiFetch<SiteSettings>("/admin/settings"),
    update: (data: SiteSettingsInput) =>
      apiFetch<SiteSettings>("/admin/settings", { method: "PUT", body: JSON.stringify(data) }),
  },
  reviews: {
    list:   () => apiFetch<Review[]>("/reviews/admin/all"),
    create: (data: ReviewCreateInput) =>
      apiFetch<Review>("/reviews/admin", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ReviewCreateInput>) =>
      apiFetch<Review>(`/reviews/admin/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<null>(`/reviews/admin/${id}`, { method: "DELETE" }),
  },
  uploads: {
    // Returns a short-lived signature for a direct-to-Cloudinary upload —
    // see apps/api/src/routes/uploads.routes.ts for why this replaced the
    // old unsigned-preset uploads.
    sign: (params: Record<string, string | number | boolean> = {}) =>
      apiFetch<{ signature: string; timestamp: number; apiKey: string; cloudName: string }>(
        "/admin/uploads/sign",
        { method: "POST", body: JSON.stringify({ params }) }
      ),
  },
};
