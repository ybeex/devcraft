"use client";

import { useEffect, useRef } from "react";

/**
 * Bidirectional scroll reveal — stable, no render-loop reconnects.
 * BUG-03 fix: uses empty deps [], MutationObserver for dynamic elements.
 */
export function useScrollReveal() {
  const ioRef = useRef<IntersectionObserver | null>(null);
  const moRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const handleEntry = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          el.classList.remove("from-top");
        } else {
          el.classList.remove("is-visible");
          if (entry.boundingClientRect.top < 0) {
            el.classList.add("from-top");
          } else {
            el.classList.remove("from-top");
          }
        }
      });
    };

    ioRef.current = new IntersectionObserver(handleEntry, {
      threshold: 0.12,
      rootMargin: "0px 0px -32px 0px",
    });

    const observe = () => {
      document.querySelectorAll<HTMLElement>(".reveal:not([data-rv])").forEach((el) => {
        ioRef.current?.observe(el);
        el.dataset.rv = "1";
      });
    };

    observe();

    moRef.current = new MutationObserver(() => observe());
    moRef.current.observe(document.body, { childList: true, subtree: true });

    return () => {
      ioRef.current?.disconnect();
      moRef.current?.disconnect();
      document.querySelectorAll<HTMLElement>("[data-rv]").forEach((el) => {
        delete el.dataset.rv;
      });
    };
  }, []); // stable — runs once
}

export function useActiveSection(
  sectionIds: string[],
  onChange?: (id: string) => void
) {
  const activeRef = useRef<string>(sectionIds[0] ?? "");

  useEffect(() => {
    if (!sectionIds.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible[0]) {
          const id = visible[0].target.id;
          if (id !== activeRef.current) {
            activeRef.current = id;
            onChange?.(id);
          }
        }
      },
      { threshold: 0.3 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionIds, onChange]);

  return activeRef;
}
