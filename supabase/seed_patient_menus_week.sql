-- Seed des menus patients (régime Normal) pour une semaine complète
-- Menus gratuits: price = 0, is_available = true

-- Petit rappel du schéma attendu
-- Table: patient_menus(
--   id uuid default gen_random_uuid() primary key,
--   name text not null,
--   description text,
--   price numeric default 0,
--   photo_url text,
--   dietary_restriction text not null,       -- Ex: 'Normal', 'Diabétique', ...
--   meal_type text not null,                 -- 'Petit-déjeuner' | 'Déjeuner' | 'Dîner'
--   day_of_week text not null,               -- 'Lundi' ... 'Dimanche'
--   calories integer,
--   protein_g numeric,
--   carbs_g numeric,
--   fat_g numeric,
--   fiber_g numeric,
--   is_available boolean default true,
--   created_at timestamptz default now()
-- )

-- Nettoyage optionnel de la semaine (régime Normal)
-- DELETE FROM patient_menus WHERE dietary_restriction = 'Normal';

-- LUNDI
INSERT INTO patient_menus (name, description, price, dietary_restriction, meal_type, day_of_week, is_available)
VALUES
  ('Petit-déjeuner Lundi', 'Boisson au choix (thé, chocolat chaud, lait, citronnelle), œuf au plat, yaourt', 0, 'Normal', 'Petit-déjeuner', 'Lundi', true),
  ('Déjeuner Lundi', 'Salade de thon maïs; Follon – maquereau fumé; Banane vapeur, riz, fruits', 0, 'Normal', 'Déjeuner', 'Lundi', true),
  ('Dîner Lundi', 'Carbonara + yaourt', 0, 'Normal', 'Dîner', 'Lundi', true);

-- MARDI
INSERT INTO patient_menus (name, description, price, dietary_restriction, meal_type, day_of_week, is_available)
VALUES
  ('Petit-déjeuner Mardi', 'Boisson au choix (thé, chocolat chaud, lait, citronnelle), céréales, pain, biscottes, clémentine', 0, 'Normal', 'Petit-déjeuner', 'Mardi', true),
  ('Déjeuner Mardi', 'Salade de betteraves; Sauté de bœuf + riz/pommes de terre', 0, 'Normal', 'Déjeuner', 'Mardi', true),
  ('Dîner Mardi', 'Soupe de légumes + crêpes au choix', 0, 'Normal', 'Dîner', 'Mardi', true);

-- MERCREDI
INSERT INTO patient_menus (name, description, price, dietary_restriction, meal_type, day_of_week, is_available)
VALUES
  ('Petit-déjeuner Mercredi', 'Boisson au choix (thé, chocolat chaud, lait, citronnelle), viennoiseries, pain, biscottes, confiture, beurre, fromage, yaourt', 0, 'Normal', 'Petit-déjeuner', 'Mercredi', true),
  ('Déjeuner Mercredi', 'Salade d’avocat; Poulet rôti + pommes de terre sautées; gâteau au choix', 0, 'Normal', 'Déjeuner', 'Mercredi', true),
  ('Dîner Mercredi', 'Salade verte + quiche + fruit', 0, 'Normal', 'Dîner', 'Mercredi', true);

-- JEUDI
INSERT INTO patient_menus (name, description, price, dietary_restriction, meal_type, day_of_week, is_available)
VALUES
  ('Petit-déjeuner Jeudi', 'Boisson au choix (thé, chocolat chaud, lait, citronnelle), œufs durs, pain, biscottes, jambon de dinde, fruits', 0, 'Normal', 'Petit-déjeuner', 'Jeudi', true),
  ('Déjeuner Jeudi', 'Salade de thon; Brochettes de viande, riz, alloco + crêpes au choix', 0, 'Normal', 'Déjeuner', 'Jeudi', true),
  ('Dîner Jeudi', 'Tagliatelles + viande hachée + yaourt', 0, 'Normal', 'Dîner', 'Jeudi', true);

-- VENDREDI
INSERT INTO patient_menus (name, description, price, dietary_restriction, meal_type, day_of_week, is_available)
VALUES
  ('Petit-déjeuner Vendredi', 'Boisson au choix (thé, chocolat chaud, lait, citronnelle), flocon d’avoine, pain, biscottes, yaourt, fruits', 0, 'Normal', 'Petit-déjeuner', 'Vendredi', true),
  ('Déjeuner Vendredi', 'Salade verte; Poisson; Haricots verts; Salade de fruits', 0, 'Normal', 'Déjeuner', 'Vendredi', true),
  ('Dîner Vendredi', 'Omelette garnie (pommes de terre, jambon de dinde, crème fraîche, fromage) + fruits', 0, 'Normal', 'Dîner', 'Vendredi', true);

-- SAMEDI
INSERT INTO patient_menus (name, description, price, dietary_restriction, meal_type, day_of_week, is_available)
VALUES
  ('Petit-déjeuner Samedi', 'Boisson au choix (thé, chocolat chaud, lait, citronnelle), pain, biscottes, omelette jambon fromage, fruits', 0, 'Normal', 'Petit-déjeuner', 'Samedi', true),
  ('Déjeuner Samedi', 'Salade avocat; Brochettes de poulet; Pommes de terre sautées + yaourt', 0, 'Normal', 'Déjeuner', 'Samedi', true),
  ('Dîner Samedi', 'Bouillon de poisson; Banane vapeur, riz, igname; Gâteau maison', 0, 'Normal', 'Dîner', 'Samedi', true);

-- DIMANCHE
INSERT INTO patient_menus (name, description, price, dietary_restriction, meal_type, day_of_week, is_available)
VALUES
  ('Petit-déjeuner Dimanche', 'Boisson au choix (thé, chocolat chaud, lait, citronnelle), viennoiseries, pain, biscottes, confiture, beurre, fromage, yaourt', 0, 'Normal', 'Petit-déjeuner', 'Dimanche', true),
  ('Déjeuner Dimanche', 'Salade verte (concombre, tomates, avocat…); Aubergine maquereau fumé; Banane vapeur / riz', 0, 'Normal', 'Déjeuner', 'Dimanche', true),
  ('Dîner Dimanche', 'Frites + steak hachés + fruits', 0, 'Normal', 'Dîner', 'Dimanche', true);




