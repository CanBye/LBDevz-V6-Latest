"use client"

import { createContext, useContext } from "react"

interface AdminPermCtx {
  isSuperAdmin: boolean
  permissions: string[] | null
}

export const AdminPermContext = createContext<AdminPermCtx>({
  isSuperAdmin: false,
  permissions: [],
})

export function AdminPermissionProvider({
  isSuperAdmin,
  permissions,
  children,
}: AdminPermCtx & { children: React.ReactNode }) {
  return (
    <AdminPermContext.Provider value={{ isSuperAdmin, permissions }}>
      {children}
    </AdminPermContext.Provider>
  )
}

export function useAdminPerm() {
  return useContext(AdminPermContext)
}