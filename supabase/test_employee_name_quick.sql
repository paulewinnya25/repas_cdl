-- Script de test rapide pour vérifier la fonctionnalité nom employé
-- Exécutez ce script pour tester rapidement

-- 1. Vérifier si la colonne employee_name existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_orders' AND column_name='employee_name') 
        THEN 'Colonne employee_name existe ✅'
        ELSE 'Colonne employee_name manquante ❌'
    END as status;

-- 2. Si elle n'existe pas, l'ajouter rapidement
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_orders' AND column_name='employee_name') THEN
        ALTER TABLE public.employee_orders ADD COLUMN employee_name TEXT;
        RAISE NOTICE 'Colonne employee_name ajoutée ✅';
    ELSE
        RAISE NOTICE 'Colonne employee_name existe déjà ✅';
    END IF;
END $$;

-- 3. Tester une insertion avec nom
INSERT INTO public.employee_orders (
    employee_id, 
    employee_name, 
    menu_id, 
    delivery_location, 
    total_price, 
    status
) VALUES (
    'test-' || EXTRACT(EPOCH FROM NOW())::text,
    'Test Employé ' || EXTRACT(EPOCH FROM NOW())::text,
    'test-menu-id',
    'Bureau',
    2500,
    'Commandé'
) ON CONFLICT DO NOTHING;

-- 4. Vérifier la dernière insertion
SELECT 
    id,
    employee_id,
    employee_name,
    delivery_location,
    status,
    created_at
FROM public.employee_orders 
ORDER BY created_at DESC
LIMIT 1;

-- 5. Nettoyer le test (optionnel)
-- DELETE FROM public.employee_orders WHERE employee_id LIKE 'test-%';







