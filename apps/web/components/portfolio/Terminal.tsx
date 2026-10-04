"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
} from "react";
import { streamSSE } from "@/lib/models";
import type { Project, Era } from "@devcraft/types";

// ── COMMAND REGISTRY ─────────────────────────────────────────────────────────

const SECTIONS: readonly string[] = ["about", "projects", "skills", "contact"];

const HELP_TEXT: string = `
╔══════════════════════════════════════════════╗
║     DevCraft CLI  ·  kano@devcraft:~$       ║
╚══════════════════════════════════════════════╝

Available commands:

  help          Show this help text
  whoami        About the developer
  ls            List portfolio sections
  cat about     Read the full bio
  open [id]     Scroll to section (about, projects, skills, contact)
  projects      List all projects by era
  skills        Show tech stack
  contact       Show contact details
  ai [prompt]   Ask the AI assistant anything
  hausa         Display a Hausa motif
  clear         Clear the terminal
  exit / q      Close the terminal

Press ↑↓ to navigate command history. Press / to open, Esc to close.
`.trim();

const WHOAMI: string = `
Name:       DevCraft (you'll know the real one when we talk)
Role:       Full-Stack Engineer
Stack:      Node.js · Fastify · PostgreSQL · Next.js · React · TypeScript · Tailwind
Background: Mathematics graduate · Ex-fashion tailor · Self-taught developer
Location:   Kano, northern Nigeria — where the Kofar Mata indigo pits have run for 500 years
Status:     Open to new roles · Remote-first · Available now
`.trim();

const CAT_ABOUT: string = `
I've spent my whole life building things from scratch.

First with fabric — I designed and constructed garments as a professional tailor.
Measured twice, cut once. Every seam intentional. The user is the body you're
fitting; there's no shortcut around understanding them precisely.

Then with mathematics — a degree that taught me the difference between knowing
an answer and knowing why the answer is true. Systems. Proofs. Edge cases.
The kind of thinking that makes you a better engineer than a thousand tutorials can.

Then with code — no bootcamp, no CS degree. Just documentation, open source,
relentless curiosity, and enough stubbornness to stay up until it worked.

Now I build SaaS products that serve real users in Nigeria and beyond.
The maths makes me reason better. The tailoring makes me care about fit.
The self-teaching proves I don't stop until it ships.

"Ginin da a gina shi da hankali, shi ne ginin da ya tsaya."
— The building built with care is the one that stands. (Hausa proverb)
`.trim();

const HAUSA_ART: string = `
    ╱╲    ╱╲    ╱╲
   ╱  ╲  ╱  ╲  ╱  ╲
  ╱ ◆  ╲╱  ◆ ╲╱ ◆  ╲   Zankwaye — Hausa geometric plasterwork
 ╱______╲______╲______╲  Each diamond interlocks with its neighbour.
 |  ╱╲  ||  ╱╲  ||  ╱╲ |  Mathematics made visible in mud and lime.
 | ╱  ╲ || ╱  ╲ || ╱  ╲|  The pattern never ends — it tiles the world.
 |╱ ◇  ╲||╱  ◇ ╲||╱ ◇  ╲
 |______||______||______|
      Kano · est. 999 AD
`.trim();

type LineType = "input" | "output" | "error" | "ai" | "system";

interface Line {
  type: LineType;
  text: string;
}

interface ProjectsApiResponse {
  data?: Project[];
}

