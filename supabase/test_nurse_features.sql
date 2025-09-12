-- TEST - Fonctionnalités d'annulation et modification des commandes
-- Ce script teste les nouvelles fonctionnalités du portail infirmier

-- 1. Vérifier les commandes existantes
SELECT 'Commandes existantes' as description, COUNT(*) as count FROM public.orders;

-- 2. Afficher toutes les commandes avec leurs statuts
SELECT 
    id,
    patient_id,
    meal_type,
    menu,
    status,
    instructions,
    created_at
FROM public.orders 
ORDER BY created_at DESC;

-- 3. Tester l'annulation d'une commande (simulation)
-- Cette commande sera exécutée par l'interface utilisateur
-- UPDATE public.orders SET status = 'Annulé' WHERE id = 'order_id_here';

-- 4. Tester la modification d'une commande (simulation)
-- Cette commande sera exécutée par l'interface utilisateur
-- UPDATE public.orders SET 
--     meal_type = 'Nouveau repas',
--     menu = 'Nouveau menu',
--     instructions = 'Nouvelles instructions'
-- WHERE id = 'order_id_here';

-- 5. Vérifier les statuts possibles
SELECT DISTINCT status FROM public.orders;

-- 6. Compter les commandes par statut
SELECT 
    status,
    COUNT(*) as count
FROM public.orders 
GROUP BY status
ORDER BY count DESC;

