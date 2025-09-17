-- SCRIPT DE DIAGNOSTIC POUR VÉRIFIER L'ÉTAT DE LA BASE DE DONNÉES
-- Exécutez ce script pour diagnostiquer les problèmes

-- 1. Vérifier toutes les tables existantes
SELECT 'TABLES EXISTANTES:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Vérifier si la table orders existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders' AND table_schema='public') 
        THEN '✅ Table orders existe'
        ELSE '❌ Table orders manquante'
    END as status_orders;

-- 3. Vérifier si la table patients existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='patients' AND table_schema='public') 
        THEN '✅ Table patients existe'
        ELSE '❌ Table patients manquante'
    END as status_patients;

-- 4. Si la table orders existe, vérifier sa structure
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders' AND table_schema='public') THEN
        RAISE NOTICE 'Structure de la table orders:';
        FOR rec IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND table_schema = 'public'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'Colonne: %, Type: %, Nullable: %, Default: %', 
                rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
        END LOOP;
    ELSE
        RAISE NOTICE 'Table orders n''existe pas';
    END IF;
END $$;

-- 5. Vérifier les politiques RLS sur orders
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND schemaname='public') 
        THEN '✅ Politiques RLS existent sur orders'
        ELSE '❌ Aucune politique RLS sur orders'
    END as status_rls;

-- 6. Compter les patients existants
DO $$
DECLARE
    patient_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='patients' AND table_schema='public') THEN
        SELECT COUNT(*) INTO patient_count FROM public.patients;
        RAISE NOTICE 'Nombre de patients: %', patient_count;
    ELSE
        RAISE NOTICE 'Table patients n''existe pas';
    END IF;
END $$;

-- 7. Compter les commandes existantes
DO $$
DECLARE
    order_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders' AND table_schema='public') THEN
        SELECT COUNT(*) INTO order_count FROM public.orders;
        RAISE NOTICE 'Nombre de commandes: %', order_count;
    ELSE
        RAISE NOTICE 'Table orders n''existe pas';
    END IF;
END $$;








