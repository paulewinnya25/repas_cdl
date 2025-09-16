-- Rendre la description optionnelle et ajouter les options d'accompagnements

ALTER TABLE public.employee_menus
  ALTER COLUMN description DROP NOT NULL;

ALTER TABLE public.employee_menus
  ADD COLUMN IF NOT EXISTS accompaniment_options TEXT;

-- Exemple: 'Riz, Plantain, Frites, Salade'


