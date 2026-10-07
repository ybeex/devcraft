export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  linkedin: string;
  era: "team" | "client" | "colleague";
  photoUrl?: string | null;
}
