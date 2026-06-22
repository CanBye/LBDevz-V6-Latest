import { requirePermission } from "@/lib/admin"
import { type AdminPermissionKey } from "@/lib/admin-permissions"
import { redirect } from "next/navigation"
import { Icon } from "@iconify/react"

interface PermissionGateProps {
  permission: AdminPermissionKey
  children: React.ReactNode
}

export async function PermissionGate({ permission, children }: PermissionGateProps) {
  const session = await requirePermission(permission)
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-5 text-center p-8">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-red-500/10 bg-red-500/[0.04]">
          <Icon icon="carbon:locked" className="text-red-400/60" width={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-white/60">Erişim Yetkiniz Yok</h2>
          <p className="text-sm text-white/25 max-w-sm leading-relaxed">
            Bu sayfayı görüntülemek için <span className="font-mono text-white/40">{permission}</span> iznine ihtiyacınız var.
          </p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
