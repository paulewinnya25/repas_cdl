-- Script pour créer la table patient_menus
-- Exécutez ce script dans votre console Supabase

-- 1. Créer la table patient_menus si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.patient_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    price NUMERIC(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Activer RLS pour patient_menus
ALTER TABLE public.patient_menus ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques RLS pour patient_menus
DROP POLICY IF EXISTS "Allow all access to authenticated users on patient_menus" ON public.patient_menus;
CREATE POLICY "Allow all access to authenticated users on patient_menus"
ON public.patient_menus FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Insérer des menus patients de test
INSERT INTO public.patient_menus (name, description, price, is_available) VALUES
('Poulet rôti', 'Poulet rôti aux légumes avec riz', 2500, true),
('Poisson grillé', 'Poisson grillé avec légumes vapeur', 3000, true),
('Salade composée', 'Salade verte avec tomates et fromage', 1500, true),
('Pâtes carbonara', 'Pâtes avec sauce carbonara', 2000, true),
('Sandwich club', 'Sandwich avec poulet, bacon et légumes', 1800, true),
('Soupe de légumes', 'Soupe chaude aux légumes de saison', 1200, true),
('Omelette aux herbes', 'Omelette avec herbes fraîches et fromage', 1600, true),
('Fruits frais', 'Assortiment de fruits de saison', 1000, true)
ON CONFLICT DO NOTHING;

-- 5. Vérifier la création
SELECT 'Table patient_menus créée avec succès' as status;
SELECT COUNT(*) as nombre_menus FROM public.patient_menus;

-- 6. Afficher les menus créés
SELECT 
    id,
    name,
    description,
    price,
    is_available,
    created_at
FROM public.patient_menus 
ORDER BY created_at DESC;






