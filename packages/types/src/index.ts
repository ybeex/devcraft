// ── ENUMS (mirror Prisma) ───────────────────────────────────────────────────

export type Era = "FOUNDATION" | "INTERNSHIP" | "SAAS";
export type NotifType = "BLOG" | "PROJECT";
export type DeviceType = "DESKTOP" | "MOBILE" | "TABLET";
export type ReviewRelation = "TEAM" | "CLIENT" | "COLLEAGUE";

export interface ProjectCodeExample {
  language: string;
  solves: string;
  code: string;
}

// ── PROJECT ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  era: Era;
  problem: string;
  solution: string;
  impact: string;
  metrics: Record<string, string | number> | null;
  codeExamples: ProjectCodeExample[];
  techStack: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  thumbnailUrl: string | null;
  galleryUrls: string[];
  featured: boolean;
  published: boolean;
  displayOrder: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCreateInput = Omit<Project, "id" | "views" | "createdAt" | "updatedAt">;
export type ProjectUpdateInput = Partial<ProjectCreateInput>;

// ── BLOG ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  readingTime: number | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export type BlogPostCreateInput = Omit<BlogPost, "id" | "views" | "createdAt" | "updatedAt">;
export type BlogPostUpdateInput = Partial<BlogPostCreateInput>;

// ── REVIEW ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number;
  initials: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  relation: ReviewRelation;
  published: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewCreateInput = Omit<Review, "id" | "createdAt" | "updatedAt">;

// ── SUBSCRIBER ───────────────────────────────────────────────────────────────

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  unsubscribeToken: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

// ── ANALYTICS ────────────────────────────────────────────────────────────────

export interface DayCount {
  date:  string; // YYYY-MM-DD
  count: number;
}

export interface DeviceSplit {
  desktop: number;
  mobile:  number;
  tablet:  number;
}

export interface PageCount {
  path:  string;
  count: number;
}

export interface ReferrerCount {
  referrer: string;
  count:    number;
}

/** Exact shape returned by GET /analytics/overview */
export interface AnalyticsOverview {
  totalViews:      number;
  viewsLastPeriod: number;
  viewsByDay:      DayCount[];
  deviceSplit:     DeviceSplit;
  topPages:        PageCount[];
  topReferrers:    ReferrerCount[];
}

/** Exact shape returned by GET /analytics/subscribers */
export interface SubscriberAnalytics {
  total:          number;
  newThisPeriod:  number;
  growthByDay:    DayCount[];
}

// ── CONTACT ───────────────────────────────────────────────────────────────────

export interface ContactMessage {
  id:        string;
  name:      string;
  email:     string;
  subject:   string;
  message:   string;
  read:      boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export type ContactCreateInput = Pick<ContactMessage, "name" | "email" | "subject" | "message">;

// ── SITE SETTINGS ────────────────────────────────────────────────────────────

export interface SiteSettings {
  id:           string;
  name:         string;
  tagline:      string;
  availability: string;
  githubUrl:    string;
  linkedinUrl:  string;
  twitterUrl:   string;
  email:        string;
  cvUrl:        string;
  updatedAt:    string;
}

export type SiteSettingsInput = Omit<SiteSettings, "id" | "updatedAt">;

// ── EMAIL NOTIFICATIONS ──────────────────────────────────────────────────────

export interface EmailNotificationLog {
  id:             string;
  type:           "BLOG" | "PROJECT";
  subject:        string;
  recipientCount: number;
  projectId:      string | null;
  sentAt:         string;
  blogPost:       { title: string; slug: string } | null;
}

// ── API RESPONSES ────────────────────────────────────────────────────────────

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  statusCode: number;
}

export type ApiResponse<T> = ApiOk<T> | ApiError;

// ── AUTH ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
