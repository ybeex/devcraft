"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { LaujeSpinner } from "@/components/hausa";
import { streamSSE, type StreamResult } from "@/lib/models";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

type CodeTokenKind = "plain" | "comment" | "keyword" | "string" | "number" | "property";

interface CodeToken {
  value: string;
  kind: CodeTokenKind;
}

interface ContentPart {
  type: "text" | "code";
  content: string;
  language?: string;
}

const QUICK_QUESTIONS: readonly string[] = [
  "What's his tech stack?",
  "Is he available for hire?",
  "Show me his best project.",
  "Show me a saved code example from one of his projects.",
  "What makes him different?",
];

const BOUNCE_DOT_DELAYS: readonly number[] = [0, 1, 2];
const CHAT_STORAGE_KEY = "devcraft-ai-chat-history";
const MAX_STORED_MESSAGES = 24;
const MAX_STORED_MESSAGE_LENGTH = 12000;
const FENCED_CODE_PATTERN = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g;
const KEYWORDS = new Set([
  "as", "async", "await", "boolean", "const", "data", "default", "enum", "export", "false",
  "from", "function", "if", "import", "interface", "let", "model", "new", "null", "number",
  "return", "string", "true", "type", "undefined", "where",
]);

function splitContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  FENCED_CODE_PATTERN.lastIndex = 0;

  while ((match = FENCED_CODE_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
    parts.push({ type: "code", language: match[1].toLowerCase() || "code", content: match[2].replace(/\n$/, "") });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length || parts.length === 0) parts.push({ type: "text", content: content.slice(lastIndex) });
  return parts;
}

