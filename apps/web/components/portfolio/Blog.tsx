import Link from "next/link";
import Image from "next/image";
import { RigaDivider } from "@/components/hausa";
import { buttonClassName, buttonStyle } from "@/components/ui/buttonStyles";

// ── TYPES ─────────────────────────────────────────────────────────────────────
// Mirrors the shape returned by GET /blog — kept local (rather than importing
// the full BlogPost type) since the homepage teaser only ever needs the
// list-view fields.

export interface BlogTeaserPost {
  id:            string;
  title:         string;
  slug:          string;
  excerpt:       string;
  coverImageUrl: string | null;
  tags:          string[];
  publishedAt:   string | null;
  readingTime:   number | null;
}

// ── CARD ──────────────────────────────────────────────────────────────────────

function BlogCard({ post }: { post: BlogTeaserPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block no-underline h-full">
      <div
        className="group flex flex-col rounded-[22px] overflow-hidden h-full transition-all duration-300 --ease-out hover:-translate-y-1.5 shadow-[inset_0_1px_0_0_var(--glass-highlight)] hover:shadow-[inset_0_1px_0_0_var(--glass-highlight),0_24px_48px_-18px_rgba(0,0,0,0.3)]"
        style={{
          background: "var(--glass-bg-strong)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          border: "1px solid var(--glass-border)",
        }}
      >
        {/* Cover image with gradient scrim + floating tags */}
        <div className="relative aspect-16/10 overflow-hidden bg-(--raised)">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <RigaDivider color="var(--brand)" className="opacity-40 w-2/3" />
            </div>
          )}
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--glass-bg-strong) 85%, transparent), transparent)" }}
          />
          {post.tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-24px)]">
              {post.tags.slice(0, 3).map((t: string) => (
                <span
                  key={t}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: "color-mix(in srgb, var(--card) 78%, transparent)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    color: "var(--ink)",
                    border: "1px solid color-mix(in srgb, var(--rim) 70%, transparent)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-6">
          {/* Title */}
          <h3
            className="font-display font-bold text-[20px] leading-tight mb-2 transition-colors duration-200 group-hover:text-(--brand)"
            style={{ color: "var(--ink)" }}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[13px] leading-[1.65] mb-4" style={{ color: "var(--dim)" }}>
            {post.excerpt}
          </p>

          <div className="flex-1" />

          {/* Meta row */}
          <div className="flex items-center gap-3 pt-4 border-t text-[11.5px]" style={{ borderColor: "var(--rim-sub)", color: "var(--ghost)" }}>
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </time>
            )}
            {post.readingTime !== null && <span>· {post.readingTime} min read</span>}
            <span
              className="ml-auto flex items-center justify-center shrink-0 rounded-full transition-all duration-200 group-hover:bg-(--brand)"
              style={{ width: 30, height: 30, background: "var(--raised)", border: "1px solid var(--rim)" }}
              aria-hidden="true"
            >
              <svg
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                className="transition-all duration-200 group-hover:translate-x-0.5 stroke-(--dim) group-hover:stroke-(--on-brand)"
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── SECTION ───────────────────────────────────────────────────────────────────

export function BlogSection({ posts }: { posts: BlogTeaserPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section
      id="blog"
      style={{ padding: "100px clamp(24px, 8vw, 120px)", background: "var(--canvas)" }}
    >
      <div className="max-w-260 mx-auto">
        <div className="flex items-start justify-between gap-8 mb-14">
          <div className="max-w-140">
            <span className="reveal swatch-tag mb-5">
              Writing
            </span>
            <h2 className="reveal font-display font-bold leading-[1.12] mb-4"
              style={{ fontSize: "clamp(28px, 4.5vw, 46px)", color: "var(--ink)" }}>
              Thoughts on craft,<br />code, and curiosity.
            </h2>
            <p className="reveal text-[16px] leading-[1.65]"
              style={{ color: "var(--dim)" }}>
              Essays on full-stack engineering, SaaS building, mathematics, and what
              tailoring taught me about software.
            </p>
          </div>
          <Image
            src="/file_00000000082481f49eb59c5417d31d10.png"
            alt=""
            width={128}
            height={128}
            className="reveal hidden sm:block shrink-0 object-contain"
          />
        </div>

        <div
          className="reveal-group grid gap-5 mb-12"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}
        >
          {posts.map((post: BlogTeaserPost) => (
            <div key={post.id} className="reveal">
              <BlogCard post={post} />
            </div>
          ))}
        </div>

        {/* Archive link */}
        <div className="reveal text-center">
          <Link
            href="/blog"
            className={buttonClassName("md", false, "no-underline")}
            style={buttonStyle("secondary")}
          >
            View all posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
