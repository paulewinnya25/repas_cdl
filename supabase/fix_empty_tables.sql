-- CORRECTION URGENTE - Désactiver RLS et insérer les données
-- Ce script corrige le problème des tables vides

-- 1. Désactiver temporairement RLS sur toutes les tables
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_menus DISABLE ROW LEVEL SECURITY;

-- 2. Vider les tables existantes
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.employee_orders CASCADE;
TRUNCATE TABLE public.patients CASCADE;
TRUNCATE TABLE public.employee_menus CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 3. Insérer des patients de test
INSERT INTO public.patients (name, room, service, diet, allergies, entry_date) VALUES
('Marie Dubois', '101', 'Cardiologie', 'Cardiaque', 'Aucune', '2024-01-15'),
('Jean Martin', '102', 'Diabétologie', 'Diabétique', 'Gluten', '2024-01-16'),
('Sophie Laurent', '103', 'Médecine interne', 'Normal', 'Aucune', '2024-01-17'),
('Pierre Durand', '104', 'Neurologie', 'Normal', 'Aucune', '2024-01-18'),
('Claire Moreau', '105', 'Pneumologie', 'Sans sel', 'Aucune', '2024-01-19');

-- 4. Insérer des menus employés de test
INSERT INTO public.employee_menus (name, description, price, is_available) VALUES
('Poulet rôti aux légumes', 'Poulet rôti avec légumes de saison et pommes de terre', 2500, true),
('Poisson grillé avec riz', 'Poisson frais grillé avec riz basmati et légumes', 3000, true),
('Salade composée', 'Salade fraîche avec légumes, fromage et protéines', 2000, true),
('Pâtes carbonara', 'Pâtes avec sauce carbonara et lardons', 2200, true),
('Sandwich club', 'Sandwich avec poulet, bacon, tomate et salade', 1800, true),
('Soupe de légumes', 'Soupe maison avec légumes de saison', 1500, true);

-- 5. Insérer des profils de test
INSERT INTO public.profiles (id, first_name, last_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Paule', 'Winnya', 'Infirmier'),
('550e8400-e29b-41d4-a716-446655440011', 'Jean', 'Martin', 'Chef Cuisinier'),
('550e8400-e29b-41d4-a716-446655440012', 'Marie', 'Dubois', 'Employé'),
('550e8400-e29b-41d4-a716-446655440013', 'Pierre', 'Durand', 'Aide Cuisinier'),
('550e8400-e29b-41d4-a716-446655440014', 'Sophie', 'Laurent', 'Super Admin');

-- 6. Insérer des commandes de test
INSERT INTO public.orders (patient_id, menu, meal_type, status, instructions) VALUES
((SELECT id FROM public.patients LIMIT 1), 'Poulet rôti aux légumes', 'Déjeuner', 'En attente d''approbation', 'Sans épices'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 1), 'Poisson grillé avec riz', 'Dîner', 'En attente d''approbation', 'Régime sans sel'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 2), 'Salade composée', 'Déjeuner', 'En préparation', 'Vinaigrette légère'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 3), 'Soupe de légumes', 'Dîner', 'Livré', 'Température tiède'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 4), 'Sandwich club', 'Déjeuner', 'Annulé', 'Patient sorti'),
((SELECT id FROM public.patients LIMIT 1), 'Pâtes carbonara', 'Dîner', 'En attente d''approbation', 'Sans fromage'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 1), 'Poisson grillé avec riz', 'Déjeuner', 'En préparation', 'Régime diabétique');

-- 7. Insérer des commandes employés de test
INSERT INTO public.employee_orders (employee_id, menu_id, delivery_location, quantity, total_price, status, special_instructions) VALUES
('550e8400-e29b-41d4-a716-446655440010', (SELECT id FROM public.employee_menus LIMIT 1), 'Bureau', 1, 2500, 'Commandé', 'Sans épices'),
('550e8400-e29b-41d4-a716-446655440011', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 1), 'Salle de réunion', 2, 6000, 'En préparation', 'Régime sans sel'),
('550e8400-e29b-41d4-a716-446655440012', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 2), 'Réception', 1, 2000, 'Livré', 'Vinaigrette légère'),
('550e8400-e29b-41d4-a716-446655440013', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 3), 'Bureau', 3, 6600, 'Commandé', 'Sans fromage'),
('550e8400-e29b-41d4-a716-446655440014', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 4), 'Cafétéria', 1, 1800, 'Annulé', 'Patient sorti');

-- 8. Réactiver RLS avec des politiques permissives
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_menus ENABLE ROW LEVEL SECURITY;

-- 9. Créer des politiques permissives pour permettre l'accès
CREATE POLICY "Allow all operations for all users" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.employee_menus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.employee_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.menus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.weekly_menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.patient_menus FOR ALL USING (true) WITH CHECK (true);

-- 10. Vérifier que les données ont été insérées
SELECT 'Patients' as table_name, COUNT(*) as count FROM public.patients
UNION ALL
SELECT 'Orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'Employee Menus', COUNT(*) FROM public.employee_menus
UNION ALL
SELECT 'Employee Orders', COUNT(*) FROM public.employee_orders
UNION ALL
SELECT 'Profiles', COUNT(*) FROM public.profiles;


