-- CORRECTION URGENTE - Ajouter la colonne employee_name
-- Ce script corrige le problème de la colonne manquante

-- 1. Vérifier la structure actuelle de la table employee_orders
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employee_orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ajouter la colonne employee_name si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employee_orders' 
        AND column_name = 'employee_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.employee_orders ADD COLUMN employee_name TEXT;
        RAISE NOTICE 'Colonne employee_name ajoutée à la table employee_orders';
    ELSE
        RAISE NOTICE 'Colonne employee_name existe déjà';
    END IF;
END $$;

-- 3. Mettre à jour les commandes existantes avec des noms d'employés
UPDATE public.employee_orders 
SET employee_name = CASE 
    WHEN employee_id = '550e8400-e29b-41d4-a716-446655440010' THEN 'Paule Winnya'
    WHEN employee_id = '550e8400-e29b-41d4-a716-446655440011' THEN 'Jean Martin'
    WHEN employee_id = '550e8400-e29b-41d4-a716-446655440012' THEN 'Marie Dubois'
    WHEN employee_id = '550e8400-e29b-41d4-a716-446655440013' THEN 'Pierre Durand'
    WHEN employee_id = '550e8400-e29b-41d4-a716-446655440014' THEN 'Sophie Laurent'
    ELSE 'Employé Inconnu'
END
WHERE employee_name IS NULL;

-- 4. Vérifier que la colonne a été ajoutée et les données mises à jour
SELECT employee_id, employee_name, delivery_location, status 
FROM public.employee_orders 
LIMIT 5;