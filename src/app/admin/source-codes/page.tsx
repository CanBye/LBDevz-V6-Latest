import { PermissionGate } from "@/components/admin/permission-gate"
import { AdminGuard } from "@/components/admin/admin-guard"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import { SourceCodesClient } from "./client"

export default function SourceCodesPage() {
  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.SOURCE_CODES}>
      <PermissionGate permission={ADMIN_PERMISSIONS.SOURCE_CODES}>
        <SourceCodesClient />
      </PermissionGate>
      </AdminGuard>
  )
}