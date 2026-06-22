import { PermissionGate } from "@/components/admin/permission-gate"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import { SourceCodesClient } from "./client"

export default function SourceCodesPage() {
  return (
    <PermissionGate permission={ADMIN_PERMISSIONS.SOURCE_CODES}>
      <SourceCodesClient />
    </PermissionGate>
  )
}