-- CORRECTION IMMÉDIATE - Résoudre le problème des quantités
-- Copiez et exécutez ce script COMPLET dans votre console Supabase

-- 1. Créer la colonne quantity si elle n'existe pas
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
        RAISE NOTICE '✅ Colonne quantity créée';
    ELSE
        RAISE NOTICE '✅ Colonne quantity existe déjà';
    END IF;
END $$;

-- 2. Mettre à jour toutes les quantités NULL ou 0
UPDATE public.employee_orders 
SET quantity = 1 
WHERE quantity IS NULL OR quantity = 0;

-- 3. Calculer les quantités basées sur le prix
UPDATE public.employee_orders 
SET quantity = CASE 
    WHEN total_price >= 15000 THEN 3
    WHEN total_price >= 10000 THEN 2
    WHEN total_price >= 5000 THEN 1
    ELSE 1
END
WHERE total_price > 0;

-- 4. Insérer des commandes de test
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
    'test-1',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau',
    1,
    5000,
    'Commandé',
    'Test 1 plat'
),
(
    'test-2',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Salle',
    2,
    10000,
    'Commandé',
    'Test 2 plats'
),
(
    'test-3',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Réception',
    3,
    15000,
    'Commandé',
    'Test 3 plats'
)
ON CONFLICT DO NOTHING;

-- 5. Vérifier les résultats
SELECT 
    'RÉSULTATS' as check_type,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 10;

