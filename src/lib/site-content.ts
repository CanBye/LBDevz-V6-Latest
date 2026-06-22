import { assets } from "@/lib/assets";

export const siteConfig = {
  name: "LBDev",
  tagline: "Plugin, script ve dijital ürünler — senin için, senin hızında.",
  discordInvite: "https://discord.gg/lbdev",
  email: "info@lbdev.com",
  year: new Date().getFullYear(),
} as const;

export const featuredProducts = [
  {
    id: "essential-plugin",
    name: "Essential Plugin Paketi",
    description: "Sunucun için temel plugin seti — kurulum dahil, optimize ve güncel.",
    price: "₺349",
    badge: "Popüler",
    icon: assets.icons.pluginPaketi,
    cover: assets.images.products.essentialPlugin,
    accent: "from-emerald-950/80 via-emerald-900/20 to-transparent",
  },
  {
    id: "fivem-economy",
    name: "FiveM Economy Script",
    description: "Özelleştirilebilir ekonomi sistemi — market, banka, meslek entegrasyonu.",
    price: "₺599",
    badge: "Yeni",
    icon: assets.icons.fivemScript,
    cover: assets.images.products.fivemEconomy,
    accent: "from-orange-950/80 via-orange-900/20 to-transparent",
  },
  {
    id: "discord-ticket",
    name: "Discord Ticket Bot",
    description: "Otomatik ticket, log kanalı ve yetkili bildirimi — hazır kurulum.",
    price: "₺249",
    badge: null,
    icon: assets.icons.discordBrand,
    cover: assets.images.products.discordTicket,
    accent: "from-indigo-950/80 via-indigo-900/20 to-transparent",
  },
  {
    id: "custom-launcher",
    name: "Özel Launcher",
    description: "Markana özel launcher — otomatik güncelleme ve modern arayüz.",
    price: "₺899",
    badge: "Premium",
    icon: assets.icons.launcher,
    cover: assets.images.products.customLauncher,
    accent: "from-slate-950/80 via-slate-800/20 to-transparent",
  },
] as const;

export const freeServices = [
  {
    title: "Ücretsiz danışmanlık",
    description: "Projeni anlat, neye ihtiyacın olduğunu birlikte netleştirelim.",
    icon: assets.icons.face,
  },
  {
    title: "Plugin kontrolü",
    description: "Mevcut plugin'inde hata mı var? Hızlıca bakıp yönlendirelim.",
    icon: assets.icons.plugin,
  },
  {
    title: "Teknik soru desteği",
    description: "Discord'da küçük sorularına ücretsiz cevap — topluluk ve ekip yanında.",
    icon: assets.icons.discordBot,
  },
  {
    title: "Fiyat teklifi",
    description: "Ne kadar tutar, ne kadar sürer — şeffaf teklif, baskı yok.",
    icon: assets.icons.webSite,
  },
] as const;

export const customerReviews = [
  {
    name: "Kaan Y.",
    role: "FiveM Sunucu Sahibi",
    quote:
      "Economy script'i tam istediğimiz gibi oldu. Plugin hata verdiğinde de hemen döndüler, kaybolmadılar.",
    rating: 5,
  },
  {
    name: "Mert A.",
    role: "Minecraft Sunucu Kurucusu",
    quote:
      "Essential paketi kurduk, sunucu açılışından önce her şeyi test ettiler. İletişim çok rahattı.",
    rating: 5,
  },
  {
    name: "Selin D.",
    role: "Discord Topluluk Yöneticisi",
    quote:
      "Ticket botunu bir günde teslim ettiler. Ücretsiz danışmanlıkta bile ciddiye aldılar, teşekkürler.",
    rating: 5,
  },
] as const;

export const discordHighlights = [
  "Canlı destek ve hızlı geri dönüş",
  "Proje güncellemeleri ve duyurular",
  "Ücretsiz teknik soru kanalları",
] as const;

