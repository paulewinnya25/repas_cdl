-- Script pour créer la table patient_menus avec régimes alimentaires et menus journaliers
-- Exécutez ce script dans votre console Supabase

-- 1. Supprimer l'ancienne table si elle existe
DROP TABLE IF EXISTS public.patient_menus CASCADE;

-- 2. Créer la nouvelle table patient_menus avec structure améliorée
CREATE TABLE public.patient_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    price NUMERIC(10, 2) NOT NULL,
    
    -- Régime alimentaire
    dietary_restriction TEXT NOT NULL CHECK (dietary_restriction IN (
        'Normal', 'Diabétique', 'Cardiaque', 'Hypertension', 
        'Sans sel', 'Sans gluten', 'Végétarien', 'Végétalien',
        'Hypocalorique', 'Hypercalorique', 'Protéiné', 'Liquide'
    )),
    
    -- Type de repas
    meal_type TEXT NOT NULL CHECK (meal_type IN (
        'Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'
    )),
    
    -- Jour de la semaine
    day_of_week TEXT NOT NULL CHECK (day_of_week IN (
        'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
    )),
    
    -- Informations nutritionnelles
    calories INTEGER,
    protein_g NUMERIC(5,2),
    carbs_g NUMERIC(5,2),
    fat_g NUMERIC(5,2),
    fiber_g NUMERIC(5,2),
    
    -- Statut et dates
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Activer RLS pour patient_menus
ALTER TABLE public.patient_menus ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS pour patient_menus
DROP POLICY IF EXISTS "Allow all access to authenticated users on patient_menus" ON public.patient_menus;
CREATE POLICY "Allow all access to authenticated users on patient_menus"
ON public.patient_menus FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Créer un index pour les recherches fréquentes
CREATE INDEX idx_patient_menus_dietary_day ON public.patient_menus(dietary_restriction, day_of_week, meal_type);

-- 6. Insérer des menus patients par régime et jour
INSERT INTO public.patient_menus (name, description, dietary_restriction, meal_type, day_of_week, price, calories, protein_g, carbs_g, fat_g, fiber_g) VALUES

-- MENUS NORMALS - LUNDI
('Petit-déjeuner Lundi Normal', 'Pain complet, beurre, confiture, café, lait', 'Normal', 'Petit-déjeuner', 'Lundi', 1500, 350, 12, 45, 8, 3),
('Déjeuner Lundi Normal', 'Poulet rôti, riz, légumes vapeur, salade verte', 'Normal', 'Déjeuner', 'Lundi', 2500, 550, 35, 60, 15, 8),
('Dîner Lundi Normal', 'Poisson grillé, purée de pommes de terre, haricots verts', 'Normal', 'Dîner', 'Lundi', 2200, 480, 30, 45, 12, 6),

-- MENUS DIABÉTIQUES - LUNDI
('Petit-déjeuner Lundi Diabétique', 'Pain complet, fromage blanc, fruits frais, thé sans sucre', 'Diabétique', 'Petit-déjeuner', 'Lundi', 1600, 280, 15, 35, 8, 5),
('Déjeuner Lundi Diabétique', 'Poulet grillé, quinoa, légumes verts, salade', 'Diabétique', 'Déjeuner', 'Lundi', 2600, 420, 40, 35, 12, 10),
('Dîner Lundi Diabétique', 'Saumon vapeur, légumes vapeur, salade de crudités', 'Diabétique', 'Dîner', 'Lundi', 2400, 380, 35, 20, 15, 8),

-- MENUS CARDIAQUES - LUNDI
('Petit-déjeuner Lundi Cardiaque', 'Pain complet, avocat, tomates, jus d\'orange', 'Cardiaque', 'Petit-déjeuner', 'Lundi', 1700, 320, 8, 40, 12, 6),
('Déjeuner Lundi Cardiaque', 'Poulet blanc grillé, riz complet, légumes verts', 'Cardiaque', 'Déjeuner', 'Lundi', 2500, 450, 35, 50, 8, 7),
('Dîner Lundi Cardiaque', 'Poisson blanc vapeur, légumes vapeur, salade', 'Cardiaque', 'Dîner', 'Lundi', 2300, 400, 30, 35, 10, 6),

-- MENUS SANS SEL - LUNDI
('Petit-déjeuner Lundi Sans Sel', 'Pain complet, confiture, fruits frais, tisane', 'Sans sel', 'Petit-déjeuner', 'Lundi', 1500, 300, 8, 50, 5, 4),
('Déjeuner Lundi Sans Sel', 'Poulet grillé sans sel, riz, légumes vapeur', 'Sans sel', 'Déjeuner', 'Lundi', 2400, 400, 35, 45, 8, 6),
('Dîner Lundi Sans Sel', 'Poisson vapeur sans sel, légumes vapeur', 'Sans sel', 'Dîner', 'Lundi', 2200, 350, 30, 30, 6, 5),

-- MENUS VÉGÉTARIENS - LUNDI
('Petit-déjeuner Lundi Végétarien', 'Pain complet, beurre, confiture, fruits, lait végétal', 'Végétarien', 'Petit-déjeuner', 'Lundi', 1600, 320, 10, 50, 8, 4),
('Déjeuner Lundi Végétarien', 'Lentilles, riz complet, légumes vapeur, salade', 'Végétarien', 'Déjeuner', 'Lundi', 2200, 450, 20, 70, 12, 15),
('Dîner Lundi Végétarien', 'Quinoa, légumes grillés, salade de crudités', 'Végétarien', 'Dîner', 'Lundi', 2000, 380, 15, 60, 10, 12),

-- MENUS HYPOCALORIQUES - LUNDI
('Petit-déjeuner Lundi Hypocalorique', 'Pain complet, fromage blanc 0%, fruits frais', 'Hypocalorique', 'Petit-déjeuner', 'Lundi', 1400, 200, 15, 30, 3, 4),
('Déjeuner Lundi Hypocalorique', 'Poulet grillé, légumes vapeur, salade verte', 'Hypocalorique', 'Déjeuner', 'Lundi', 2000, 300, 35, 20, 8, 8),
('Dîner Lundi Hypocalorique', 'Poisson vapeur, légumes vapeur, salade', 'Hypocalorique', 'Dîner', 'Lundi', 1800, 250, 30, 15, 6, 6),

-- MENUS LIQUIDES - LUNDI
('Petit-déjeuner Lundi Liquide', 'Smoothie fruits, yaourt liquide, jus de fruits', 'Liquide', 'Petit-déjeuner', 'Lundi', 1200, 250, 8, 45, 5, 3),
('Déjeuner Lundi Liquide', 'Soupe de légumes, bouillon de poulet, compote', 'Liquide', 'Déjeuner', 'Lundi', 1800, 300, 15, 40, 8, 5),
('Dîner Lundi Liquide', 'Soupe de poisson, bouillon de légumes, jus de fruits', 'Liquide', 'Dîner', 'Lundi', 1600, 280, 12, 35, 6, 4)

ON CONFLICT DO NOTHING;

-- 7. Créer une fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_patient_menus_updated_at ON public.patient_menus;
CREATE TRIGGER update_patient_menus_updated_at
    BEFORE UPDATE ON public.patient_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Vérifier la création
SELECT 'Table patient_menus créée avec succès' as status;
SELECT COUNT(*) as nombre_menus FROM public.patient_menus;

-- 10. Afficher les menus par régime
SELECT 
    dietary_restriction,
    COUNT(*) as nombre_menus,
    STRING_AGG(DISTINCT day_of_week, ', ') as jours_disponibles
FROM public.patient_menus 
GROUP BY dietary_restriction
ORDER BY dietary_restriction;

-- 11. Afficher un exemple de menu complet pour un jour
SELECT 
    day_of_week,
    dietary_restriction,
    meal_type,
    name,
    price,
    calories
FROM public.patient_menus 
WHERE day_of_week = 'Lundi' AND dietary_restriction = 'Normal'
ORDER BY 
    CASE meal_type 
        WHEN 'Petit-déjeuner' THEN 1
        WHEN 'Déjeuner' THEN 2
        WHEN 'Dîner' THEN 3
        WHEN 'Collation' THEN 4
    END;







