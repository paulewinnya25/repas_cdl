-- Script pour créer des données de test
-- Exécutez ce script pour tester le flux complet

-- 1. Créer un menu de test
INSERT INTO public.employee_menus (name, description, price, is_available)
VALUES ('Poulet rôti', 'Poulet rôti aux légumes avec riz', 2500, true)
ON CONFLICT DO NOTHING;

-- 2. Récupérer l'ID du menu créé
SELECT id, name FROM public.employee_menus WHERE name = 'Poulet rôti';

-- 3. Créer une commande de test (remplacez l'employee_id par un ID réel)
-- INSERT INTO public.employee_orders (employee_id, menu_id, delivery_location, total_price, status)
-- VALUES (
--     'votre-employee-id-ici',
--     (SELECT id FROM public.employee_menus WHERE name = 'Poulet rôti'),
--     'Bureau',
--     2500,
--     'Commandé'
-- );

-- 4. Vérifier les données
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
ORDER BY eo.created_at DESC
LIMIT 10;


