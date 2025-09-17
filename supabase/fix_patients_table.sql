-- Script pour corriger la table patients et permettre la création
-- Exécutez ce script dans votre console Supabase

-- 1. Vérifier et créer la table patients si nécessaire
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

-- 4. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Insérer des patients de test si la table est vide
DO $$
DECLARE
    patient_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO patient_count FROM public.patients;
    
    IF patient_count = 0 THEN
        INSERT INTO public.patients (name, room, service, diet, allergies, entry_date) VALUES
        ('Marie Dubois', 'Libreville', 'Cardiologie', 'Cardiaque', 'Aucune', '2024-01-15'),
        ('Jean Martin', 'Franceville', 'Diabétologie', 'Diabétique', 'Gluten', '2024-01-16'),
        ('Sophie Laurent', 'Port-Gentil', 'Médecine interne', 'Normal', 'Aucune', '2024-01-17'),
        ('Pierre Durand', 'WOLEU', 'Cardiologie', 'Sans sel', 'Aucune', '2024-01-18'),
        ('Claire Moreau', 'NTEM', 'Endocrinologie', 'Diabétique', 'Aucune', '2024-01-19');
        
        RAISE NOTICE 'Patients de test créés';
    ELSE
        RAISE NOTICE 'Patients existants trouvés: %', patient_count;
    END IF;
END $$;

-- 6. Vérifier le résultat
SELECT 'Table patients vérifiée avec succès' as status;
SELECT COUNT(*) as nombre_patients FROM public.patients;

-- 7. Afficher les patients
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

-- 8. Test d'insertion
INSERT INTO public.patients (name, room, service, diet, allergies, entry_date) VALUES
('Test Patient', 'Test Room', 'Test Service', 'Normal', 'Aucune', '2024-01-20')
ON CONFLICT DO NOTHING;

-- 9. Vérifier l'insertion
SELECT 'Test d''insertion réussi' as status;
SELECT COUNT(*) as total_patients FROM public.patients;









