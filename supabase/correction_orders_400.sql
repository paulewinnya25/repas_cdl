-- CORRECTION IMMÉDIATE - ERREUR 400 TABLE ORDERS
-- Copiez et exécutez ce script COMPLET dans votre console Supabase

-- ÉTAPE 1: Vérifier l'état actuel
SELECT 'DIAGNOSTIC - État actuel' as etape;

-- Vérifier si la table orders existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders' AND table_schema='public') 
        THEN '✅ Table orders existe'
        ELSE '❌ Table orders manquante - CRÉATION NÉCESSAIRE'
    END as status_orders;

-- ÉTAPE 2: Créer la table orders si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.orders (
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

-- ÉTAPE 4: Créer les politiques RLS
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
        -- Supprimer la contrainte existante si elle existe
        ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS fk_orders_patient_id;
        -- Ajouter la nouvelle contrainte
        ALTER TABLE public.orders 
        ADD CONSTRAINT fk_orders_patient_id 
        FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Clé étrangère ajoutée vers patients';
    ELSE
        RAISE NOTICE '⚠️ Table patients non trouvée, clé étrangère non ajoutée';
    END IF;
END $$;

-- ÉTAPE 6: Insérer des commandes de test avec des IDs de patients réels
DO $$
DECLARE
    patient_id_1 UUID;
    patient_id_2 UUID;
    patient_id_3 UUID;
BEGIN
    -- Récupérer les IDs des patients existants
    SELECT id INTO patient_id_1 FROM public.patients LIMIT 1 OFFSET 0;
    SELECT id INTO patient_id_2 FROM public.patients LIMIT 1 OFFSET 1;
    SELECT id INTO patient_id_3 FROM public.patients LIMIT 1 OFFSET 2;
    
    -- Insérer des commandes de test
    INSERT INTO public.orders (patient_id, menu, meal_type, status, instructions) VALUES
    (patient_id_1, 'Poulet rôti aux légumes', 'Déjeuner', 'En attente d''approbation', 'Sans épices'),
    (patient_id_2, 'Poisson grillé avec riz', 'Dîner', 'En attente d''approbation', 'Régime sans sel'),
    (patient_id_3, 'Salade composée', 'Déjeuner', 'En préparation', 'Vinaigrette légère'),
    (patient_id_1, 'Soupe de légumes', 'Dîner', 'Livré', 'Température tiède'),
    (patient_id_2, 'Sandwich au poulet', 'Déjeuner', 'Annulé', 'Patient sorti')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Commandes de test insérées';
END $$;

-- ÉTAPE 7: Vérifier le résultat
SELECT 'SUCCÈS - Vérification finale' as etape;
SELECT COUNT(*) as nombre_commandes FROM public.orders;

-- Afficher les commandes créées avec les noms des patients
SELECT 
    o.id,
    p.name as patient_name,
    p.room,
    o.menu,
    o.meal_type,
    o.status,
    o.instructions,
    o.created_at
FROM public.orders o
LEFT JOIN public.patients p ON o.patient_id = p.id
ORDER BY o.created_at DESC;

-- ÉTAPE 8: Test des permissions
SELECT 'Test des permissions RLS' as test;
SELECT COUNT(*) as commandes_visibles FROM public.orders;

-- ÉTAPE 9: Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

