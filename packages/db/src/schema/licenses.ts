import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { products, productVersions, licenseModelEnum } from './products'

export const licenseStatusEnum = pgEnum('license_status', [
  'active',
  'expired',
  'revoked',
  'suspended',
])

export const licenseEventEnum = pgEnum('license_event', [
  'validated',
  'heartbeat',
  'revoked',
  'expired',
  'ip_rejected',
  'replay_rejected',
  'error',
])

export const licenses = pgTable('licenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  licenseKey: text('license_key').unique().notNull(),
  licenseModel: licenseModelEnum('license_model').notNull(),
  periodDays: integer('period_days'),
  expiresAt: timestamp('expires_at'),
  autoRenew: boolean('auto_renew').default(false).notNull(),
  renewalPriceCredits: integer('renewal_price_credits'),
  graceUntil: timestamp('grace_until'),
  seatLimit: integer('seat_limit').default(1).notNull(),
  status: licenseStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const licenseIps = pgTable('license_ips', {
  id: uuid('id').primaryKey().defaultRandom(),
  licenseId: uuid('license_id')
    .notNull()
    .references(() => licenses.id, { onDelete: 'cascade' }),
  ip: text('ip').notNull(),
  label: text('label'),
  addedAt: timestamp('added_at').defaultNow().notNull(),
  lastChangedAt: timestamp('last_changed_at').defaultNow().notNull(),
})

export const licenseLogs = pgTable('license_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  licenseId: uuid('license_id').references(() => licenses.id, {
    onDelete: 'set null',
  }),
  licenseKey: text('license_key').notNull(),
  event: licenseEventEnum('event').notNull(),
  ip: text('ip'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type License = typeof licenses.$inferSelect
export type NewLicense = typeof licenses.$inferInsert
export type LicenseLog = typeof licenseLogs.$inferSelect