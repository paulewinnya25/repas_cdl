-- Script pour ajouter des noms d'employés de test
-- Exécutez ce script pour avoir des noms d'employés dans les commandes

-- 1. Vérifier si la colonne employee_name existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_orders' AND column_name='employee_name') 
        THEN 'Colonne employee_name existe ✅'
        ELSE 'Colonne employee_name manquante ❌'
    END as status;

-- 2. Si elle n'existe pas, l'ajouter
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_orders' AND column_name='employee_name') THEN
        ALTER TABLE public.employee_orders ADD COLUMN employee_name TEXT;
        RAISE NOTICE 'Colonne employee_name ajoutée ✅';
    ELSE
        RAISE NOTICE 'Colonne employee_name existe déjà ✅';
    END IF;
END $$;

-- 3. Ajouter des noms d'employés de test
UPDATE public.employee_orders 
SET employee_name = CASE 
    WHEN employee_id = '550e8400-e29b-41d4-a716-446655440004' THEN 'Marie Dubois'
    WHEN employee_id = '550e8400-e29b-41d4-a716-446655440005' THEN 'Jean Martin'
    WHEN employee_id = '550e8400-e29b-41d4-a716-446655440006' THEN 'Sophie Laurent'
    WHEN employee_id = 'c8001584-1234-5678-9abc-def012345678' THEN 'Pierre Durand'
    WHEN employee_id = 'a1c76527-9876-5432-fedc-ba0987654321' THEN 'Claire Moreau'
    WHEN employee_id = '62376aae-1111-2222-3333-444444444444' THEN 'Thomas Bernard'
    ELSE 'Employé ' || SUBSTRING(employee_id::text, 1, 8)
END
WHERE employee_name IS NULL OR employee_name = '';

-- 4. Vérifier les commandes avec noms
SELECT 
    id,
    employee_id,
    employee_name,
    delivery_location,
    total_price,
    status,
    created_at
FROM public.employee_orders 
ORDER BY created_at DESC
LIMIT 10;

-- 5. Compter les commandes avec et sans noms
SELECT 
    CASE 
        WHEN employee_name IS NULL OR employee_name = '' THEN 'Sans nom'
        ELSE 'Avec nom'
    END as type,
    COUNT(*) as nombre
FROM public.employee_orders 
GROUP BY 
    CASE 
        WHEN employee_name IS NULL OR employee_name = '' THEN 'Sans nom'
        ELSE 'Avec nom'
    END;







