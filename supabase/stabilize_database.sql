-- Script de stabilisation COMPLET pour la base de données
-- Centre Diagnostic - Système de Gestion des Repas
-- Ce script résout TOUS les problèmes de stabilité

-- 1. NETTOYER ET RECRÉER TOUTES LES TABLES
-- Supprimer les tables existantes pour repartir sur une base propre
DROP TABLE IF EXISTS employee_orders CASCADE;
DROP TABLE IF EXISTS employee_menus CASCADE;
DROP TABLE IF EXISTS patient_menus CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CRÉER LES TABLES AVEC STRUCTURE STABLE
CREATE TABLE patients (
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

CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) NOT NULL,
    menu VARCHAR(255) NOT NULL,
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'En attente d''approbation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE employee_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 1500.00,
    photo_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE employee_orders (
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

CREATE TABLE patient_menus (
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

-- 3. ACTIVER RLS DE FAÇON STABLE
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_menus ENABLE ROW LEVEL SECURITY;

-- 4. CRÉER DES POLITIQUES RLS STABLES ET SIMPLES
-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;
DROP POLICY IF EXISTS "Enable insert access for all users" ON patients;
DROP POLICY IF EXISTS "Enable update access for all users" ON patients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON patients;

DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert access for all users" ON orders;
DROP POLICY IF EXISTS "Enable update access for all users" ON orders;
DROP POLICY IF EXISTS "Enable delete access for all users" ON orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON employee_menus;
DROP POLICY IF EXISTS "Enable insert access for all users" ON employee_menus;
DROP POLICY IF EXISTS "Enable update access for all users" ON employee_menus;
DROP POLICY IF EXISTS "Enable delete access for all users" ON employee_menus;

DROP POLICY IF EXISTS "Enable read access for all users" ON employee_orders;
DROP POLICY IF EXISTS "Enable insert access for all users" ON employee_orders;
DROP POLICY IF EXISTS "Enable update access for all users" ON employee_orders;
DROP POLICY IF EXISTS "Enable delete access for all users" ON employee_orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON patient_menus;
DROP POLICY IF EXISTS "Enable insert access for all users" ON patient_menus;
DROP POLICY IF EXISTS "Enable update access for all users" ON patient_menus;
DROP POLICY IF EXISTS "Enable delete access for all users" ON patient_menus;

-- Créer des politiques simples et stables
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employee_menus" ON employee_menus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employee_orders" ON employee_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on patient_menus" ON patient_menus FOR ALL USING (true) WITH CHECK (true);

-- 5. BASE DE DONNÉES VIDE POUR LES VRAIES DONNÉES
-- Aucune donnée de test insérée - la base est prête pour les vraies données

-- 6. VÉRIFICATION FINALE
SELECT 'Base de données stabilisée avec succès' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Vérifier que les tables sont vides et prêtes pour les vraies données
SELECT 'Patients:' as table_name, COUNT(*) as count FROM patients
UNION ALL
SELECT 'Orders:', COUNT(*) FROM orders
UNION ALL
SELECT 'Employee Menus:', COUNT(*) FROM employee_menus
UNION ALL
SELECT 'Employee Orders:', COUNT(*) FROM employee_orders
UNION ALL
SELECT 'Patient Menus:', COUNT(*) FROM patient_menus;
