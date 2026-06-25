import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@lbdevz/db"
import { verifyTurnstile } from "@/lib/turnstile"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email:          { label: "Email",          type: "email" },
        password:       { label: "Şifre",          type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const ip = getClientIp(request as Request)
        const rl = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 })
        if (!rl.success) return null

        const turnstileOk = await verifyTurnstile((credentials.turnstileToken as string) ?? "")
        if (!turnstileOk) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user || !user.passwordHash) return null

        const valid = await compare(credentials.password as string, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/giris",
    error: "/giris",
  },
})