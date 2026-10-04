import type { Metadata } from "next";
import { notFound } from "next/navigation";
// import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import type { BlogPost } from "@devcraft/types";
import { fetchJSON } from "@/lib/fetch";
import { PortfolioNav }    from "@/components/portfolio/Nav";
import { FooterSection }   from "@/components/portfolio/Sections";
import { RigaDivider, LaujeSpinner, ZaureArch, SawakiLineDivider } from "@/components/hausa";
import { SubscribeWidget } from "@/components/ui/SubscribeWidget";
import { IconFill } from "@/components/ui/IconFill";
import { AiChat }          from "@/components/portfolio/AiChat";
import { CustomCursor }    from "@/components/ui/Cursor";
import { ScrollInit }      from "../../ScrollInit";
import { ReadingMode } from "@/components/portfolio/ReadingMode.client"
import { ArrowLeft, ArrowRight } from "lucide-react";

// FR-021: Reading mode is client-only (Canvas + Selection API)
// const ReadingMode = dynamic(
//   () => import("@/components/portfolio/ReadingMode").then((m) => m.ReadingMode),
//   { ssr: false }
// );

const API_URL: string = process.env.NEXT_PUBLIC_API_URL!;

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface RelatedPost {
  title:       string;
  slug:        string;
  excerpt:     string;
  publishedAt: string | null;
  readingTime: number | null;
}

interface BlogPostData {
  post:    BlogPost;
  related: RelatedPost[];
}

interface BlogNavPost {
  title: string;
  slug: string;
}

interface BlogNavigationResponse {
  posts: BlogNavPost[];
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// ── DATA ──────────────────────────────────────────────────────────────────────

async function getPost(slug: string): Promise<BlogPostData | null> {
  // fetchJSON<T> returns T | null — never `any`. This is what fixes the
  // "post and related do not exist on type '{...} | null'" error: the
  // return type here is explicitly BlogPostData | null, so every call site
  // gets full property narrowing once the null check runs.
  return fetchJSON<BlogPostData>(`${API_URL}/blog/${slug}`, {
    revalidate: 300,
    tags: [`blog:${slug}`],
  });
}

async function getPostNavigation(): Promise<BlogNavPost[]> {
  const data = await fetchJSON<BlogNavigationResponse>(`${API_URL}/blog?limit=50`, {
    revalidate: 300,
    tags: ["blog-list"],
  });
  return data?.posts ?? [];
}

// ── METADATA ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data: BlogPostData | null = await getPost(slug);

  if (!data) {
    return { title: "Post not found" };
  }

  const { post }: BlogPostData = data; // safe — data is narrowed to non-null here

  return {
    title: `${post.title} — DevCraft`,
    description: post.excerpt,
    openGraph: {
      title:       post.title,
      description: post.excerpt,
      images:      post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
      type:        "article",
      publishedTime: post.publishedAt ?? undefined,
    },
  };
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: BlogPostPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const [data, navigation] = await Promise.all([getPost(slug), getPostNavigation()]);

  // `return notFound()` (not just `notFound()`) is required for correct
  // control-flow narrowing: notFound() has return type `never`, but without
  // an explicit `return`, TypeScript can't always prove the function exits
  // here in every code path, especially under strict mode with the
  // Next.js JSX return type. The `if (!data) return notFound();` pattern
  // below guarantees `data` is `BlogPostData` (never null) for the rest
  // of the function body.
  if (!data) {
    return notFound();
  }

  const { post, related }: BlogPostData = data;
  const postIndex: number = navigation.findIndex((item: BlogNavPost) => item.slug === post.slug);
  const previousPost: BlogNavPost | undefined = postIndex >= 0 ? navigation[postIndex + 1] : undefined;
  const nextPost: BlogNavPost | undefined = postIndex > 0 ? navigation[postIndex - 1] : undefined;

