-- Script de diagnostic pour les quantités dans employee_orders
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

-- 2. Vérifier les données existantes avec focus sur quantity
SELECT 
    'Données employee_orders avec quantity' as check_type,
    id,
    employee_id,
    employee_name,
    quantity,
    total_price,
    status,
    created_at
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 10;

-- 3. Vérifier spécifiquement les valeurs de quantity
SELECT 
    'Vérification quantity' as check_type,
    quantity,
    COUNT(*) as count,
    CASE 
        WHEN quantity IS NULL THEN 'NULL'
        WHEN quantity = 0 THEN 'ZERO'
        WHEN quantity > 0 THEN 'POSITIF'
        ELSE 'AUTRE'
    END as status_quantity
FROM public.employee_orders
GROUP BY quantity
ORDER BY quantity;

-- 4. Vérifier si la colonne quantity existe
SELECT 
    'Existence colonne quantity' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employee_orders' 
            AND table_schema = 'public'
            AND column_name = 'quantity'
        ) THEN 'EXISTE'
        ELSE 'N''EXISTE PAS'
    END as status;

-- 5. Si la colonne n'existe pas, la créer
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
        RAISE NOTICE 'Colonne quantity ajoutée avec valeur par défaut 1';
    ELSE
        RAISE NOTICE 'Colonne quantity existe déjà';
    END IF;
END $$;

-- 6. Mettre à jour les valeurs NULL ou 0
UPDATE public.employee_orders 
SET quantity = 1 
WHERE quantity IS NULL OR quantity = 0;

-- 7. Vérifier les mises à jour
SELECT 
    'Après mise à jour' as check_type,
    COUNT(*) as total_orders,
    COUNT(quantity) as orders_with_quantity,
    AVG(quantity) as average_quantity,
    MIN(quantity) as min_quantity,
    MAX(quantity) as max_quantity
FROM public.employee_orders;

-- 8. Test d'insertion avec quantity explicite
INSERT INTO public.employee_orders (
    employee_id,
    menu_id,
    delivery_location,
    quantity,
    total_price,
    status,
    employee_name
) VALUES (
    'test-employee-quantity-' || EXTRACT(EPOCH FROM NOW()),
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau',
    3,
    15000,
    'Commandé',
    'Test Quantité 3'
) ON CONFLICT DO NOTHING;

-- 9. Vérifier le test
SELECT 
    'Test insertion' as check_type,
    id,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders 
WHERE employee_name LIKE 'Test Quantité%'
ORDER BY created_at DESC
LIMIT 5;

-- 10. Afficher toutes les commandes avec leurs quantités
SELECT 
    'Toutes les commandes' as check_type,
    id,
    employee_name,
    quantity,
    total_price,
    status,
    created_at
FROM public.employee_orders
ORDER BY created_at DESC;






