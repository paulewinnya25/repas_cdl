-- Script pour créer la table orders manquante
-- Exécutez ce script pour résoudre l'erreur 400 dans le portail cuisinier

-- 1. Vérifier si la table orders existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders' AND table_schema='public') 
        THEN '✅ Table orders existe'
        ELSE '❌ Table orders manquante'
    END as status;

-- 2. Créer la table orders si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID,
    menu TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Activer RLS pour orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS pour orders
DROP POLICY IF EXISTS "Allow all access to authenticated users on orders" ON public.orders;
CREATE POLICY "Allow all access to authenticated users on orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Insérer des commandes de test
INSERT INTO public.orders (patient_id, menu, meal_type, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Poulet rôti', 'Déjeuner', 'En attente d''approbation'),
('550e8400-e29b-41d4-a716-446655440002', 'Poisson grillé', 'Dîner', 'Approuvé'),
('550e8400-e29b-41d4-a716-446655440003', 'Salade composée', 'Déjeuner', 'En attente d''approbation')
ON CONFLICT DO NOTHING;

-- 6. Vérifier la création
SELECT 
    'Table orders créée avec succès' as status,
    COUNT(*) as nombre_commandes
FROM public.orders;

-- 7. Voir les commandes créées
SELECT 
    id,
    patient_id,
    menu,
    meal_type,
    status,
    created_at
FROM public.orders 
ORDER BY created_at DESC
LIMIT 5;



