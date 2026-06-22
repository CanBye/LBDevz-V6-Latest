import { requireAdmin } from "@/lib/admin"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users } from "@lbdevz/db"
import { desc } from "drizzle-orm"
import { Icon } from "@iconify/react"

export default async function AdminUsersPage() {
  const session = await requireAdmin()
  if (!session) redirect("/dashboard")

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      createdAt: users.createdAt,
      image: users.image,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100)

  return (
    <div className="p-6 sm:p-8 space-y-10">
      {/* Page Header */}
      <div className="border-b border-white/[0.04] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Customer Directory</h1>
          <p className="text-xs text-white/35 mt-1 font-mono uppercase tracking-widest">LBDEV // CENTRAL MEMBERSHIP LOGS</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#0c0c0c] px-4 py-2 text-xs font-semibold text-white/60">
          <Icon icon="carbon:user-multiple" width={14} />
          {allUsers.length} Active Records
        </span>
      </div>

      {/* Modern SaaS Table Frame */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden">
        <div className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white/80">Membership Records</h2>
            <p className="text-[10px] text-white/35 mt-0.5">Database audit log of registered developers and clients</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Action buttons or search stub can go here */}
          </div>
        </div>

        {allUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
            <Icon icon="carbon:user-multiple" className="text-white/10" width={36} />
            <p className="text-xs text-white/35">No users found in database</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.03] text-[10px] font-bold text-white/30 uppercase tracking-widest bg-black/15">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {allUsers.map(u => {
                  const initials = u.name
                    ? u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                    : (u.username?.charAt(0).toUpperCase() ?? "U")

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-all">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {u.image ? (
                          <img src={u.image} className="h-8 w-8 rounded-full border border-white/10 object-cover" alt="" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[10px] font-bold text-white/60">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white">{u.name ?? "Anonymous Developer"}</p>
                          <p className="text-[10px] text-white/35 truncate mt-0.5">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-white/55">
                        {u.username ? `@${u.username}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                          Verified
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-white/35 text-right font-mono">
                        {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
