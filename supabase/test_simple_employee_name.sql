-- Script de test simple et direct
-- Exécutez ce script étape par étape dans votre console Supabase

-- ÉTAPE 1: Vérifier si la table employee_orders existe
SELECT 'ÉTAPE 1: Vérification de la table' as etape;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'employee_orders';

-- ÉTAPE 2: Voir la structure actuelle de la table
SELECT 'ÉTAPE 2: Structure de la table' as etape;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employee_orders'
ORDER BY ordinal_position;

-- ÉTAPE 3: Voir les données existantes
SELECT 'ÉTAPE 3: Données existantes' as etape;
SELECT 
    id,
    employee_id,
    delivery_location,
    total_price,
    status,
    created_at
FROM public.employee_orders 
ORDER BY created_at DESC
LIMIT 5;

-- ÉTAPE 4: Ajouter la colonne employee_name (si elle n'existe pas)
SELECT 'ÉTAPE 4: Ajout de la colonne employee_name' as etape;
ALTER TABLE public.employee_orders ADD COLUMN IF NOT EXISTS employee_name TEXT;

-- ÉTAPE 5: Mettre à jour toutes les commandes avec des noms de test
SELECT 'ÉTAPE 5: Mise à jour des noms' as etape;
UPDATE public.employee_orders 
SET employee_name = 'Employé Test ' || SUBSTRING(id::text, 1, 8)
WHERE employee_name IS NULL OR employee_name = '';

-- ÉTAPE 6: Vérifier le résultat
SELECT 'ÉTAPE 6: Vérification du résultat' as etape;
SELECT 
    id,
    employee_id,
    employee_name,
    delivery_location,
    total_price,
    status
FROM public.employee_orders 
ORDER BY created_at DESC
LIMIT 5;

-- ÉTAPE 7: Compter les commandes avec noms
SELECT 'ÉTAPE 7: Statistiques' as etape;
SELECT 
    COUNT(*) as total_commandes,
    COUNT(employee_name) as avec_nom,
    COUNT(*) - COUNT(employee_name) as sans_nom
FROM public.employee_orders;






