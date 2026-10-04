import { getToken } from "./api";

// ── MODEL REGISTRY (mirrors API) ─────────────────────────────────────────────

export interface ModelConfig {
  maxTokens:   number | undefined;
  label:       string;
  description: string;
  speed:       "fast" | "medium" | "slow";
  badge:       string;
  color:       string;
}

export const MODELS = {
  "openai/gpt-4o-mini": {
    maxTokens: undefined,
    label: "GPT-4o Mini",
    description: "Fast & cost-efficient. Best for chat and quick tasks.",
    speed: "fast",
    badge: "Chat",
    color: "#10a37f",
  },
  "deepseek/deepseek-r1-0528": {
    maxTokens: 10000,
    label: "DeepSeek R1 (0528)",
    description: "Strong reasoning. Great for analysis and structured writing.",
    speed: "medium",
    badge: "Reasoning",
    color: "#4e8ef7",
  },
  "qwen/qwen3-coder-480b-a35b-07-25": {
    maxTokens: 8000,
    label: "Qwen3 Coder 480B",
    description: "State-of-the-art coding model. Best for technical writing.",
    speed: "medium",
    badge: "Code",
    color: "#7c3aed",
  },
  "google/gemma-3-27b-it": {
    maxTokens: 8000,
    label: "Gemma 3 27B",
    description: "Google's instruction model. Good for creative writing.",
    speed: "fast",
    badge: "Creative",
    color: "#1a73e8",
  },
  "deepseek/deepseek-r1": {
    maxTokens: undefined,
    label: "DeepSeek R1",
    description: "Full reasoning chain. Best quality for complex tasks.",
    speed: "slow",
    badge: "Deep Think",
    color: "#0ea5e9",
  },
  "deepseek/deepseek-chat-v3-0324": {
    maxTokens: 8000,
    label: "DeepSeek Chat V3",
    description: "Balanced chat. Excellent for blog writing and content.",
    speed: "medium",
    badge: "Writing",
    color: "#2563eb",
  },
  "openai/gpt-4o": {
    maxTokens: 10000,
    label: "GPT-4o",
    description: "OpenAI flagship. Best for insights and structured output.",
    speed: "medium",
    badge: "Flagship",
    color: "#10a37f",
  },
} satisfies Record<string, ModelConfig>;

export type ModelId = keyof typeof MODELS;

export const SPEED_LABELS: Record<ModelConfig["speed"], string> = {
  fast:   "Fast",
  medium: "Medium",
  slow:   "Deep",
};

// ── SHARED RESULT TYPES ────────────────────────────────────────────────────────

export interface StreamResult {
  ok:     boolean;
  error?: string;
}

export interface CallResult<T = unknown> {
  ok:     boolean;
  data?:  T;
  error?: string;
}

/** Shape of each `data: {...}` line in our SSE protocol */
interface SseChunkPayload {
  delta?: string;
  done?:  boolean;
  finish?: string;
  error?: string;
}

// ── SSE STREAMING CONSUMER ────────────────────────────────────────────────────
// Calls an SSE endpoint, invokes onChunk for each streamed delta.

export async function streamSSE(
  url: string,
  body: Record<string, unknown>,
  onChunk: (delta: string) => void,
  signal?: AbortSignal
): Promise<StreamResult> {
  const API: string = process.env.NEXT_PUBLIC_API_URL!;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const tok: string | null = getToken();
  if (tok) headers["Authorization"] = `Bearer ${tok}`;

  let res: Response;
  try {
    res = await fetch(`${API}${url}`, {
      method:      "POST",
      headers,
      body:        JSON.stringify(body),
      credentials: "include",
      signal,
    });
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: message };
  }

  if (!res.ok) {
    const errBody: { error?: string } = await res
      .json()
      .catch((): { error?: string } => ({}));
    return { ok: false, error: errBody.error ?? `HTTP ${res.status}` };
  }

  const reader = res.body?.getReader();
  if (!reader) return { ok: false, error: "No response body" };

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value }: ReadableStreamReadResult<Uint8Array> = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines: string[] = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload: string = line.slice(6).trim();
      if (payload === "[DONE]") return { ok: true };

      try {
        const parsed: SseChunkPayload = JSON.parse(payload) as SseChunkPayload;
        if (parsed.error) return { ok: false, error: parsed.error };
        if (parsed.delta) onChunk(parsed.delta);
        if (parsed.done)  return { ok: true };
      } catch {
        // Malformed SSE line — skip silently, stream continues
      }
    }
  }

  return { ok: true };
}

// ── NON-STREAMING CALL ────────────────────────────────────────────────────────

export async function callAI<T = unknown>(
  path: string,
  body: Record<string, unknown>
): Promise<CallResult<T>> {
  const API: string = process.env.NEXT_PUBLIC_API_URL!;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const tok: string | null = getToken();
  if (tok) headers["Authorization"] = `Bearer ${tok}`;

  try {
    const res: Response = await fetch(`${API}${path}`, {
      method:      "POST",
      headers,
      body:        JSON.stringify(body),
      credentials: "include",
    });
    return (await res.json()) as CallResult<T>;
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: message };
  }
}
