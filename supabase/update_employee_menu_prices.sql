-- Script pour mettre à jour les prix des menus employés
-- Prix de base : 1500 FCFA
-- Avec 2 accompagnements : 2000 FCFA

-- Mettre à jour tous les menus employés existants à 1500 FCFA
UPDATE public.employee_menus 
SET price = 1500 
WHERE is_available = true;

-- Insérer de nouveaux menus avec les nouveaux prix si nécessaire
INSERT INTO public.employee_menus (name, description, price, is_available) VALUES
('Plat du jour', 'Plat du jour avec accompagnement de base', 1500, true),
('Plat du jour + 2 accompagnements', 'Plat du jour avec 2 accompagnements supplémentaires', 2000, true),
('Poulet rôti', 'Poulet rôti aux légumes avec riz', 1500, true),
('Poulet rôti + 2 accompagnements', 'Poulet rôti avec 2 accompagnements supplémentaires', 2000, true),
('Poisson grillé', 'Poisson grillé avec légumes vapeur', 1500, true),
('Poisson grillé + 2 accompagnements', 'Poisson grillé avec 2 accompagnements supplémentaires', 2000, true),
('Salade composée', 'Salade verte avec tomates et fromage', 1500, true),
('Salade composée + 2 accompagnements', 'Salade verte avec 2 accompagnements supplémentaires', 2000, true),
('Pâtes carbonara', 'Pâtes avec sauce carbonara', 1500, true),
('Pâtes carbonara + 2 accompagnements', 'Pâtes carbonara avec 2 accompagnements supplémentaires', 2000, true),
('Sandwich club', 'Sandwich avec poulet, bacon et légumes', 1500, true),
('Sandwich club + 2 accompagnements', 'Sandwich club avec 2 accompagnements supplémentaires', 2000, true)
ON CONFLICT (name) DO UPDATE SET 
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    is_available = EXCLUDED.is_available;

-- Vérifier les résultats
SELECT 
    id,
    name,
    description,
    price,
    is_available,
    created_at
FROM public.employee_menus
ORDER BY name, price;
