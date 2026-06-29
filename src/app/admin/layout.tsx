import { requireAdminAccess } from "@/lib/admin"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AdminPermissionProvider } from "@/components/admin/admin-permission-context"
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAdminAccess()
  if (!access) redirect("/dashboard")

  return (
    <ConfirmDialogProvider>
    <AdminPermissionProvider
      isSuperAdmin={access.isSuperAdmin}
      permissions={access.permissions}
    >
      <SidebarProvider>
      <div className="flex min-h-screen bg-[#030303] text-white">
        <AdminSidebar
          isSuperAdmin={access.isSuperAdmin}
          permissions={access.permissions}
        />
        <SidebarInset className="flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
      </SidebarProvider>
    </AdminPermissionProvider>
    </ConfirmDialogProvider>
  )
}