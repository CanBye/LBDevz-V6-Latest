import {
  pgTable,
  text,
  uuid,
  integer,
  timestamp,
  pgEnum,
  numeric,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const affiliateStatusEnum = pgEnum('affiliate_status', [
  'active',
  'suspended',
])

export const referralStatusEnum = pgEnum('referral_status', [
  'pending',
  'confirmed',
  'paid',
])

export const affiliatePayoutStatusEnum = pgEnum('affiliate_payout_status', [
  'pending',
  'completed',
])

export const affiliates = pgTable('affiliates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .unique()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').unique().notNull(),
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 })
    .default('10.00')
    .notNull(),
  status: affiliateStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  affiliateId: uuid('affiliate_id')
    .notNull()
    .references(() => affiliates.id, { onDelete: 'cascade' }),
  referredUserId: uuid('referred_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id'),
  commissionAmount: integer('commission_amount'),
  status: referralStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const affiliatePayouts = pgTable('affiliate_payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  affiliateId: uuid('affiliate_id')
    .notNull()
    .references(() => affiliates.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  status: affiliatePayoutStatusEnum('status').default('pending').notNull(),
  processedBy: uuid('processed_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Affiliate = typeof affiliates.$inferSelect
export type Referral = typeof referrals.$inferSelect
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect