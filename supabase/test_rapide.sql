-- Test rapide de connexion et de données
-- Exécutez ce script pour vérifier rapidement l'état de la base

-- 1. Test de connexion basique
SELECT NOW() as timestamp, 'Connexion OK' as status;

-- 2. Vérifier les tables principales
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'employee_menus' THEN (SELECT COUNT(*) FROM public.employee_menus)
        WHEN table_name = 'employee_orders' THEN (SELECT COUNT(*) FROM public.employee_orders)
        WHEN table_name = 'profiles' THEN (SELECT COUNT(*) FROM public.profiles)
        ELSE 0
    END as nombre_lignes
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('employee_menus', 'employee_orders', 'profiles')
ORDER BY table_name;

-- 3. Vérifier les menus disponibles
SELECT 
    COUNT(*) as menus_disponibles,
    MIN(price) as prix_min,
    MAX(price) as prix_max
FROM public.employee_menus 
WHERE is_available = true;

-- 4. Vérifier les commandes récentes
SELECT 
    COUNT(*) as commandes_totales,
    COUNT(CASE WHEN status = 'Commandé' THEN 1 END) as en_attente,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as aujourd_hui
FROM public.employee_orders;


