-- Migration pour ajouter le nom de l'employé à la table employee_orders
-- Exécutez ce script pour ajouter la colonne employee_name

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_orders' AND column_name='employee_name') THEN
        ALTER TABLE public.employee_orders ADD COLUMN employee_name TEXT;
    END IF;
END $$;

-- Mettre à jour les enregistrements existants avec un nom par défaut
UPDATE public.employee_orders 
SET employee_name = 'Employé ' || SUBSTRING(employee_id::text, 1, 8)
WHERE employee_name IS NULL;

-- Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'employee_orders'
ORDER BY ordinal_position;


