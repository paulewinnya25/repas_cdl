-- Script pour vérifier et corriger la table profiles
-- Exécutez ce script dans votre console Supabase

-- 1. Vérifier si la table profiles existe
SELECT 
    'Vérification table profiles' as check_type,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 2. Vérifier la structure de la table profiles
SELECT 
    'Structure profiles' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier les données existantes
SELECT 
    'Données profiles' as check_type,
    COUNT(*) as count,
    'profiles' as table_name
FROM public.profiles;

-- 4. Afficher quelques profils
SELECT 
    'Profils existants' as check_type,
    id,
    first_name,
    last_name,
    role
FROM public.profiles
LIMIT 10;

-- 5. Vérifier les relations avec employee_orders
SELECT 
    'Relations profiles-employee_orders' as check_type,
    eo.id,
    eo.employee_id,
    p.first_name,
    p.last_name,
    eo.employee_name,
    eo.status
FROM public.employee_orders eo
LEFT JOIN public.profiles p ON eo.employee_id = p.id
ORDER BY eo.created_at DESC
LIMIT 10;

-- 6. Mettre à jour les employee_orders avec les noms des profils
UPDATE public.employee_orders 
SET employee_name = CONCAT(p.first_name, ' ', p.last_name)
FROM public.profiles p
WHERE employee_orders.employee_id = p.id
AND (employee_orders.employee_name IS NULL OR employee_orders.employee_name = '');

-- 7. Vérifier les mises à jour
SELECT 
    'Mises à jour effectuées' as check_type,
    COUNT(*) as orders_with_names
FROM public.employee_orders 
WHERE employee_name IS NOT NULL AND employee_name != '';

-- 8. Test d'insertion d'un profil de test
INSERT INTO public.profiles (id, first_name, last_name, role) VALUES
('test-employee-profile-id', 'Test', 'Employé', 'Employé')
ON CONFLICT (id) DO UPDATE SET
first_name = EXCLUDED.first_name,
last_name = EXCLUDED.last_name,
role = EXCLUDED.role;

-- 9. Vérifier le test
SELECT 'Test profil créé' as result;
SELECT COUNT(*) as total_profiles FROM public.profiles;






