-- reviews: profil fotoğrafı alanı ekle
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "image" text;