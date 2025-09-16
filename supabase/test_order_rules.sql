-- TEST - Règles de modification des commandes
-- Ce script teste les nouvelles restrictions sur les commandes en préparation

-- 1. Vérifier les commandes par statut
SELECT 
    status,
    COUNT(*) as count,
    CASE 
        WHEN status = 'En attente d\'approbation' THEN 'Modifiable, Annulable, Supprimable'
        WHEN status = 'En préparation' THEN 'Annulable uniquement'
        WHEN status = 'Livré' THEN 'Supprimable uniquement'
        WHEN status = 'Annulé' THEN 'Supprimable uniquement'
        ELSE 'Actions non définies'
    END as actions_possibles
FROM public.orders 
GROUP BY status
ORDER BY count DESC;

-- 2. Afficher toutes les commandes avec leurs statuts
SELECT 
    id,
    patient_id,
    meal_type,
    menu,
    status,
    created_at,
    CASE 
        WHEN status = 'En attente d\'approbation' THEN '✅ Modifiable'
        WHEN status = 'En préparation' THEN '⚠️ Actions limitées'
        WHEN status = 'Livré' THEN '✅ Supprimable'
        WHEN status = 'Annulé' THEN '✅ Supprimable'
        ELSE '❓ Statut inconnu'
    END as actions_status
FROM public.orders 
ORDER BY created_at DESC;

-- 3. Tester la logique des fonctions (simulation)
-- canModifyOrder: seulement 'En attente d\'approbation'
-- canCancelOrder: 'En attente d\'approbation' OU 'En préparation'
-- canDeleteOrder: 'En attente d\'approbation' OU 'Livré' OU 'Annulé'

-- 4. Vérifier qu'il n'y a pas de commandes en préparation modifiables
SELECT 
    'Commandes en préparation' as description,
    COUNT(*) as count
FROM public.orders 
WHERE status = 'En préparation';

-- 5. Vérifier les commandes modifiables
SELECT 
    'Commandes modifiables' as description,
    COUNT(*) as count
FROM public.orders 
WHERE status = 'En attente d\'approbation';





