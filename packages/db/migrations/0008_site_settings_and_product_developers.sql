-- site_settings: site-wide key/value configuration table
CREATE TABLE IF NOT EXISTS "site_settings" (
  "key"        text PRIMARY KEY,
  "value"      text NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

-- product_developers: link products to their developer users
CREATE TABLE IF NOT EXISTS "product_developers" (
  "product_id"   uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "user_id"      uuid NOT NULL REFERENCES "users"("id")    ON DELETE CASCADE,
  "assigned_at"  timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("product_id", "user_id")
);

-- default site settings
INSERT INTO "site_settings" ("key", "value") VALUES
  ('authorized_purchase_enabled', 'true'),
  ('maintenance_mode', 'false')
ON CONFLICT ("key") DO NOTHING;