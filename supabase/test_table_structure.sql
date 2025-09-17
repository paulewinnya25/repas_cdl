-- Script de test pour vérifier la structure des tables
-- Exécutez ce script pour vérifier que toutes les colonnes nécessaires existent

-- Vérifier la structure de employee_orders
SELECT 'employee_orders' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'employee_orders'
ORDER BY ordinal_position;

-- Vérifier la structure de employee_menus
SELECT 'employee_menus' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'employee_menus'
ORDER BY ordinal_position;

-- Test d'insertion dans employee_orders (ne sera pas exécuté, juste pour vérifier la syntaxe)
-- INSERT INTO public.employee_orders (
--     employee_id, 
--     menu_id, 
--     delivery_location, 
--     special_instructions, 
--     quantity, 
--     total_price, 
--     status
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     '00000000-0000-0000-0000-000000000000',
--     'Test',
--     'Test instructions',
--     1,
--     1000.00,
--     'Commandé'
-- );









