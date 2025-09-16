-- Script de diagnostic et correction IMMÉDIAT
-- Copiez et exécutez ce script COMPLET dans votre console Supabase

-- ÉTAPE 1: Vérifier l'état actuel
SELECT 'DIAGNOSTIC COMPLET' as etape;

-- Vérifier toutes les tables existantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ÉTAPE 2: Créer la table orders IMMÉDIATEMENT
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID,
    menu TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ÉTAPE 3: Activer RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4: Créer les politiques RLS
DROP POLICY IF EXISTS "Allow all access to authenticated users on orders" ON public.orders;
CREATE POLICY "Allow all access to authenticated users on orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ÉTAPE 5: Insérer des données de test IMMÉDIATEMENT
INSERT INTO public.orders (patient_id, menu, meal_type, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Poulet rôti', 'Déjeuner', 'En attente d''approbation'),
('550e8400-e29b-41d4-a716-446655440002', 'Poisson grillé', 'Dîner', 'Approuvé'),
('550e8400-e29b-41d4-a716-446655440003', 'Salade composée', 'Déjeuner', 'En attente d''approbation'),
('550e8400-e29b-41d4-a716-446655440004', 'Pâtes carbonara', 'Dîner', 'En attente d''approbation'),
('550e8400-e29b-41d4-a716-446655440005', 'Sandwich club', 'Déjeuner', 'Approuvé')
ON CONFLICT DO NOTHING;

-- ÉTAPE 6: Vérifier le résultat
SELECT 'RÉSULTAT FINAL' as etape;
SELECT COUNT(*) as nombre_commandes FROM public.orders;

-- Afficher les commandes créées
SELECT 
    id,
    patient_id,
    menu,
    meal_type,
    status,
    created_at
FROM public.orders 
ORDER BY created_at DESC;

-- ÉTAPE 7: Test de la requête qui causait l'erreur 400
SELECT 'TEST DE LA REQUÊTE' as etape;
SELECT * FROM public.orders ORDER BY created_at DESC LIMIT 5;






