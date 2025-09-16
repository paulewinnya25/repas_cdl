-- VÉRIFICATION SIMPLE - Pourquoi les quantités ne s'affichent pas
-- Copiez et exécutez ce script dans votre console Supabase

-- 1. Vérifier si la colonne quantity existe
SELECT 
    'VÉRIFICATION COLONNE' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employee_orders' 
            AND table_schema = 'public'
            AND column_name = 'quantity'
        ) THEN '✅ EXISTE'
        ELSE '❌ N''EXISTE PAS'
    END as status;

-- 2. Voir les données actuelles
SELECT 
    'DONNÉES ACTUELLES' as check_type,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 5;

-- 3. Compter les quantités NULL
SELECT 
    'COMPTAGE' as check_type,
    COUNT(*) as total_commandes,
    COUNT(quantity) as commandes_avec_quantite,
    COUNT(CASE WHEN quantity IS NULL THEN 1 END) as quantites_null
FROM public.employee_orders;






