import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchJSON } from "@/lib/fetch";
import { LaujeSpinner, RigaDivider, SawakiLineDivider } from "@/components/hausa";
import { PortfolioNav }    from "@/components/portfolio/Nav";
import { FooterSection }   from "@/components/portfolio/Sections";
import { AiChat }          from "@/components/portfolio/AiChat";
import { CustomCursor }    from "@/components/ui/Cursor";
import { ScrollInit }      from "../ScrollInit";

export const metadata: Metadata = {
  title:       "Blog — DevCraft",
  description: "Writing on full-stack engineering, SaaS, mathematics, and the craft of building software.",
};

const API_URL: string = process.env.NEXT_PUBLIC_API_URL!;
const BLOG_PAGE_SIZE = 10;

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface BlogListItem {
  id:            string;
  title:         string;
  slug:          string;
  excerpt:       string;
  coverImageUrl: string | null;
  tags:          string[];
  publishedAt:   string | null;
  readingTime:   number | null;
  views:         number;
}

interface BlogListResponse {
  posts:       BlogListItem[];
  pagination:  { total: number; page: number; limit: number };
}

// Next 15+/16: searchParams is a Promise and must be awaited before use.
interface BlogPageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

// ── DATA ──────────────────────────────────────────────────────────────────────

async function getPosts(tag: string | undefined, page: number): Promise<BlogListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(BLOG_PAGE_SIZE) });
  if (tag) params.set("tag", tag);
  const data = await fetchJSON<BlogListResponse>(`${API_URL}/blog?${params.toString()}`, {
    revalidate: 300,
    tags: ["blog-list", ...(tag ? [`blog-tag:${tag}`] : [])],
  });
  return data ?? { posts: [], pagination: { total: 0, page, limit: BLOG_PAGE_SIZE } };
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default async function BlogPage({ searchParams }: BlogPageProps): Promise<ReactElement> {
  const { tag, page: rawPage } = await searchParams;
  const requestedPage = Number.parseInt(rawPage ?? "1", 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const data = await getPosts(tag, page);
  const posts: BlogListItem[] = data.posts;
  const totalPages = Math.max(1, Math.ceil(data.pagination.total / BLOG_PAGE_SIZE));
  const firstPost = posts.length > 0 ? (page - 1) * BLOG_PAGE_SIZE + 1 : 0;
  const lastPost = firstPost + posts.length - 1;
  if (page > totalPages) {
    const params = new URLSearchParams({ page: String(totalPages) });
    if (tag) params.set("tag", tag);
    redirect(`/blog?${params.toString()}`);
  }

  const pageHref = (nextPage: number): string => {
    const params = new URLSearchParams({ page: String(nextPage) });
    if (tag) params.set("tag", tag);
    return `/blog?${params.toString()}`;
  };

  return (
    <>
      <ScrollInit />
      <CustomCursor />
      <PortfolioNav />

      <main style={{ minHeight: "100vh", background: "var(--canvas)", paddingTop: 80 }}>
        <div className="sawaki-bg relative" style={{ padding: "64px clamp(24px, 8vw, 120px) 48px" }}>
          <div className="max-w-215 mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-[2.5px] mb-3" style={{ color: "var(--brand)" }}>
              Writing
            </p>
            <h1
              className="font-display font-bold leading-[1.1] mb-4"
              style={{ fontSize: "clamp(32px, 5vw, 52px)", color: "var(--ink)" }}
            >
              Thoughts on craft,<br />code, and curiosity.
            </h1>
            <p className="text-[16px] leading-[1.7]" style={{ color: "var(--dim)", maxWidth: 500 }}>
              Essays on full-stack engineering, SaaS building, mathematics, and
              what tailoring taught me about software. Written in Kano.
            </p>
          </div>
        </div>

        <SawakiLineDivider />

        <div style={{ padding: "0 clamp(24px, 8vw, 120px) 80px" }}>
          <div className="max-w-215 mx-auto">
            {tag && (
              <div
                className="flex items-center gap-3 mb-8 py-3 px-4 rounded-xl border"
                style={{ background: "var(--card)", borderColor: "var(--rim)" }}
              >
                <span className="text-[13px]" style={{ color: "var(--dim)" }}>Filtered by tag:</span>
                <span
                  className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{ background: "var(--brand-muted)", color: "var(--brand)", borderColor: "var(--rim)" }}
                >
                  {tag}
                </span>
                <Link href="/blog" className="text-[12px] ml-auto hover:opacity-70" style={{ color: "var(--ghost)" }}>
                  Clear ×
                </Link>
              </div>
            )}

            {posts.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center gap-4">
                <LaujeSpinner size={48} color="var(--brand)" />
                <p style={{ color: "var(--ghost)" }}>
                  {tag ? `No posts tagged "${tag}" yet.` : "No posts published yet. Check back soon."}
                </p>
                <Link href="/" className="text-[13px] font-semibold hover:opacity-80" style={{ color: "var(--brand)" }}>
                  ← Back to portfolio
                </Link>
              </div>
            ) : (
              <div className="flex flex-col">
                {posts.map((post: BlogListItem, i: number) => (
                  <div key={post.id}>
                    <article className="reveal py-8 group">
                      <Link href={`/blog/${post.slug}`} className="block no-underline">
                        {post.coverImageUrl && (
                          <div
                            className="mb-5 rounded-2xl overflow-hidden aspect-16/7"
                            style={{ background: "var(--raised)" }}
                          >
                            <img
                              src={post.coverImageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 4).map((t: string) => (
                            <span
                              key={t}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                              style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ghost)" }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <h2
                          className="font-display font-bold leading-[1.2] mb-3 transition-colors duration-200 group-hover:text-(--brand)"
                          style={{ fontSize: "clamp(20px, 3vw, 26px)", color: "var(--ink)" }}
                        >
                          {post.title}
                        </h2>

                        <p className="text-[14px] leading-[1.7] mb-4" style={{ color: "var(--dim)", maxWidth: 620 }}>
                          {post.excerpt}
                        </p>

                        <div className="flex items-center gap-4 text-[12px]" style={{ color: "var(--ghost)" }}>
                          {post.publishedAt && (
                            <time dateTime={post.publishedAt}>
                              {new Date(post.publishedAt).toLocaleDateString("en-NG", {
                                day: "numeric", month: "long", year: "numeric",
                              })}
                            </time>
                          )}
                          {post.readingTime !== null && <span>· {post.readingTime} min read</span>}
                          <span
                            className="ml-auto text-[13px] font-semibold transition-colors duration-200 group-hover:text-(--brand)"
                            style={{ color: "var(--dim)" }}
                          >
                            Read →
                          </span>
                        </div>
                      </Link>
                    </article>

                    {i < posts.length - 1 && (
                      <div className="opacity-40">
                        <RigaDivider />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && posts.length > 0 && (
              <nav className="mt-8 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t pt-5" style={{ borderColor: "var(--rim)" }} aria-label="Blog pagination">
                {page > 1 ? (
                  <Link href={pageHref(page - 1)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-70" style={{ color: "var(--brand)" }} rel="prev">
                    <ChevronLeft size={16} aria-hidden="true" /> Previous
                  </Link>
                ) : <span />}
                <span className="flex flex-col items-center text-center text-[12px] tabular-nums" style={{ color: "var(--ghost)" }} aria-current="page">
                  <span>Page {page} of {totalPages}</span>
                  <span>Showing {firstPost}–{lastPost} of {data.pagination.total} posts</span>
                </span>
                {page < totalPages ? (
                  <Link href={pageHref(page + 1)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-70" style={{ color: "var(--brand)" }} rel="next">
                    Next <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                ) : <span />}
              </nav>
            )}
          </div>
        </div>
      </main>

      <SawakiLineDivider />
      <FooterSection />
      <AiChat />
    </>
  );
}
