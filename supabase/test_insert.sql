-- Script de test pour vérifier l'insertion dans employee_orders
-- Remplacez les UUIDs par des valeurs réelles de votre base

-- Test d'insertion minimal
INSERT INTO public.employee_orders (
    employee_id, 
    menu_id, 
    delivery_location, 
    total_price, 
    status
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Remplacez par un employee_id réel
    '00000000-0000-0000-0000-000000000000', -- Remplacez par un menu_id réel
    'Bureau',
    2500.00,
    'Commandé'
);

-- Vérifier l'insertion
SELECT * FROM public.employee_orders ORDER BY created_at DESC LIMIT 5;

-- Nettoyer le test (optionnel)
-- DELETE FROM public.employee_orders WHERE delivery_location = 'Bureau' AND total_price = 2500.00;






