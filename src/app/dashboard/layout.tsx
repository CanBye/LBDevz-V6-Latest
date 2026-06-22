import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard/navbar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/giris")

  return (
    <div className="flex min-h-dvh flex-col bg-black text-white pt-5">
      <DashboardNavbar />
      <div className="flex-1">
        <div className="mx-auto max-w-[1400px] px-8 pt-16 pb-16 sm:px-14 sm:pt-20 md:pt-24">
          {children}
        </div>
      </div>
    </div>
  )
}
