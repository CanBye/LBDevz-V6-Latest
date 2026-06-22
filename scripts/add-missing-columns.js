/**
 * Adds missing columns to existing DB tables without touching primary keys.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { Client } = require('pg')

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected to Neon PostgreSQL')

  const migrations = [
    // Products table missing columns
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE`,
    // Licenses table IP binding
    `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS allowed_ips TEXT[]`,

    // Enums for tickets (create if not exist)
    `DO $$ BEGIN CREATE TYPE ticket_category AS ENUM ('general','purchase','license','bug','refund'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE ticket_status AS ENUM ('open','answered','pending','closed'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE ticket_priority AS ENUM ('low','normal','high','urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$`,

    // Tickets table
    `CREATE TABLE IF NOT EXISTS tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category ticket_category NOT NULL,
      subject TEXT NOT NULL,
      status ticket_status NOT NULL DEFAULT 'open',
      priority ticket_priority NOT NULL DEFAULT 'normal',
      assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
      product_id UUID,
      license_id UUID,
      last_activity_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    // Ticket messages table
    `CREATE TABLE IF NOT EXISTS ticket_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      body TEXT NOT NULL,
      is_internal BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    // Ticket attachments table
    `CREATE TABLE IF NOT EXISTS ticket_attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id UUID NOT NULL REFERENCES ticket_messages(id) ON DELETE CASCADE,
      file_key TEXT NOT NULL,
      filename TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    // Enum for product obf status
    `DO $$ BEGIN CREATE TYPE obf_status AS ENUM ('pending','processing','done','failed'); EXCEPTION WHEN duplicate_object THEN null; END $$`,

    // Product versions table
    `CREATE TABLE IF NOT EXISTS product_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      version TEXT NOT NULL,
      changelog TEXT,
      file_key TEXT,
      blob_key TEXT,
      mapping_key TEXT,
      checksum TEXT,
      obf_status obf_status NOT NULL DEFAULT 'pending',
      published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    // FAZ 6: Obfuscation toggles on products
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS enable_license BOOLEAN NOT NULL DEFAULT TRUE`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS enable_obf BOOLEAN NOT NULL DEFAULT FALSE`,

    // FAZ 7: Coupon system
    `DO $$ BEGIN CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed', 'free'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

    `CREATE TABLE IF NOT EXISTS coupons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT UNIQUE NOT NULL,
      type coupon_type NOT NULL DEFAULT 'percentage',
      value INTEGER NOT NULL DEFAULT 10,
      max_uses INTEGER,
      uses_count INTEGER NOT NULL DEFAULT 0,
      min_amount INTEGER,
      product_id UUID REFERENCES products(id) ON DELETE SET NULL,
      expires_at TIMESTAMP,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    // FAZ 9: License renewal tracking
    `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS notified_expiry BOOLEAN NOT NULL DEFAULT FALSE`,

    // FAZ 9: Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'info',
      title TEXT NOT NULL,
      body TEXT,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      link TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
  ]

  // Obf engine columns
  migrations.push(`ALTER TABLE product_versions ADD COLUMN IF NOT EXISTS server_key_half TEXT`)

  for (const sql of migrations) {
    try {
      await client.query(sql)
      console.log('✅', sql.slice(0, 70))
    } catch (err) {
      console.log('⚠️  Skipped:', err.message)
    }
  }

  await client.end()
  console.log('\nDone. All missing columns added.')
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})