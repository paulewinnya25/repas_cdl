-- CORRECTION IMMÉDIATE - Créer toutes les tables manquantes
-- Ce script corrige le problème des tables 404

-- 1. Créer la table patients
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    room TEXT NOT NULL,
    service TEXT NOT NULL,
    diet TEXT NOT NULL,
    allergies TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    entry_date DATE NOT NULL,
    exit_date DATE
);

-- 2. Créer la table orders avec toutes les colonnes nécessaires
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL,
    menu TEXT NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- 3. Créer la table employee_menus
CREATE TABLE IF NOT EXISTS public.employee_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    price NUMERIC(10, 2) NOT NULL,
    preparation_time INTEGER DEFAULT 30,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Créer la table employee_orders
CREATE TABLE IF NOT EXISTS public.employee_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    menu_id UUID REFERENCES public.employee_menus(id),
    delivery_location TEXT NOT NULL,
    special_instructions TEXT,
    quantity INTEGER DEFAULT 1 NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Commandé' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- 5. Créer la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Créer la table menus
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    diet_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Créer la table weekly_menu_items
CREATE TABLE IF NOT EXISTS public.weekly_menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_id UUID REFERENCES public.menus(id),
    day_of_week TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Créer la table notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Créer la table patient_menus
CREATE TABLE IF NOT EXISTS public.patient_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    menu_id UUID REFERENCES public.menus(id),
    date DATE NOT NULL,
    meal_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Activer RLS sur toutes les tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_menus ENABLE ROW LEVEL SECURITY;

-- 11. Créer les politiques RLS basiques
CREATE POLICY "Enable read access for all users" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.patients FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.employee_menus FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.employee_menus FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.employee_menus FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.employee_menus FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.employee_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.employee_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.employee_orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.employee_orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.menus FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.menus FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.menus FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.weekly_menu_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.weekly_menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.weekly_menu_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.weekly_menu_items FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.notifications FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.patient_menus FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.patient_menus FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.patient_menus FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.patient_menus FOR DELETE USING (true);

-- 12. Insérer des données de test
INSERT INTO public.patients (name, room, service, diet, allergies, entry_date) VALUES
('Jean Dupont', '101', 'Cardiologie', 'Sans sel', 'Arachides', '2024-01-15'),
('Marie Martin', '205', 'Neurologie', 'Diabétique', NULL, '2024-01-16'),
('Pierre Durand', '302', 'Orthopédie', 'Normal', 'Gluten', '2024-01-17'),
('Sophie Laurent', '108', 'Pédiatrie', 'Végétarien', NULL, '2024-01-18'),
('Paul Winnya', '401', 'Chirurgie', 'Sans lactose', 'Œufs', '2024-01-19')
ON CONFLICT DO NOTHING;

INSERT INTO public.employee_menus (name, description, price, photo_url, is_available) VALUES
('Menu du Jour', 'Plat principal + dessert + boisson', 2500, '/images/menu-jour.jpg', true),
('Salade César', 'Salade fraîche avec poulet grillé', 2000, '/images/salade-cesar.jpg', true),
('Pizza Margherita', 'Pizza traditionnelle avec mozzarella', 3000, '/images/pizza-margherita.jpg', true),
('Poulet Rôti', 'Poulet rôti avec légumes de saison', 3500, '/images/poulet-roti.jpg', true),
('Pâtes Carbonara', 'Pâtes crémeuses avec lardons', 2800, '/images/pates-carbonara.jpg', true),
('Sandwich Club', 'Sandwich triple étage avec frites', 2200, '/images/sandwich-club.jpg', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.orders (patient_id, meal_type, menu, instructions, status) VALUES
((SELECT id FROM public.patients LIMIT 1), 'Déjeuner', 'Menu Cardiaque', 'Sans sel', 'En attente d''approbation'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 1), 'Dîner', 'Menu Diabétique', 'Portion réduite', 'En préparation'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 2), 'Petit-déjeuner', 'Menu Sans Gluten', 'Pain spécial', 'Livré'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 3), 'Déjeuner', 'Menu Végétarien', 'Bio préféré', 'En attente d''approbation'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 4), 'Dîner', 'Menu Sans Lactose', 'Sans fromage', 'En préparation'),
((SELECT id FROM public.patients LIMIT 1), 'Petit-déjeuner', 'Menu Cardiaque', 'Fruits frais', 'Livré'),
((SELECT id FROM public.patients LIMIT 1 OFFSET 2), 'Déjeuner', 'Menu Sans Gluten', 'Riz complet', 'Annulé')
ON CONFLICT DO NOTHING;

INSERT INTO public.employee_orders (employee_id, menu_id, delivery_location, quantity, total_price, status, special_instructions) VALUES
('550e8400-e29b-41d4-a716-446655440010', (SELECT id FROM public.employee_menus LIMIT 1), 'Bureau', 1, 2500, 'Commandé', 'Sans épices'),
('550e8400-e29b-41d4-a716-446655440011', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 1), 'Salle de réunion', 2, 4000, 'En préparation', 'Régime sans sel'),
('550e8400-e29b-41d4-a716-446655440012', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 2), 'Réception', 1, 3000, 'Livré', 'Vinaigrette légère'),
('550e8400-e29b-41d4-a716-446655440013', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 3), 'Bureau', 3, 10500, 'Commandé', 'Sans fromage'),
('550e8400-e29b-41d4-a716-446655440014', (SELECT id FROM public.employee_menus LIMIT 1 OFFSET 4), 'Cafétéria', 1, 2800, 'Annulé', 'Patient sorti')
ON CONFLICT DO NOTHING;

-- 13. Vérifier que les tables ont été créées
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;






