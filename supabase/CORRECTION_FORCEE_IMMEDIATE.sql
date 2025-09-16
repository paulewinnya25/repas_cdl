-- CORRECTION FORCÉE IMMÉDIATE - Résoudre le problème des quantités
-- Copiez et exécutez ce script COMPLET dans votre console Supabase

-- 1. Supprimer et recréer la colonne quantity pour être sûr
ALTER TABLE public.employee_orders DROP COLUMN IF EXISTS quantity;
ALTER TABLE public.employee_orders ADD COLUMN quantity INTEGER DEFAULT 1 NOT NULL;

-- 2. Mettre à jour toutes les quantités basées sur le prix
UPDATE public.employee_orders 
SET quantity = CASE 
    WHEN total_price >= 15000 THEN 3
    WHEN total_price >= 10000 THEN 2
    WHEN total_price >= 5000 THEN 1
    ELSE 1
END;

-- 3. Insérer des commandes de test avec quantités explicites
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
    'test-fix-1',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau Test',
    1,
    5000,
    'Commandé',
    'Test Fix 1 plat'
),
(
    'test-fix-2',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Salle Test',
    2,
    10000,
    'Commandé',
    'Test Fix 2 plats'
),
(
    'test-fix-3',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Réception Test',
    3,
    15000,
    'Commandé',
    'Test Fix 3 plats'
)
ON CONFLICT DO NOTHING;

-- 4. Vérifier les résultats
SELECT 
    'RÉSULTATS APRÈS CORRECTION FORCÉE' as check_type,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 10;

-- 5. Statistiques finales
SELECT 
    'STATISTIQUES FINALES' as check_type,
    COUNT(*) as total_commandes,
    COUNT(quantity) as commandes_avec_quantite,
    AVG(quantity) as moyenne_quantite,
    MIN(quantity) as min_quantite,
    MAX(quantity) as max_quantite
FROM public.employee_orders;






