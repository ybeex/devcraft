import type { Metadata, Viewport } from "next";
import { DM_Sans, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// ── FONTS ─────────────────────────────────────────────────────────────────────
// Bricolage Grotesque carries every headline — its slightly irregular,
// warm-but-modern grotesk character is the one display voice on the site.
// Deliberately not paired with a serif: one confident typeface, used across
// its full weight range, reads more considered than a second "elegant" face.

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "600"],
});

// ── METADATA ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "DevCraft — Full-Stack Engineer from Kano",
    template: "%s | DevCraft",
  },
  description:
    "Full-stack engineer. Mathematics graduate. Ex-tailor. I build products that fit — precisely, deliberately, from scratch.",
  keywords: ["Full-stack developer", "Nigeria", "Kano", "Next.js", "Fastify", "PostgreSQL", "SaaS"],
  authors: [{ name: "DevCraft" }],
  creator: "DevCraft",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: process.env.NEXT_PUBLIC_SITE_URL!,
    siteName: "DevCraft",
    title: "DevCraft — Full-Stack Engineer from Kano",
    description: "Full-stack engineer. Mathematics graduate. Ex-tailor. Built from scratch.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevCraft — Full-Stack Engineer from Kano",
    description: "Full-stack engineer. Mathematics graduate. Ex-tailor.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
};

export const viewport: Viewport = {
  themeColor: "#d4ac55",
};

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "DevCraft",
  jobTitle: "Full-Stack Software Engineer",
  description: "Self-taught full-stack engineer from Kano, Nigeria. Mathematics graduate. Ex-tailor.",
  url: process.env.NEXT_PUBLIC_SITE_URL!,
  knowsAbout: ["Next.js", "Fastify", "PostgreSQL", "TypeScript", "Node.js", "Tailwind CSS"],
};

// ── LAYOUT ────────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const saved = localStorage.getItem('theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (saved === 'dark' || (!saved && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            } catch {}
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${bricolage.variable} ${jetbrains.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
