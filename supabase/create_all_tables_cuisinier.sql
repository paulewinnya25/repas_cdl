-- Script pour créer toutes les tables nécessaires au portail cuisinier
-- Exécutez ce script si les tables n'existent pas

-- 1. Créer la table orders si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID,
    menu TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    status TEXT DEFAULT 'Commandé' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Activer RLS pour orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour orders
DROP POLICY IF EXISTS "Allow all access to authenticated users on orders" ON public.orders;
CREATE POLICY "Allow all access to authenticated users on orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Créer la table employee_orders si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.employee_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    menu_id UUID,
    delivery_location TEXT NOT NULL,
    special_instructions TEXT,
    quantity INTEGER DEFAULT 1 NOT NULL,
    status TEXT DEFAULT 'Commandé' NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Activer RLS pour employee_orders
ALTER TABLE public.employee_orders ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour employee_orders
DROP POLICY IF EXISTS "Allow all access to authenticated users on employee_orders" ON public.employee_orders;
CREATE POLICY "Allow all access to authenticated users on employee_orders"
ON public.employee_orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Créer la table employee_menus si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.employee_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    price NUMERIC(10, 2) NOT NULL,
    preparation_time INTEGER DEFAULT 30 NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Activer RLS pour employee_menus
ALTER TABLE public.employee_menus ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour employee_menus
DROP POLICY IF EXISTS "Allow all access to authenticated users on employee_menus" ON public.employee_menus;
CREATE POLICY "Allow all access to authenticated users on employee_menus"
ON public.employee_menus FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Insérer des données de test
-- Menus employés
INSERT INTO public.employee_menus (name, description, price, is_available) VALUES
('Poulet rôti', 'Poulet rôti aux légumes avec riz', 2500, true),
('Poisson grillé', 'Poisson grillé avec légumes vapeur', 3000, true),
('Salade composée', 'Salade verte avec tomates et fromage', 1500, true),
('Pâtes carbonara', 'Pâtes avec sauce carbonara', 2000, true),
('Sandwich club', 'Sandwich avec poulet, bacon et légumes', 1800, true)
ON CONFLICT DO NOTHING;

-- Commandes patients de test
INSERT INTO public.orders (patient_id, menu, meal_type, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Poulet rôti', 'Déjeuner', 'Commandé'),
('550e8400-e29b-41d4-a716-446655440002', 'Poisson grillé', 'Dîner', 'En préparation'),
('550e8400-e29b-41d4-a716-446655440003', 'Salade composée', 'Déjeuner', 'Commandé')
ON CONFLICT DO NOTHING;

-- Commandes employés de test
INSERT INTO public.employee_orders (employee_id, menu_id, delivery_location, status, total_price) VALUES
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM public.employee_menus WHERE name = 'Poulet rôti' LIMIT 1), 'Bureau', 'Commandé', 2500),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM public.employee_menus WHERE name = 'Poisson grillé' LIMIT 1), 'Salle de pause', 'En préparation', 3000),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM public.employee_menus WHERE name = 'Salade composée' LIMIT 1), 'Bureau', 'Commandé', 1500)
ON CONFLICT DO NOTHING;

-- 5. Vérifier la création
SELECT 'Tables créées avec succès' as status;
SELECT 'orders' as table_name, COUNT(*) as nombre_lignes FROM public.orders
UNION ALL
SELECT 'employee_orders' as table_name, COUNT(*) as nombre_lignes FROM public.employee_orders
UNION ALL
SELECT 'employee_menus' as table_name, COUNT(*) as nombre_lignes FROM public.employee_menus;







