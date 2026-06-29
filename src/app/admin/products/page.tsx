"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"
import { useConfirm } from "@/components/ui/confirm-dialog"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

const RichEditor = dynamic(() => import("@/components/editor/RichEditor"), { ssr: false })

interface Product {
  id: string
  name: string
  description: string | null
  priceCredits: number
  status: string
  featured: boolean
  type: string
  category: string | null
  imageUrl: string | null
  visibility: string
  approvedAt: string | null
  approvedByName: string | null
  approvedByEmail: string | null
}

interface StaffUser {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

const TYPE_OPTIONS = [
  { value: "minecraft_plugin", label: "Minecraft Plugin", icon: "simple-icons:minecraft" },
  { value: "fivem_script",     label: "FiveM Script",     icon: "simple-icons:fivem" },
  { value: "discord_bot",      label: "Discord Bot",      icon: "ic:baseline-discord" },
  { value: "website",          label: "Website",          icon: "carbon:globe" },
  { value: "launcher",         label: "Launcher",         icon: "carbon:launch" },
  { value: "other",            label: "Diğer",            icon: "carbon:cube" },
]

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"

export default function AdminProductsPage() {
  const router = useRouter()

  // Data
  const [products,    setProducts]   = useState<Product[]>([])
  const [staffUsers,  setStaffUsers] = useState<StaffUser[]>([])
  const [loading,     setLoading]    = useState(true)

  // Edit modal
  const [editProduct,    setEditProduct]    = useState<Product | null>(null)
  const [editSaving,     setEditSaving]     = useState(false)
  const [editName,       setEditName]       = useState("")
  const [editDesc,       setEditDesc]       = useState("")
  const [editPrice,      setEditPrice]      = useState("")
  const [editCategory,   setEditCategory]   = useState("")
  const [editFeatured,   setEditFeatured]   = useState(false)
  const [editVisibility, setEditVisibility] = useState("public")

  // Form state
  const [name,        setName]        = useState("")
  const [description, setDescription] = useState("")
  const [price,       setPrice]       = useState("")
  const [type,        setType]        = useState("minecraft_plugin")
  const [licenseModel,setLicenseModel]= useState("lifetime")
  const [enableObf,   setEnableObf]   = useState(true)
  const [enableLicense, setEnableLicense] = useState(true)
  const [featured,    setFeatured]    = useState(false)
  const [selectedDevs,setSelectedDevs]= useState<string[]>([])

  // Images
  const imageInputRef                 = useRef<HTMLInputElement>(null)
  const [images,      setImages]      = useState<{ file: File; url: string; uploaded?: string }[]>([])
  const [imageDrag,   setImageDrag]   = useState(false)

  // JAR
  const jarInputRef                   = useRef<HTMLInputElement>(null)
  const [jarFile,     setJarFile]     = useState<File | null>(null)
  const [jarVersion,  setJarVersion]  = useState("")

  // Source code
  const srcInputRef                   = useRef<HTMLInputElement>(null)
  const [srcFile,     setSrcFile]     = useState<File | null>(null)

  // Submit state
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Bulk add modal
  const [bulkOpen,      setBulkOpen]      = useState(false)
  const [bulkLicModel,  setBulkLicModel]  = useState("lifetime")
  const [bulkEnableLic, setBulkEnableLic] = useState(true)
  const [bulkEnableObf, setBulkEnableObf] = useState(true)
  interface BulkRow { id: number; name: string; price: string; type: string; jar: File | null }
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    { id: Date.now(), name: "", price: "", type: "minecraft_plugin", jar: null },
  ])
  // Progress view
  type StepStatus = "wait" | "running" | "done" | "err"
  interface BulkProgress { name: string; step: string; status: StepStatus; error?: string }
  const [bulkProgress, setBulkProgress] = useState<BulkProgress[]>([])
  const [bulkRunning,  setBulkRunning]  = useState(false)
  const [bulkDone,     setBulkDone]     = useState(false)
  const bulkJarRefs = useRef<Map<number, HTMLInputElement>>(new Map())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  function toggleAll() {
    if (selectedIds.size === products.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(products.map(p => p.id)))
  }
  async function deleteSelected() {
    if (selectedIds.size === 0) return
    const ok = await confirm({ title: "Ürünleri Sil", description: `${selectedIds.size} ürün kalıcı olarak silinecek. Emin misiniz?`, confirmText: "Evet, Sil", cancelText: "İptal" })
    if (!ok) return
    await Promise.all(
      [...selectedIds].map(id =>
        fetch(`/api/admin/products/${id}`, { method: "DELETE" }).catch(() => {})
      )
    )
    setSelectedIds(new Set())
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {})
  }

  function bulkAddRow() {
    setBulkRows(r => [...r, { id: Date.now(), name: "", price: "", type: "minecraft_plugin", jar: null }])
  }
  function bulkRemoveRow(id: number) {
    setBulkRows(r => r.filter(x => x.id !== id))
  }
  function bulkSetRow(id: number, field: string, value: string) {
    setBulkRows(r => r.map(x => (x.id === id ? { ...x, [field]: value } : x)))
  }
  function bulkSetJar(id: number, file: File | null) {
    setBulkRows(r => r.map(x => (x.id === id ? { ...x, jar: file } : x)))
  }
  function setProgress(idx: number, step: string, status: StepStatus, error?: string) {
    setBulkProgress(prev => prev.map((p, i) => i === idx ? { ...p, step, status, error } : p))
  }

  async function submitBulk() {
    const valid = bulkRows.filter(r => r.name.trim())
    if (!valid.length) return
    setBulkRunning(true); setBulkDone(false)
    setBulkProgress(valid.map(r => ({ name: r.name.trim(), step: "Bekliyor...", status: "wait" })))

    for (let i = 0; i < valid.length; i++) {
      const row = valid[i]
      try {
        // 1. Ürün oluştur
        setProgress(i, "Ürün oluşturuluyor...", "running")
        const pRes = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: row.name.trim(),
            price: row.price === "" ? 0 : Number(row.price),
            type: row.type,
            licenseModel: bulkLicModel,
            enableLicense: bulkEnableLic,
            enableObf: bulkEnableObf,
          }),
        })
        if (!pRes.ok) { const d = await pRes.json(); throw new Error(d.error ?? "Ürün oluşturulamadı"); }
        const product = await pRes.json()

        // 2. JAR yükle (varsa)
        if (row.jar) {
          setProgress(i, "JAR yükleniyor...", "running")
          const jarFd = new FormData(); jarFd.append("file", row.jar)
          const jarRes = await fetch(`/api/admin/products/${product.id}/versions/upload`, { method: "POST", body: jarFd })
          const jarData = await jarRes.json()
          if (!jarData.blobKey) throw new Error("JAR yüklenemedi")

          // 3. Versiyon oluştur
          setProgress(i, "Versiyon oluşturuluyor...", "running")
          const vRes = await fetch(`/api/admin/products/${product.id}/versions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ version: "v1.0.0", blobKey: jarData.blobKey, fileKey: jarData.blobKey, published: true }),
          })
          if (!vRes.ok) throw new Error("Versiyon oluşturulamadı")
          const { version: ver } = await vRes.json()

          // 4. Obfuscation (istenirse)
          if (bulkEnableObf && ver?.id) {
            setProgress(i, "Obfuscation başlatılıyor...", "running")
            await fetch(`/api/admin/products/${product.id}/versions/${ver.id}/obfuscate`, {
              method: "POST", headers: { "Content-Type": "application/json" },
            }).catch(() => {})
            setProgress(i, "Obfuscation kuyruğa alındı", "done")
          } else {
            setProgress(i, "Tamamlandı", "done")
          }
        } else {
          setProgress(i, "Tamamlandı (JAR yok)", "done")
        }
      } catch (err: unknown) {
        setProgress(i, "Hata", "err", err instanceof Error ? err.message : String(err))
      }
    }

    setBulkRunning(false); setBulkDone(true)
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {})
  }

  function resetBulk() {
    setBulkProgress([]); setBulkDone(false); setBulkRunning(false)
    setBulkRows([{ id: Date.now(), name: "", price: "", type: "minecraft_plugin", jar: null }])
  }

  useEffect(() => {
    fetch("/api/admin/products").then(r => r.json()).then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
    fetch("/api/admin/staff").then(r => r.json()).then(d => setStaffUsers(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  // ── Image handling ──────────────────────────────────────────────────────
  function addImageFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).slice(0, 6 - images.length).forEach(file => {
      if (!file.type.startsWith("image/")) return
      const url = URL.createObjectURL(file)
      setImages(prev => [...prev, { file, url }])
    })
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = []
    for (const img of images) {
      if (img.uploaded) { urls.push(img.uploaded); continue }
      const fd = new FormData()
      fd.append("file", img.file)
      const res  = await fetch("/api/admin/upload/image", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) urls.push(data.url)
    }
    return urls
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    if (!name.trim()) return setMsg({ type: "err", text: "Ürün adı zorunlu" })
    if (images.length === 0) return setMsg({ type: "err", text: "En az 1 görsel ekle" })

    setSaving(true)

    // 1. Upload images
    const imageUrls = await uploadImages()
    if (imageUrls.length === 0) { setSaving(false); return setMsg({ type: "err", text: "Görsel yükleme başarısız" }) }

    // 2. Create product
    const productRes = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description,
        price: price === "" ? 0 : Number(price),
        type,
        licenseModel,
        enableLicense,
        enableObf,
        featured,
        imageUrl: imageUrls[0],
        developerIds: selectedDevs,
      }),
    })
    if (!productRes.ok) {
      const d = await productRes.json()
      setSaving(false)
      return setMsg({ type: "err", text: d.error ?? "Ürün oluşturulamadı" })
    }
    const createdProduct = await productRes.json()

    // 3. Upload JAR + create version (if provided)
    if (jarFile && jarVersion.trim()) {
      const jarFd = new FormData()
      jarFd.append("file", jarFile)
      const jarUpRes  = await fetch(`/api/admin/products/${createdProduct.id}/versions/upload`, { method: "POST", body: jarFd })
      const jarUpData = await jarUpRes.json()

      if (jarUpData.blobKey) {
        const verRes = await fetch(`/api/admin/products/${createdProduct.id}/versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version: jarVersion.trim(), blobKey: jarUpData.blobKey, fileKey: jarUpData.blobKey, published: true }),
        })
        if (verRes.ok) {
          const { version: newVer } = await verRes.json()

          // Upload source code if provided
          if (srcFile) {
            const srcFd = new FormData()
            srcFd.append("file", srcFile)
            await fetch(
              `/api/admin/products/${createdProduct.id}/versions/${newVer.id}/source`,
              { method: "POST", body: srcFd }
            ).catch(() => {})
          }

          if (enableObf) {
            fetch(`/api/admin/products/${createdProduct.id}/versions/${newVer.id}/obfuscate`, { method: "POST", headers: { "Content-Type": "application/json" } })
              .catch(() => {})
          }
        }
      }
    }

    // 4. Reset
    setSaving(false)
    setMsg({ type: "ok", text: `"${name}" oluşturuldu — onay bekliyor.` })
    setName(""); setDescription(""); setPrice(""); setType("minecraft_plugin")
    setLicenseModel("lifetime"); setEnableObf(true); setEnableLicense(true); setFeatured(false)
    setSelectedDevs([]); setImages([]); setJarFile(null); setJarVersion(""); setSrcFile(null)
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {})
  }

  async function toggleActive(id: string, status: string) {
    await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: status !== "active" }) })
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {})
  }

  async function approveProduct(id: string) {
    await fetch(`/api/admin/products/${id}/approve`, { method: "PATCH" })
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {})
  }

  async function rejectProduct(id: string) {
    await fetch(`/api/admin/products/${id}/reject`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {})
  }

  function openEdit(p: Product) {
    setEditProduct(p)
    setEditName(p.name)
    setEditDesc(p.description ?? "")
    setEditPrice(String(p.priceCredits))
    setEditCategory(p.category ?? "")
    setEditFeatured(p.featured)
    setEditVisibility(p.visibility)
  }

  async function saveEdit() {
    if (!editProduct) return
    setEditSaving(true)
    await fetch(`/api/admin/products/${editProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName, description: editDesc,
        price: Number(editPrice), category: editCategory,
        featured: editFeatured, visibility: editVisibility,
      }),
    })
    setEditSaving(false)
    setEditProduct(null)
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {})
  }

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.PRODUCTS}>
      <div className="p-6 sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white/90">Ürün Yönetimi</h1>
            <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Products</p>
          </div>
          <button
            onClick={() => { setBulkOpen(true); resetBulk() }}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 px-4 py-2 text-xs font-bold hover:bg-indigo-500/20 transition-all"
          >
            <Icon icon="carbon:add" width={14} />
            Toplu Ekle
          </button>
        </div>

        <div className="grid gap-8 xl:grid-cols-5 items-start">
          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-5">

            {/* Product name */}
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Ürün Adı *</label>
              <input className={inputCls} placeholder="Örn. KitPvP Pro" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            {/* Description (rich editor) */}
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Açıklama</label>
              <RichEditor value={description} onChange={setDescription} placeholder="Ürün detayları, özellikler, kurulum..." />
            </div>

            {/* Images */}
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Görseller * <span className="text-white/20 normal-case font-normal">(min 1, max 6)</span></label>
              <div
                onDragOver={e => { e.preventDefault(); setImageDrag(true) }}
                onDragLeave={() => setImageDrag(false)}
                onDrop={e => { e.preventDefault(); setImageDrag(false); addImageFiles(e.dataTransfer.files) }}
                onClick={() => images.length < 6 && imageInputRef.current?.click()}
                className={cn(
                  "rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-3",
                  imageDrag ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/[0.07] hover:border-white/20 bg-[#0d0d0d]"
                )}
              >
                <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addImageFiles(e.target.files)} />

                {images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Icon icon="carbon:image-copy" className="text-white/15" width={28} />
                    <p className="text-xs text-white/30">Sürükle veya tıkla</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative group aspect-video rounded-lg overflow-hidden bg-[#1a1a1a]">
                        <img src={img.url} className="h-full w-full object-cover" alt="" />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 rounded bg-white/80 px-1.5 py-0.5 text-[8px] font-bold text-black uppercase">Kapak</span>
                        )}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeImage(i) }}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded bg-black/70 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icon icon="carbon:close" width={10} />
                        </button>
                      </div>
                    ))}
                    {images.length < 6 && (
                      <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-white/[0.08] text-white/20 hover:text-white/40 hover:border-white/20 transition-all">
                        <Icon icon="carbon:add" width={20} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Price + Type row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Fiyat (₺)</label>
                <div className="relative">
                  <input
                    className={cn(inputCls, "pr-16")}
                    placeholder="0"
                    type="number"
                    min="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                  {(price === "" || Number(price) === 0) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Ücretsiz</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Tür</label>
                <select className={inputCls} value={type} onChange={e => setType(e.target.value)}>
                  {TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* JAR Upload */}
            <div className="rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4 space-y-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Plugin JAR <span className="text-white/20 font-normal normal-case">(isteğe bağlı)</span></p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => jarInputRef.current?.click()}
                  className={cn(
                    "flex-1 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition-all",
                    jarFile
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                      : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/70"
                  )}
                >
                  <Icon icon={jarFile ? "carbon:document-software" : "carbon:upload"} width={14} />
                  <span className="truncate">{jarFile ? jarFile.name : "JAR dosyası seç"}</span>
                </button>
                <input ref={jarInputRef} type="file" accept=".jar" className="hidden" onChange={e => setJarFile(e.target.files?.[0] ?? null)} />
                <input
                  className="w-24 rounded-xl border border-white/[0.07] bg-[#111] px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
                  placeholder="v1.0.0"
                  value={jarVersion}
                  onChange={e => setJarVersion(e.target.value)}
                />
              </div>

              {/* OBF + License toggles */}
              <div className="flex gap-3">
                {[
                  { label: "Obfuscation", state: enableObf, set: setEnableObf, color: "indigo" },
                  { label: "Lisans", state: enableLicense, set: setEnableLicense, color: "emerald", disabled: false },
                ].map(({ label, state, set, color, disabled }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && (set as (v: boolean) => void)(!state)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all flex-1 justify-center",
                      state
                        ? color === "indigo" ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/[0.07] text-white/30"
                    )}
                  >
                    <Icon icon={state ? "carbon:checkmark-filled" : "carbon:circle-dash"} width={13} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Source code upload */}
              <div className="pt-1 border-t border-white/[0.05]">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">
                  Kaynak Kodu <span className="text-white/20 font-normal normal-case">(gizli — sadece yetkili görebilir)</span>
                </p>
                <button
                  type="button"
                  onClick={() => srcInputRef.current?.click()}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition-all",
                    srcFile
                      ? "border-violet-500/30 bg-violet-500/5 text-violet-400"
                      : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/70"
                  )}
                >
                  <Icon icon={srcFile ? "carbon:document-protected" : "carbon:upload"} width={14} />
                  <span className="truncate">{srcFile ? srcFile.name : ".zip / .tar.gz seç"}</span>
                </button>
                <input
                  ref={srcInputRef}
                  type="file"
                  accept=".zip,.tar,.tar.gz,.tgz"
                  className="hidden"
                  onChange={e => setSrcFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {/* Developers */}
            {staffUsers.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">
                  Geliştiriciler <span className="text-white/20 font-normal normal-case">(çoklu)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {staffUsers.map(u => {
                    const sel = selectedDevs.includes(u.id)
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedDevs(p => sel ? p.filter(x => x !== u.id) : [...p, u.id])}
                        className={cn(
                          "flex items-center gap-2 rounded-full px-3 py-1.5 border text-xs font-medium transition-all",
                          sel
                            ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-400"
                            : "border-white/[0.07] text-white/35 hover:border-white/20 hover:text-white/60"
                        )}
                      >
                        {u.image ? (
                          <img src={u.image} alt="" className="h-4 w-4 rounded-full object-cover" />
                        ) : (
                          <Icon icon="carbon:user-filled" width={11} className="text-white/30" />
                        )}
                        {u.name ?? u.username ?? "—"}
                        {sel && <Icon icon="carbon:close" width={10} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFeatured(p => !p)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all",
                  featured
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border-white/[0.07] text-white/35 hover:border-white/20"
                )}
              >
                <Icon icon={featured ? "carbon:star-filled" : "carbon:star"} width={14} />
                Öne Çıkar
              </button>

              <select
                className="flex-1 rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 text-xs text-white/60 outline-none focus:border-white/20 transition-all"
                value={licenseModel}
                onChange={e => setLicenseModel(e.target.value)}
              >
                <option value="lifetime" className="bg-[#111]">Ömürlük Lisans</option>
                <option value="subscription" className="bg-[#111]">Abonelik</option>
                <option value="custom" className="bg-[#111]">Özel</option>
              </select>
            </div>

            {/* Submit */}
            {msg && (
              <div className={cn("rounded-xl border px-4 py-2.5 text-xs font-medium", msg.type === "ok" ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Icon icon="carbon:circle-dash" width={16} className="animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Icon icon="carbon:add-filled" width={16} />
                  Ürün Oluştur
                </>
              )}
            </button>
          </form>

          {/* ── Product list ── */}
          <div className="xl:col-span-3 space-y-2">
            <div className="flex items-center justify-between mb-4 gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                  checked={products.length > 0 && selectedIds.size === products.length}
                  onChange={toggleAll}
                />
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  {products.length} Ürün
                </span>
              </label>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">{selectedIds.size} seçili</span>
                  <button
                    onClick={deleteSelected}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Icon icon="carbon:trash-can" width={12} />
                    Sil
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#080808] p-16 text-center">
                <Icon icon="carbon:cube" className="text-white/10" width={32} />
                <p className="mt-3 text-xs text-white/25">Henüz ürün yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map(p => (
                  <div key={p.id} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 hover:bg-white/[0.02] transition-all", selectedIds.has(p.id) ? "border-indigo-500/25 bg-indigo-500/[0.04]" : "border-white/[0.06] bg-[#0a0a0a]")}>
                    <input type="checkbox" className="accent-indigo-500 w-4 h-4 rounded cursor-pointer shrink-0" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} />
                    {p.imageUrl ? (
                      <img src={p.imageUrl} className="h-10 w-16 rounded-lg object-cover border border-white/[0.07] shrink-0" alt="" />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-white/[0.06] bg-[#111] text-white/20 shrink-0">
                        <Icon icon="carbon:cube" width={14} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/85 truncate">{p.name}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">
                        {p.type.replace("_", " ")} · {p.priceCredits === 0 ? "Ücretsiz" : `₺${p.priceCredits.toLocaleString("tr-TR")}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {p.featured && (
                        <Icon icon="carbon:star-filled" className="text-amber-400/60" width={13} />
                      )}

                      {/* Status badge */}
                      <span className={cn(
                        "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
                        p.status === "active"   && "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400",
                        p.status === "draft"    && "border-amber-500/25 bg-amber-500/[0.08] text-amber-400",
                        p.status === "archived" && "border-red-500/25 bg-red-500/[0.08] text-red-400",
                      )}>
                        {p.status === "active" ? "Aktif" : p.status === "draft" ? "Onay Bekliyor" : "Arşiv"}
                      </span>

                      <button
                        onClick={() => router.push(`/admin/products/${p.id}/versions`)}
                        className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-white/[0.07] text-white/35 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                      >
                        Sürümler
                      </button>

                      {/* Onaylayan bilgisi */}
                      {p.status === "active" && p.approvedByName && (
                        <span className="text-[9px] text-white/25 whitespace-nowrap" title={`Onaylandı: ${new Date(p.approvedAt!).toLocaleDateString("tr-TR")}`}>
                          ✓ {p.approvedByName}
                        </span>
                      )}

                      {/* Edit butonu */}
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-white/[0.07] text-white/35 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                      >
                        Düzenle
                      </button>

                      {/* Approve / Reject for drafts */}
                      {p.status === "draft" && (
                        <>
                          <button
                            onClick={() => approveProduct(p.id)}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => rejectProduct(p.id)}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            Reddet
                          </button>
                        </>
                      )}

                      {/* Toggle active/archived for already-published products */}
                      {p.status !== "draft" && (
                        <button
                          onClick={() => toggleActive(p.id, p.status)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all",
                            p.status === "active"
                              ? "border-white/[0.07] text-white/35 hover:border-red-500/25 hover:text-red-400 hover:bg-red-500/10"
                              : "border-white/[0.07] text-white/35 hover:border-emerald-500/25 hover:text-emerald-400 hover:bg-emerald-500/10"
                          )}
                        >
                          {p.status === "active" ? "Devre Dışı" : "Aktifleştir"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bulk Add Modal */}
        {bulkOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
                <h2 className="text-sm font-bold text-white/80">Toplu Ürün Ekle</h2>
                <button onClick={() => { if (!bulkRunning) setBulkOpen(false) }} className="text-white/30 hover:text-white transition-colors">✕</button>
              </div>

              {/* Progress view */}
              {(bulkRunning || bulkDone) ? (
                <>
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    {bulkProgress.map((p, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                        p.status === "done" ? "border-emerald-500/20 bg-emerald-500/[0.04]" :
                        p.status === "err"  ? "border-red-500/20 bg-red-500/[0.04]" :
                        p.status === "running" ? "border-indigo-500/20 bg-indigo-500/[0.04]" :
                        "border-white/[0.04] bg-transparent"
                      )}>
                        <div className="shrink-0">
                          {p.status === "done"    && <Icon icon="carbon:checkmark-filled" className="text-emerald-400" width={16} />}
                          {p.status === "err"     && <Icon icon="carbon:close-filled" className="text-red-400" width={16} />}
                          {p.status === "running" && <Icon icon="carbon:circle-dash" className="text-indigo-400 animate-spin" width={16} />}
                          {p.status === "wait"    && <Icon icon="carbon:circle-dash" className="text-white/20" width={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/80 truncate">{p.name}</p>
                          <p className={cn("text-[10px]", p.status === "err" ? "text-red-400" : p.status === "done" ? "text-emerald-400" : "text-white/35")}>{p.error ?? p.step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 border-t border-white/[0.06] shrink-0 flex justify-between items-center">
                    <p className="text-xs text-white/30">
                      {bulkDone ? `${bulkProgress.filter(p => p.status === "done").length}/${bulkProgress.length} tamamlandı` : "İşleniyor..."}
                    </p>
                    {bulkDone && (
                      <div className="flex gap-2">
                        <button onClick={resetBulk} className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">Yeniden Ekle</button>
                        <button onClick={() => { resetBulk(); setBulkOpen(false) }} className="rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 transition-all">Kapat</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Shared settings */}
                  <div className="px-6 py-4 border-b border-white/[0.04] shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Lisans Modeli</label>
                      <select className={inputCls + " text-xs"} value={bulkLicModel} onChange={e => setBulkLicModel(e.target.value)}>
                        <option value="lifetime" className="bg-[#111]">Ömürlük</option>
                        <option value="subscription" className="bg-[#111]">Abonelik</option>
                        <option value="custom" className="bg-[#111]">Özel</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer pb-0.5">
                        <input type="checkbox" checked={bulkEnableLic} onChange={e => setBulkEnableLic(e.target.checked)} className="accent-indigo-500" />
                        <span className="text-xs text-white/50">Lisans Aktif</span>
                      </label>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer pb-0.5">
                        <input type="checkbox" checked={bulkEnableObf} onChange={e => setBulkEnableObf(e.target.checked)} className="accent-indigo-500" />
                        <span className="text-xs text-white/50">Obfuscation</span>
                      </label>
                    </div>
                  </div>

                  {/* Product rows */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    <div className="grid grid-cols-[1fr_90px_120px_1fr_28px] gap-2 mb-1">
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Ürün Adı *</span>
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Fiyat (₺)</span>
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Tür</span>
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">JAR Dosyası</span>
                      <span />
                    </div>
                    {bulkRows.map(row => (
                      <div key={row.id} className="grid grid-cols-[1fr_90px_120px_1fr_28px] gap-2 items-center">
                        <input
                          className={inputCls + " py-2 text-xs"}
                          placeholder="Ürün adı"
                          value={row.name}
                          onChange={e => bulkSetRow(row.id, "name", e.target.value)}
                        />
                        <input
                          type="number"
                          className={inputCls + " py-2 text-xs"}
                          placeholder="0"
                          value={row.price}
                          onChange={e => bulkSetRow(row.id, "price", e.target.value)}
                        />
                        <select
                          className={inputCls + " py-2 text-xs"}
                          value={row.type}
                          onChange={e => bulkSetRow(row.id, "type", e.target.value)}
                        >
                          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>)}
                        </select>
                        <button
                          type="button"
                          onClick={() => { const el = bulkJarRefs.current.get(row.id); el?.click() }}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs w-full transition-all",
                            row.jar ? "border-emerald-500/30 bg-emerald-500/[0.05] text-emerald-400" : "border-white/[0.07] text-white/30 hover:border-white/20"
                          )}
                        >
                          <Icon icon={row.jar ? "carbon:document-software" : "carbon:upload"} width={12} />
                          <span className="truncate">{row.jar ? row.jar.name : "JAR seç..."}</span>
                          <input
                            type="file" accept=".jar" className="hidden"
                            ref={el => { if (el) bulkJarRefs.current.set(row.id, el) }}
                            onChange={e => bulkSetJar(row.id, e.target.files?.[0] ?? null)}
                          />
                        </button>
                        <button
                          onClick={() => bulkRemoveRow(row.id)}
                          disabled={bulkRows.length === 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/20 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-20"
                        >
                          <Icon icon="carbon:trash-can" width={12} />
                        </button>
                      </div>
                    ))}
                    <button onClick={bulkAddRow} className="mt-1 flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
                      <Icon icon="carbon:add" width={13} /> Satır Ekle
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-white/[0.06] shrink-0 flex items-center justify-end gap-2">
                    <button onClick={() => setBulkOpen(false)} className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">İptal</button>
                    <button
                      onClick={submitBulk}
                      disabled={!bulkRows.some(r => r.name.trim())}
                      className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-50 transition-all"
                    >
                      <Icon icon="carbon:rocket" width={13} />
                      {`Başlat (${bulkRows.filter(r => r.name.trim()).length} ürün)`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <h2 className="text-sm font-bold text-white/80">Ürün Düzenle</h2>
                <button onClick={() => setEditProduct(null)} className="text-white/30 hover:text-white transition-colors">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Ürün Adı</label>
                  <input className={inputCls} value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Açıklama</label>
                  <textarea className={inputCls + " resize-none"} rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Fiyat (Kredi)</label>
                    <input type="number" className={inputCls} value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Kategori</label>
                    <input className={inputCls} value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="FiveM, Minecraft..." />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Görünürlük</label>
                  <select className={inputCls} value={editVisibility} onChange={e => setEditVisibility(e.target.value)}>
                    <option value="public">Herkese Açık</option>
                    <option value="unlisted">Listelenmemiş</option>
                    <option value="private">Gizli</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setEditFeatured(v => !v)} className={cn("relative flex h-5 w-9 items-center rounded-full transition-colors", editFeatured ? "bg-white" : "bg-white/10")}>
                    <div className={cn("absolute size-4 rounded-full bg-black transition-transform mx-0.5", editFeatured ? "translate-x-4" : "translate-x-0")} />
                  </div>
                  <span className="text-sm text-white/60">Öne Çıkan Ürün</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
                <button onClick={() => setEditProduct(null)} className="rounded-xl border border-white/[0.07] px-4 py-2 text-sm text-white/40 hover:text-white transition-all">İptal</button>
                <button onClick={saveEdit} disabled={editSaving} className="rounded-xl bg-white text-black px-5 py-2 text-sm font-bold hover:bg-white/90 disabled:opacity-50 transition-all">
                  {editSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </AdminGuard>
  )
}