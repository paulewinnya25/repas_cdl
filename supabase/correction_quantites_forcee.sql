-- Script pour forcer la correction des quantités
-- Exécutez ce script dans votre console Supabase

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
        RAISE NOTICE 'Colonne quantity ajoutée';
    END IF;
END $$;

-- 2. Mettre à jour toutes les quantités NULL ou 0 à 1
UPDATE public.employee_orders 
SET quantity = 1 
WHERE quantity IS NULL OR quantity <= 0;

-- 3. Calculer la quantité basée sur le prix total et le prix unitaire
-- (Si le prix total est divisible par un prix unitaire standard)
UPDATE public.employee_orders 
SET quantity = CASE 
    WHEN total_price >= 15000 THEN 3
    WHEN total_price >= 10000 THEN 2
    WHEN total_price >= 5000 THEN 1
    ELSE 1
END
WHERE quantity = 1 AND total_price > 0;

-- 4. Insérer des commandes de test avec différentes quantités
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
    'test-employee-1',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau',
    1,
    5000,
    'Commandé',
    'Test 1 plat'
),
(
    'test-employee-2',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Salle de pause',
    2,
    10000,
    'Commandé',
    'Test 2 plats'
),
(
    'test-employee-3',
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
    'Résultats après correction' as check_type,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 10;

-- 6. Statistiques finales
SELECT 
    'Statistiques finales' as check_type,
    COUNT(*) as total_orders,
    COUNT(quantity) as orders_with_quantity,
    AVG(quantity) as average_quantity,
    MIN(quantity) as min_quantity,
    MAX(quantity) as max_quantity
FROM public.employee_orders;









