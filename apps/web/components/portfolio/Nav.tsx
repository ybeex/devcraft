"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MiniRigaDivider } from "@/components/hausa";
import { LogoMark } from "@/components/ui/LogoMark";
import { api } from "@/lib/api";
import type { ApiResponse, SiteSettings } from "@devcraft/types";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Magnetic } from "@/components/ui/Magnetic";
import { ButtonLink } from "@/components/ui/Button";

const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

export function PortfolioNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // The CV button used to link to a static /cv.pdf. It's now wired to
  // whatever file is uploaded in the dashboard's Settings page, same source
  // the hero's own CV button reads from — /cv.pdf stays as the fallback
  // until a real one has been uploaded.
  const [cvUrl, setCvUrl] = useState("");

  useEffect((): void => {
    const loadCvUrl = async (): Promise<void> => {
      const res = (await api.settings()) as ApiResponse<SiteSettings>;
      if (res.ok && res.data.cvUrl) {
        setCvUrl(res.data.cvUrl);
      }
    };
    void loadCvUrl();
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // The mobile panel is conditionally rendered. Close it as soon as the
  // desktop breakpoint is crossed so its open state cannot survive a resize
  // and reappear unexpectedly if the viewport becomes narrow again.
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = (event: MediaQueryListEvent): void => {
      if (event.matches) setMobileOpen(false);
    };
    if (desktopQuery.matches) setMobileOpen(false);
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  // Active section via IntersectionObserver
  //
  // Bug fix: the previous version did `entries.forEach(e => { if
  // (e.isIntersecting) setActive(e.target.id) })`. When two adjacent
  // sections (e.g. "projects" and "blog") both cross the 0.35 threshold in
  // the same callback batch — common with shorter sections, fast smooth
  // scrolls, or fast-scrolling past a section — `forEach` unconditionally
  // overwrites `active` with whichever entry happens to be last in that
  // batch, regardless of which section is actually most visible. That's
  // why clicking "Projects" could leave "Blog" highlighted: the scroll
  // passed both thresholds in one batch and blog was processed last.
  //
  // Fix: keep a running visibility-ratio map for every observed section
  // and always pick the one with the *highest* intersection ratio, so the
  // most-visible section wins regardless of batch/DOM order.
  useEffect(() => {
    const ids = ["hero", ...NAV_LINKS.map((l) => l.id)];
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        });

        let topId: string | null = null;
        let topRatio = 0;
        ids.forEach((id) => {
          const r = ratios.get(id) ?? 0;
          if (r > topRatio) {
            topRatio = r;
            topId = id;
          }
        });

        if (topId) setActive(topId);
      },
      { threshold: [0, 0.15, 0.35, 0.5, 0.75, 1] }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    // Set the clicked section as active immediately rather than waiting on
    // the IntersectionObserver — during a smooth scroll the observer can
    // briefly report a neighboring section as more visible (see the fix
    // above), which was the direct cause of clicking "Projects" flashing
    // "Blog" as active. This guarantees the nav reflects the user's intent
    // the instant they click, and the observer takes back over once the
    // scroll settles.
    setActive(id);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });

    setMobileOpen(false);
  };

  return (
    <nav
      className="portfolio-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300"
      style={{
        height: 72,
        padding: "0 clamp(16px, 5vw, 72px)",
        background: scrolled
          ? "color-mix(in srgb, var(--canvas) 65%, transparent)"
          : "transparent",
        backdropFilter: scrolled
          ? "var(--glass-blur)"
          : "none",
        WebkitBackdropFilter: scrolled
          ? "var(--glass-blur)"
          : "none",
        borderBottom: scrolled
          ? "1px solid color-mix(in srgb, var(--rim) 65%, transparent)"
          : "none",
        boxShadow: scrolled
          ? "0 8px 32px -12px rgba(0, 0, 0, 0.16)"
          : "none",
      }}
    >
      {/* Logo — links home from any page; on the homepage itself it just
          smooth-scrolls to the hero instead of a no-op full navigation */}
      <Link
        href="/"
        onClick={(e) => {
          if (pathname === "/") {
            e.preventDefault();
            scrollTo("hero");
          }
        }}
        className="logo-group flex items-center gap-3 group no-underline"
      >
        <LogoMark size={32} className="logo-mark" />

        <span
          className="font-display font-bold text-[18px] tracking-tight"
          style={{ color: "var(--ink)" }}
        >
          DevCraft
        </span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-2">
        {NAV_LINKS.map(({ id, label }) => {
          const isActive = active === id;

          return (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`nav-link riga-underline-trigger flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "active" : ""}`}
            >
              <span className="relative inline-block">
                {label}
                <span className="riga-underline-wrap">
                  <MiniRigaDivider />
                </span>
              </span>
            </button>
          );
        })}

        <div className="ml-3 flex items-center gap-3">
          <ThemeToggle />

          {cvUrl && <Magnetic strength={0.25}>
            <ButtonLink href={cvUrl} target="_blank" rel="noopener noreferrer" size="sm">
              CV ↓
            </ButtonLink>
          </Magnetic>}
        </div>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
        aria-controls="portfolio-mobile-menu"
      >
        <span
          className="block w-5 h-[1.5px] rounded-full transition-all duration-300"
          style={{
            background: "var(--ink)",
            transform: mobileOpen ? "translateY(6.5px) rotate(45deg)" : "none",
          }}
        />
        <span
          className="block w-5 h-[1.5px] rounded-full transition-all duration-200"
          style={{ background: "var(--ink)", opacity: mobileOpen ? 0 : 1 }}
        />
        <span
          className="block w-5 h-[1.5px] rounded-full transition-all duration-300"
          style={{
            background: "var(--ink)",
            transform: mobileOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
          }}
        />
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="portfolio-mobile-menu"
          className="absolute top-19.5 left-4 right-4 rounded-2xl border p-4 flex flex-col gap-2"
          style={{
            // Match the mobile navbar's 72% canvas fill and glass blur so
            // links stay readable while the page remains softly visible.
            background: "color-mix(in srgb, var(--canvas) 72%, transparent)",
            borderColor: "color-mix(in srgb, var(--rim) 65%, transparent)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            boxShadow: "0 8px 32px -12px rgba(0, 0, 0, 0.16)",
            animation: "fade-up 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          {NAV_LINKS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`nav-link riga-underline-trigger text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active === id ? "active" : ""}`}
            >
              <span className="relative inline-block">
                {label}
                <span className="riga-underline-wrap">
                  <MiniRigaDivider />
                </span>
              </span>
            </button>
          ))}

          <div
            className="flex items-center gap-3 px-4 pt-4 mt-2 border-t"
            style={{ borderColor: "var(--rim)" }}
          >
            <ThemeToggle />

            {cvUrl && <ButtonLink href={cvUrl} target="_blank" rel="noopener noreferrer" fullWidth>Download CV</ButtonLink>}
          </div>
        </div>
      )}
    </nav>
  );
}
