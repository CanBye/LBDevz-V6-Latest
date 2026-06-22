import type { Metadata } from "next"
import { StoreClient } from "./store-client"

export const metadata: Metadata = {
  title: "Mağaza — Premium Plugin, Script & Bot",
  description: "Minecraft plugin, FiveM script, Discord bot ve özel yazılım ürünleri. Kurulum, destek ve güncelleme dahil.",
  alternates: { canonical: "https://lbdevz.com/magaza" },
}

export default function MagazaPage() {
  return <StoreClient />
}