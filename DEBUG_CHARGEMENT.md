# Guide de dépannage - "Impossible de charger les données"

## Problème
Le portail employé affiche "Impossible de charger les données" au lieu des menus.

## Étapes de diagnostic

### 1. Ouvrir la console du navigateur (F12)
Regardez les logs pour identifier l'erreur exacte :
- `Menus chargés:` - Doit afficher un tableau
- `Commandes chargées:` - Doit afficher un tableau
- Erreurs Supabase éventuelles

### 2. Vérifier la base de données
Exécutez ce script dans votre console Supabase :
```sql
-- Vérifier si les tables existent et ont des données
SELECT 'employee_menus' as table_name, COUNT(*) as nombre_lignes FROM public.employee_menus;
SELECT 'employee_orders' as table_name, COUNT(*) as nombre_lignes FROM public.employee_orders;
```

### 3. Vérifier les menus disponibles
```sql
-- Voir les menus disponibles
SELECT id, name, description, price, is_available
FROM public.employee_menus
WHERE is_available = true
ORDER BY name;
```

### 4. Si les tables sont vides
Exécutez le script de création de données de test :
```sql
-- Créer des menus de test
INSERT INTO public.employee_menus (name, description, price, is_available) VALUES
('Poulet rôti', 'Poulet rôti aux légumes avec riz', 2500, true),
('Poisson grillé', 'Poisson grillé avec légumes vapeur', 3000, true),
('Salade composée', 'Salade verte avec tomates et fromage', 1500, true)
ON CONFLICT DO NOTHING;
```

## Causes possibles

### 1. Tables vides
- **Problème** : Aucun menu dans `employee_menus`
- **Solution** : Créer des menus de test

### 2. Problème de permissions RLS
- **Problème** : Politiques RLS bloquent l'accès
- **Solution** : Vérifier les politiques

### 3. Problème de structure
- **Problème** : Colonnes manquantes
- **Solution** : Appliquer les migrations

### 4. Problème de connexion
- **Problème** : Supabase non accessible
- **Solution** : Vérifier la connexion internet

## Solutions par ordre de priorité

### Solution 1 : Créer des menus de test
```sql
-- Exécutez ce script
INSERT INTO public.employee_menus (name, description, price, is_available) VALUES
('Poulet rôti', 'Poulet rôti aux légumes avec riz', 2500, true),
('Poisson grillé', 'Poisson grillé avec légumes vapeur', 3000, true),
('Salade composée', 'Salade verte avec tomates et fromage', 1500, true),
('Pâtes carbonara', 'Pâtes avec sauce carbonara', 2000, true),
('Sandwich club', 'Sandwich avec poulet, bacon et légumes', 1800, true)
ON CONFLICT DO NOTHING;
```

### Solution 2 : Vérifier les politiques RLS
```sql
-- Voir les politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('employee_menus', 'employee_orders')
ORDER BY tablename, policyname;
```

### Solution 3 : Appliquer les migrations
```sql
-- Ajouter les colonnes manquantes
ALTER TABLE public.employee_menus ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 30 NOT NULL;
ALTER TABLE public.employee_orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE public.employee_orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;
```

## Test rapide

1. **Exécutez le script de diagnostic** : `supabase/diagnostic_complet.sql`
2. **Créez des menus de test** : `supabase/create_test_menus.sql`
3. **Rechargez le portail employé**
4. **Vérifiez la console** pour les logs

## Résultat attendu

Après avoir créé les menus de test, vous devriez voir :
- ✅ **5 menus** dans le portail employé
- ✅ **Logs dans la console** : "Menus chargés: [array]"
- ✅ **Interface fonctionnelle** pour passer des commandes









