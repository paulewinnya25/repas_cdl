-- VÉRIFICATION DES DONNÉES - Script de diagnostic
-- Ce script vérifie que les données sont bien présentes dans la base

-- 1. Vérifier les patients
SELECT 'Patients' as table_name, COUNT(*) as count FROM public.patients;

-- 2. Vérifier les menus employés
SELECT 'Employee Menus' as table_name, COUNT(*) as count FROM public.employee_menus;

-- 3. Vérifier les commandes patients
SELECT 'Patient Orders' as table_name, COUNT(*) as count FROM public.orders;

-- 4. Vérifier les commandes employés
SELECT 'Employee Orders' as table_name, COUNT(*) as count FROM public.employee_orders;

-- 5. Vérifier les profils
SELECT 'Profiles' as table_name, COUNT(*) as count FROM public.profiles;

-- 6. Afficher quelques commandes employés avec détails
SELECT 
    eo.id,
    eo.employee_name,
    eo.delivery_location,
    eo.quantity,
    eo.total_price,
    eo.status,
    em.name as menu_name,
    p.first_name,
    p.last_name
FROM public.employee_orders eo
LEFT JOIN public.employee_menus em ON eo.menu_id = em.id
LEFT JOIN public.profiles p ON eo.employee_id = p.id
ORDER BY eo.created_at DESC
LIMIT 5;

-- 7. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;








