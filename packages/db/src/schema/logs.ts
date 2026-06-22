import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const systemLogLevelEnum = pgEnum('system_log_level', [
  'info',
  'warn',
  'error',
])

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  action: text('action').notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  metadata: jsonb('metadata'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const systemLogs = pgTable('system_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: systemLogLevelEnum('level').notNull(),
  source: text('source').notNull(),
  event: text('event').notNull(),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type AuditLog = typeof auditLog.$inferSelect
export type SystemLog = typeof systemLogs.$inferSelect