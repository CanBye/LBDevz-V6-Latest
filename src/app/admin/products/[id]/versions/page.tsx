"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Version {
  id: string
  productId: string
  version: string
  changelog: string | null
  fileKey: string | null
  blobKey: string | null
  checksum: string | null
  obfStatus: string
  published: boolean
  createdAt: string
}

const inputCls =
  "w-full rounded-xl border border-white/[0.06] bg-[#0c0c0c] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all duration-200"

export default function ProductVersionsPage() {
  const params    = useParams()
  const productId = params.id as string

  const [versions,    setVersions]    = useState<Version[]>([])
  const [loading,     setLoading]     = useState(true)
  const [form,        setForm]        = useState({ version: "", changelog: "" })
  const [saving,      setSaving]      = useState(false)
  const [msg,         setMsg]         = useState("")
  const [togglingId,  setTogglingId]  = useState<string | null>(null)
  const [obfingId,    setObfingId]    = useState<string | null>(null)

  // upload state
  const fileInputRef              = useRef<HTMLInputElement>(null)
  const [selectedFile,  setSelectedFile]  = useState<File | null>(null)
  const [uploading,     setUploading]     = useState(false)
  const [uploadedKey,   setUploadedKey]   = useState<{ blobKey: string; fileKey: string } | null>(null)
  const [isDragging,    setIsDragging]    = useState(false)

  const fetchVersions = () => {
    setLoading(true)
    fetch(`/api/admin/products/${productId}/versions`)
      .then((r) => r.json())
      .then((d) => { setVersions(d.versions ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { if (productId) fetchVersions() }, [productId])

  // ── File pick / drag-drop ────────────────────────────────────────────────
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    if (f) { setSelectedFile(f); setUploadedKey(null) }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith(".jar")) { setSelectedFile(f); setUploadedKey(null) }
  }

  async function uploadFile(): Promise<{ blobKey: string; fileKey: string } | null> {
    if (!selectedFile) return null
    setUploading(true)
    const fd = new FormData()
    fd.append("file", selectedFile)
    const res = await fetch(`/api/admin/products/${productId}/versions/upload`, {
      method: "POST", body: fd,
    })
    setUploading(false)
    if (!res.ok) { setMsg("Dosya yükleme başarısız"); return null }
    const data = await res.json()
    setUploadedKey(data)
    return data
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg("")

    // Upload first if file selected but not yet uploaded
    let keys = uploadedKey
    if (selectedFile && !keys) {
      keys = await uploadFile()
      if (!keys) { setSaving(false); return }
    }

    const res = await fetch(`/api/admin/products/${productId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ...(keys ?? {}) }),
    })
    setSaving(false)
    if (res.ok) {
      setMsg("Versiyon eklendi!")
      setForm({ version: "", changelog: "" })
      setSelectedFile(null); setUploadedKey(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      fetchVersions()
    } else {
      const d = await res.json()
      setMsg(d.error ?? "Hata oluştu")
    }
  }

  async function startObf(v: Version) {
    setObfingId(v.id)
    await fetch(`/api/admin/products/${productId}/versions/${v.id}/obfuscate`, {
      method: "POST", headers: { "Content-Type": "application/json" },
    })
    setObfingId(null); fetchVersions()
  }

  async function togglePublish(v: Version) {
    setTogglingId(v.id)
    await fetch(`/api/admin/products/${productId}/versions/${v.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !v.published }),
    })
    setTogglingId(null); fetchVersions()
  }

  return (
    <div className="p-6 sm:p-8 space-y-10">
      <div className="border-b border-white/[0.04] pb-6 flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <Icon icon="carbon:arrow-left" width={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Version Management</h1>
          <p className="text-xs text-white/35 mt-1 font-mono uppercase tracking-widest">
            LBDEV // PRODUCT VERSIONS · {productId.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* ── Add version form ── */}
        <div className="lg:col-span-1 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0c0c0c] to-[#040404] p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white/80">Yeni Versiyon Ekle</h2>
            <p className="text-[10px] text-white/35 mt-0.5">Yeni bir versiyon yayınla</p>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            {/* Version number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">
                Versiyon Numarası
              </label>
              <input
                className={inputCls}
                placeholder="e.g. 1.0.0"
                value={form.version}
                onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                required
              />
            </div>

            {/* Changelog */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">
                Changelog
              </label>
              <textarea
                className={inputCls}
                rows={3}
                placeholder="Bu versiyonda yapılan değişiklikler..."
                value={form.changelog}
                onChange={(e) => setForm((f) => ({ ...f, changelog: e.target.value }))}
              />
            </div>

            {/* JAR upload drop zone */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">
                Plugin JAR
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 px-4 py-6",
                  isDragging
                    ? "border-violet-500/60 bg-violet-500/5"
                    : selectedFile
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-white/[0.08] bg-[#0c0c0c] hover:border-white/20 hover:bg-white/[0.02]"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jar"
                  className="hidden"
                  onChange={onFileChange}
                />

                {selectedFile ? (
                  <>
                    <Icon icon="carbon:document-software" className="text-emerald-400" width={24} />
                    <p className="text-xs font-semibold text-emerald-400 text-center break-all">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {(selectedFile.size / 1024).toFixed(1)} KB · tıkla değiştir
                    </p>
                    {uploadedKey && (
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        Yüklendi ✓
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Icon icon="carbon:upload" className="text-white/20" width={24} />
                    <p className="text-xs text-white/40">JAR dosyasını sürükle veya tıkla</p>
                    <p className="text-[10px] text-white/20">Sadece .jar formatı</p>
                  </>
                )}
              </div>
            </div>

            {msg && (
              <p className={cn(
                "text-xs font-medium pt-1",
                msg.includes("eklendi") ? "text-emerald-400" : "text-red-400"
              )}>
                {msg}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-white/90 text-black py-3 text-xs font-bold transition-all duration-200 disabled:opacity-50"
            >
              {saving || uploading ? (
                uploading ? "Dosya yükleniyor..." : "Ekleniyor..."
              ) : (
                <>
                  <Icon icon="carbon:add-filled" width={16} />
                  Versiyon Ekle
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Version list ── */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden">
          <div className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white/80">Versiyon Geçmişi</h2>
              <p className="text-[10px] text-white/35 mt-0.5">Yayınlanmış ve taslak versiyonlar</p>
            </div>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              {versions.length} Versiyon
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-white/30 animate-pulse">Yükleniyor...</div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
              <Icon icon="carbon:version" className="text-white/10" width={36} />
              <p className="text-xs text-white/35">Henüz versiyon yok</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {versions.map((v) => (
                <div key={v.id} className="p-5 hover:bg-white/[0.01] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-white">
                          v{v.version}
                        </span>
                        {v.published && (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                            Yayında
                          </span>
                        )}
                        {v.blobKey && (
                          <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400">
                            JAR Mevcut
                          </span>
                        )}
                        <span className={cn(
                          "rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          v.obfStatus === "done"
                            ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                            : v.obfStatus === "processing"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : v.obfStatus === "failed"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-white/[0.04] border-white/10 text-white/30"
                        )}>
                          OBF: {v.obfStatus}
                        </span>
                      </div>

                      {v.changelog && (
                        <p className="mt-2 text-xs text-white/40 leading-relaxed line-clamp-2">
                          {v.changelog}
                        </p>
                      )}

                      <div className="mt-2 flex gap-4 text-[10px] text-white/20">
                        {v.fileKey && <span className="truncate max-w-[200px]">{v.fileKey}</span>}
                        <span>{new Date(v.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startObf(v)}
                        disabled={obfingId === v.id || v.obfStatus === "processing" || !v.blobKey}
                        title={!v.blobKey ? "Önce JAR yükle" : undefined}
                        className={cn(
                          "rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border disabled:opacity-40 disabled:cursor-not-allowed",
                          v.obfStatus === "done"
                            ? "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20"
                            : "bg-white/[0.05] text-white/40 border-white/[0.08] hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/20"
                        )}
                      >
                        {obfingId === v.id ? "İşleniyor..." : v.obfStatus === "done" ? "Yeniden Obf" : "Obf Başlat"}
                      </button>
                      <button
                        onClick={() => togglePublish(v)}
                        disabled={togglingId === v.id}
                        className={cn(
                          "rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border disabled:opacity-50",
                          v.published
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                            : "bg-white/[0.05] text-white/40 border-white/[0.08] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20"
                        )}
                      >
                        {togglingId === v.id ? "..." : v.published ? "Yayından Kaldır" : "Yayınla"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}