const ERA_ORDER: readonly Era[] = ["FOUNDATION", "INTERNSHIP", "SAAS"];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function Terminal(): ReactElement {
  const [open, setOpen]             = useState<boolean>(false);
  const [lines, setLines]           = useState<Line[]>([]);
  const [input, setInput]           = useState<string>("");
  const [history, setHistory]       = useState<string[]>([]);
  const [histIdx, setHistIdx]       = useState<number>(-1);
  const [aiLoading, setAiLoading]   = useState<boolean>(false);

  const inputRef  = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const abortRef  = useRef<AbortController | null>(null);

  // Auto-scroll on new line
  useEffect((): void => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  // Seed help text + focus input on open
  useEffect((): void => {
    if (open) {
      setLines([{ type: "system", text: HELP_TEXT }]);
      setTimeout((): void => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // Global "/" key trigger
  useEffect((): (() => void) => {
    const handler = (e: KeyboardEvent): void => {
      const target: HTMLElement = e.target as HTMLElement;
      const tag: string = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "/" && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        abortRef.current?.abort();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return (): void => window.removeEventListener("keydown", handler);
  }, [open]);

  const push = useCallback((type: LineType, text: string): void => {
    setLines((prev: Line[]): Line[] => [...prev, { type, text }]);
  }, []);

  const fetchProjectsSummary = useCallback(async (): Promise<string> => {
    try {
      const apiUrl: string = process.env.NEXT_PUBLIC_API_URL!;
      const res: Response = await fetch(`${apiUrl}/projects`);
      const json: ProjectsApiResponse = (await res.json()) as ProjectsApiResponse;
      const projects: Project[] = json.data ?? [];

      const out: string = ERA_ORDER.map((era: Era): string => {
        const eraProjects: Project[] = projects.filter((p: Project): boolean => p.era === era);
        if (eraProjects.length === 0) return "";
        const lines: string = eraProjects
          .map((p: Project): string => `  • ${p.title}\n    ${p.tagline}`)
          .join("\n");
        return `\n── ${era} ─────────────────────\n${lines}`;
      })
        .filter((s: string): boolean => s.length > 0)
        .join("\n");

      return out || "No published projects yet.";
    } catch {
      return "__FETCH_ERROR__";
    }
  }, []);

  const runCommand = useCallback(async (raw: string): Promise<void> => {
    const cmd: string = raw.trim();
    if (!cmd) return;

    setHistory((prev: string[]): string[] => [cmd, ...prev.slice(0, 49)]);
    setHistIdx(-1);
    push("input", `kano@devcraft:~$ ${cmd}`);

    const parts: string[] = cmd.toLowerCase().split(/\s+/);
    const verb: string = parts[0] ?? "";
    const arg: string = parts.slice(1).join(" ");

    switch (verb) {
      case "help":
        push("output", HELP_TEXT);
        break;

      case "whoami":
        push("output", WHOAMI);
        break;

      case "ls":
        push("output", SECTIONS.map((s: string): string => `  ${s}/`).join("\n"));
        break;

      case "cat":
        if (arg === "about") push("output", CAT_ABOUT);
        else push("error", `cat: ${arg}: No such file or directory`);
        break;

      case "open": {
        const target: string = arg || "hero";
        if ([...SECTIONS, "hero"].includes(target)) {
          document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
          push("output", `→ Navigating to #${target}…`);
          setTimeout((): void => setOpen(false), 600);
        } else {
          push("error", `open: unknown section "${target}". Try: ${SECTIONS.join(", ")}`);
        }
        break;
      }

      case "projects": {
        push("output", "Fetching projects…");
        const summary: string = await fetchProjectsSummary();
        if (summary === "__FETCH_ERROR__") {
          push("error", "Could not fetch projects. Is the API running?");
        } else {
          push("output", summary);
        }
        break;
      }

      case "skills":
        push(
          "output",
          [
            "── Frontend ─────────────────────",
            "  Next.js · React · TypeScript · Tailwind CSS · Framer Motion",
            "── Backend ──────────────────────",
            "  Node.js · Fastify · REST APIs · JWT Auth · WebSockets",
            "── Database ─────────────────────",
            "  PostgreSQL · Prisma ORM · SQL",
            "── Infrastructure ───────────────",
            "  Vercel · Railway · Neon DB · Cloudinary · CI/CD",
          ].join("\n")
        );
        break;

      case "contact":
        push(
          "output",
          [
            "Email:    hello@devcraft.dev  (scroll to #contact to use the form)",
            "Social links: available in the contact section",
            "GitHub:       available in the contact section",
            "Status:   ● Open to new roles",
          ].join("\n")
        );
        break;

      case "hausa":
        push("output", HAUSA_ART);
        break;

      case "clear":
        setLines([]);
        break;

      case "exit":
      case "q":
      case "quit":
        setOpen(false);
        break;

      case "ai": {
        if (!arg) {
          push("error", "Usage: ai [your question]");
          break;
        }
        setAiLoading(true);
        push("ai", "");

        abortRef.current = new AbortController();
        let full = "";

        await streamSSE(
          "/ai/chat/stream",
          { messages: [{ role: "user", content: arg }], model: "openai/gpt-4o-mini" },
          (delta: string): void => {
            full += delta;
            setLines((prev: Line[]): Line[] => {
              const updated: Line[] = [...prev];
              updated[updated.length - 1] = { type: "ai", text: full };
              return updated;
            });
          },
          abortRef.current.signal
        );

        setAiLoading(false);
        break;
      }

      // Easter eggs
      case "sudo":
        push("output", "Nice try. You are already root in this kingdom.");
        break;
      case "rm":
        push("output", "rm: cannot remove 'devcraft': permission denied (and why would you?)");
        break;
      case "vim":
      case "nvim":
        push("output", ":q!  ← you know what that means.");
        break;
      case "git":
        push("output", "hint: Open the contact section for current social links.");
        break;
      case "pwd":
        push("output", "/home/kano/devcraft");
        break;
      case "uname":
        push("output", 'DevCraft OS v1.0 — "Tukul" release — Built in Kano');
        break;

      default:
        push("error", `Command not found: ${verb}. Type 'help' to see available commands.`);
    }
  }, [push, fetchProjectsSummary]);

  const handleKey = (e: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !aiLoading) {
      const val: string = input.trim();
      setInput("");
      void runCommand(val);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next: number = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next: number = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : (history[next] ?? ""));
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const partial: string = input.split(" ").pop() ?? "";
      const match: string | undefined = SECTIONS.find((s: string): boolean => s.startsWith(partial));
      if (match) {
        setInput((prev: string): string => prev.slice(0, prev.lastIndexOf(partial)) + match);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => setInput(e.target.value);

  const handleBackdropClick = (e: ReactMouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  const handleStop = (): void => {
    abortRef.current?.abort();
    setAiLoading(false);
  };

  // ── COLLAPSED TRIGGER ────────────────────────────────────────────────────────
  if (!open) {
    return (
      <div
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full border
          text-[11px] font-mono cursor-pointer opacity-40 hover:opacity-80 transition-opacity"
        style={{ background: "#0d1220", borderColor: "#313d63", color: "#d4ac55" }}
        onClick={(): void => setOpen(true)}
      >
        <span className="inline-block w-1.5 h-3 animate-pulse" style={{ background: "#d4ac55" }} />
        Press / to open terminal
      </div>
    );
  }

  // ── EXPANDED TERMINAL ────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-195 rounded-2xl overflow-hidden flex flex-col"
        style={{ height: "min(560px, 85vh)", background: "#0d1220", border: "1px solid #313d63" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ background: "#161c30", borderColor: "#313d63" }}
        >
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={(): void => setOpen(false)}
              className="w-3 h-3 rounded-full hover:opacity-80 transition-opacity"
              style={{ background: "#ef4444" }}
            />
            <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
          </div>
          <p className="flex-1 text-center text-[12px] font-mono" style={{ color: "#acb2c9" }}>
            kano@devcraft:~$ — DevCraft Terminal
          </p>
          <button
            type="button"
            onClick={(): void => setOpen(false)}
            className="text-[11px] font-mono hover:opacity-70 transition-opacity"
            style={{ color: "#acb2c9" }}
          >
            esc
          </button>
        </div>

        {/* Output area */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-[12.5px] leading-[1.65]">
          {lines.map((line: Line, i: number): ReactElement => (
            <div
              key={i}
              style={{
                color:
                  line.type === "input"  ? "#d4ac55" :
                  line.type === "error"  ? "#ef4444" :
                  line.type === "ai"     ? "#f4efe3" :
                  line.type === "system" ? "#a2762a" :
                                            "#acb2c9",
                marginBottom: 2,
                whiteSpace:   "pre-wrap",
                wordBreak:    "break-word",
              }}
            >
              {line.text}
              {line.type === "ai" && aiLoading && i === lines.length - 1 && (
                <span
                  className="inline-block w-2 h-3.5 ml-0.5 align-text-bottom animate-pulse"
                  style={{ background: "#d4ac55" }}
                />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-t shrink-0"
          style={{ borderColor: "#313d63", background: "#0d1220" }}
        >
          <span className="text-[12px] font-mono shrink-0" style={{ color: "#a2762a" }}>
            kano@devcraft:~$
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKey}
            disabled={aiLoading}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent outline-none text-[12.5px] font-mono caret-[#d4ac55] disabled:opacity-50"
            style={{ color: "#d4ac55" }}
            placeholder={aiLoading ? "AI thinking…" : "type a command or 'help'"}
          />
          {aiLoading && (
            <button
              type="button"
              onClick={handleStop}
              className="text-[10px] font-mono hover:opacity-70"
              style={{ color: "#acb2c9" }}
            >
              stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
