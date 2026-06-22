"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Props {
  productName: string
  onAccept: () => void
  onClose: () => void
}

export function SalesAgreementModal({ productName, onAccept, onClose }: Props) {
  const [checked, setChecked] = useState(false)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-2xl border border-white/[0.09] bg-[#080808] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                <Icon icon="carbon:document-signed" className="text-amber-400" width={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white/90">Satış Ön Bilgi Formu</p>
                <p className="text-[10px] text-white/35">{productName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors">
              <Icon icon="carbon:close" width={18} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 max-h-[55vh] overflow-y-auto space-y-4 text-sm text-white/55 leading-relaxed">
            <p className="text-white/80 font-semibold text-base">Satın almadan önce lütfen okuyunuz.</p>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-2">1. İşletme Statüsü ve Fatura</p>
              <p>
                <strong className="text-white/75">LBDevz</strong>, resmi olarak tescil edilmiş bir şirket veya ticari işletme değildir.
                Faaliyetlerimiz tamamen <strong className="text-white/75">hobi ve kişisel proje</strong> kapsamında yürütülmektedir.
                Bu nedenle gerçekleştirilen satışlar karşılığında <strong className="text-amber-400">herhangi bir fatura, fiş veya vergi belgesi
                düzenlenememektedir.</strong>
              </p>
              <p className="mt-2">
                Satın alma işlemini tamamlayarak bu durumu açıkça kabul etmiş sayılırsınız. Sonrasında fatura talep etme hakkınızı
                kullanamaz ve bu gerekçeyle herhangi bir hukuki yola başvuramazsınız.
              </p>
            </section>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-2">2. Dijital Ürün ve İade Politikası</p>
              <p>
                Satın alınan ürünler <strong className="text-white/75">dijital ve anlık teslim edilebilir</strong> niteliktedir.
                Ürünün teslimi gerçekleştikten sonra iade veya iptal talepleri kabul edilmemektedir.
                Teknik sorunlar için <strong className="text-white/75">destek hizmeti</strong> sağlanmaktadır.
              </p>
            </section>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-2">3. Lisans ve Kullanım Koşulları</p>
              <p>
                Satın alınan ürün, yalnızca lisans anahtarında belirtilen <strong className="text-white/75">tek kullanıcı ve tek sunucu</strong> için
                geçerlidir. Ürünü başkalarıyla paylaşmak, yeniden satmak veya dağıtmak kesinlikle yasaktır.
                Lisans ihlali tespit edildiğinde lisans derhal iptal edilir.
              </p>
            </section>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-2">4. Sorumluluk Reddi</p>
              <p>
                LBDevz, ürünlerinin üçüncü taraf platformlarda (sunucu, oyun ortamı vb.) çalışmaması durumunda teknik destek
                sunmakla birlikte, bu durumdan kaynaklanan doğrudan veya dolaylı zararlardan sorumlu tutulamaz.
              </p>
            </section>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-400/90">
              <strong>Önemli:</strong> Bu formu onaylayarak yukarıdaki tüm koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi
              beyan etmiş olursunuz. Kabul etmemeniz durumunda satın alma işlemine devam etmeyiniz.
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-white/[0.06] space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                checked ? "border-white bg-white" : "border-white/20 group-hover:border-white/40"
              )} onClick={() => setChecked(c => !c)}>
                {checked && <Icon icon="carbon:checkmark" className="text-black" width={12} />}
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Yukarıdaki Satış Ön Bilgi Formunu okudum, anladım ve tüm koşulları <strong className="text-white/70">kabul ediyorum</strong>.
                Özellikle fatura düzenlenemeyeceğini ve bu durumu peşinen kabul ettiğimi onaylıyorum.
              </p>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => { if (checked) { onAccept(); onClose() } }}
                disabled={!checked}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Icon icon="carbon:checkmark-filled" width={16} />
                Kabul Et ve Devam Et
              </button>
              <button onClick={onClose} className="rounded-xl border border-white/[0.07] px-4 py-3 text-xs text-white/40 hover:text-white transition-all">
                İptal
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}