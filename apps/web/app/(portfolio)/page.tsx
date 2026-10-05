import type { Metadata } from "next";
// import dynamic from "next/dynamic";
import { type ReactElement } from "react";
import type { Project } from "@devcraft/types";
import { fetchList, fetchJSON } from "@/lib/fetch";
import { PortfolioNav }         from "@/components/portfolio/Nav";
import { HeroSection }          from "@/components/portfolio/Hero";
import { AboutSection }         from "@/components/portfolio/About";
import { ProjectsSection }      from "@/components/portfolio/Projects";
import { BlogSection, type BlogTeaserPost } from "@/components/portfolio/Blog";
import { SkillsSection, ContactSection, FooterSection } from "@/components/portfolio/Sections";
import { TestimonialsSection }  from "@/components/portfolio/Testimonials";
import { CustomCursor }         from "@/components/ui/Cursor";
import { AiChat }               from "@/components/portfolio/AiChat";
import { ScrollInit }           from "./ScrollInit";
import { JourneyMap } from "@/components/portfolio/JourneyMap.client"
import { SawakiLineDivider } from "@/components/hausa";

// FR-019: Journey map is client-only (D3 + browser APIs)
// const JourneyMap = dynamic(
//   () => import("@/components/portfolio/JourneyMap").then((m) => m.JourneyMap),
//   { ssr: false, loading: () => <div style={{ height: 480, background: "var(--canvas)" }} /> }
// );

export const metadata: Metadata = {
  title: "DevCraft — Full-Stack Engineer from Kano",
  description:
    "Full-stack engineer. Mathematics graduate. Ex-tailor. I build products that fit — precisely, deliberately, from scratch.",
};

const API_URL: string = process.env.NEXT_PUBLIC_API_URL!;

interface BlogListResponse {
  posts: BlogTeaserPost[];
}

export default async function HomePage(): Promise<ReactElement> {
  // fetchList() wraps Next.js's extended fetch() — fixes the
  // "'next' does not exist in type 'RequestInit'" TypeScript error,
  // and always resolves to an array even on failure.
  const projects: Project[] = await fetchList<Project>(`${API_URL}/projects`, {
    revalidate: 300,
    tags: ["projects"],
  });

  // Blog list endpoint returns { posts, pagination } rather than a bare
  // array, so this uses fetchJSON (not fetchList) and unwraps `.posts`.
  const blogData = await fetchJSON<BlogListResponse>(`${API_URL}/blog`, {
    revalidate: 300,
    tags: ["blog-list"],
  });
  const latestPosts: BlogTeaserPost[] = (blogData?.posts ?? []).slice(0, 3);

  return (
    <>
      <ScrollInit />
      <CustomCursor />
      <PortfolioNav />

      <main>
        <HeroSection />
         <SawakiLineDivider />
        <AboutSection />
         <SawakiLineDivider />
        {/* FR-019: Interactive Hausa Journey Map */}
        <JourneyMap />
          <SawakiLineDivider />
        <SkillsSection />
          <SawakiLineDivider />
        <ProjectsSection projects={projects} />
          <SawakiLineDivider />
        <BlogSection posts={latestPosts} />
          <SawakiLineDivider />
        {/* FR-018: Testimonials */}
        <TestimonialsSection />
          <SawakiLineDivider />
        <ContactSection />
      </main>

       <SawakiLineDivider />
      <FooterSection />

      {/* AI Chat Widget */}
      <AiChat />
    </>
  );
}
