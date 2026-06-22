import {
  pgTable,
  text,
  uuid,
  integer,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const creditTransactionTypeEnum = pgEnum('credit_transaction_type', [
  'topup',
  'purchase',
  'refund',
  'renewal',
  'commission',
  'admin_adjust',
])

export const topupStatusEnum = pgEnum('topup_status', [
  'pending',
  'approved',
  'rejected',
])

export const creditTransactions = pgTable('credit_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  type: creditTransactionTypeEnum('type').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  idempotencyKey: text('idempotency_key').unique(),
  note: text('note'),
  createdBy: uuid('created_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const topupRequests = pgTable('topup_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amountCredits: integer('amount_credits').notNull(),
  ibanReference: text('iban_reference'),
  status: topupStatusEnum('status').default('pending').notNull(),
  reviewedBy: uuid('reviewed_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type CreditTransaction = typeof creditTransactions.$inferSelect
export type TopupRequest = typeof topupRequests.$inferSelect