-- Script pour créer des données de test pour le portail cuisinier
-- Exécutez ce script si les tables sont vides

-- 1. Créer des commandes patients de test
INSERT INTO public.orders (patient_id, menu, meal_type, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Poulet rôti', 'Déjeuner', 'Commandé'),
('550e8400-e29b-41d4-a716-446655440002', 'Poisson grillé', 'Dîner', 'En préparation'),
('550e8400-e29b-41d4-a716-446655440003', 'Salade composée', 'Déjeuner', 'Commandé')
ON CONFLICT DO NOTHING;

-- 2. Créer des commandes employés de test
INSERT INTO public.employee_orders (employee_id, menu_id, delivery_location, status, total_price) VALUES
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', 'Bureau', 'Commandé', 2500),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440011', 'Salle de pause', 'En préparation', 3000),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440012', 'Bureau', 'Commandé', 1500)
ON CONFLICT DO NOTHING;

-- 3. Créer des menus employés de test
INSERT INTO public.employee_menus (id, name, description, price, is_available) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Poulet rôti', 'Poulet rôti aux légumes avec riz', 2500, true),
('550e8400-e29b-41d4-a716-446655440011', 'Poisson grillé', 'Poisson grillé avec légumes vapeur', 3000, true),
('550e8400-e29b-41d4-a716-446655440012', 'Salade composée', 'Salade verte avec tomates et fromage', 1500, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Vérifier les données créées
SELECT 'Commandes patients' as type, COUNT(*) as nombre FROM public.orders
UNION ALL
SELECT 'Commandes employés' as type, COUNT(*) as nombre FROM public.employee_orders
UNION ALL
SELECT 'Menus employés' as type, COUNT(*) as nombre FROM public.employee_menus;






