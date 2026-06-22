"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface SourceRow {
  versionId: string
  productName: string
  version: string
  sourceCodeKey: string | null
  sourceCodeUploadedAt: string | null
  obfStatus: string
}

export function SourceCodesClient() {
  const [rows, setRows]       = useState<SourceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")

  useEffect(() => {
    fetch("/api/admin/source-codes")
      .then(r => r.json())
      .then(d => { setRows(d.rows ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = rows.filter(r =>
    r.productName.toLowerCase().includes(search.toLowerCase()) ||
    r.version.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDownload(versionId: string, productName: string) {
    const res = await fetch(`/api/admin/source-codes/${versionId}/download`)
    if (!res.ok) { alert("İndirme başarısız"); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${productName}-source.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white/90">Kaynak Kodları</h1>
        <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Source Codes</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Ürün veya versiyon ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
        />
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-[#090909] overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 text-[10px] font-bold uppercase tracking-widest text-white/20 px-5 py-3 border-b border-white/[0.05]">
          <span>Ürün / Versiyon</span>
          <span className="px-4">Obf Durum</span>
          <span className="px-4">Yükleme Tarihi</span>
          <span className="px-4">Kaynak</span>
          <span className="px-4">İndir</span>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[1,2,3,4].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/25 gap-3">
            <Icon icon="carbon:document-unknown" width={32} />
            <p className="text-sm">{search ? "Sonuç bulunamadı" : "Henüz kaynak kodu yok"}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(row => (
              <div key={row.versionId} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-0 px-5 py-3.5 hover:bg-white/[0.01] transition-colors">
                <div>
                  <p className="text-sm font-medium text-white/80">{row.productName}</p>
                  <p className="text-[10px] font-mono text-white/30 mt-0.5">v{row.version}</p>
                </div>

                <div className="px-4">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    row.obfStatus === "done"       && "bg-emerald-500/10 text-emerald-400",
                    row.obfStatus === "processing" && "bg-amber-500/10 text-amber-400 animate-pulse",
                    row.obfStatus === "pending"    && "bg-white/[0.06] text-white/30",
                    row.obfStatus === "failed"     && "bg-red-500/10 text-red-400",
                  )}>
                    {row.obfStatus === "done" && <Icon icon="carbon:checkmark" width={8} />}
                    {row.obfStatus === "processing" && <Icon icon="carbon:rotate-clockwise" width={8} />}
                    {row.obfStatus === "failed" && <Icon icon="carbon:close" width={8} />}
                    {row.obfStatus}
                  </span>
                </div>

                <div className="px-4 text-[11px] text-white/35 whitespace-nowrap">
                  {row.sourceCodeUploadedAt
                    ? new Date(row.sourceCodeUploadedAt).toLocaleDateString("tr-TR")
                    : <span className="text-white/15">—</span>}
                </div>

                <div className="px-4">
                  {row.sourceCodeKey
                    ? <span className="flex items-center gap-1 text-[10px] text-emerald-400"><Icon icon="carbon:checkmark-filled" width={12} />Var</span>
                    : <span className="text-[10px] text-white/20">Yok</span>}
                </div>

                <div className="px-4">
                  {row.sourceCodeKey ? (
                    <button
                      onClick={() => handleDownload(row.versionId, row.productName)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] font-medium text-white/50 hover:border-white/20 hover:text-white transition-all"
                    >
                      <Icon icon="carbon:download" width={11} />
                      İndir
                    </button>
                  ) : (
                    <span className="text-[10px] text-white/15">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] text-white/20">{filtered.length} versiyon listeleniyor</p>
    </div>
  )
}