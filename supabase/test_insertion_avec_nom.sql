-- Script pour tester l'insertion d'une nouvelle commande avec nom
-- Exécutez ce script pour tester la fonctionnalité complète

-- 1. Vérifier que la colonne employee_name existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_orders' AND column_name='employee_name') 
        THEN '✅ Colonne employee_name existe'
        ELSE '❌ Colonne employee_name manquante - AJOUTEZ-LA D\'ABORD'
    END as status;

-- 2. Insérer une commande de test avec nom
INSERT INTO public.employee_orders (
    employee_id, 
    employee_name, 
    menu_id, 
    delivery_location, 
    total_price, 
    status
) VALUES (
    'test-employee-' || EXTRACT(EPOCH FROM NOW())::text,
    'Test Employé ' || EXTRACT(EPOCH FROM NOW())::text,
    'test-menu-id',
    'Bureau',
    2500,
    'Commandé'
) ON CONFLICT DO NOTHING;

-- 3. Vérifier l'insertion
SELECT 
    'Commande de test insérée:' as info,
    id,
    employee_id,
    employee_name,
    delivery_location,
    total_price,
    status,
    created_at
FROM public.employee_orders 
WHERE employee_name LIKE 'Test Employé%'
ORDER BY created_at DESC
LIMIT 1;

-- 4. Voir toutes les commandes avec noms
SELECT 
    'Toutes les commandes avec noms:' as info,
    COUNT(*) as nombre_commandes
FROM public.employee_orders 
WHERE employee_name IS NOT NULL AND employee_name != '';

-- 5. Afficher les dernières commandes
SELECT 
    id,
    employee_id,
    employee_name,
    delivery_location,
    total_price,
    status,
    created_at
FROM public.employee_orders 
ORDER BY created_at DESC
LIMIT 10;






