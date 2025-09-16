-- SCRIPT ULTRA-SIMPLE POUR CORRIGER LE PORTAIL INFIRMIER
-- Copiez et exécutez ce script COMPLET dans votre console Supabase

-- ÉTAPE 1: Créer la table patients
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

-- ÉTAPE 2: Créer la table orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    meal_type TEXT NOT NULL,
    menu TEXT NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- ÉTAPE 3: Activer RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4: Créer les politiques RLS
DROP POLICY IF EXISTS "Allow all access to authenticated users on patients" ON public.patients;
CREATE POLICY "Allow all access to authenticated users on patients"
ON public.patients FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to authenticated users on orders" ON public.orders;
CREATE POLICY "Allow all access to authenticated users on orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ÉTAPE 5: Insérer des données de test
INSERT INTO public.patients (name, room, service, diet, allergies, entry_date) VALUES
('Marie Dubois', 'Libreville', 'Cardiologie', 'Cardiaque', 'Aucune', '2024-01-15'),
('Jean Martin', 'Franceville', 'Diabétologie', 'Diabétique', 'Gluten', '2024-01-16'),
('Sophie Laurent', 'Port-Gentil', 'Médecine interne', 'Normal', 'Aucune', '2024-01-17')
ON CONFLICT DO NOTHING;

-- ÉTAPE 6: Vérifier
SELECT 'SUCCÈS: Tables créées' as result;
SELECT COUNT(*) as patients_count FROM public.patients;
SELECT COUNT(*) as orders_count FROM public.orders;






