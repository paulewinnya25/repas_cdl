-- SOLUTION RAPIDE - Corriger Supabase existant
-- Exécutez ce script dans votre console Supabase en ligne

-- 1. Ajouter la colonne created_at manquante
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- 2. Ajouter les autres colonnes si nécessaire
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMPTZ;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS instructions TEXT;

-- 3. Mettre à jour les valeurs created_at existantes
UPDATE public.orders 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- 4. Insérer des commandes de test si la table est vide
INSERT INTO public.orders (patient_id, menu, meal_type, status, instructions, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Poulet rôti aux légumes', 'Déjeuner', 'En attente d''approbation', 'Sans épices', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Poisson grillé avec riz', 'Dîner', 'En attente d''approbation', 'Régime sans sel', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Salade composée', 'Déjeuner', 'En préparation', 'Vinaigrette légère', NOW())
ON CONFLICT DO NOTHING;

-- 5. Vérifier le résultat
SELECT COUNT(*) as nombre_commandes FROM public.orders;





