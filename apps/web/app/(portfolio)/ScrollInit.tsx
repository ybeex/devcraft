"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

export function ScrollInit() {
  // Boot bidirectional scroll reveal
  useScrollReveal();

  // Track page views
  const pathname = usePathname();
  useEffect(() => {
    api.pageview(pathname, document.referrer || undefined).catch(() => {});
  }, [pathname]);

  return null;
}
