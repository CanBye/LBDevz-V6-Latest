import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().url(),

  // MinIO / S3
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_BUCKET: z.string().default('lbdevz-files'),
  MINIO_USE_SSL: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  S3_PUBLIC_URL: z.string().url().optional(),

  // Auth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // License service
  LICENSE_API_URL: z.string().url().default('http://localhost:8080'),
  LICENSE_API_HOST: z.string().optional(),
  LICENSE_API_SCHEME: z.enum(['http', 'https']).optional(),
  LICENSE_ED25519_PRIVATE_KEY: z.string().optional(),
  LICENSE_ED25519_PUBLIC_KEY: z.string().optional(),
  LICENSE_VALIDATE_API_KEY: z.string().optional(),

  // Internal
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

export type Env = z.infer<typeof envSchema>

let _env: Env | undefined

export function getEnv(): Env {
  if (_env) return _env
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten())
    throw new Error('Invalid environment configuration')
  }
  _env = result.data
  return _env
}