-- SCRIPT ULTRA-SIMPLE POUR CORRIGER LES QUANTITÉS
-- Copiez et exécutez ce script COMPLET dans votre console Supabase

-- 1. Vérifier si la colonne quantity existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employee_orders' 
            AND table_schema = 'public'
            AND column_name = 'quantity'
        ) THEN 'EXISTE'
        ELSE 'N''EXISTE PAS'
    END as status_quantity;

-- 2. Si elle n'existe pas, la créer
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
        RAISE NOTICE '✅ Colonne quantity créée avec succès';
    ELSE
        RAISE NOTICE '✅ Colonne quantity existe déjà';
    END IF;
END $$;

-- 3. Vérifier les données actuelles
SELECT 
    'AVANT CORRECTION' as etape,
    id,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 5;

-- 4. Corriger toutes les quantités NULL ou 0
UPDATE public.employee_orders 
SET quantity = 1 
WHERE quantity IS NULL OR quantity = 0;

-- 5. Calculer les quantités basées sur le prix
UPDATE public.employee_orders 
SET quantity = CASE 
    WHEN total_price >= 15000 THEN 3
    WHEN total_price >= 10000 THEN 2
    WHEN total_price >= 5000 THEN 1
    ELSE 1
END
WHERE total_price > 0;

-- 6. Vérifier les données après correction
SELECT 
    'APRÈS CORRECTION' as etape,
    id,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 5;

-- 7. Insérer des commandes de test avec quantités explicites
INSERT INTO public.employee_orders (
    employee_id,
    menu_id,
    delivery_location,
    quantity,
    total_price,
    status,
    employee_name
) VALUES 
(
    'test-quantity-1',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau Test',
    1,
    5000,
    'Commandé',
    'Test 1 plat'
),
(
    'test-quantity-2',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Salle Test',
    2,
    10000,
    'Commandé',
    'Test 2 plats'
),
(
    'test-quantity-3',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Réception Test',
    3,
    15000,
    'Commandé',
    'Test 3 plats'
)
ON CONFLICT DO NOTHING;

-- 8. Vérifier les commandes de test
SELECT 
    'COMMANDES DE TEST' as etape,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
WHERE employee_name LIKE 'Test%'
ORDER BY created_at DESC;

-- 9. Statistiques finales
SELECT 
    'STATISTIQUES FINALES' as etape,
    COUNT(*) as total_commandes,
    COUNT(quantity) as commandes_avec_quantite,
    AVG(quantity) as moyenne_quantite,
    MIN(quantity) as min_quantite,
    MAX(quantity) as max_quantite
FROM public.employee_orders;

-- 10. Afficher toutes les commandes avec quantités
SELECT 
    'TOUTES LES COMMANDES' as etape,
    employee_name,
    quantity,
    total_price,
    status,
    created_at
FROM public.employee_orders
ORDER BY created_at DESC;









