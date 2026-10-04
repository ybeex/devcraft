CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "name" TEXT NOT NULL DEFAULT 'DevCraft',
    "tagline" TEXT NOT NULL DEFAULT 'Full-stack engineer. Mathematics graduate. Ex-tailor.',
    "availability" TEXT NOT NULL DEFAULT 'Open to new roles · Remote-first',
    "githubUrl" TEXT NOT NULL DEFAULT 'https://github.com/yourusername',
    "linkedinUrl" TEXT NOT NULL DEFAULT 'https://linkedin.com/in/yourusername',
    "twitterUrl" TEXT NOT NULL DEFAULT 'https://twitter.com/yourusername',
    "email" TEXT NOT NULL DEFAULT 'hello@devcraft.dev',
    "cvUrl" TEXT NOT NULL DEFAULT '/cv.pdf',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
