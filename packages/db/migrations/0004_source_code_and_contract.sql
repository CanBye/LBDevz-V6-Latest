-- product_versions: kaynak kodu alanları ekle
ALTER TABLE "product_versions" ADD COLUMN "source_code_key" text;--> statement-breakpoint
ALTER TABLE "product_versions" ADD COLUMN "source_code_uploaded_at" timestamp;--> statement-breakpoint

-- auth_purchase_applications: sözleşme imzalama alanları ekle
ALTER TABLE "auth_purchase_applications" ADD COLUMN IF NOT EXISTS "agreement_signed_at" timestamptz;--> statement-breakpoint
ALTER TABLE "auth_purchase_applications" ADD COLUMN IF NOT EXISTS "agreement_version" text;