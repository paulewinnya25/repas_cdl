-- Script de test pour vérifier les commandes employés
-- Exécutez ce script pour voir les commandes dans la base

-- Voir toutes les commandes employés
SELECT 
    eo.id,
    eo.employee_id,
    eo.menu_id,
    eo.delivery_location,
    eo.total_price,
    eo.status,
    eo.created_at,
    em.name as menu_name
FROM public.employee_orders eo
LEFT JOIN public.employee_menus em ON eo.menu_id = em.id
ORDER BY eo.created_at DESC;

-- Compter les commandes par statut
SELECT 
    status,
    COUNT(*) as nombre_commandes
FROM public.employee_orders
GROUP BY status;

-- Vérifier s'il y a des menus employés
SELECT 
    id,
    name,
    price,
    is_available
FROM public.employee_menus
ORDER BY created_at DESC;


