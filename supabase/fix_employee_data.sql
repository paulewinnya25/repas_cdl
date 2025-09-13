-- CORRECTION URGENTE - Vérifier et corriger les données
-- Ce script vérifie que toutes les données sont présentes

-- 1. Vérifier les données existantes
SELECT 'Patients' as table_name, COUNT(*) as count FROM public.patients;
SELECT 'Employee Menus' as table_name, COUNT(*) as count FROM public.employee_menus;
SELECT 'Employee Orders' as table_name, COUNT(*) as count FROM public.employee_orders;
SELECT 'Profiles' as table_name, COUNT(*) as count FROM public.profiles;

-- 2. Vérifier que l'UUID de test existe dans profiles
SELECT id, first_name, last_name, role 
FROM public.profiles 
WHERE id = '550e8400-e29b-41d4-a716-446655440012';

-- 3. Si l'UUID n'existe pas, l'ajouter
INSERT INTO public.profiles (id, first_name, last_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'Marie', 'Dubois', 'Employé')
ON CONFLICT (id) DO NOTHING;

-- 4. Vérifier les commandes employés existantes
SELECT 
    id,
    employee_id,
    employee_name,
    delivery_location,
    quantity,
    total_price,
    status,
    created_at
FROM public.employee_orders 
WHERE employee_id = '550e8400-e29b-41d4-a716-446655440012'
ORDER BY created_at DESC;

-- 5. Si aucune commande n'existe pour cet employé, en ajouter une de test
INSERT INTO public.employee_orders (
    employee_id, 
    employee_name, 
    menu_id, 
    delivery_location, 
    quantity, 
    total_price, 
    status, 
    special_instructions
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440012',
    'Marie Dubois',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau',
    1,
    2500,
    'Commandé',
    'Commande de test'
)
ON CONFLICT DO NOTHING;

-- 6. Vérifier que la commande a été ajoutée
SELECT 
    id,
    employee_id,
    employee_name,
    delivery_location,
    quantity,
    total_price,
    status,
    created_at
FROM public.employee_orders 
WHERE employee_id = '550e8400-e29b-41d4-a716-446655440012'
ORDER BY created_at DESC;


