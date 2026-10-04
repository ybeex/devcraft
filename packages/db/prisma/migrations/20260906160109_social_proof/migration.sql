/*
  Warnings:

  - You are about to drop the `testimonials` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReviewRelation" AS ENUM ('TEAM', 'CLIENT', 'COLLEAGUE');

-- DropTable
DROP TABLE "testimonials";

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "initials" TEXT NOT NULL,
    "photoUrl" TEXT,
    "linkedinUrl" TEXT,
    "relation" "ReviewRelation" NOT NULL DEFAULT 'COLLEAGUE',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_published_displayOrder_idx" ON "reviews"("published", "displayOrder");
