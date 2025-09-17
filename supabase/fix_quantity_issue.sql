-- Script pour diagnostiquer et corriger le problème des quantités
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

-- 3. Vérifier si la colonne quantity existe et a des valeurs NULL
SELECT 
    'Vérification quantity NULL' as check_type,
    COUNT(*) as total_orders,
    COUNT(quantity) as orders_with_quantity,
    COUNT(*) - COUNT(quantity) as orders_with_null_quantity
FROM public.employee_orders;

-- 4. Si la colonne quantity n'existe pas, la créer
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

-- 5. Mettre à jour les enregistrements avec quantity NULL ou 0
UPDATE public.employee_orders 
SET quantity = 1 
WHERE quantity IS NULL OR quantity = 0;

-- 6. Vérifier les mises à jour
SELECT 
    'Mises à jour quantity' as check_type,
    COUNT(*) as total_orders,
    COUNT(quantity) as orders_with_quantity,
    AVG(quantity) as average_quantity,
    MIN(quantity) as min_quantity,
    MAX(quantity) as max_quantity
FROM public.employee_orders;

-- 7. Test d'insertion avec quantity
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
    'test-employee-quantity',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau',
    'Test quantité',
    3,
    15000,
    'Commandé',
    'Test Quantité'
) ON CONFLICT DO NOTHING;

-- 8. Vérifier le test
SELECT 
    'Test insertion quantité' as check_type,
    id,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders 
WHERE employee_name = 'Test Quantité';

-- 9. Afficher toutes les commandes avec leurs quantités
SELECT 
    'Toutes les commandes avec quantités' as check_type,
    id,
    employee_name,
    quantity,
    total_price,
    status,
    created_at
FROM public.employee_orders
ORDER BY created_at DESC;









