import { pgTable, text, uuid, integer, boolean, timestamp, jsonb, check } from 'drizzle-orm/pg-core'
import { users } from './users'
import { products } from './products'
import { sql } from 'drizzle-orm'

/** A server the member has worked on / been staff at. */
export type TeamServer = { name: string; role?: string; period?: string }
/** A project the member built. */
export type TeamProject = { title: string; description?: string; link?: string; image?: string }

export const teamMembers = pgTable('team_members', {
  id:        uuid('id').primaryKey().defaultRandom(),
  // Pretty-URL slug for the public profile page (/ekip/<slug>). Unique.
  slug:      text('slug').unique(),
  name:      text('name').notNull(),
  role:      text('role').notNull(),
  bio:       text('bio'),
  // Longer "about" text shown on the profile page.
  longBio:   text('long_bio'),
  image:     text('image'),
  github:    text('github'),
  discord:   text('discord'),
  twitter:   text('twitter'),
  // Portfolio fields.
  yearsExperience: integer('years_experience'),
  languages: jsonb('languages').$type<string[]>().default([]).notNull(),
  servers:   jsonb('servers').$type<TeamServer[]>().default([]).notNull(),
  projects:  jsonb('projects').$type<TeamProject[]>().default([]).notNull(),
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

/** User-submitted reviews for purchased products. */
export const productReviews = pgTable('product_reviews', {
  id:        uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating:    integer('rating').notNull(),
  comment:   text('comment'),
  visible:   boolean('visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type ProductReview = typeof productReviews.$inferSelect