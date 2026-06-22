import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core'

// NextAuth v5 uyumlu users tablosu
// name/emailVerified/image: @auth/drizzle-adapter zorunlu alanları
// username: opsiyonel, profil tamamlama akışında doldurulur
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  username: text('username').unique(),
  passwordHash: text('password_hash'),
  discordId: text('discord_id').unique(),
  googleId: text('google_id').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// NextAuth v5 uyumlu accounts tablosu
// type: OAuth zorunlu ("oauth" | "oidc" | "email" | "credentials")
// expires_at: integer (Unix timestamp) — OAuth spec gerektiriyor
export const accounts = pgTable('accounts', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (t) => [
  primaryKey({ columns: [t.provider, t.providerAccountId] }),
])

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (t) => [
  primaryKey({ columns: [t.identifier, t.token] }),
])

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert