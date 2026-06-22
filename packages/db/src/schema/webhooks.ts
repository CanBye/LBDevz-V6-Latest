import {
  pgTable,
  text,
  uuid,
  boolean,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const webhookOutboxStatusEnum = pgEnum('webhook_outbox_status', [
  'pending',
  'sent',
  'failed',
])

export const webhookConfigs = pgTable('webhook_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  event: text('event').notNull(),
  url: text('url').notNull(),
  template: text('template').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const webhooksOutbox = pgTable('webhooks_outbox', {
  id: uuid('id').primaryKey().defaultRandom(),
  configId: uuid('config_id').references(() => webhookConfigs.id, {
    onDelete: 'set null',
  }),
  event: text('event').notNull(),
  payload: jsonb('payload').notNull(),
  status: webhookOutboxStatusEnum('status').default('pending').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  lastAttemptAt: timestamp('last_attempt_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type WebhookConfig = typeof webhookConfigs.$inferSelect
export type WebhookOutbox = typeof webhooksOutbox.$inferSelect