-- Duplique tous les menus de patient_menus du régime 'Normal' vers d'autres régimes
-- Utile si vous n'avez pas encore défini des menus spécifiques par régime

-- Ciblez ici les régimes à cloner
WITH target_diets AS (
  SELECT unnest(ARRAY[
    'Diabétique',
    'Sans sel',
    'Cardiaque',
    'Hypertension',
    'Sans gluten',
    'Végétarien',
    'Végétalien',
    'Hypocalorique',
    'Hypercalorique',
    'Protéiné',
    'Liquide'
  ]) AS diet
)
INSERT INTO patient_menus (
  name,
  description,
  price,
  photo_url,
  dietary_restriction,
  meal_type,
  day_of_week,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  fiber_g,
  is_available
)
SELECT
  pm.name,
  pm.description,
  COALESCE(pm.price, 0),
  pm.photo_url,
  td.diet AS dietary_restriction,
  pm.meal_type,
  pm.day_of_week,
  pm.calories,
  pm.protein_g,
  pm.carbs_g,
  pm.fat_g,
  pm.fiber_g,
  pm.is_available
FROM patient_menus pm
CROSS JOIN target_diets td
LEFT JOIN patient_menus existing
  ON existing.dietary_restriction = td.diet
 AND existing.meal_type = pm.meal_type
 AND existing.day_of_week = pm.day_of_week
WHERE pm.dietary_restriction = 'Normal'
  AND existing.id IS NULL;

-- Vérification rapide (facultative)
-- SELECT dietary_restriction, day_of_week, meal_type, count(*) FROM patient_menus GROUP BY 1,2,3 ORDER BY 1,2,3;




