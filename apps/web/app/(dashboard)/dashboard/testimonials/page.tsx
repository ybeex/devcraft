import { redirect } from "next/navigation";

/**
 * Keep the old testimonials URL working for bookmarks while the dashboard's
 * canonical social-proof editor lives under Reviews.
 */
export default function TestimonialsDashboardRedirect(): never {
  redirect("/dashboard/reviews");
}
