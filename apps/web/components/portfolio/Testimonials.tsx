import { fetchList } from "@/lib/fetch";
import type { Review } from "@devcraft/types";
import TestimonialsCarousel from "./TestimonialsCarousel";
import type { Testimonial } from "./testimonial.types";

const API_URL: string = process.env.NEXT_PUBLIC_API_URL!;

// Real reviews from the database replace these as soon as at least one exists.
// The small fallback keeps the section populated on a fresh installation.
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

const RELATION_TO_ERA: Record<Review["relation"], Testimonial["era"]> = {
  TEAM: "team",
  CLIENT: "client",
  COLLEAGUE: "colleague",
};

function reviewToTestimonial(review: Review): Testimonial {
  return {
    id: review.id,
    quote: review.quote,
    name: review.name,
    role: review.role ?? "",
    company: review.company ?? "",
    initials: review.initials,
    linkedin: review.linkedinUrl ?? "",
    era: RELATION_TO_ERA[review.relation],
    photoUrl: review.photoUrl,
  };
}

export async function TestimonialsSection() {
  const reviews = await fetchList<Review>(`${API_URL}/reviews`, { revalidate: 60 });
  const realReviews = reviews.map(reviewToTestimonial);
  const testimonials = realReviews.length > 0 ? realReviews : TESTIMONIALS;

  return <TestimonialsCarousel testimonials={testimonials} />;
}
