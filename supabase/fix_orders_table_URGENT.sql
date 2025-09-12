-- SCRIPT URGENT POUR CORRIGER L'ERREUR 400 - TABLE ORDERS
-- Copiez et exécutez ce script COMPLET dans votre console Supabase SQL Editor

-- ÉTAPE 1: Supprimer la table orders si elle existe (pour repartir à zéro)
DROP TABLE IF EXISTS public.orders CASCADE;

-- ÉTAPE 2: Créer la table orders avec la structure correcte
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID,
    meal_type TEXT NOT NULL,
    menu TEXT NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- ÉTAPE 3: Activer RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4: Créer les politiques RLS pour permettre l'accès aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Allow all access to authenticated users on orders" ON public.orders;
CREATE POLICY "Allow all access to authenticated users on orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ÉTAPE 5: Créer une clé étrangère vers patients (si la table patients existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients' AND table_schema = 'public') THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT fk_orders_patient_id 
        FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère ajoutée vers patients';
    ELSE
        RAISE NOTICE 'Table patients non trouvée, clé étrangère non ajoutée';
    END IF;
END $$;

-- ÉTAPE 6: Insérer des commandes de test
INSERT INTO public.orders (patient_id, menu, meal_type, status, instructions) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Poulet rôti aux légumes', 'Déjeuner', 'En attente d''approbation', 'Sans épices'),
('550e8400-e29b-41d4-a716-446655440002', 'Poisson grillé avec riz', 'Dîner', 'En attente d''approbation', 'Régime sans sel'),
('550e8400-e29b-41d4-a716-446655440003', 'Salade composée', 'Déjeuner', 'En préparation', 'Vinaigrette légère'),
('550e8400-e29b-41d4-a716-446655440004', 'Soupe de légumes', 'Dîner', 'Livré', 'Température tiède'),
('550e8400-e29b-41d4-a716-446655440005', 'Sandwich au poulet', 'Déjeuner', 'Annulé', 'Patient sorti')
ON CONFLICT DO NOTHING;

-- ÉTAPE 7: Vérifier que tout fonctionne
SELECT 'SUCCÈS: Table orders créée et configurée' as status;
SELECT COUNT(*) as nombre_commandes FROM public.orders;

-- Afficher les commandes créées
SELECT 
    id,
    patient_id,
    menu,
    meal_type,
    status,
    instructions,
    created_at
FROM public.orders 
ORDER BY created_at DESC;

-- ÉTAPE 8: Tester les permissions
SELECT 'Test des permissions RLS' as test;
SELECT COUNT(*) as commandes_visibles FROM public.orders;

