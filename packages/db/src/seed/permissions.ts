import "dotenv/config"
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../schema'
import { permissions, roles, rolePermissions } from '../schema'

// Standalone seed script: build its own runtime connection (the package only
// exports schema, not a db instance). Uses the postgres-js driver that this
// package already depends on.
const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client, { schema })

const PERMISSIONS = [
  // Tickets
  { key: 'tickets.view', description: 'Ticketları görüntüle' },
  { key: 'tickets.reply', description: 'Ticketa yanıt ver' },
  { key: 'tickets.assign', description: 'Ticket ata' },
  { key: 'tickets.close', description: 'Ticketı kapat' },
  { key: 'tickets.internal_note', description: 'Internal not ekle' },
  { key: 'tickets.delete', description: 'Ticket sil' },
  // Products
  { key: 'products.create', description: 'Ürün oluştur' },
  { key: 'products.edit', description: 'Ürün düzenle' },
  { key: 'products.obfuscate', description: 'Ürün obfuscate et' },
  { key: 'products.publish', description: 'Ürün yayınla' },
  { key: 'products.delete', description: 'Ürün sil' },
  // Licenses
  { key: 'licenses.view', description: 'Lisansları görüntüle' },
  { key: 'licenses.issue', description: 'Lisans oluştur' },
  { key: 'licenses.revoke', description: 'Lisans iptal et' },
  { key: 'licenses.extend', description: 'Lisans süresini uzat' },
  // Credits
  { key: 'credits.view', description: 'Kredi işlemlerini görüntüle' },
  { key: 'credits.adjust', description: 'Kredi düzenleme (admin)' },
  { key: 'topups.approve', description: 'Havale/kredi yükleme onayı' },
  // Store
  { key: 'coupons.manage', description: 'Kupon yönetimi' },
  { key: 'discounts.manage', description: 'İndirim yönetimi' },
  { key: 'announcements.publish', description: 'Duyuru yayınla' },
  // Users & Roles
  { key: 'users.view', description: 'Kullanıcıları görüntüle' },
  { key: 'users.manage', description: 'Kullanıcı yönetimi' },
  { key: 'roles.manage', description: 'Rol ve yetki yönetimi' },
  // Affiliates & Webhooks
  { key: 'affiliates.manage', description: 'Affiliate yönetimi' },
  { key: 'webhooks.manage', description: 'Webhook yönetimi' },
  // Logs
  { key: 'logs.view', description: 'Logları görüntüle' },
] as const

type PermissionKey = (typeof PERMISSIONS)[number]['key']

const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  owner: PERMISSIONS.map((p) => p.key),
  admin: PERMISSIONS.filter((p) => p.key !== 'logs.view').map((p) => p.key),
  support: ['tickets.view', 'tickets.reply', 'tickets.assign', 'tickets.close', 'tickets.internal_note', 'tickets.delete', 'users.view'],
  seller: ['products.create', 'products.edit', 'products.obfuscate', 'products.publish', 'products.delete'],
  affiliate: ['affiliates.manage'],
  user: [],
}

const ROLE_META: Record<string, { color: string; priority: number }> = {
  owner: { color: '#ef4444', priority: 100 },
  admin: { color: '#f97316', priority: 90 },
  support: { color: '#3b82f6', priority: 50 },
  seller: { color: '#8b5cf6', priority: 40 },
  affiliate: { color: '#10b981', priority: 30 },
  user: { color: '#6b7280', priority: 0 },
}

export async function seedPermissions() {
  console.log('Seeding permissions...')
  await db
    .insert(permissions)
    .values([...PERMISSIONS])
    .onConflictDoNothing()

  console.log('Seeding roles...')
  for (const [roleName, meta] of Object.entries(ROLE_META)) {
    const [role] = await db
      .insert(roles)
      .values({
        name: roleName,
        color: meta.color,
        priority: meta.priority,
      })
      .onConflictDoNothing()
      .returning()

    if (!role) continue

    const perms = ROLE_PERMISSIONS[roleName] ?? []
    if (perms.length === 0) continue

    await db
      .insert(rolePermissions)
      .values(perms.map((key) => ({ roleId: role.id, permissionKey: key })))
      .onConflictDoNothing()
  }

  console.log('Seed complete.')
}

seedPermissions()
  .then(() => client.end())
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })