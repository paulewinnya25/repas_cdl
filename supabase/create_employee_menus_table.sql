-- Script pour créer la table employee_menus si elle n'existe pas
-- Exécutez ce script si la table n'existe pas

-- Créer la table employee_menus
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

-- Activer RLS
ALTER TABLE public.employee_menus ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
DROP POLICY IF EXISTS "Allow all access to authenticated users on employee_menus" ON public.employee_menus;
CREATE POLICY "Allow all access to authenticated users on employee_menus"
ON public.employee_menus FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insérer des menus de test
INSERT INTO public.employee_menus (name, description, price, is_available) VALUES
('Poulet rôti', 'Poulet rôti aux légumes avec riz', 2500, true),
('Poisson grillé', 'Poisson grillé avec légumes vapeur', 3000, true),
('Salade composée', 'Salade verte avec tomates et fromage', 1500, true),
('Pâtes carbonara', 'Pâtes avec sauce carbonara', 2000, true),
('Sandwich club', 'Sandwich avec poulet, bacon et légumes', 1800, true)
ON CONFLICT DO NOTHING;

-- Vérifier la création
SELECT 
    id,
    name,
    description,
    price,
    is_available,
    created_at
FROM public.employee_menus
ORDER BY created_at DESC;



