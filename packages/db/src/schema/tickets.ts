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

export const ticketCategoryEnum = pgEnum('ticket_category', [
  'general',
  'purchase',
  'license',
  'bug',
  'refund',
])

export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'answered',
  'pending',
  'closed',
])

export const ticketPriorityEnum = pgEnum('ticket_priority', [
  'low',
  'normal',
  'high',
  'urgent',
])

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  category: ticketCategoryEnum('category').notNull(),
  subject: text('subject').notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  priority: ticketPriorityEnum('priority').default('normal').notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id, {
    onDelete: 'set null',
  }),
  productId: uuid('product_id'),
  licenseId: uuid('license_id'),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  body: text('body').notNull(),
  isInternal: boolean('is_internal').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const ticketAttachments = pgTable('ticket_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id')
    .notNull()
    .references(() => ticketMessages.id, { onDelete: 'cascade' }),
  fileKey: text('file_key').notNull(),
  filename: text('filename').notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Ticket = typeof tickets.$inferSelect
export type TicketMessage = typeof ticketMessages.$inferSelect