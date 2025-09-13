-- CORRECTION IMMÉDIATE - COLONNE created_at MANQUANTE
-- Copiez et exécutez ce script COMPLET dans votre console Supabase

-- ÉTAPE 1: Vérifier la structure actuelle de la table orders
SELECT 'DIAGNOSTIC - Structure de la table orders' as etape;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ÉTAPE 2: Ajouter la colonne created_at si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND table_schema = 'public'
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
        RAISE NOTICE '✅ Colonne created_at ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne created_at existe déjà';
    END IF;
END $$;

-- ÉTAPE 3: Ajouter d'autres colonnes manquantes si nécessaire
DO $$
BEGIN
    -- Ajouter prepared_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND table_schema = 'public'
        AND column_name = 'prepared_at'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN prepared_at TIMESTAMPTZ;
        RAISE NOTICE '✅ Colonne prepared_at ajoutée';
    END IF;
    
    -- Ajouter delivered_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND table_schema = 'public'
        AND column_name = 'delivered_at'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN delivered_at TIMESTAMPTZ;
        RAISE NOTICE '✅ Colonne delivered_at ajoutée';
    END IF;
    
    -- Ajouter instructions si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND table_schema = 'public'
        AND column_name = 'instructions'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN instructions TEXT;
        RAISE NOTICE '✅ Colonne instructions ajoutée';
    END IF;
END $$;

-- ÉTAPE 4: Mettre à jour les valeurs created_at pour les enregistrements existants
UPDATE public.orders 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- ÉTAPE 5: Vérifier la nouvelle structure
SELECT 'NOUVELLE STRUCTURE - Vérification' as etape;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ÉTAPE 6: Insérer des commandes de test si la table est vide
DO $$
DECLARE
    order_count INTEGER;
    patient_id_1 UUID;
    patient_id_2 UUID;
    patient_id_3 UUID;
BEGIN
    -- Compter les commandes existantes
    SELECT COUNT(*) INTO order_count FROM public.orders;
    
    IF order_count = 0 THEN
        -- Récupérer les IDs des patients existants
        SELECT id INTO patient_id_1 FROM public.patients LIMIT 1 OFFSET 0;
        SELECT id INTO patient_id_2 FROM public.patients LIMIT 1 OFFSET 1;
        SELECT id INTO patient_id_3 FROM public.patients LIMIT 1 OFFSET 2;
        
        -- Insérer des commandes de test
        INSERT INTO public.orders (patient_id, menu, meal_type, status, instructions, created_at) VALUES
        (patient_id_1, 'Poulet rôti aux légumes', 'Déjeuner', 'En attente d''approbation', 'Sans épices', NOW()),
        (patient_id_2, 'Poisson grillé avec riz', 'Dîner', 'En attente d''approbation', 'Régime sans sel', NOW()),
        (patient_id_3, 'Salade composée', 'Déjeuner', 'En préparation', 'Vinaigrette légère', NOW()),
        (patient_id_1, 'Soupe de légumes', 'Dîner', 'Livré', 'Température tiède', NOW()),
        (patient_id_2, 'Sandwich au poulet', 'Déjeuner', 'Annulé', 'Patient sorti', NOW())
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Commandes de test insérées';
    ELSE
        RAISE NOTICE '✅ Commandes existantes trouvées: %', order_count;
    END IF;
END $$;

-- ÉTAPE 7: Test final - Vérifier que la requête fonctionne
SELECT 'TEST FINAL - Requête de test' as etape;
SELECT 
    o.id,
    o.patient_id,
    o.menu,
    o.meal_type,
    o.status,
    o.instructions,
    o.created_at,
    p.name as patient_name,
    p.room
FROM public.orders o
LEFT JOIN public.patients p ON o.patient_id = p.id
ORDER BY o.created_at DESC
LIMIT 5;

-- ÉTAPE 8: Confirmation finale
SELECT 'SUCCÈS - Correction terminée' as etape;
SELECT COUNT(*) as nombre_commandes FROM public.orders;


