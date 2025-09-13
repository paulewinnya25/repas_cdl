-- VÉRIFICATION IMMÉDIATE - Avez-vous exécuté le script ?
-- Copiez et exécutez ce script dans votre console Supabase

-- 1. Vérifier si la colonne quantity existe
SELECT 
    'VÉRIFICATION COLONNE QUANTITY' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employee_orders' 
            AND table_schema = 'public'
            AND column_name = 'quantity'
        ) THEN '✅ EXISTE'
        ELSE '❌ N''EXISTE PAS'
    END as status;

-- 2. Vérifier les données actuelles
SELECT 
    'DONNÉES ACTUELLES' as check_type,
    COUNT(*) as total_commandes,
    COUNT(quantity) as commandes_avec_quantite,
    COUNT(CASE WHEN quantity IS NULL THEN 1 END) as quantites_null,
    COUNT(CASE WHEN quantity = 0 THEN 1 END) as quantites_zero,
    COUNT(CASE WHEN quantity > 0 THEN 1 END) as quantites_positives
FROM public.employee_orders;

-- 3. Afficher quelques commandes avec leurs quantités
SELECT 
    'EXEMPLES DE COMMANDES' as check_type,
    employee_name,
    quantity,
    total_price,
    status,
    created_at
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 5;

-- 4. Si la colonne n'existe pas, la créer MAINTENANT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employee_orders' 
        AND table_schema = 'public'
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE public.employee_orders 
        ADD COLUMN quantity INTEGER DEFAULT 1 NOT NULL;
        RAISE NOTICE '🚨 COLONNE QUANTITY CRÉÉE MAINTENANT !';
    ELSE
        RAISE NOTICE '✅ COLONNE QUANTITY EXISTE DÉJÀ';
    END IF;
END $$;

-- 5. Corriger toutes les quantités NULL ou 0
UPDATE public.employee_orders 
SET quantity = 1 
WHERE quantity IS NULL OR quantity = 0;

-- 6. Calculer les quantités basées sur le prix
UPDATE public.employee_orders 
SET quantity = CASE 
    WHEN total_price >= 15000 THEN 3
    WHEN total_price >= 10000 THEN 2
    WHEN total_price >= 5000 THEN 1
    ELSE 1
END
WHERE total_price > 0;

-- 7. Vérifier après correction
SELECT 
    'APRÈS CORRECTION' as check_type,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 5;

-- 8. Statistiques finales
SELECT 
    'STATISTIQUES FINALES' as check_type,
    COUNT(*) as total_commandes,
    AVG(quantity) as moyenne_quantite,
    MIN(quantity) as min_quantite,
    MAX(quantity) as max_quantite
FROM public.employee_orders;



