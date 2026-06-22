// Sadece sabitler — client bileşenler buradan import edebilir
export const ADMIN_PERMISSIONS = {
  DASHBOARD:    "admin.dashboard",
  PRODUCTS:     "admin.products",
  ORDERS:       "admin.orders",
  CUSTOMERS:    "admin.customers",
  TOPUPS:       "admin.topups",
  TICKETS:      "admin.tickets",
  COUPONS:      "admin.coupons",
  ROLES:        "admin.roles",
  REVIEWS:      "admin.reviews",
  AGREEMENTS:   "admin.agreements",
  TEAM:         "admin.team",
  BLOG:         "admin.blog",
  FORUM:        "admin.forum",
  YETKILIALIM:  "admin.yetkilialim",
  SITE_SETTINGS:"admin.site_settings",
  WEBHOOKS:     "admin.webhooks",
  NOTIFICATIONS:"admin.notifications",
  ANALYTICS:      "admin.analytics",
  REVENUE:        "admin.revenue",
  SETTINGS:       "admin.settings",
  SOURCE_CODES:   "admin.source_codes",
} as const

export type AdminPermissionKey = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS]