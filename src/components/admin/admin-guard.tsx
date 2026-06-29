"use client"

import { Icon } from "@iconify/react"
import { useAdminPerm } from "@/components/admin/admin-permission-context"

function ForbiddenScreen() {
  return (
    <div className="flex flex-1 min-h-[60vh] items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/[0.06]">
            <Icon icon="carbon:locked" className="text-red-400" width={24} />
          </div>
        </div>
        <p className="text-sm font-semibold text-white/70">Yetkisiz Erişim</p>
        <p className="text-xs text-white/30 max-w-xs">
          Bu sayfayı görüntüleme izniniz yok. Yöneticinizle iletişime geçin.
        </p>
      </div>
    </div>
  )
}

interface AdminGuardProps {
  permission: string
  children: React.ReactNode
}

export function AdminGuard({ permission, children }: AdminGuardProps) {
  const { isSuperAdmin, permissions } = useAdminPerm()

  // Super admin her şeyi görebilir
  if (isSuperAdmin || permissions === null) return <>{children}</>

  // Gerekli izin yoksa Yetkisiz ekranı
  if (!permissions.includes(permission)) return <ForbiddenScreen />

  return <>{children}</>
}