  return (
    <>
      <ScrollInit />
      <CustomCursor />
      <PortfolioNav />

      <main style={{ minHeight: "100vh", background: "var(--canvas)", paddingTop: 80 }}>
        {post.coverImageUrl && (
          <div className="w-full overflow-hidden" style={{ maxHeight: 420, background: "var(--raised)" }}>
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              style={{ maxHeight: 420 }}
            />
          </div>
        )}

        <article style={{ padding: "56px clamp(24px, 8vw, 120px) 80px" }}>
          <div className="max-w-180 mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[13px] mb-8 hover:opacity-70 transition-opacity"
              style={{ color: "var(--ghost)" }}
            >
              ← All posts
            </Link>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border hover:border-(--brand) transition-colors"
                  style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ghost)" }}
                >
                  {tag}
                </Link>
              ))}
            </div>

            <h1
              className="font-display font-bold leading-[1.1] mb-5"
              style={{ fontSize: "clamp(28px, 5vw, 44px)", color: "var(--ink)", letterSpacing: "-0.5px" }}
            >
              {post.title}
            </h1>

            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] mb-10 pb-6 border-b"
              style={{ color: "var(--ghost)", borderColor: "var(--rim)" }}
            >
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </time>
              )}
              {post.readingTime !== null && <span>· {post.readingTime} min read</span>}
              <span>· {post.views.toLocaleString()} views</span>
            </div>

            {/* FR-021: Reading mode wraps MDX content for highlight-to-share */}
            <ReadingMode postTitle={post.title} postSlug={post.slug}>
              <div className="prose-devcraft">
                <MDXRemote
                  source={post.content}
                  options={{
                    mdxOptions: {
                      remarkPlugins:  [remarkGfm],
                      rehypePlugins:  [
                        // Bug fix: rehype-highlight was only tagging tokens
                        // with .hljs-* classes — nothing anywhere actually
                        // styled them, so every code block rendered as
                        // plain, uncolored text regardless of language.
                        // aliases lets ```react fences resolve to the same
                        // grammar as JSX; detect:true means an untagged
                        // ``` fence still gets a best-guess highlight
                        // instead of none at all. The actual token colors
                        // live in globals.css's HIGHLIGHT.JS THEME block.
                        [rehypeHighlight, { aliases: { react: "jsx" }, detect: true }],
                        rehypeSlug,
                      ],
                    },
                  }}
                />
              </div>
            </ReadingMode>

            <div className="mt-16 mb-12 opacity-60">
              <RigaDivider />
            </div>

            {(previousPost || nextPost) && (
              <nav aria-label="Post navigation" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
                {previousPost ? (
                  <Link href={`/blog/${previousPost.slug}`} className="group rounded-2xl border p-4 no-underline transition-colors hover:border-(--brand)" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <span className="flex items-center gap-2 text-[12px] font-semibold mb-2" style={{ color: "var(--brand)" }}><ArrowLeft size={14} aria-hidden="true" /> Previous post</span>
                    <span className="block font-display font-bold text-[15px] leading-[1.35] group-hover:text-(--brand) transition-colors" style={{ color: "var(--ink)" }}>{previousPost.title}</span>
                  </Link>
                ) : <div aria-hidden="true" className="hidden sm:block" />}
                {nextPost ? (
                  <Link href={`/blog/${nextPost.slug}`} className="group rounded-2xl border p-4 no-underline text-left sm:text-right transition-colors hover:border-(--brand)" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <span className="flex items-center justify-start sm:justify-end gap-2 text-[12px] font-semibold mb-2" style={{ color: "var(--brand)" }}>Next post <ArrowRight size={14} aria-hidden="true" /></span>
                    <span className="block font-display font-bold text-[15px] leading-[1.35] group-hover:text-(--brand) transition-colors" style={{ color: "var(--ink)" }}>{nextPost.title}</span>
                  </Link>
                ) : <div aria-hidden="true" className="hidden sm:block" />}
              </nav>
            )}

            {/* Subscribe */}
            <div className="rounded-2xl p-6 border fill-trigger mb-12" style={{ background: "var(--card)", borderColor: "var(--rim)" }}>
              <div className="flex items-center gap-3 mb-4">
                <IconFill scale={1.3}>
                  <LaujeSpinner size={32} color="var(--brand)" />
                </IconFill>
                <div>
                  <p className="font-display font-bold text-[18px]" style={{ color: "var(--ink)" }}>
                    Enjoyed this?
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--ghost)" }}>
                    Subscribe for new posts and projects.
                  </p>
                </div>
              </div>
              <SubscribeWidget />
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[2px] mb-5" style={{ color: "var(--brand)" }}>
                  Related reading
                </p>
                <div className="flex flex-col gap-4">
                  {related.map((r: RelatedPost) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="flex items-start gap-4 p-4 rounded-xl border transition-all hover:border-(--brand) group"
                      style={{ background: "var(--card)", borderColor: "var(--rim)", textDecoration: "none" }}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-[14px] leading-[1.3] mb-1 group-hover:text-(--brand) transition-colors"
                          style={{ color: "var(--ink)" }}
                        >
                          {r.title}
                        </p>
                        <p className="text-[12px] line-clamp-2" style={{ color: "var(--dim)" }}>
                          {r.excerpt}
                        </p>
                      </div>
                      <span
                        className="text-[12px] font-semibold shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform"
                        style={{ color: "var(--brand)" }}
                      >
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-16 opacity-20">
              <ZaureArch size={140} />
            </div>
          </div>
        </article>
      </main>

      <SawakiLineDivider />
      <FooterSection />
      <AiChat />
    </>
  );
}
