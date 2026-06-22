import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
  pgEnum,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const productTypeEnum = pgEnum('product_type', [
  'minecraft_plugin',
  'fivem_script',
  'discord_bot',
  'website',
  'launcher',
  'other',
])

export const licenseModelEnum = pgEnum('license_model', [
  'lifetime',
  'subscription',
  'custom',
])

export const productVisibilityEnum = pgEnum('product_visibility', [
  'public',
  'unlisted',
  'private',
])

export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'active',
  'archived',
])

export const obfStatusEnum = pgEnum('obf_status', [
  'pending',
  'processing',
  'done',
  'failed',
])

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: productTypeEnum('type').notNull(),
  priceCredits: integer('price_credits').notNull(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  licenseModel: licenseModelEnum('license_model').notNull(),
  periodDays: integer('period_days'),
  gracePeriodDays: integer('grace_period_days').default(3).notNull(),
  seatLimit: integer('seat_limit').default(1).notNull(),
  autoRenewDefault: boolean('auto_renew_default').default(false).notNull(),
  visibility: productVisibilityEnum('visibility').default('public').notNull(),
  status: productStatusEnum('status').default('draft').notNull(),
  category: text('category'),
  imageUrl: text('image_url'),
  featured: boolean('featured').default(false).notNull(),
  enableLicense: boolean('enable_license').default(true).notNull(),
  enableObf: boolean('enable_obf').default(false).notNull(),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const productVersions = pgTable('product_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  changelog: text('changelog'),
  fileKey: text('file_key'),
  blobKey: text('blob_key'),
  mappingKey: text('mapping_key'),
  checksum: text('checksum'),
  obfStatus: obfStatusEnum('obf_status').default('pending').notNull(),
  serverKeyHalf: text('server_key_half'),  // Kserver (base64) — returned to loader at runtime
  published: boolean('published').default(false).notNull(),
  sourceCodeKey: text('source_code_key'),
  sourceCodeUploadedAt: timestamp('source_code_uploaded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const productDevelopers = pgTable(
  'product_developers',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.productId, t.userId] })]
)

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductVersion = typeof productVersions.$inferSelect
export type ProductDeveloper = typeof productDevelopers.$inferSelect