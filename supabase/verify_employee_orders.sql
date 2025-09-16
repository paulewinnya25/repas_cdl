-- VÉRIFICATION FINALE - Commandes employés
-- Ce script vérifie que les commandes employés sont bien présentes

-- 1. Compter toutes les commandes employés
SELECT 'Total Employee Orders' as description, COUNT(*) as count FROM public.employee_orders;

-- 2. Afficher toutes les commandes employés avec détails
SELECT 
    id,
    employee_id,
    employee_name,
    delivery_location,
    quantity,
    total_price,
    status,
    special_instructions,
    created_at
FROM public.employee_orders 
ORDER BY created_at DESC;

-- 3. Vérifier les menus employés disponibles
SELECT 'Available Employee Menus' as description, COUNT(*) as count 
FROM public.employee_menus 
WHERE is_available = true;

-- 4. Afficher les menus disponibles
SELECT id, name, description, price, is_available 
FROM public.employee_menus 
WHERE is_available = true
ORDER BY name;

-- 5. Vérifier les politiques RLS sur employee_orders
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'employee_orders' 
AND schemaname = 'public';





