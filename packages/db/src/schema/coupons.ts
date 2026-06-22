import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { products } from './products'

export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed', 'free', 'percent'])

export const couponScopeEnum = pgEnum('coupon_scope', ['all', 'product'])

export const discountScopeEnum = pgEnum('discount_scope', ['all', 'product'])

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').unique().notNull(),
  type: couponTypeEnum('type').notNull(),
  value: integer('value').notNull(),
  maxUses: integer('max_uses'),
  usesCount: integer('used_count').default(0).notNull(),
  minAmount: integer('min_amount'),
  productId: uuid('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const discounts = pgTable('discounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  scope: discountScopeEnum('scope').default('all').notNull(),
  productId: uuid('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  percent: integer('percent').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Coupon = typeof coupons.$inferSelect
export type Discount = typeof discounts.$inferSelect