export const aboutContent = {
  eyebrow: "Hakkımızda",
  title: "Biz Kimiz?",
  story:
    "LBDev, 2019 yılından beri oyun ve yazılım dünyasında faaliyet gösteren, tamamen kendi ekibi tarafından özgün projeler geliştiren bir ekibiz. Başlangıçta Minecraft sunucularına odaklanarak yola çıktık, ardından web geliştirme ve genel yazılım sektörüne genişledik. Bugün Minecraft'tan FiveM'e, özel projelerden otomasyona kadar birçok alanda hizmet veriyoruz — üçüncü parti sistemlere bağımlı olmadan, temiz ve modern kodlarla!",
  milestones: [
    { year: "2019", label: "Minecraft ile başladık" },
    { year: "Sonra", label: "Web & yazılım" },
    { year: "Bugün", label: "Minecraft, FiveM, otomasyon" },
  ],
  mission: {
    title: "Kısa ve Net",
    text: "LBDev olarak amacımız basit: Sana en iyi çözümü, en hızlı ve güvenilir şekilde sunmak. Sunucunu güzelleştirmek mi istiyorsun, yoksa sıfırdan bir sistem mi kurmak? Biz buradayız!",
  },
  servicesTitle: "Neler Yapıyoruz?",
  servicesDescription:
    "Tüm platformları tek bir ekosistemde birleştiriyor, baştan sona temiz kodlarla teslim ediyoruz.",
  services: [
    {
      id: "client-launcher",
      title: "Client & Launcher",
      description:
        "Minecraft client ve launcher tasarımları, geliştirmeleri ve optimize performans çözümleri.",
      icon: assets.icons.launcher,
      tag: "Performans",
    },
    {
      id: "plugin-paketleri",
      title: "Plugin & Hazır Paketler",
      description:
        "Minecraft plugin'leri ve performans odaklı, hata vermeyen hazır plugin paketleri.",
      icon: assets.icons.pluginPaketi,
      tag: "Optimize",
    },
    {
      id: "web-scriptleri",
      title: "Web Scriptleri",
      description:
        "Minecraft ve FiveM için panel, market sitesi ve yönetim araçları.",
      icon: assets.icons.webSite,
      tag: "Panel & Site",
    },
    {
      id: "ozel-projeler",
      title: "Özel Projeler",
      description:
        "Tamamen isteğine göre, esnek ve özgün yazılım çözümleri.",
      icon: assets.icons.skript,
      tag: "Sıfırdan",
    },
    {
      id: "discord-botlari",
      title: "Discord Botları",
      description:
        "Sunucuna ve topluluğuna özel ticket, otomasyon ve yönetim botları.",
      icon: assets.icons.discordBot,
      tag: "Otomasyon",
    },
  ],
} as const;

export const footerLinks = {
  sayfalar: [
    { label: "Ana Sayfa", href: "/" },
    { label: "Hakkımızda", href: "/#neden-biz" },
    { label: "Ürünler", href: "/#urunler" },
    { label: "Ücretsiz Hizmetler", href: "/#ucretsiz" },
    { label: "Yorumlar", href: "/#yorumlar" },
  ],
  yasal: [
    { label: "Sözleşmeler", href: "/sozlesmeler" },
    { label: "Gizlilik Politikası", href: "/sozlesmeler/gizlilik-politikasi" },
    { label: "Kullanım Şartları", href: "/sozlesmeler/kullanim-sartlari" },
    { label: "Mesafeli Satış", href: "/sozlesmeler/mesafeli-satis-sozlesmesi" },
    { label: "KVKK", href: "/sozlesmeler/kvkk-aydinlatma" },
    { label: "Çerez Politikası", href: "/sozlesmeler/cerez-politikasi" },
  ],
  hizmetler: [
    "Plugin & Plugin Paketi",
    "FiveM Script",
    "Discord Bot",
    "Web Site",
    "Launcher & Client",
  ],
} as const;
