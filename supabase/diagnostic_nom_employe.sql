-- Script de diagnostic rapide pour le nom de l'employé
-- Exécutez ce script dans votre console Supabase

-- 1. Vérifier si la colonne employee_name existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_orders' AND column_name='employee_name') 
        THEN '✅ Colonne employee_name existe'
        ELSE '❌ Colonne employee_name manquante'
    END as status_colonne;

-- 2. Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'employee_orders'
ORDER BY ordinal_position;

-- 3. Vérifier les données existantes
SELECT 
    COUNT(*) as total_commandes,
    COUNT(employee_name) as avec_nom,
    COUNT(*) - COUNT(employee_name) as sans_nom
FROM public.employee_orders;

-- 4. Voir les dernières commandes
SELECT 
    id,
    employee_id,
    employee_name,
    delivery_location,
    total_price,
    status,
    created_at
FROM public.employee_orders 
ORDER BY created_at DESC
LIMIT 5;



