import {
  pgTable,
  text,
  uuid,
  integer,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { productVersions } from './products'

export const obfJobStatusEnum = pgEnum('obf_job_status', [
  'pending',
  'processing',
  'done',
  'failed',
])

export const obfJobs = pgTable('obf_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionId: uuid('version_id')
    .notNull()
    .references(() => productVersions.id, { onDelete: 'cascade' }),
  status: obfJobStatusEnum('status').default('pending').notNull(),
  progress: integer('progress').default(0).notNull(),
  error: text('error'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type ObfJob = typeof obfJobs.$inferSelect