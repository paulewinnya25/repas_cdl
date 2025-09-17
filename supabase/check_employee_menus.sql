-- Script pour vérifier la table employee_menus
-- Exécutez ce script pour diagnostiquer le problème

-- 1. Vérifier si la table existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'employee_menus';

-- 2. Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'employee_menus'
ORDER BY ordinal_position;

-- 3. Compter les menus
SELECT COUNT(*) as nombre_menus FROM public.employee_menus;

-- 4. Voir les menus disponibles
SELECT 
    id,
    name,
    description,
    price,
    is_available,
    created_at
FROM public.employee_menus
ORDER BY created_at DESC;

-- 5. Si la table est vide, créer des menus de test
INSERT INTO public.employee_menus (name, description, price, is_available) VALUES
('Poulet rôti', 'Poulet rôti aux légumes avec riz', 2500, true),
('Poisson grillé', 'Poisson grillé avec légumes vapeur', 3000, true),
('Salade composée', 'Salade verte avec tomates et fromage', 1500, true),
('Pâtes carbonara', 'Pâtes avec sauce carbonara', 2000, true),
('Sandwich club', 'Sandwich avec poulet, bacon et légumes', 1800, true)
ON CONFLICT DO NOTHING;

-- 6. Vérifier les politiques RLS
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'employee_menus'
ORDER BY policyname;









