-- Script de diagnostic complet pour le portail cuisinier
-- Exécutez ce script pour vérifier toutes les tables

-- 1. Vérifier l'existence de toutes les tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'employee_orders', 'patients', 'employee_menus')
ORDER BY table_name;

-- 2. Vérifier la structure de la table orders
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 3. Vérifier la structure de la table employee_orders
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'employee_orders'
ORDER BY ordinal_position;

-- 4. Compter les commandes patients
SELECT COUNT(*) as nombre_commandes_patients FROM public.orders;

-- 5. Compter les commandes employés
SELECT COUNT(*) as nombre_commandes_employes FROM public.employee_orders;

-- 6. Voir les dernières commandes patients
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

-- 7. Voir les dernières commandes employés
SELECT 
    id,
    employee_id,
    menu_id,
    delivery_location,
    status,
    created_at
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 5;

-- 8. Vérifier les politiques RLS pour orders
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- 9. Vérifier les politiques RLS pour employee_orders
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'employee_orders'
ORDER BY policyname;


