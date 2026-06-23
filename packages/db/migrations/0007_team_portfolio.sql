-- team_members: portfolio / profile fields for clickable team profiles
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "slug" text;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "long_bio" text;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "years_experience" integer;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "languages" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "servers" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "projects" jsonb DEFAULT '[]'::jsonb NOT NULL;

-- Unique slug for /ekip/<slug> profile URLs (allows multiple NULLs).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_members_slug_unique'
  ) THEN
    ALTER TABLE "team_members" ADD CONSTRAINT "team_members_slug_unique" UNIQUE ("slug");
  END IF;
END $$;
