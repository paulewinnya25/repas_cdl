-- TEST - Règles strictes pour les commandes en préparation
-- Ce script teste les nouvelles restrictions sur les commandes en préparation

-- 1. Vérifier les commandes par statut avec les nouvelles règles
SELECT 
    status,
    COUNT(*) as count,
    CASE 
        WHEN status = 'En attente d\'approbation' THEN 'Modifiable, Annulable, Supprimable'
        WHEN status = 'En préparation' THEN 'AUCUNE ACTION POSSIBLE'
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
        WHEN status = 'En attente d\'approbation' THEN '✅ Modifiable, Annulable, Supprimable'
        WHEN status = 'En préparation' THEN '🔒 AUCUNE ACTION POSSIBLE'
        WHEN status = 'Livré' THEN '✅ Supprimable uniquement'
        WHEN status = 'Annulé' THEN '✅ Supprimable uniquement'
        ELSE '❓ Statut inconnu'
    END as actions_status
FROM public.orders 
ORDER BY created_at DESC;

-- 3. Vérifier qu'il n'y a pas de commandes en préparation modifiables/annulables
SELECT 
    'Commandes en préparation' as description,
    COUNT(*) as count,
    'Aucune action possible' as restriction
FROM public.orders 
WHERE status = 'En préparation';

-- 4. Vérifier les commandes modifiables (seulement en attente)
SELECT 
    'Commandes modifiables' as description,
    COUNT(*) as count,
    'En attente d\'approbation uniquement' as restriction
FROM public.orders 
WHERE status = 'En attente d\'approbation';

-- 5. Vérifier les commandes annulables (seulement en attente)
SELECT 
    'Commandes annulables' as description,
    COUNT(*) as count,
    'En attente d\'approbation uniquement' as restriction
FROM public.orders 
WHERE status = 'En attente d\'approbation';

-- 6. Vérifier les commandes supprimables
SELECT 
    'Commandes supprimables' as description,
    COUNT(*) as count,
    'En attente, Livré, ou Annulé' as restriction
FROM public.orders 
WHERE status IN ('En attente d\'approbation', 'Livré', 'Annulé');





