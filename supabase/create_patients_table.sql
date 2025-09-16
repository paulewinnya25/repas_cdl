-- Script pour créer la table patients avec des données de test
-- Exécutez ce script dans votre console Supabase

-- 1. Créer la table patients si elle n'existe pas
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

-- 2. Activer RLS pour patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques RLS pour patients
DROP POLICY IF EXISTS "Allow all access to authenticated users on patients" ON public.patients;
CREATE POLICY "Allow all access to authenticated users on patients"
ON public.patients FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Insérer des patients de test
INSERT INTO public.patients (name, room, service, diet, allergies, entry_date) VALUES
('Marie Dubois', '101', 'Cardiologie', 'Cardiaque', 'Aucune', '2024-01-15'),
('Jean Martin', '102', 'Diabétologie', 'Diabétique', 'Gluten', '2024-01-16'),
('Sophie Laurent', '103', 'Médecine interne', 'Normal', 'Aucune', '2024-01-17'),
('Pierre Durand', '104', 'Cardiologie', 'Sans sel', 'Aucune', '2024-01-18'),
('Claire Moreau', '105', 'Endocrinologie', 'Diabétique', 'Aucune', '2024-01-19'),
('Antoine Petit', '106', 'Gastro-entérologie', 'Sans gluten', 'Aucune', '2024-01-20'),
('Isabelle Roux', '107', 'Médecine interne', 'Végétarien', 'Aucune', '2024-01-21'),
('Michel Blanc', '108', 'Cardiologie', 'Hypocalorique', 'Aucune', '2024-01-22'),
('Nathalie Vert', '109', 'Neurologie', 'Liquide', 'Aucune', '2024-01-23'),
('Philippe Noir', '110', 'Médecine interne', 'Normal', 'Aucune', '2024-01-24')
ON CONFLICT DO NOTHING;

-- 5. Vérifier la création
SELECT 'Table patients créée avec succès' as status;
SELECT COUNT(*) as nombre_patients FROM public.patients;

-- 6. Afficher les patients créés
SELECT 
    id,
    name,
    room,
    service,
    diet,
    allergies,
    entry_date
FROM public.patients 
ORDER BY name;

-- 7. Vérifier la relation avec les commandes
SELECT 
    o.id as commande_id,
    o.menu,
    o.meal_type,
    o.status,
    p.name as patient_name,
    p.room as chambre
FROM public.orders o
LEFT JOIN public.patients p ON o.patient_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;






