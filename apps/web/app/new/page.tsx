import type { ReactElement } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
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
import { Terminal }             from "@/components/portfolio/Terminal";
import { ScrollInit }           from "./ScrollInit";
import { JourneyMap } from "@/components/portfolio/JourneyMap.client";

// FR-019: Journey map is client-only (D3 + browser APIs)

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
        <AboutSection />
        {/* FR-019: Interactive Hausa Journey Map */}
        <JourneyMap />
        <ProjectsSection projects={projects} />
        <BlogSection posts={latestPosts} />
        <SkillsSection />
        {/* FR-018: Testimonials */}
        <TestimonialsSection />
        <ContactSection />
      </main>

      <FooterSection />

      {/* FR-016: Terminal CLI easter egg (press "/") */}
      <Terminal />
      {/* AI Chat Widget */}
      <AiChat />
    </>
  );
}
