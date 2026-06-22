-- Seed all admin permission keys
INSERT INTO "permissions" ("key", "description") VALUES
  ('admin.dashboard',    'Ana panel ve istatistikleri görüntüle'),
  ('admin.products',     'Ürünleri yönet (ekle, düzenle, sil)'),
  ('admin.orders',       'Siparişleri görüntüle ve yönet'),
  ('admin.customers',    'Müşteri listesini görüntüle'),
  ('admin.topups',       'Kredi taleplerini onayla veya reddet'),
  ('admin.tickets',      'Destek taleplerini görüntüle ve yanıtla'),
  ('admin.coupons',      'Kuponları yönet'),
  ('admin.roles',        'Rolleri ve yetkileri yönet'),
  ('admin.reviews',      'Yorumları yönet'),
  ('admin.agreements',   'Sözleşmeleri yönet'),
  ('admin.team',         'Ekip üyelerini yönet'),
  ('admin.blog',         'Blog yazılarını yönet'),
  ('admin.forum',        'Forum kategorilerini yönet'),
  ('admin.yetkilialim',  'Yetkili alım başvurularını yönet'),
  ('admin.site_settings','Site ayarlarını değiştir'),
  ('admin.webhooks',     'Webhook ayarlarını yönet'),
  ('admin.notifications','Bildirimleri yönet'),
  ('admin.analytics',    'Analitik verileri görüntüle'),
  ('admin.revenue',      'Gelir raporlarını görüntüle'),
  ('admin.settings',     'Admin panel ayarlarını değiştir')
ON CONFLICT ("key") DO NOTHING;