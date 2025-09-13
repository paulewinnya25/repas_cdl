-- Script pour créer les tables nécessaires au portail infirmier
-- Exécutez ce script pour résoudre l'erreur 400

-- 1. Créer la table patients si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    room TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Activer RLS pour patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour patients
DROP POLICY IF EXISTS "Allow all access to authenticated users on patients" ON public.patients;
CREATE POLICY "Allow all access to authenticated users on patients"
ON public.patients FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Créer la table orders si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID,
    menu TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
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

-- 3. Insérer des patients de test
INSERT INTO public.patients (name, room) VALUES
('Marie Dubois', 'Chambre 101'),
('Jean Martin', 'Chambre 102'),
('Sophie Laurent', 'Chambre 103'),
('Pierre Durand', 'Chambre 104'),
('Claire Moreau', 'Chambre 105')
ON CONFLICT DO NOTHING;

-- 4. Insérer des commandes de test
INSERT INTO public.orders (patient_id, menu, meal_type, status) VALUES
((SELECT id FROM public.patients WHERE name = 'Marie Dubois' LIMIT 1), 'Poulet rôti', 'Déjeuner', 'En attente d''approbation'),
((SELECT id FROM public.patients WHERE name = 'Jean Martin' LIMIT 1), 'Poisson grillé', 'Dîner', 'Approuvé'),
((SELECT id FROM public.patients WHERE name = 'Sophie Laurent' LIMIT 1), 'Salade composée', 'Déjeuner', 'En attente d''approbation')
ON CONFLICT DO NOTHING;

-- 5. Vérifier la création
SELECT 'Tables créées avec succès' as status;
SELECT 'patients' as table_name, COUNT(*) as nombre_lignes FROM public.patients
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as nombre_lignes FROM public.orders;



