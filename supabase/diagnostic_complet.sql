-- Script de diagnostic complet pour le portail infirmier
-- Exécutez ce script dans votre console Supabase pour identifier les problèmes

-- 1. Vérifier l'existence des tables
SELECT 
    'Tables existantes' as check_type,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'orders', 'employee_orders', 'employee_menus')
ORDER BY table_name;

-- 2. Vérifier la structure de la table patients
SELECT 
    'Structure patients' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier la structure de la table orders
SELECT 
    'Structure orders' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier les politiques RLS
SELECT 
    'Politiques RLS' as check_type,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('patients', 'orders')
ORDER BY tablename, policyname;

-- 5. Vérifier les données existantes
SELECT 
    'Données patients' as check_type,
    COUNT(*) as count,
    'patients' as table_name
FROM public.patients
UNION ALL
SELECT 
    'Données orders' as check_type,
    COUNT(*) as count,
    'orders' as table_name
FROM public.orders;

-- 6. Vérifier les permissions
SELECT 
    'Permissions' as check_type,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'orders')
ORDER BY table_name, grantee;

-- 7. Test de connexion
SELECT 
    'Test connexion' as check_type,
    current_user as current_user,
    session_user as session_user,
    'OK' as status;