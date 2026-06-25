import { config } from 'dotenv'
import { resolve } from 'path'
import type { Config } from 'drizzle-kit'

config({ path: resolve(__dirname, '../../.env') })
config({ path: resolve(__dirname, '.env') })

export default {
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config