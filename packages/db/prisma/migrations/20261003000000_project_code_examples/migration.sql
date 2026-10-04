ALTER TABLE "projects"
ADD COLUMN "codeExamples" JSONB NOT NULL DEFAULT '[]'::jsonb;