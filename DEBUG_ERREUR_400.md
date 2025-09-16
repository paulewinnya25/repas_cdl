# Guide de dépannage - Erreur 400 dans le portail cuisinier

## Problème
Le portail cuisinier affiche "Erreur lors du chargement des données" avec une erreur 400.

## Cause identifiée
L'erreur 400 vient de la requête qui essaie de joindre avec `employee_menus`. Cette table pourrait :
- Ne pas exister
- Être vide
- Avoir des problèmes de permissions RLS

## Solutions appliquées

### ✅ Code corrigé
- **Supprimé** : La jointure `employee_menus(name, photo_url)` qui causait l'erreur
- **Simplifié** : Requête `SELECT *` sur `employee_orders` uniquement
- **Modifié** : Affichage pour ne pas dépendre des données de menu

### ✅ Affichage adapté
- **Avant** : `{order.employee_menus?.name}` (causait l'erreur)
- **Après** : `Commande #{order.id.slice(0, 8)}` (fonctionne toujours)

## Actions à effectuer

### 1. Vérifier si la table employee_menus existe
```sql
-- Exécutez ce script
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'employee_menus';
```

### 2. Si la table n'existe pas, la créer
```sql
-- Exécutez le script complet
-- Fichier: supabase/create_employee_menus_table.sql
```

### 3. Si la table existe mais est vide, ajouter des menus
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

### 4. Vérifier les politiques RLS
```sql
-- Voir les politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'employee_menus'
ORDER BY policyname;
```

## Test du portail cuisinier

### 1. Recharger la page
- Allez sur `/portails/cook`
- Vérifiez que l'erreur 400 a disparu

### 2. Vérifier les logs
- Ouvrez la console (F12)
- Regardez les logs : `Commandes employés chargées:`

### 3. Tester l'affichage
- Les commandes devraient apparaître avec :
  - ✅ **ID de commande** : `Commande #12345678`
  - ✅ **ID employé** : `Employé ID: 87654321...`
  - ✅ **Lieu de livraison** : Bureau, Salle de pause, etc.
  - ✅ **Prix total** : Calculé correctement

## Résultat attendu

Après avoir créé la table `employee_menus` et ajouté des menus :
- ✅ **Portail cuisinier** : Fonctionne sans erreur 400
- ✅ **Portail employé** : Affiche les menus disponibles
- ✅ **Flux complet** : Employé → Cuisinier fonctionnel

## Prochaines étapes

1. **Exécutez le script de vérification** : `supabase/check_employee_menus.sql`
2. **Créez la table si nécessaire** : `supabase/create_employee_menus_table.sql`
3. **Testez les deux portails** : Employé et Cuisinier
4. **Vérifiez le flux complet** : Commande → Affichage → Gestion

L'erreur 400 devrait maintenant être résolue ! 🎉






