-- Script pour vérifier et corriger la table employee_orders
-- Exécutez ce script dans votre console Supabase

-- 1. Vérifier la structure de la table employee_orders
SELECT 
    'Structure employee_orders' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'employee_orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les données existantes
SELECT 
    'Données employee_orders' as check_type,
    COUNT(*) as count,
    'employee_orders' as table_name
FROM public.employee_orders;

-- 3. Vérifier les données avec les menus
SELECT 
    'Commandes avec menus' as check_type,
    eo.id,
    eo.employee_name,
    eo.quantity,
    eo.total_price,
    eo.status,
    em.name as menu_name,
    em.price as menu_price
FROM public.employee_orders eo
LEFT JOIN public.employee_menus em ON eo.menu_id = em.id
ORDER BY eo.created_at DESC
LIMIT 10;

-- 4. Vérifier les politiques RLS
SELECT 
    'Politiques RLS employee_orders' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'employee_orders';

-- 5. Test d'insertion avec toutes les colonnes
INSERT INTO public.employee_orders (
    employee_id,
    menu_id,
    delivery_location,
    special_instructions,
    quantity,
    total_price,
    status,
    employee_name
) VALUES (
    'test-employee-id',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau',
    'Test commande',
    2,
    5000,
    'Commandé',
    'Test Employé'
) ON CONFLICT DO NOTHING;

-- 6. Vérifier l'insertion
SELECT 'Test insertion réussi' as result;
SELECT COUNT(*) as total_orders FROM public.employee_orders;







