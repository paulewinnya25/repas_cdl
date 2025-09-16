-- Script pour créer des données de test si les tables sont vides
-- Exécutez ce script si les tables existent mais sont vides

-- 1. Créer des menus de test
INSERT INTO public.employee_menus (name, description, price, is_available) VALUES
('Poulet rôti', 'Poulet rôti aux légumes avec riz', 2500, true),
('Poisson grillé', 'Poisson grillé avec légumes vapeur', 3000, true),
('Salade composée', 'Salade verte avec tomates et fromage', 1500, true),
('Pâtes carbonara', 'Pâtes avec sauce carbonara', 2000, true),
('Sandwich club', 'Sandwich avec poulet, bacon et légumes', 1800, true)
ON CONFLICT DO NOTHING;

-- 2. Vérifier que les menus ont été créés
SELECT 
    id,
    name,
    description,
    price,
    is_available
FROM public.employee_menus
ORDER BY created_at DESC;

-- 3. Créer une commande de test (remplacez l'employee_id par un ID réel)
-- Décommentez et modifiez cette section si vous voulez créer une commande de test
/*
INSERT INTO public.employee_orders (employee_id, menu_id, delivery_location, total_price, status)
VALUES (
    'votre-employee-id-ici',
    (SELECT id FROM public.employee_menus WHERE name = 'Poulet rôti' LIMIT 1),
    'Bureau',
    2500,
    'Commandé'
);
*/

-- 4. Vérifier les commandes
SELECT 
    eo.id,
    eo.employee_id,
    eo.delivery_location,
    eo.total_price,
    eo.status,
    eo.created_at,
    em.name as menu_name
FROM public.employee_orders eo
LEFT JOIN public.employee_menus em ON eo.menu_id = em.id
ORDER BY eo.created_at DESC;






