-- Script pour créer la table orders manquante
-- Exécutez ce script dans votre console Supabase

-- 1. Créer la table orders si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    meal_type TEXT NOT NULL,
    menu TEXT NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- 2. Activer RLS pour orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques RLS pour orders
DROP POLICY IF EXISTS "Allow all access to authenticated users on orders" ON public.orders;
CREATE POLICY "Allow all access to authenticated users on orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Créer une clé étrangère vers patients (si la table patients existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT fk_orders_patient_id 
        FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère ajoutée vers patients';
    ELSE
        RAISE NOTICE 'Table patients non trouvée, clé étrangère non ajoutée';
    END IF;
END $$;

-- 5. Insérer des commandes de test (si des patients existent)
DO $$
DECLARE
    patient_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO patient_count FROM public.patients;
    
    IF patient_count > 0 THEN
        INSERT INTO public.orders (patient_id, meal_type, menu, status) 
        SELECT 
            p.id,
            CASE (ROW_NUMBER() OVER ()) % 3
                WHEN 0 THEN 'Petit-déjeuner'
                WHEN 1 THEN 'Déjeuner'
                ELSE 'Dîner'
            END,
            CASE (ROW_NUMBER() OVER ()) % 4
                WHEN 0 THEN 'Poulet rôti'
                WHEN 1 THEN 'Poisson grillé'
                WHEN 2 THEN 'Salade composée'
                ELSE 'Pâtes carbonara'
            END,
            CASE (ROW_NUMBER() OVER ()) % 3
                WHEN 0 THEN 'En attente d''approbation'
                WHEN 1 THEN 'Approuvé'
                ELSE 'En préparation'
            END
        FROM public.patients p
        LIMIT 5;
        
        RAISE NOTICE 'Commandes de test créées';
    ELSE
        RAISE NOTICE 'Aucun patient trouvé, aucune commande de test créée';
    END IF;
END $$;

-- 6. Vérifier la création
SELECT 'Table orders créée avec succès' as status;
SELECT COUNT(*) as nombre_commandes FROM public.orders;

-- 7. Afficher les commandes créées
SELECT 
    o.id,
    o.patient_id,
    o.meal_type,
    o.menu,
    o.status,
    o.created_at,
    p.name as patient_name,
    p.room as patient_room
FROM public.orders o
LEFT JOIN public.patients p ON o.patient_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;






