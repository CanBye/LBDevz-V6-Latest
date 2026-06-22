-- NextAuth v5 / @auth/drizzle-adapter uyumluluk migrasyonu
-- users: name, email_verified, image ekle; username nullable yap; discordId/googleId koru
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint

-- accounts: id PK kaldır, type ekle, expires_at integer yap
-- Önce eski PK constraint'i kaldır
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_pkey";--> statement-breakpoint
-- id kolonunu kaldır
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
-- type kolonu ekle (OAuth için zorunlu)
ALTER TABLE "accounts" ADD COLUMN "type" text NOT NULL DEFAULT 'oauth';--> statement-breakpoint
-- expires_at: timestamp -> integer (Unix timestamp, OAuth spec)
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "expires_at";--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "expires_at" integer;--> statement-breakpoint
-- Composite PK ekle
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY ("provider", "provider_account_id");--> statement-breakpoint

-- sessions: id PK kaldır, session_token PK yap
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_pkey";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_token");--> statement-breakpoint

-- verification_tokens: composite PK ekle
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY ("identifier", "token");