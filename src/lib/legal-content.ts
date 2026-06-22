import { siteConfig } from "@/lib/site-content";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type LegalPage = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

export const legalPages: LegalPage[] = [
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası",
    description:
      "LBDev olarak kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.",
    updatedAt: "15 Haziran 2026",
    sections: [
      {
        title: "1. Genel Bilgiler",
        paragraphs: [
          `Bu Gizlilik Politikası, ${siteConfig.name} ("LBDev", "biz") tarafından işletilen web sitesi ve hizmetler kapsamında toplanan kişisel verilerin işlenmesine ilişkin esasları açıklar.`,
          "Web sitemizi ziyaret etmeniz, Discord üzerinden iletişime geçmeniz veya hizmetlerimizden yararlanmanız halinde bu politika geçerlidir.",
        ],
      },
      {
        title: "2. Toplanan Veriler",
        paragraphs: ["Hizmetlerimizi sunabilmek için aşağıdaki verileri toplayabiliriz:"],
        list: [
          "Ad, kullanıcı adı ve iletişim bilgileri (e-posta, Discord)",
          "Proje talepleri ve sipariş sürecinde paylaştığınız teknik bilgiler",
          "Ödeme işlemi sırasında ödeme sağlayıcısı üzerinden iletilen işlem bilgileri",
          "Site kullanımına ilişkin teknik veriler (IP adresi, tarayıcı, cihaz bilgisi)",
        ],
      },
      {
        title: "3. Verilerin Kullanım Amaçları",
        paragraphs: ["Toplanan veriler aşağıdaki amaçlarla kullanılır:"],
        list: [
          "Teklif, sipariş ve teslimat süreçlerinin yürütülmesi",
          "Müşteri desteği ve proje sonrası iletişim",
          "Yasal yükümlülüklerin yerine getirilmesi",
          "Site güvenliği ve hizmet kalitesinin iyileştirilmesi",
        ],
      },
      {
        title: "4. Verilerin Paylaşımı",
        paragraphs: [
          "Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.",
          "Ödeme altyapısı, barındırma ve analiz hizmetleri gibi teknik iş ortaklarıyla yalnızca hizmetin gerektirdiği ölçüde ve gerekli güvenlik önlemleriyle paylaşım yapılabilir.",
        ],
      },
      {
        title: "5. Saklama Süresi",
        paragraphs: [
          "Verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri kadar saklanır.",
          "Saklama süresi sona eren veriler silinir, yok edilir veya anonim hale getirilir.",
        ],
      },
      {
        title: "6. Haklarınız",
        paragraphs: [
          "KVKK kapsamında verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama ve itiraz etme haklarına sahipsiniz.",
          `Talepleriniz için ${siteConfig.email} adresinden bizimle iletişime geçebilirsiniz.`,
        ],
      },
    ],
  },
  {
    slug: "kullanim-sartlari",
    title: "Kullanım Şartları",
    description:
      "LBDev web sitesi ve dijital hizmetlerinin kullanımına ilişkin şartları içerir.",
    updatedAt: "15 Haziran 2026",
    sections: [
      {
        title: "1. Kabul",
        paragraphs: [
          `${siteConfig.name} web sitesini kullanarak bu Kullanım Şartları'nı kabul etmiş sayılırsınız.`,
          "Şartları kabul etmiyorsanız siteyi ve hizmetleri kullanmamanız gerekir.",
        ],
      },
      {
        title: "2. Hizmet Kapsamı",
        paragraphs: [
          "LBDev; Minecraft plugin, FiveM script, Discord bot, web site, launcher ve özel yazılım geliştirme hizmetleri sunar.",
          "Sitede yer alan ürün açıklamaları, fiyatlar ve teslim süreleri bilgilendirme amaçlıdır; kesin teklif proje detaylarına göre belirlenir.",
        ],
      },
      {
        title: "3. Kullanıcı Yükümlülükleri",
        paragraphs: ["Hizmetlerimizi kullanırken:"],
        list: [
          "Doğru ve güncel bilgi vermeyi",
          "Üçüncü taraf haklarını ihlal eden içerik talep etmemeyi",
          "Hizmetleri yasa dışı amaçlarla kullanmamayı",
          "Teslim edilen yazılımları lisans koşullarına uygun kullanmayı",
        ],
      },
      {
        title: "4. Fikri Mülkiyet",
        paragraphs: [
          "Site tasarımı, marka, metinler ve özgün içerikler LBDev'e aittir. İzinsiz kopyalanamaz veya ticari amaçla kullanılamaz.",
          "Özel proje teslimatlarında lisans ve kullanım hakları, sipariş sırasında yazılı olarak paylaşılan koşullara tabidir.",
        ],
      },
      {
        title: "5. Sorumluluk Sınırı",
        paragraphs: [
          "LBDev, üçüncü taraf platformların (Minecraft, FiveM, Discord vb.) politika veya teknik değişikliklerinden kaynaklanan kesintilerden sorumlu tutulamaz.",
          "Mücbir sebep hallerinde teslimat süreleri makul ölçüde uzatılabilir; müşteri bilgilendirilir.",
        ],
      },
      {
        title: "6. Değişiklikler",
        paragraphs: [
          "Bu şartlar güncellenebilir. Güncel metin her zaman sitede yayınlanır.",
          "Güncelleme sonrası hizmetleri kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz anlamına gelir.",
        ],
      },
    ],
  },
  {
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli Satış Sözleşmesi",
    description:
      "6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında dijital ürün ve hizmet satışlarına ilişkin sözleşme metnidir.",
    updatedAt: "15 Haziran 2026",
    sections: [
      {
        title: "1. Taraflar",
        paragraphs: [
          `Satıcı: ${siteConfig.name} — İletişim: ${siteConfig.email}`,
          "Alıcı: Siparişi veren ve ödeme yapan gerçek veya tüzel kişi.",
        ],
      },
      {
        title: "2. Konu",
        paragraphs: [
          "Bu sözleşme, Alıcı'nın Satıcı'dan dijital ürün veya yazılım hizmeti satın almasına ilişkin tarafların hak ve yükümlülüklerini düzenler.",
          "Ürün/hizmet kapsamı, fiyat, teslim süresi ve teknik detaylar sipariş onayı sırasında paylaşılır.",
        ],
      },
      {
        title: "3. Ödeme ve Teslimat",
        paragraphs: [
          "Ödeme, sipariş onayı sonrası belirtilen yöntemlerle alınır.",
          "Dijital ürünler ve yazılım teslimatları, proje kapsamına göre Discord, e-posta veya belirlenen dijital kanallar üzerinden yapılır.",
          "Teslimat süresi proje büyüklüğüne göre değişir; tahmini süre sipariş öncesi müşteriye bildirilir.",
        ],
      },
      {
        title: "4. Cayma Hakkı",
        paragraphs: [
          "Dijital içerik ve anında ifa edilen hizmetlerde, Alıcı'nın onayı ile ifaya başlandığında cayma hakkı kullanılamayabilir.",
          "Henüz ifaya başlanmamış siparişlerde, yasal süre içinde cayma hakkı kullanılabilir; talep yazılı olarak iletilmelidir.",
        ],
      },
      {
        title: "5. Garanti ve Destek",
        paragraphs: [
          "Teslim edilen yazılımlar için proje kapsamında belirtilen destek süresi geçerlidir.",
          "Müşteri kaynaklı hatalar, üçüncü taraf uyumsuzlukları veya yetkisiz müdahaleler garanti kapsamı dışındadır.",
        ],
      },
      {
        title: "6. Uyuşmazlık",
        paragraphs: [
          "Uyuşmazlıklarda öncelikle dostane çözüm aranır.",
          "Çözülemeyen hallerde Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.",
        ],
      },
    ],
  },
  {
    slug: "kvkk-aydinlatma",
    title: "KVKK Aydınlatma Metni",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu aydınlatma metnidir.",
    updatedAt: "15 Haziran 2026",
    sections: [
      {
        title: "1. Veri Sorumlusu",
        paragraphs: [
          `${siteConfig.name} ("LBDev"), kişisel verileriniz bakımından veri sorumlusu sıfatıyla hareket eder.`,
          `İletişim: ${siteConfig.email}`,
        ],
      },
      {
        title: "2. İşlenen Kişisel Veriler",
        paragraphs: ["Aşağıdaki kişisel veri kategorileri işlenebilir:"],
        list: [
          "Kimlik ve iletişim bilgileri",
          "Müşteri işlem bilgileri (sipariş, teklif, destek kayıtları)",
          "Finansal işlem bilgileri (ödeme sağlayıcı kayıtları)",
          "İşlem güvenliği verileri (log, IP, cihaz bilgisi)",
        ],
      },
      {
        title: "3. İşleme Amaçları ve Hukuki Sebepler",
        paragraphs: [
          "Kişisel veriler; sözleşmenin kurulması ve ifası, hukuki yükümlülüklerin yerine getirilmesi ve meşru menfaatler kapsamında işlenir.",
          "Açık rıza gerektiren hallerde ayrıca onayınız alınır.",
        ],
      },
      {
        title: "4. Aktarım",
        paragraphs: [
          "Verileriniz; ödeme kuruluşları, barındırma sağlayıcıları ve yasal mercilerle, kanuni sınırlar içinde paylaşılabilir.",
          "Yurt dışına aktarım gerektiğinde KVKK'daki şartlara uyulur.",
        ],
      },
      {
        title: "5. Haklarınız (KVKK md. 11)",
        paragraphs: ["Kanun kapsamında aşağıdaki haklara sahipsiniz:"],
        list: [
          "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
          "İşlenmişse buna ilişkin bilgi talep etme",
          "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
          "Kanuni şartlar oluştuğunda silinmesini veya yok edilmesini isteme",
          "İşleme faaliyetine itiraz etme",
        ],
      },
      {
        title: "6. Başvuru",
        paragraphs: [
          `Haklarınıza ilişkin taleplerinizi ${siteConfig.email} adresine iletebilirsiniz.`,
          "Başvurularınız en geç 30 gün içinde sonuçlandırılır.",
        ],
      },
    ],
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    description:
      "Web sitemizde kullanılan çerezler ve benzeri teknolojiler hakkında bilgilendirme metnidir.",
    updatedAt: "15 Haziran 2026",
    sections: [
      {
        title: "1. Çerez Nedir?",
        paragraphs: [
          "Çerezler, web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır.",
          "Site performansını artırmak, tercihlerinizi hatırlamak ve kullanımı analiz etmek için kullanılabilir.",
        ],
      },
      {
        title: "2. Kullandığımız Çerez Türleri",
        paragraphs: ["Sitemizde aşağıdaki çerez türleri kullanılabilir:"],
        list: [
          "Zorunlu çerezler: Sitenin temel işlevleri için gereklidir",
          "Analitik çerezler: Ziyaret ve kullanım istatistiklerini anlamamıza yardımcı olur",
          "İşlevsel çerezler: Tercihlerinizi hatırlamamızı sağlar",
        ],
      },
      {
        title: "3. Çerez Yönetimi",
        paragraphs: [
          "Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz.",
          "Zorunlu çerezlerin devre dışı bırakılması sitenin bazı bölümlerinin çalışmamasına neden olabilir.",
        ],
      },
      {
        title: "4. Üçüncü Taraf Çerezleri",
        paragraphs: [
          "Analiz veya entegrasyon hizmetleri kullanıldığında üçüncü taraf çerezleri devreye girebilir.",
          "Bu çerezler ilgili sağlayıcıların gizlilik politikalarına tabidir.",
        ],
      },
      {
        title: "5. İletişim",
        paragraphs: [
          `Çerez politikası hakkında sorularınız için ${siteConfig.email} adresinden bize ulaşabilirsiniz.`,
        ],
      },
    ],
  },
];

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug);
}
