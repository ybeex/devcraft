import { KwalbaFrame, RigaDivider } from "@/components/hausa";
import { IconFill } from "@/components/ui/IconFill";
import { fetchList } from "@/lib/fetch";
import type { Review } from "@devcraft/types";

const API_URL: string = process.env.NEXT_PUBLIC_API_URL!;

interface Testimonial {
  id:       string;
  quote:    string;
  name:     string;
  role:     string;
  company:  string;
  initials: string;
  linkedin: string;
  era:      "team" | "client" | "colleague";
  photoUrl?: string | null;
}

// Real reviews from the database (see the Reviews dashboard page) replace
// these the moment at least one exists — see TestimonialsSection below.
// Kept here as the fallback so the section never renders empty before the
// first real review comes in.
const TESTIMONIALS: Testimonial[] = [
  {
    id: "placeholder-aisha-musa",
    quote: "Working alongside him during the HNG internship was one of the most instructive experiences I've had. He shipped our auth microservice in 48 hours and it had zero bugs in the final review. The codebase was clean enough that three other teams adopted it without modification.",
    name: "Aisha Musa",
    role: "Product Engineer",
    company: "Paystack",
    initials: "AM",
    linkedin: "https://linkedin.com/in/yourcolleague",
    era: "team",
  },
  {
    id: "placeholder-emeka-okafor",
    quote: "He rebuilt our invoice system from scratch in six weeks. What struck me wasn't just the quality — it was how he asked the right questions before writing a single line. He understood our business before he understood our tech stack. That's rare.",
    name: "Emeka Okafor",
    role: "Founder",
    company: "FinStack Labs",
    initials: "EO",
    linkedin: "https://linkedin.com/in/yourclient",
    era: "client",
  },
  {
    id: "placeholder-zainab-ibrahim",
    quote: "He has a mathematician's discipline and a craftsman's eye. Every PR he raised during our sprint came with context — why he made each decision, what trade-offs he considered. You don't have to chase him for explanations. He writes code like he's writing for the next person.",
    name: "Zainab Ibrahim",
    role: "Senior Engineer",
    company: "Flutterwave",
    initials: "ZI",
    linkedin: "https://linkedin.com/in/yourcolleague2",
    era: "colleague",
  },
];

const ERA_LABELS = {
  team:      "HNG Internship",
  client:    "Client",
  colleague: "Colleague",
};

const ERA_COLORS = {
  team:      "var(--brand)",
  client:    "var(--indigo)",
  colleague: "var(--ghost)",
};

function TestimonialCard({ t, featured = false }: { t: Testimonial; featured?: boolean }) {
  const color = ERA_COLORS[t.era];
  return (
    <div
      className={`reveal fill-trigger flex flex-col ${featured ? "lg:flex-row" : ""} rounded-[22px] border overflow-hidden relative transition-all duration-300 ease-site-out hover:-translate-y-1 shadow-[inset_0_1px_0_0_var(--glass-highlight)] hover:shadow-[inset_0_1px_0_0_var(--glass-highlight),0_20px_40px_-16px_rgba(0,0,0,0.28)]`}
      style={{
        background: `linear-gradient(155deg, color-mix(in srgb, ${color} 10%, var(--glass-bg-strong)) 0%, var(--glass-bg-strong) 60%)`,
        borderColor: "var(--glass-border)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
      }}
    >
      {/* Quote */}
      <div className={`flex-1 ${featured ? "p-7 sm:p-9" : "p-6 pb-5"}`}>
        {/* Opening quote mark */}
        <div
          className="font-display leading-[0.8] mb-3 select-none"
          style={{ color, opacity: 0.35, fontWeight: 700, fontSize: featured ? 72 : 56 }}
          aria-hidden="true"
        >
          "
        </div>
        <p
          className={`leading-[1.8] italic ${featured ? "text-[16px] sm:text-[18px]" : "text-[14px]"}`}
          style={{ color: "var(--ink)" }}
        >
          {t.quote}
        </p>
      </div>

      {/* Attribution */}
      <div
        className={`flex items-center gap-4 px-6 py-5 ${featured ? "lg:flex-col lg:items-start lg:justify-center lg:w-60 lg:shrink-0 lg:border-t-0 lg:border-l" : "border-t"}`}
        style={{ borderColor: "var(--rim)", background: "color-mix(in srgb, var(--raised) 80%, transparent)" }}
      >
        <IconFill scale={1.2}>
          <KwalbaFrame size={featured ? 58 : 52} color={color}>
            {t.photoUrl ? (
              <img
                src={t.photoUrl}
                alt={t.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span
                className="font-display text-[14px] font-bold"
                style={{ color }}
              >
                {t.initials}
              </span>
            )}
          </KwalbaFrame>
        </IconFill>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px] leading-tight" style={{ color: "var(--ink)" }}>
            {t.name}
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--dim)" }}>
            {t.role} · {t.company}
          </p>
          <a
            href={t.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] mt-1 hover:opacity-70 transition-opacity"
            style={{ color: "var(--ghost)" }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212a1.38 1.38 0 0 1-1.38-1.38c0-.762.617-1.38 1.38-1.38.763 0 1.38.618 1.38 1.38 0 .762-.617 1.38-1.38 1.38m5.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
            </svg>
            Verify on LinkedIn
          </a>
        </div>

        <span
          className={`swatch-tag shrink-0 ${featured ? "lg:mt-3" : ""}`}
          style={{
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            color,
            borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
          }}
        >
          {ERA_LABELS[t.era]}
        </span>
      </div>
    </div>
  );
}

