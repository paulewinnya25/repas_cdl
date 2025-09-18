-- Création du bucket menu_media pour le stockage des images de menus
-- Exécuter dans Supabase SQL Editor

-- 1. Créer le bucket menu_media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu_media',
  'menu_media', 
  true,  -- Bucket public pour accès direct aux images
  52428800,  -- Limite de 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']  -- Types d'images acceptés
);

-- 2. Politique pour permettre la lecture publique des images
CREATE POLICY "Allow public read access to menu images" ON storage.objects
FOR SELECT USING (bucket_id = 'menu_media');

-- 3. Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated upload to menu_media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'menu_media' 
  AND auth.role() = 'authenticated'
);

-- 4. Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated update to menu_media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'menu_media' 
  AND auth.role() = 'authenticated'
);

-- 5. Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated delete from menu_media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'menu_media' 
  AND auth.role() = 'authenticated'
);

-- Vérification
SELECT * FROM storage.buckets WHERE id = 'menu_media';
