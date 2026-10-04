"use client";

import type { ReactNode, ReactElement } from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Star,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { TukulMarker } from "@/components/hausa";
import { LogoMark } from "@/components/ui/LogoMark";
import { PageLoading } from "@/components/ui/PageLoading";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getToken, adminApi, setToken } from "@/lib/api";
import type { ApiResponse, AuthTokens } from "@devcraft/types";

interface NavItem {
  href:  string;
  label: string;
  icon:  LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/dashboard",             label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/projects",    label: "Projects",    icon: FolderKanban },
  { href: "/dashboard/blog",        label: "Blog",        icon: FileText },
  { href: "/dashboard/reviews",     label: "Reviews",     icon: Star },
  { href: "/dashboard/contacts",    label: "Inbox",       icon: Inbox },
  { href: "/dashboard/subscribers", label: "Subscribers", icon: Users },
  { href: "/dashboard/analytics",   label: "Analytics",   icon: BarChart3 },
  { href: "/dashboard/settings",    label: "Settings",    icon: Settings },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): ReactElement {
  const router               = useRouter();
  const pathname              = usePathname();
  const [checking, setChecking]     = useState<boolean>(true);
  const [collapsed, setCollapsed]   = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [unreadCount, setUnread]    = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
        setCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth check on mount — try refresh, redirect to login if it fails.
  // Wrapped in try/catch so an unexpected error (bad JSON, a thrown
  // exception, etc.) can never leave the page stuck on the loading spinner —
  // every path below is guaranteed to either grant access or redirect.
  useEffect(() => {
    let cancelled = false;

    (async (): Promise<void> => {
      let authorized = false;

      try {
        if (getToken()) {
          authorized = true;
        } else {
          const res = (await adminApi.auth.refresh()) as ApiResponse<AuthTokens>;
          if (cancelled) return;

          if (res.ok && res.data?.accessToken) {
            setToken(res.data.accessToken);
            authorized = true;
          }
        }
      } catch {
        authorized = false;
      }

      if (cancelled) return;

      if (authorized) {
        setChecking(false);
      } else {
        setToken(null);
        router.replace("/auth/login");
      }
    })();

    return () => { cancelled = true; };
  }, [router]);

  // Poll unread contact-message count every 30s
  const pollUnread = useCallback(async (): Promise<void> => {
    const res = (await adminApi.contacts.unreadCount()) as ApiResponse<{ count: number }>;
    if (res.ok) setUnread(res.data.count);
  }, []);

  useEffect(() => {
    if (checking) return;
    void pollUnread();
    const interval = setInterval(() => void pollUnread(), 30_000);
    return () => clearInterval(interval);
  }, [checking, pollUnread]);

  if (checking) {
    return <PageLoading />;
  }

  const handleLogout = async (): Promise<void> => {
    await adminApi.auth.logout();
    setToken(null);
    router.replace("/auth/login");
  };

  return (
    <div
      className="dashboard-layout relative flex flex-col md:flex-row h-dvh overflow-hidden"
      style={{ background: "var(--canvas)", color: "var(--ink)" }}
    >
      {/* Same textured backdrop as the login page / contact section, fixed
          so it never scrolls with content and sits behind every layer. */}
      <div className="sawaki-bg fixed inset-0 z-0 opacity-40 pointer-events-none" aria-hidden="true" />

      {/* Mobile Header Bar — stays put at the top; content scrolls under it */}
      <div
        className="md:hidden relative z-20 flex items-center justify-between px-4 h-14 border-b shrink-0"
        style={{ background: "var(--card)", borderColor: "var(--rim)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <LogoMark size={26} />
          <span className="font-display font-bold text-[16px] truncate" style={{ color: "var(--ink)" }}>DevCraft</span>
        </div>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="p-2.5 rounded-lg border shrink-0"
          style={{ borderColor: "var(--rim)", background: "var(--raised)" }}
        >
          {mobileOpen ? <X size={17} strokeWidth={1.8} /> : <Menu size={17} strokeWidth={1.8} />}
        </button>
      </div>

      {/* Mobile drawer scrim — tapping outside the sidebar closes it */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed/overlay on mobile so it never scrolls with the page,
          static column with its own height on desktop so only the nav list
          (not the whole sidebar) scrolls if it ever overflows. */}
      <aside
        className={`${
          mobileOpen ? "flex" : "hidden"
        } md:flex flex-col shrink-0 fixed md:static inset-y-0 left-0 z-40 md:z-10 h-full md:h-full max-w-[85vw] transition-all duration-300`}
        style={{
          // Mobile navigation is a readable drawer, never the collapsed
          // desktop icon rail. `mobileOpen` is only true below md.
          width:       mobileOpen ? 260 : (collapsed ? 68 : 220),
          background:  "var(--card)",
          borderRight: "1px solid var(--rim)",
          boxShadow:   "var(--elevation-1)",
        }}
      >
        {/* Logo (desktop) */}
        <div
            className="hidden md:flex items-center gap-3 px-4 h-16 border-b shrink-0"
          style={{ borderColor: "var(--rim)" }}
        >
          <LogoMark size={30} />
          {!collapsed && (
            <span className="font-display font-bold text-[16px] truncate" style={{ color: "var(--ink)" }}>
              DevCraft
            </span>
          )}
          <button
            onClick={() => setCollapsed((c: boolean) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="ml-auto p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity shrink-0"
            style={{ color: "var(--dim)" }}
          >
            {collapsed ? <ChevronRight size={15} strokeWidth={2} /> : <ChevronLeft size={15} strokeWidth={2} />}
          </button>
        </div>

        {/* Nav links — this is the part that scrolls if the list is ever
            taller than the viewport, not the sidebar itself */}
        <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto min-h-0">
          {NAV.map(({ href, label, icon: Icon }: NavItem) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            const showBadge = href === "/dashboard/contacts" && unreadCount > 0;

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
                style={{
                  background: active ? "var(--brand-muted)" : "transparent",
                  color:      active ? "var(--brand)"        : "var(--dim)",
                }}
              >
                {/* Left accent rail on the active tab — a single tint alone
                    reads as a generic template sidebar; this plus the badge
                    dot gives the current section real, at-a-glance weight. */}
                {active && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-full"
                    style={{ background: "var(--brand)" }}
                    aria-hidden="true"
                  />
                )}
                <span className="shrink-0 relative">
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  {showBadge && collapsed && !mobileOpen && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{ background: "var(--brand)" }}
                    />
                  )}
                </span>
                {(!collapsed || mobileOpen) && (
                  <>
                    <span className="flex-1 truncate">{label}</span>
                    {showBadge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center shrink-0"
                        style={{ background: "var(--brand)", color: "var(--on-brand)" }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                    {active && !showBadge && <TukulMarker size={10} color="var(--brand)" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div
          className={`p-2 border-t shrink-0 ${collapsed && !mobileOpen ? "flex flex-col items-center gap-1" : "flex items-center gap-2"}`}
          style={{ borderColor: "var(--rim)" }}
        >
          <button
            onClick={() => void handleLogout()}
            title="Logout"
            className={`${collapsed && !mobileOpen ? "w-full justify-center" : "flex-1"} flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 hover:bg-(--raised)`}
            style={{ color: "var(--dim)" }}
          >
            <LogOut size={17} strokeWidth={1.8} aria-hidden="true" />
            {(!collapsed || mobileOpen) && "Logout"}
          </button>
          <ThemeToggle className="shrink-0" />
        </div>
      </aside>

      {/* Main area — the only thing that scrolls; sidebar and header stay put */}
      <main className="relative z-10 flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  );
}