function tokenizeCode(code: string): CodeToken[] {
  return code.split(/(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g)
    .filter((value: string): boolean => value.length > 0)
    .map((value: string): CodeToken => {
      if (/^(\/\/|#|\/\*)/.test(value)) return { value, kind: "comment" };
      if (/^([`"'])/.test(value)) return { value, kind: "string" };
      if (/^\d/.test(value)) return { value, kind: "number" };
      if (KEYWORDS.has(value)) return { value, kind: "keyword" };
      if (/^[a-z][\w$]*$/.test(value) && /(?:Id|Url|At|Count|Order|Stack)$/.test(value)) return { value, kind: "property" };
      return { value, kind: "plain" };
    });
}

function isStoredMessage(value: unknown): value is Message {
  return Boolean(value) && typeof value === "object"
    && ((value as Message).role === "user" || (value as Message).role === "assistant")
    && typeof (value as Message).content === "string"
    && (value as Message).content.trim().length > 0;
}

function MessageContent({ content }: { content: string }): ReactElement {
  return (
    <>
      {splitContent(content).map((part: ContentPart, index: number): ReactElement => {
        if (part.type === "text") {
          return (
            <div key={index} className="ai-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.content}</ReactMarkdown>
            </div>
          );
        }

        return (
          <div key={index} className="ai-code-block" aria-label={`${part.language ?? "code"} code example`}>
            <div className="ai-code-language">{part.language ?? "code"}</div>
            <pre><code>{tokenizeCode(part.content).map((token: CodeToken, tokenIndex: number) => (
              <span key={tokenIndex} className={`ai-code-token-${token.kind}`}>{token.value}</span>
            ))}</code></pre>
          </div>
        );
      })}
    </>
  );
}

export function AiChat(): ReactElement {
  const [open, setOpen]           = useState<boolean>(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState<string>("");
  const [streaming, setStreaming] = useState<boolean>(false);
  const [error, setError]         = useState<string>("");
  const [historyRestored, setHistoryRestored] = useState<boolean>(false);

  const abortRef  = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef  = useRef<HTMLInputElement | null>(null);

  // Chat is intentionally local to this browser: no visitor messages are
  // stored on the server, but a reload no longer discards the conversation.
  useEffect((): void => {
    try {
      const raw: string | null = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return;
      const stored: unknown = JSON.parse(raw);
      if (!Array.isArray(stored)) return;
      setMessages(stored
        .filter(isStoredMessage)
        .slice(-MAX_STORED_MESSAGES)
        .map((message: Message): Message => ({
          role: message.role,
          content: message.content.slice(0, MAX_STORED_MESSAGE_LENGTH),
        })));
    } catch {
      // Storage can be unavailable or contain legacy/corrupt data.
    } finally {
      setHistoryRestored(true);
    }
  }, []);

  useEffect((): void => {
    if (!historyRestored) return;
    try {
      const saved: Message[] = messages
        .filter((message: Message): boolean => message.content.trim().length > 0)
        .slice(-MAX_STORED_MESSAGES)
        .map((message: Message): Message => ({
          role: message.role,
          content: message.content.slice(0, MAX_STORED_MESSAGE_LENGTH),
        }));
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Private browsing and a full storage quota should not break chat.
    }
  }, [historyRestored, messages]);

  // Scroll to bottom on new message
  useEffect((): void => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect((): void => {
    if (open) setTimeout((): void => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      const trimmed: string = content.trim();
      if (!trimmed || streaming) return;
      setError("");

      const userMsg: Message = { role: "user", content: trimmed };
      const newHistory: Message[] = [...messages, userMsg];
      setMessages(newHistory);
      setInput("");
      setStreaming(true);

      // Append empty assistant placeholder to stream into
      setMessages((prev: Message[]): Message[] => [...prev, { role: "assistant", content: "" }]);

      abortRef.current = new AbortController();

      const result: StreamResult = await streamSSE(
        "/ai/chat/stream",
        {
          // BUG FIX: filter out empty-content messages before sending. The
          // API's ChatSchema requires content.min(1) on every message, so a
          // single empty entry here would fail validation. That could
          // otherwise happen because the assistant placeholder below starts
          // out empty — if a turn ever errors out before any delta arrives,
          // that empty placeholder would stay in `messages` state and get
          // included in every future request from this point on, permanently
          // breaking the rest of the session. Filtering here also cleans up
          // any placeholder left over from before this fix.
          messages: newHistory
            .slice(-12)
            .map((m: Message) => ({ role: m.role, content: m.content }))
            .filter((m) => m.content.trim().length > 0),
          model: "openai/gpt-4o-mini",
        },
        (delta: string): void => {
          setMessages((prev: Message[]): Message[] => {
            const updated: Message[] = [...prev];
            const last: Message | undefined = updated[updated.length - 1];
            updated[updated.length - 1] = {
              role:    "assistant",
              content: (last?.content ?? "") + delta,
            };
            return updated;
          });
        },
        abortRef.current.signal
      );

      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        // BUG FIX: drop the empty assistant placeholder on failure instead
        // of leaving it in history — otherwise it lingers as a zero-length
        // "assistant" turn that (before the filter above existed) would
        // fail the API's content.min(1) validation on every message sent
        // from here on, turning one transient failure into a permanently
        // broken chat for the rest of the session.
        setMessages((prev: Message[]): Message[] => {
          const last: Message | undefined = prev[prev.length - 1];
          if (last && last.role === "assistant" && last.content === "") {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
      setStreaming(false);
    },
    [messages, streaming]
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => setInput(e.target.value);

  const toggleOpen = (): void => setOpen((prev: boolean): boolean => !prev);

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Open AI chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{ background: "var(--brand)" }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4L16 16M16 4L4 16" stroke="var(--on-brand)" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.06L2 22l4.94-1.38A9.93 9.93 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
              fill="var(--on-brand)"
              opacity=".9"
            />
            <path d="M8 12h8M8 8.5h5" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-85 max-w-[calc(100vw-2rem)] h-[min(480px,calc(100dvh-7rem))] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "var(--glass-bg-strong)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            boxShadow: "inset 0 1px 0 0 var(--glass-highlight), 0 24px 48px -12px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
            style={{ background: "var(--raised)", borderColor: "var(--rim)" }}
          >
            <LaujeSpinner size={28} color="var(--brand)" spin={streaming} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>DevCraft AI</p>
              <p className="text-[11px]" style={{ color: "var(--ghost)" }}>
                {streaming ? "Thinking…" : "Ask me anything about him"}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full" style={{ background: streaming ? "var(--brand)" : "var(--pos-text)" }} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" aria-live="polite" aria-busy={streaming}>
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-[12px] text-center mb-1" style={{ color: "var(--ghost)" }}>
                  Ask about skills, projects, availability…
                </p>
                {QUICK_QUESTIONS.map((q: string): ReactElement => (
                  <button
                    key={q}
                    type="button"
                    onClick={(): void => { void sendMessage(q); }}
                    className="text-left text-[12px] px-3 py-2 rounded-xl border transition-all hover:border-(--brand)"
                    style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--dim)" }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((m: Message, i: number): ReactElement => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[92%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-[1.6] ${m.role === "assistant" ? "ai-chat-message" : "whitespace-pre-wrap"}`}
                    style={{
                      background:   m.role === "user" ? "var(--brand)" : "var(--raised)",
                      color:        m.role === "user" ? "var(--on-brand)" : "var(--ink)",
                      borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    }}
                  >
                    {m.content ? (m.role === "assistant" ? <MessageContent content={m.content} /> : m.content) : (m.role === "assistant" && streaming && i === messages.length - 1 ? (
                      <span className="inline-flex gap-1">
                        {BOUNCE_DOT_DELAYS.map((d: number): ReactElement => (
                          <span
                            key={d}
                            className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ background: "var(--brand)", animationDelay: `${d * 0.15}s` }}
                          />
                        ))}
                      </span>
                    ) : "")}
                  </div>
                </div>
              ))
            )}

            {error && (
              <p
                className="text-[11px] text-center px-3 py-2 rounded-lg"
                style={{ background: "var(--neg-bg)", color: "var(--neg-text)" }}
              >
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 border-t shrink-0"
            style={{ borderColor: "var(--rim)", background: "var(--raised)" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask anything…"
              disabled={streaming}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl text-[13px] border outline-none transition-all
                focus:border-(--brand) disabled:opacity-50"
              style={{ background: "var(--canvas)", borderColor: "var(--rim)", color: "var(--ink)" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                transition-all disabled:opacity-40 hover:opacity-80"
              style={{ background: "var(--brand)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="var(--on-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
