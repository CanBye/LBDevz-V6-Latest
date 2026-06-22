"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Language = "tr" | "en"

const translations = {
  tr: {
    // Navbar
    home: "Ana Sayfa",
    about: "Hakkımızda",
    products: "Ürünler",
    freeServices: "Ücretsiz",
    reviews: "Yorumlar",
    discord: "Discord",
    login: "Giriş Yap",
    logout: "Çıkış Yap",
    dashboard: "Dashboard",
    myAccount: "Hesabım",
    credits: "Kredi",
    buyCredits: "Kredi Yükle",
    
    // Auth
    welcomeBack: "Tekrar hoş geldin",
    loginDesc: "Hesabına giriş yap veya kayıt ol",
    email: "Email",
    password: "Şifre",
    nameSurname: "Ad Soyad",
    username: "Kullanıcı adı",
    passwordLength: "Şifre (min. 8 karakter)",
    orSocial: "veya sosyal hesapla devam et",
    acceptTerms: "kullanım şartlarını",
    acceptTermsDesc: "Devam ederek kullanım şartlarını kabul etmiş olursun.",
    
    // Dashboard general
    activeLicenses: "Aktif Lisanslar",
    activeTickets: "Aktif Destek Talepleri",
    unpaidInvoices: "Ödenmemiş Faturalar",
    balance: "Bakiye",
    allServices: "Tüm Hizmetler",
    buyService: "Hizmet satın al",
    buyServiceDesc: "Yeni projeni oluşturmak için tıkla ve hemen sipariş ver!",
    recentTransactions: "Son İşlemler",
    noTransactions: "Henüz işlem yok",
    pendingTopups: "Yükleme Talepleri",
    amount: "Miktar",
    status: "Durum",
    pending: "Bekliyor",
    approved: "Onaylandı",
    rejected: "Reddedildi",
    
    // Dashboard Menu
    hizmetSatinAl: "Hizmet Satın Al",
    faturalar: "Faturalar",
    bakiyeYukle: "Bakiye Yükle",
    destekTalepleri: "Destek Talepleri",
    apiDokumantasyonu: "API Dokümantasyonu",
    myProducts: "Ürünlerim",
    myLicenses: "Lisanslarım",
    destek: "Destek",
    magaza: "Mağaza",
    tickets: "Sözleşmeler",
    
    // Topup
    topupIban: "Kredi Yükle (IBAN Havale)",
    topupIbanDesc: "Havaleyi yaptıktan sonra formu doldurun, ekibimiz onaylayacak.",
    minAmount: "Minimum 10 ₺",
    chooseAmount: "Miktar seç",
    customAmount: "Veya özel miktar",
    referencePlaceholder: "Havale açıklaması / referans (opsiyonel)",
    submitRequest: "Talep Oluştur",
    submitting: "Gönderiliyor...",
    topupSuccess: "Talebiniz alındı! Ekibimiz onayladığında krediniz yüklenecek.",
    
    // License
    noLicenses: "Henüz lisans yok",
    noProducts: "Henüz ürün satın alınmadı",
    ticketSystemSoon: "Ticket sistemi yakında",
    ticketSystemDesc: "Ticket sistemi en kısa sürede eklenecek.",

    // Ticket system
    newTicket: "Yeni Ticket",
    ticketSubject: "Konu",
    ticketCategory: "Kategori",
    ticketPriority: "Öncelik",
    ticketMessage: "Mesaj",
    submitTicket: "Ticket Oluştur",
    noTickets: "Henüz destek talebi yok",
    openTicket: "Açık",
    inProgressTicket: "Bekliyor",
    resolvedTicket: "Yanıtlandı",
    closedTicket: "Kapatıldı",

    // Download
    downloadBtn: "İndir",
    noVersionAvailable: "Henüz dosya yüklenmedi",
    downloadAvailable: "İndir",

    // Admin Panel
    adminDashboard: "Dashboard",
    adminOrders: "Siparişler",
    adminProducts: "Ürünler",
    adminCustomers: "Müşteriler",
    adminTickets: "Destek Talepleri",
    adminTeam: "Ekip Yönetimi",
    adminAnalytics: "Analizler",
    adminRevenue: "Gelir",
    adminNotifications: "Bildirimler",
    adminSettings: "Ayarlar",
    adminTopups: "Kredi Talepleri",
    adminConsole: "Konsol Genel Bakış",
    adminApprove: "Onayla",
    adminReject: "Reddet",
    adminActive: "Aktif",
    adminPaused: "Pasif",
    adminFeatured: "Öne Çıkan",
    adminAddProduct: "Ürün Ekle",
    adminPending: "Bekliyor",
    adminApproved: "Onaylandı",
    adminRejected: "Reddedildi",

    // Product approval workflow
    productDraft: "Onay Bekliyor",
    productArchived: "Arşivlendi",
    productApproveBtn: "Onayla",
    productRejectBtn: "Reddet",
    productActivateBtn: "Aktifleştir",
    productDeactivateBtn: "Devre Dışı",
    productCreateSuccess: "oluşturuldu — onay bekliyor.",
    productCreateBtn: "Ürün Oluştur",

    // Source code upload
    sourceCodeLabel: "Kaynak Kodu",
    sourceCodeHint: "(gizli — sadece yetkili görebilir)",
    sourceCodeSelectBtn: ".zip / .tar.gz seç",
    sourceCodeNoAccess: "Bu kaynağa erişim yetkiniz yok",
    sourceCodeDownload: "Kaynak Kodu İndir",
    sourceCodeNotFound: "Kaynak kodu bulunamadı",

    // Yetkilialim agreement
    agreementTitle: "Yetkili Alım Başvuru Sözleşmesi",
    agreementSubtitle: "Sözleşme · Okumanız Zorunludur",
    agreementCheckbox: "Yukarıdaki sözleşmeyi okudum, anladım ve tüm maddelerini kabul ediyorum.",
    agreementSignBtn: "Sözleşmeyi İmzala ve Başvur",
    agreementCancelBtn: "İptal",
    agreementLoadFailed: "Sözleşme içeriği yüklenemedi.",
    agreementReadHere: "bu sayfadan",
    agreementSigned: "Sözleşme imzalandı — başvuru gönderildi.",
    applyWithAgreementBtn: "Sözleşmeyi Gör ve Başvur",

    // Auth page
    loginTab: "Giriş Yap",
    registerTab: "Kayıt Ol",
    loggingIn: "Giriş yapılıyor...",
    registering: "Kayıt olunuyor...",
    loginError: "Email veya şifre hatalı ya da bot doğrulaması başarısız",
    registerError: "Kayıt başarısız",
    continueWithDiscord: "Discord ile devam et",
    continueWithGoogle: "Google ile devam et",
    usernameExample: "Kullanıcı adı (örn: canbye)",

    // Dashboard store
    magazaTitle: "Mağaza",
    magazaSubtitle: "Premium yazılım ürünleri · Kredi ile anında satın al",
    allFilter: "Tümü",
    featuredLabel: "Öne Çıkan",
    allProductsLabel: "Tüm Ürünler",
    noProductsInCategory: "Bu kategoride ürün bulunamadı",
    browseBtn: "İncele",
    freeLabel: "Ücretsiz",
    otherLabel: "Diğer",

    // Profile page
    profileTitle: "Profilim",
    profileSubtitle: "Hesap bilgilerin ve istatistiklerin",
    memberSinceLabel: "Üyelik",
    totalLicensesLabel: "Toplam Lisans",
    purchasedServicesLabel: "Satın alınan hizmet",
    totalSpendingLabel: "Toplam Harcama",
    totalCreditsSpentLabel: "Toplam kredi harcaması",
    updateUsernameLabel: "Kullanıcı Adını Güncelle",
    usernameHint: "Sadece harf, rakam, nokta, tire ve alt çizgi kullanılabilir.",
    saveBtn: "Kaydet",
    usernameSaved: "Kullanıcı adı güncellendi.",
    genericError: "Bir hata oluştu.",
    profileLoadError: "Profil yüklenemedi.",

    // My applications
    myApplicationsTitle: "Başvurularım",
    myApplicationsDesc: "Yetkili alım başvurularının durumunu buradan takip edebilirsin.",
    noApplications: "Henüz başvurun yok.",
    newApplicationBtn: "Yeni Başvuru Yap",
    yourAnswersLabel: "Yanıtlarınız",
    adminNoteLabel: "Admin Notu",
    reviewedAtLabel: "İnceleme:",

    // Public store
    storeEyebrow: "MAĞAZA",
    storeHeroLine1: "Premium ürünler,",
    storeHeroLine2: "hazır teslim.",
    storeDesc: "Minecraft plugin, FiveM script, Discord bot ve daha fazlası — kurulum, destek ve güncelleme dahil.",
    searchPlaceholder: "Ürün ara...",
    priceLabel: "FİYAT",
    noMatchingProducts: "Eşleşen ürün bulunamadı.",
    noProductsYet: "Henüz ürün eklenmemiş.",
    productCountSuffix: "ürün",

    // Forum
    forumEyebrow: "TOPLULUK",
    forumTitle: "Forum kategorileri",
    forumNoCategories: "Henüz kategori oluşturulmamış.",
    forumTopicsSuffix: "konu",
    forumBack: "Forum",
    forumNewTopic: "Yeni Konu",
    forumLoginToPost: "Giriş yap ve konu aç",
    forumRules: "Kurallar",
    forumTopicTitlePlaceholder: "Konu başlığı...",
    forumSending: "Gönderiliyor...",
    forumSendBtn: "Gönder",
    forumCancelBtn: "İptal",
    forumNoTopics: "Henüz konu yok. İlk konuyu sen aç!",
    forumAnonymous: "Anonim",
    forumContentPlaceholder: "İçerik (en az",
    forumCharsLeft: "karakter daha",
    productDescFallback: "Premium kalitede ürün.",
    featuredProductsTitle: "Öne çıkan ürünler",
    featuredProductsDesc: "En çok tercih edilen paketler — kurulum, destek ve güncelleme dahil.",

    // Blog
    blogEyebrow: "DUYURULAR",
    blogTitle: "Blog & duyurular",
    blogSubtitle: "Ekipten haberler, güncellemeler ve duyurular.",
    blogNoPosts: "Henüz duyuru yok.",
    blogBreadcrumb: "Blog",
    blogBackAll: "← Tüm Duyurular",

    // API docs
    apiDocsTitle: "API Dokümantasyonu",
    apiDocsBack: "Ana Sayfa",
    apiDocsVersion: "Versiyon",
    apiDocsCurl: "Örnek cURL",
    copied: "Kopyalandı",
    copyBtn: "Kopyala",
    apiDocsFooter: "LBDevz API — Tüm hakları saklıdır.",

    // Hero section
    heroLookingFor: "Bir",
    heroLookingFor2: "mi arıyorsun?",
    heroDesc: "Anlat yeter — plugin, web site, script ya da Discord bot, fikrini birlikte hayata geçirelim...",
    heroCta1: "Hadi Konuşalım",
    heroCta2: "Neler Yapıyoruz?",
    heroReferenceServers: "Referans Sunucular",

    // Why section
    whoAreWe: "Biz Kimiz?",
    whyOverview: "LBDEV // OVERVIEW",
    whyHeadline: "2019'dan beri Özgün Projeler",
    whyFoundYear: "KURULUŞ YILI",
    whyOriginalDev: "ÖZGÜN GELİŞTİRME",
    whyShortAndClear: "KISA VE NET",
    whyMission: "Sana en iyi çözümü, en hızlı ve güvenilir şekilde sunmak.",
    whyStep1: "Fikir Analizi",
    whyStep2: "Özgün Kod",
    whyStep3: "7/24 Destek",

    // Reviews section
    reviewsEyebrow: "YORUMLAR",
    reviewsHeadline: "Onlar güvendi, biz teslim ettik.",
    reviewsDesc: "Gerçek projelerden geri bildirimler. Plugin hata verdi, fark ettik ve döndük. Kaybolmak yok.",

    // Team section
    teamEyebrow: "TAKIM",
    teamHeadline: "Arkasındaki ekip",
    teamDesc: "Tutkulu geliştiriciler ve tasarımcılardan oluşan küçük ama güçlü bir ekip.",

    // Global section
    globalEyebrow: "DÜNYA GENELİNDE",
    globalHeadline: "Nerede olursan ol, biz de oradayız.",

    // Yetkilialim page
    joinTeam: "EKİBE KATIL",
    yetkilialimTitle: "Yetkili Alım",
    yetkilialimTitleBold: "Başvurusu",
    yetkilialimDesc: "Ekibimize katılmak için uygun kategoriyi seç ve formu doldur. Başvurunu inceleyip en kısa sürede dönüş yapacağız.",
    yetkilialimClosed: "Yetkili alım şu an kapalı.",
    questionsSuffix: "soru",
    loginRequired: "Başvurmak için",
    loginLink: "giriş yapman",
    loginRequiredSuffix: "gerekiyor.",
    atLeastChars: "en az",
    charsSuffix: "karakter",
    selectPlaceholder: "Seç...",
    applicationSuccess: "Başvurun Alındı!",
    applicationSuccessDesc: "için başvurunu inceleyip dönüş yapacağız.",
    otherCategories: "Diğer Kategoriler",
    backToCategories: "Kategorilere Dön",
    sendingLabel: "Gönderiliyor...",
    applicationFailed: "Başvuru gönderilemedi",

    // Why section body text
    whyBody1: "LBDev, 2019 yılından beri oyun ve yazılım dünyasında faaliyet gösteren, tamamen kendi ekibi tarafından özgün projeler geliştiren bir ekibiz.",
    whyBody2: "Başlangıçta Minecraft sunucularına odaklanarak yola çıktık, ardından web geliştirme ve genel yazılım sektörüne genişledik. Bugün Minecraft'tan FiveM'e, özel projelerden otomasyona kadar birçok alanda hizmet veriyoruz — üçüncü parti sistemlere bağımlı olmadan, temiz ve modern kodlarla!",
    whyCardBody: "Karmaşık süreçler ve gereksiz detaylarla vaktini çalmıyoruz. Sunucunu baştan sona yükseltmek mi istiyorsun, yoksa hayalindeki projeyi hayata geçirmek mi? Fark etmez, biz buradayız.",
    whyStep1Detail: "Sıfır teknik jargon",
    whyStep2Detail: "%100 performans",
    whyStep3Detail: "Sürekli iletişim",

    // Product detail & purchase
    backToStore: "Mağazaya Dön",
    couponPlaceholder: "Kupon kodu...",
    applyBtn: "Uygula",
    purchaseSuccess: "Satın alma başarılı!",
    licenseKeyLabel: "Lisans anahtarın:",
    closeBtn: "Kapat",
    alreadyOwnedLabel: "Zaten Sahipsin",
    downloadFromLicenses: "Lisanslarım sayfasından indirebilirsin",
    processing: "İşleniyor...",
    insufficientBalance: "Yetersiz Bakiye",
    buyBtn: "Satın Al",
    instantDelivery: "Anlık teslimat",
    developersLabel: "Geliştiriciler",
    unnamed: "İsimsiz",
    changelogTitle: "Güncelleme Geçmişi",
    latestVersionBadge: "Son Sürüm",
    noChangelog: "Changelog belirtilmedi",
    purchaseFailed: "Satın alma başarısız",
    licenseModelLifetime: "Ömürlük",
    licenseModelSubscription: "Abonelik",
    licenseModelCustom: "Özel",

    // Public product page
    descriptionTab: "Açıklama",
    versionsTab: "Sürümler",
    noDescription: "Açıklama henüz eklenmemiş.",
    noVersionsPublished: "Henüz yayınlanan sürüm yok.",
    loginAndBuy: "Giriş Yap ve Satın Al",
    goToLicenses: "Lisanslarıma Git",
    readAndBuy: "Sözleşmeyi Oku ve Satın Al",
    walletBalance: "Bakiye:",
    addBalance: "Yükle",
    purchaseSuccessTitle: "Satın alma başarılı!",
    licenseKey: "Lisans Anahtarı:",
    viewMyLicenses: "Lisanslarımı Gör →",

    // Product info labels
    typeLabel: "Tür",
    licenseLabel: "Lisans",
    versionLabel: "Sürüm",
    categoryLabel: "Kategori",
    licenseModelLifetimeLong: "Ömür Boyu",

    // Features
    featureInstantDelivery: "Anında Teslim",
    feature247Support: "7/24 Destek",
    featureFreeUpdates: "Ücretsiz Güncelleme",
    featureSecurePayment: "Güvenli Ödeme",
  },
  en: {
    // Navbar
    home: "Home",
    about: "About Us",
    products: "Products",
    freeServices: "Free Services",
    reviews: "Reviews",
    discord: "Discord",
    login: "Log In",
    logout: "Log Out",
    dashboard: "Dashboard",
    myAccount: "My Account",
    credits: "Credits",
    buyCredits: "Add Credits",
    
    // Auth
    welcomeBack: "Welcome back",
    loginDesc: "Log in or register to your account",
    email: "Email",
    password: "Password",
    nameSurname: "Full Name",
    username: "Username",
    passwordLength: "Password (min. 8 chars)",
    orSocial: "or continue with social account",
    acceptTerms: "terms of use",
    acceptTermsDesc: "By continuing, you agree to our terms of use.",
    
    // Dashboard general
    activeLicenses: "Active Licenses",
    activeTickets: "Active Support Tickets",
    unpaidInvoices: "Unpaid Invoices",
    balance: "Balance",
    allServices: "All Services",
    buyService: "Buy service",
    buyServiceDesc: "Click to configure your new project and order instantly!",
    recentTransactions: "Recent Transactions",
    noTransactions: "No transactions yet",
    pendingTopups: "Top-up Requests",
    amount: "Amount",
    status: "Status",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    
    // Dashboard Menu
    hizmetSatinAl: "Buy Service",
    faturalar: "Invoices",
    bakiyeYukle: "Add Balance",
    destekTalepleri: "Support Tickets",
    apiDokumantasyonu: "API Documentation",
    myProducts: "My Products",
    myLicenses: "My Licenses",
    destek: "Support",
    magaza: "Store",
    tickets: "Agreements",
    
    // Topup
    topupIban: "Add Credits (IBAN Transfer)",
    topupIbanDesc: "Fill the form after making the bank transfer, our team will approve it.",
    minAmount: "Minimum 10 ₺",
    chooseAmount: "Choose amount",
    customAmount: "Or custom amount",
    referencePlaceholder: "Transfer description / reference (optional)",
    submitRequest: "Submit Request",
    submitting: "Submitting...",
    topupSuccess: "Request received! Your credits will be added upon approval.",
    
    // License
    noLicenses: "No licenses found",
    noProducts: "No products purchased yet",
    ticketSystemSoon: "Ticket system coming soon",
    ticketSystemDesc: "The ticket system will be added shortly.",

    // Ticket system
    newTicket: "New Ticket",
    ticketSubject: "Subject",
    ticketCategory: "Category",
    ticketPriority: "Priority",
    ticketMessage: "Message",
    submitTicket: "Create Ticket",
    noTickets: "No support tickets yet",
    openTicket: "Open",
    inProgressTicket: "Pending",
    resolvedTicket: "Answered",
    closedTicket: "Closed",

    // Download
    downloadBtn: "Download",
    noVersionAvailable: "No file uploaded yet",
    downloadAvailable: "Download",

    // Admin Panel
    adminDashboard: "Dashboard",
    adminOrders: "Orders",
    adminProducts: "Products",
    adminCustomers: "Customers",
    adminTickets: "Support Tickets",
    adminTeam: "Team Management",
    adminAnalytics: "Analytics",
    adminRevenue: "Revenue",
    adminNotifications: "Notifications",
    adminSettings: "Settings",
    adminTopups: "Credit Requests",
    adminConsole: "Console Overview",
    adminApprove: "Approve",
    adminReject: "Reject",
    adminActive: "Active",
    adminPaused: "Paused",
    adminFeatured: "Featured",
    adminAddProduct: "Add Product",
    adminPending: "Pending",
    adminApproved: "Approved",
    adminRejected: "Rejected",

    // Product approval workflow
    productDraft: "Pending Approval",
    productArchived: "Archived",
    productApproveBtn: "Approve",
    productRejectBtn: "Reject",
    productActivateBtn: "Activate",
    productDeactivateBtn: "Deactivate",
    productCreateSuccess: "created — pending approval.",
    productCreateBtn: "Create Product",

    // Source code upload
    sourceCodeLabel: "Source Code",
    sourceCodeHint: "(private — visible to authorized only)",
    sourceCodeSelectBtn: "Select .zip / .tar.gz",
    sourceCodeNoAccess: "You do not have access to this resource",
    sourceCodeDownload: "Download Source Code",
    sourceCodeNotFound: "Source code not found",

    // Yetkilialim agreement
    agreementTitle: "Authority Application Agreement",
    agreementSubtitle: "Agreement · Reading Is Required",
    agreementCheckbox: "I have read, understood, and agree to all terms of the above agreement.",
    agreementSignBtn: "Sign Agreement & Apply",
    agreementCancelBtn: "Cancel",
    agreementLoadFailed: "Failed to load agreement content.",
    agreementReadHere: "this page",
    agreementSigned: "Agreement signed — application submitted.",
    applyWithAgreementBtn: "View Agreement & Apply",

    // Auth page
    loginTab: "Log In",
    registerTab: "Sign Up",
    loggingIn: "Logging in...",
    registering: "Signing up...",
    loginError: "Email or password incorrect, or bot verification failed",
    registerError: "Registration failed",
    continueWithDiscord: "Continue with Discord",
    continueWithGoogle: "Continue with Google",
    usernameExample: "Username (e.g. canbye)",

    // Dashboard store
    magazaTitle: "Store",
    magazaSubtitle: "Premium software products · Buy instantly with credits",
    allFilter: "All",
    featuredLabel: "Featured",
    allProductsLabel: "All Products",
    noProductsInCategory: "No products found in this category",
    browseBtn: "View",
    freeLabel: "Free",
    otherLabel: "Other",

    // Profile page
    profileTitle: "My Profile",
    profileSubtitle: "Your account information and statistics",
    memberSinceLabel: "Member Since",
    totalLicensesLabel: "Total Licenses",
    purchasedServicesLabel: "Purchased services",
    totalSpendingLabel: "Total Spending",
    totalCreditsSpentLabel: "Total credits spent",
    updateUsernameLabel: "Update Username",
    usernameHint: "Only letters, numbers, dots, hyphens, and underscores allowed.",
    saveBtn: "Save",
    usernameSaved: "Username updated.",
    genericError: "An error occurred.",
    profileLoadError: "Failed to load profile.",

    // My applications
    myApplicationsTitle: "My Applications",
    myApplicationsDesc: "Track the status of your authority application submissions here.",
    noApplications: "No applications yet.",
    newApplicationBtn: "New Application",
    yourAnswersLabel: "Your Answers",
    adminNoteLabel: "Admin Note",
    reviewedAtLabel: "Reviewed:",

    // Public store
    storeEyebrow: "STORE",
    storeHeroLine1: "Premium products,",
    storeHeroLine2: "ready to deliver.",
    storeDesc: "Minecraft plugins, FiveM scripts, Discord bots and more — setup, support, and updates included.",
    searchPlaceholder: "Search products...",
    priceLabel: "PRICE",
    noMatchingProducts: "No matching products found.",
    noProductsYet: "No products added yet.",
    productCountSuffix: "products",

    // Forum
    forumEyebrow: "COMMUNITY",
    forumTitle: "Forum categories",
    forumNoCategories: "No categories created yet.",
    forumTopicsSuffix: "topics",
    forumBack: "Forum",
    forumNewTopic: "New Topic",
    forumLoginToPost: "Log in to post a topic",
    forumRules: "Rules",
    forumTopicTitlePlaceholder: "Topic title...",
    forumSending: "Sending...",
    forumSendBtn: "Send",
    forumCancelBtn: "Cancel",
    forumNoTopics: "No topics yet. Be the first to post!",
    forumAnonymous: "Anonymous",
    forumContentPlaceholder: "Content (at least",
    forumCharsLeft: "more characters",
    productDescFallback: "Premium quality product.",
    featuredProductsTitle: "Featured products",
    featuredProductsDesc: "The most preferred packages — setup, support, and updates included.",

    // Blog
    blogEyebrow: "ANNOUNCEMENTS",
    blogTitle: "Blog & announcements",
    blogSubtitle: "News, updates, and announcements from the team.",
    blogNoPosts: "No announcements yet.",
    blogBreadcrumb: "Blog",
    blogBackAll: "← All Announcements",

    // API docs
    apiDocsTitle: "API Documentation",
    apiDocsBack: "Home",
    apiDocsVersion: "Version",
    apiDocsCurl: "Example cURL",
    copied: "Copied",
    copyBtn: "Copy",
    apiDocsFooter: "LBDevz API — All rights reserved.",

    // Hero section
    heroLookingFor: "Looking for a",
    heroLookingFor2: "?",
    heroDesc: "Just tell us — plugin, website, script or Discord bot, let's bring your idea to life together...",
    heroCta1: "Let's Talk",
    heroCta2: "What We Do",
    heroReferenceServers: "Reference Servers",

    // Why section
    whoAreWe: "Who Are We?",
    whyOverview: "LBDEV // OVERVIEW",
    whyHeadline: "Original Projects Since 2019",
    whyFoundYear: "FOUNDED",
    whyOriginalDev: "ORIGINAL DEVELOPMENT",
    whyShortAndClear: "SHORT & CLEAR",
    whyMission: "To deliver the best solution for you, in the fastest and most reliable way.",
    whyStep1: "Idea Analysis",
    whyStep2: "Original Code",
    whyStep3: "24/7 Support",

    // Reviews section
    reviewsEyebrow: "REVIEWS",
    reviewsHeadline: "They trusted us, we delivered.",
    reviewsDesc: "Feedback from real projects. Plugin failed, we noticed and fixed it. No ghosting.",

    // Team section
    teamEyebrow: "TEAM",
    teamHeadline: "The team behind it",
    teamDesc: "A small but powerful team of passionate developers and designers.",

    // Global section
    globalEyebrow: "WORLDWIDE",
    globalHeadline: "Wherever you are, we're there too.",

    // Yetkilialim page
    joinTeam: "JOIN THE TEAM",
    yetkilialimTitle: "Authority",
    yetkilialimTitleBold: "Application",
    yetkilialimDesc: "Choose the right category and fill out the form to join our team. We'll review your application and get back to you shortly.",
    yetkilialimClosed: "Authority applications are currently closed.",
    questionsSuffix: "questions",
    loginRequired: "You need to",
    loginLink: "log in",
    loginRequiredSuffix: "to apply.",
    atLeastChars: "at least",
    charsSuffix: "characters",
    selectPlaceholder: "Select...",
    applicationSuccess: "Application Received!",
    applicationSuccessDesc: "We will review your application for and get back to you.",
    otherCategories: "Other Categories",
    backToCategories: "Back to Categories",
    sendingLabel: "Sending...",
    applicationFailed: "Failed to submit application",

    // Why section body text
    whyBody1: "LBDev is a team that has been active in the gaming and software world since 2019, developing fully original projects built entirely by our own team.",
    whyBody2: "We started by focusing on Minecraft servers, then expanded into web development and the broader software industry. Today we serve many areas from Minecraft to FiveM, from custom projects to automation — without relying on third-party systems, with clean and modern code!",
    whyCardBody: "We don't waste your time with complex processes and unnecessary details. Want to upgrade your server from top to bottom, or bring your dream project to life? No matter what, we're here.",
    whyStep1Detail: "Zero technical jargon",
    whyStep2Detail: "100% performance",
    whyStep3Detail: "Ongoing communication",

    // Product detail & purchase
    backToStore: "Back to Store",
    couponPlaceholder: "Coupon code...",
    applyBtn: "Apply",
    purchaseSuccess: "Purchase successful!",
    licenseKeyLabel: "Your license key:",
    closeBtn: "Close",
    alreadyOwnedLabel: "Already Owned",
    downloadFromLicenses: "You can download it from the Licenses page",
    processing: "Processing...",
    insufficientBalance: "Insufficient Balance",
    buyBtn: "Buy",
    instantDelivery: "Instant delivery",
    developersLabel: "Developers",
    unnamed: "Unnamed",
    changelogTitle: "Changelog",
    latestVersionBadge: "Latest",
    noChangelog: "No changelog provided",
    purchaseFailed: "Purchase failed",
    licenseModelLifetime: "Lifetime",
    licenseModelSubscription: "Subscription",
    licenseModelCustom: "Custom",

    // Public product page
    descriptionTab: "Description",
    versionsTab: "Versions",
    noDescription: "No description added yet.",
    noVersionsPublished: "No versions published yet.",
    loginAndBuy: "Log In & Buy",
    goToLicenses: "Go to My Licenses",
    readAndBuy: "Read Agreement & Buy",
    walletBalance: "Balance:",
    addBalance: "Add",
    purchaseSuccessTitle: "Purchase successful!",
    licenseKey: "License Key:",
    viewMyLicenses: "View My Licenses →",

    // Product info labels
    typeLabel: "Type",
    licenseLabel: "License",
    versionLabel: "Version",
    categoryLabel: "Category",
    licenseModelLifetimeLong: "Lifetime",

    // Features
    featureInstantDelivery: "Instant Delivery",
    feature247Support: "24/7 Support",
    featureFreeUpdates: "Free Updates",
    featureSecurePayment: "Secure Payment",
  }
} as const

type TranslationKey = keyof typeof translations.tr

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("tr")

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang === "tr" || savedLang === "en") {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations["tr"][key] || String(key)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
