-- Script pour vérifier si la colonne employee_name existe
-- Exécutez ce script pour diagnostiquer le problème

-- 1. Vérifier si la colonne employee_name existe
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'employee_orders' 
AND column_name = 'employee_name';

-- 2. Si la colonne n'existe pas, l'ajouter
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_orders' AND column_name='employee_name') THEN
        ALTER TABLE public.employee_orders ADD COLUMN employee_name TEXT;
        RAISE NOTICE 'Colonne employee_name ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne employee_name existe déjà';
    END IF;
END $$;

-- 3. Vérifier la structure complète de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'employee_orders'
ORDER BY ordinal_position;

-- 4. Tester une insertion avec employee_name
INSERT INTO public.employee_orders (
    employee_id, 
    employee_name, 
    menu_id, 
    delivery_location, 
    total_price, 
    status
) VALUES (
    'test-employee-id',
    'Test Employé',
    'test-menu-id',
    'Bureau',
    2500,
    'Commandé'
) ON CONFLICT DO NOTHING;

-- 5. Vérifier l'insertion
SELECT 
    id,
    employee_id,
    employee_name,
    delivery_location,
    status,
    created_at
FROM public.employee_orders 
WHERE employee_name = 'Test Employé'
ORDER BY created_at DESC
LIMIT 1;







