-- Données de test pour Supabase local
-- Ce fichier sera exécuté automatiquement lors du reset

-- 1. Désactiver temporairement RLS
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

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

-- 2. Insérer des menus employés de test avec prix de base
INSERT INTO public.employee_menus (name, description, price, is_available) VALUES
('Plat du jour', 'Plat du jour avec accompagnement de base', 1500, true),
('Poulet rôti', 'Poulet rôti aux légumes avec riz', 1500, true),
('Poisson grillé', 'Poisson grillé avec légumes vapeur', 1500, true),
('Salade composée', 'Salade verte avec tomates et fromage', 1500, true),
('Pâtes carbonara', 'Pâtes avec sauce carbonara', 1500, true),
('Sandwich club', 'Sandwich avec poulet, bacon et légumes', 1500, true)
ON CONFLICT DO NOTHING;

-- 3. Insérer des commandes de test
INSERT INTO public.orders (patient_id, menu, meal_type, status, instructions) VALUES
((SELECT id FROM public.patients LIMIT 1), 'Poulet rôti aux légumes', 'Déjeuner', 'En attente d''approbation', 'Sans épices'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 1), 'Poisson grillé avec riz', 'Dîner', 'En attente d''approbation', 'Régime sans sel'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 2), 'Salade composée', 'Déjeuner', 'En préparation', 'Vinaigrette légère'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 3), 'Soupe de légumes', 'Dîner', 'Livré', 'Température tiède'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 4), 'Sandwich club', 'Déjeuner', 'Annulé', 'Patient sorti'),
((SELECT id FROM public.patients LIMIT 1), 'Pâtes carbonara', 'Dîner', 'En attente d''approbation', 'Sans fromage'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 1), 'Poisson grillé avec riz', 'Déjeuner', 'En préparation', 'Régime diabétique')
ON CONFLICT DO NOTHING;

-- 4. Insérer des profils de test
INSERT INTO public.profiles (id, first_name, last_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Paule', 'Winnya', 'Infirmier'),
('550e8400-e29b-41d4-a716-446655440011', 'Jean', 'Martin', 'Chef Cuisinier'),
('550e8400-e29b-41d4-a716-446655440012', 'Marie', 'Dubois', 'Employé'),
('550e8400-e29b-41d4-a716-446655440013', 'Pierre', 'Durand', 'Aide Cuisinier'),
('550e8400-e29b-41d4-a716-446655440014', 'Sophie', 'Laurent', 'Super Admin')
ON CONFLICT DO NOTHING;

-- 4.1. Ajouter une commande de test pour l'employé de test
INSERT INTO public.employee_orders (
    employee_id, 
    employee_name, 
    menu_id, 
    delivery_location, 
    quantity, 
    accompaniments,
    total_price, 
    status, 
    special_instructions
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440012',
    'Marie Dubois',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Cuisine',
    1,
    1,
    1500,
    'Commandé',
    'Commande de test pour démonstration'
);

-- 5. Créer des utilisateurs de test pour l'authentification
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440010',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'paule.winnya@centre-diagnostic.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Paule", "last_name": "Winnya"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'chef@centre-diagnostic.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jean", "last_name": "Martin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '550e8400-e29b-41d4-a716-446655440012',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'employe@centre-diagnostic.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Marie", "last_name": "Dubois"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

-- 6. Insérer des commandes employés de test (avec des UUIDs valides)
INSERT INTO public.employee_orders (employee_id, employee_name, menu_id, delivery_location, quantity, accompaniments, total_price, status, special_instructions) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Paule Winnya', (SELECT id FROM public.employee_menus LIMIT 1), 'Cuisine', 1, 1, 1500, 'Commandé', 'Sans épices'),
('550e8400-e29b-41d4-a716-446655440011', 'Jean Martin', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 1), 'Cuisine', 2, 2, 4000, 'En préparation', 'Régime sans sel'),
('550e8400-e29b-41d4-a716-446655440012', 'Marie Dubois', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 2), 'Cuisine', 1, 2, 2000, 'Livré', 'Vinaigrette légère'),
('550e8400-e29b-41d4-a716-446655440013', 'Pierre Durand', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 3), 'Cuisine', 3, 1, 4500, 'Commandé', 'Sans fromage'),
('550e8400-e29b-41d4-a716-446655440014', 'Sophie Laurent', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 4), 'Cuisine', 1, 1, 1500, 'Annulé', 'Patient sorti');

-- 7. Réactiver RLS avec des politiques permissives
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Créer des politiques permissives pour permettre l'accès
CREATE POLICY "Allow all operations for all users" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.employee_menus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.employee_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for all users" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
