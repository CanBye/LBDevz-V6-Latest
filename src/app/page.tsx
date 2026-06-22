import type { Metadata } from "next";
import { HomePage } from "@/components/sections/hero/home-page";

export const metadata: Metadata = {
  title: "LBDevz — Premium Plugin, Script & Bot Çözümleri",
  description: "Minecraft plugin, FiveM script, Discord bot ve özel yazılım çözümleri. Kurulum, destek ve güncelleme dahil. Türkiye'nin en güvenilir oyun yazılım ekibi.",
  keywords: ["minecraft plugin", "fivem script", "discord bot", "minecraft plugin satın al", "fivem ekonomi script", "lbdevz", "oyun yazılımı", "minecraft server plugin", "türkiye fivem"],
  openGraph: {
    title: "LBDevz — Premium Plugin, Script & Bot Çözümleri",
    description: "Minecraft plugin, FiveM script, Discord bot ve özel yazılım çözümleri. Kurulum, destek ve güncelleme dahil.",
    images: [{ url: "https://lbdevz.com/og-image.png", width: 1200, height: 630, alt: "LBDevz" }],
  },
  alternates: { canonical: "https://lbdevz.com" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LBDevz",
  url: "https://lbdevz.com",
  logo: "https://lbdevz.com/logo.png",
  description: "Minecraft Plugin, FiveM Script, Discord Bot ve özel yazılım çözümleri.",
  contactPoint: { "@type": "ContactPoint", contactType: "customer support", availableLanguage: "Turkish" },
  sameAs: ["https://discord.gg/lbdev"],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomePage />
    </>
  );
}
