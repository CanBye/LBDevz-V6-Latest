import { pgTable, text, uuid, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const teamMembers = pgTable('team_members', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull(),
  role:      text('role').notNull(),
  bio:       text('bio'),
  image:     text('image'),
  github:    text('github'),
  discord:   text('discord'),
  twitter:   text('twitter'),
  order:     integer('order').default(0).notNull(),
  visible:   boolean('visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const reviews = pgTable('reviews', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull(),
  role:      text('role').notNull(),
  quote:     text('quote').notNull(),
  image:     text('image'),
  rating:    integer('rating').default(5).notNull(),
  visible:   boolean('visible').default(true).notNull(),
  order:     integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type TeamMember = typeof teamMembers.$inferSelect
export type Review = typeof reviews.$inferSelect