const RELATION_TO_ERA: Record<Review["relation"], Testimonial["era"]> = {
  TEAM: "team",
  CLIENT: "client",
  COLLEAGUE: "colleague",
};

function getTestimonialKey(t: Pick<Testimonial, "id" | "name" | "company" | "era">) {
  return t.id || `${t.name}-${t.company || "unknown"}-${t.era}`;
}

function reviewToTestimonial(r: Review): Testimonial {
  return {
    id: r.id,
    quote: r.quote,
    name: r.name,
    role: r.role ?? "",
    company: r.company ?? "",
    initials: r.initials,
    linkedin: r.linkedinUrl ?? "",
    era: RELATION_TO_ERA[r.relation],
    photoUrl: r.photoUrl,
  };
}

export async function TestimonialsSection() {
  // Real reviews (added from the dashboard's Reviews page) take over the
  // moment at least one exists — the placeholder set above only shows
  // while the database is empty, so the section is never blank on a
  // fresh install but also never mixes made-up quotes in with real ones.
  // fetchList (not the sessionStorage-backed client in lib/api.ts, which
  // isn't safe to call from a server component) also gets this section
  // Next.js ISR caching for free, same as the homepage's projects/blog
  // fetches above it.
  const reviews = await fetchList<Review>(`${API_URL}/reviews`, { revalidate: 60 });
  const realReviews: Testimonial[] = reviews.map(reviewToTestimonial);
  const testimonials: Testimonial[] = realReviews.length > 0 ? realReviews : TESTIMONIALS;

  const [featured, ...rest] = testimonials;

  return (
    <section
      id="testimonials"
      style={{
        padding: "100px clamp(24px, 8vw, 120px)",
        // Matches the Blog section's background so the two sections read
        // as one continuous surface, separated only by the Sawaki divider.
        background: "var(--canvas)",
      }}
    >
      <div className="max-w-260 mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span
              className="reveal swatch-tag mb-5"
            >
              Social Proof
            </span>
            <h2
              className="reveal font-display font-bold leading-[1.12]"
              style={{ fontSize: "clamp(28px, 4.5vw, 46px)", color: "var(--ink)" }}
            >
              People who've<br />worked with me.
            </h2>
          </div>
          <p
            className="reveal text-[14px] leading-[1.7] max-w-[320px]"
            style={{ color: "var(--dim)" }}
          >
            Three perspectives — from an internship teammate, a client, and a colleague.
            All linked to their LinkedIn for verification.
          </p>
        </div>

        {/* Cards — one featured full-width strip, the rest in a 2-up row */}
        <div className="reveal-group flex flex-col gap-5">
          {featured && <TestimonialCard key={getTestimonialKey(featured)} t={featured} featured />}
          {rest.length > 0 && (
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))" }}>
              {rest.map((t) => (
                <TestimonialCard key={getTestimonialKey(t)} t={t} />
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mt-14 opacity-40">
          <RigaDivider />
        </div>

        {/* Coda */}
        <p
          className="reveal text-center text-[13px] italic mt-8"
          style={{ color: "var(--ghost)" }}
        >
          Want to add yours?{" "}
          <a
            href="mailto:hello@devcraft.dev"
            className="hover:opacity-70 transition-opacity underline underline-offset-3"
            style={{ color: "var(--brand)" }}
          >
            Reach out.
          </a>
        </p>
      </div>
    </section>
  );
}
