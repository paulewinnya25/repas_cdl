-- Script d'initialisation pour Supabase Cloud
-- Centre Diagnostic - Système de Gestion des Repas

-- Création des tables principales
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    room VARCHAR(100) NOT NULL,
    service VARCHAR(100) NOT NULL,
    diet VARCHAR(100) NOT NULL,
    allergies TEXT,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) NOT NULL,
    menu VARCHAR(255) NOT NULL,
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'En attente d''approbation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 1500.00,
    photo_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    menu_id UUID REFERENCES employee_menus(id),
    quantity INTEGER DEFAULT 1,
    accompaniments INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    delivery_location VARCHAR(255) DEFAULT 'Cuisine',
    special_instructions TEXT,
    status VARCHAR(50) DEFAULT 'Commandé',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    photo_url TEXT,
    dietary_restriction VARCHAR(100) DEFAULT 'Normal',
    meal_type VARCHAR(50) DEFAULT 'Déjeuner',
    day_of_week VARCHAR(20) DEFAULT 'Lundi',
    calories INTEGER,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    fiber_g DECIMAL(5,2),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des données de test
INSERT INTO patients (name, room, service, diet, allergies) VALUES
('Marie Dubois', 'Woleu', 'Médecine interne', 'Normal', 'Aucune'),
('Jean Martin', 'Ntem', 'Chirurgie', 'Sans sel', 'Allergique aux noix'),
('Sophie Laurent', 'Mpassa', 'Pédiatrie', 'Diabétique', 'Lactose');

INSERT INTO employee_menus (name, description, price) VALUES
('Plat du jour', 'Plat principal du jour avec accompagnement', 1500.00),
('Poulet rôti', 'Poulet rôti avec légumes', 1500.00),
('Poisson grillé', 'Poisson frais grillé avec riz', 1500.00),
('Salade composée', 'Salade fraîche avec protéines', 1500.00),
('Pâtes bolognaise', 'Pâtes avec sauce bolognaise', 1500.00);

INSERT INTO patient_menus (name, description, price, dietary_restriction, meal_type, calories) VALUES
('Soupe de légumes', 'Soupe légère aux légumes de saison', 800.00, 'Normal', 'Déjeuner', 120),
('Poulet vapeur', 'Poulet cuit à la vapeur avec légumes', 1200.00, 'Normal', 'Déjeuner', 350),
('Salade verte', 'Salade verte avec vinaigrette légère', 600.00, 'Hypocalorique', 'Déjeuner', 80),
('Poisson vapeur', 'Poisson blanc cuit à la vapeur', 1000.00, 'Sans sel', 'Déjeuner', 280);

INSERT INTO orders (patient_id, meal_type, menu, status) VALUES
((SELECT id FROM patients WHERE name = 'Marie Dubois'), 'Déjeuner', 'Poulet vapeur', 'En attente d''approbation'),
((SELECT id FROM patients WHERE name = 'Jean Martin'), 'Dîner', 'Poisson vapeur', 'En préparation');

INSERT INTO employee_orders (employee_id, employee_name, menu_id, quantity, accompaniments, total_price, status) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'Alice Dupont', (SELECT id FROM employee_menus WHERE name = 'Plat du jour'), 1, 1, 1500.00, 'Commandé'),
('550e8400-e29b-41d4-a716-446655440013', 'Bob Martin', (SELECT id FROM employee_menus WHERE name = 'Poulet rôti'), 1, 2, 2000.00, 'En préparation'),
('550e8400-e29b-41d4-a716-446655440014', 'Claire Durand', (SELECT id FROM employee_menus WHERE name = 'Salade composée'), 1, 1, 1500.00, 'Livré');

-- Activation de Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_menus ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (accès public pour le développement)
CREATE POLICY "Enable read access for all users" ON patients FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON patients FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON patients FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON employee_menus FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON employee_menus FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON employee_menus FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON employee_menus FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON employee_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON employee_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON employee_orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON employee_orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON patient_menus FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON patient_menus FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON patient_menus FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON patient_menus FOR DELETE USING (true);

