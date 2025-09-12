-- VÉRIFICATION ULTRA-SIMPLE - État actuel de la base de données
-- Copiez et exécutez ce script dans votre console Supabase

-- 1. Vérifier si la colonne quantity existe
SELECT 
    'COLONNE QUANTITY' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employee_orders' 
            AND table_schema = 'public'
            AND column_name = 'quantity'
        ) THEN 'EXISTE'
        ELSE 'N''EXISTE PAS'
    END as status;

-- 2. Voir la structure de la table employee_orders
SELECT 
    'STRUCTURE TABLE' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'employee_orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Voir les données actuelles
SELECT 
    'DONNÉES ACTUELLES' as check_type,
    id,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 5;

-- 4. Compter les quantités NULL
SELECT 
    'COMPTAGE QUANTITÉS' as check_type,
    COUNT(*) as total_commandes,
    COUNT(quantity) as commandes_avec_quantite,
    COUNT(CASE WHEN quantity IS NULL THEN 1 END) as quantites_null,
    COUNT(CASE WHEN quantity = 0 THEN 1 END) as quantites_zero,
    COUNT(CASE WHEN quantity > 0 THEN 1 END) as quantites_positives
FROM public.employee_orders;


