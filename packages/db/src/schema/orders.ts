import {
  pgTable,
  uuid,
  integer,
  timestamp,
  text,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { products, productVersions } from './products'
import { licenses } from './licenses'
import { affiliates } from './affiliates'

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  versionId: uuid('version_id').references(() => productVersions.id, {
    onDelete: 'set null',
  }),
  pricePaid: integer('price_paid').notNull(),
  couponId: uuid('coupon_id'),
  affiliateId: uuid('affiliate_id').references(() => affiliates.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const entitlements = pgTable('entitlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  orderId: uuid('order_id').references(() => orders.id, {
    onDelete: 'set null',
  }),
  licenseId: uuid('license_id').references(() => licenses.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const downloads = pgTable('downloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  versionId: uuid('version_id')
    .notNull()
    .references(() => productVersions.id, { onDelete: 'cascade' }),
  watermarkId: text('watermark_id').unique().notNull(),
  ip: text('ip'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type Entitlement = typeof entitlements.$inferSelect
export type Download = typeof downloads.$inferSelect