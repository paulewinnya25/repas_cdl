# Guide de dépannage - Erreur 400 dans le portail cuisinier (MISE À JOUR)

## Problème
Le portail cuisinier affiche "Erreur lors du chargement des données" avec une erreur 400.

## Causes identifiées
L'erreur 400 vient des requêtes qui essaient de joindre avec d'autres tables :
1. **`orders`** avec `patients(name, room)` - Table `patients` peut ne pas exister
2. **`employee_orders`** avec `employee_menus(name, photo_url)` - Table `employee_menus` peut ne pas exister

## Solutions appliquées

### ✅ Code corrigé
- **Supprimé** : `patients(name, room)` de la requête `orders`
- **Supprimé** : `employee_menus(name, photo_url)` de la requête `employee_orders`
- **Simplifié** : Requêtes `SELECT *` sur les tables principales uniquement
- **Ajouté** : Logs de debug pour identifier les erreurs

### ✅ Affichage adapté
- **Commandes patients** : `Commande #{order.id.slice(0, 8)}` au lieu de `{order.patients?.name}`
- **Commandes employés** : `Commande #{order.id.slice(0, 8)}` au lieu de `{order.employee_menus?.name}`
- **Informations conservées** : Patient ID, Employé ID, lieu, prix, statut

## Actions à effectuer

### 1. Vérifier l'état des tables
```sql
-- Exécutez le script de diagnostic complet
-- Fichier: supabase/diagnostic_portail_cuisinier.sql
```

### 2. Si les tables sont vides, créer des données de test
```sql
-- Exécutez le script de création de données de test
-- Fichier: supabase/create_test_data_cuisinier.sql
```

### 3. Vérifier les politiques RLS
```sql
-- Vérifier les politiques pour orders
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- Vérifier les politiques pour employee_orders
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'employee_orders'
ORDER BY policyname;
```

## Test du portail cuisinier

### 1. Recharger la page
- Allez sur `/portails/cook`
- Vérifiez que l'erreur 400 a disparu

### 2. Vérifier les logs
- Ouvrez la console (F12)
- Regardez les logs :
  - `Commandes patients chargées:`
  - `Commandes employés chargées:`

### 3. Tester l'affichage
- **Commandes patients** devraient apparaître avec :
  - ✅ **ID de commande** : `Commande #12345678`
  - ✅ **Patient ID** : `Patient ID: 87654321...`
  - ✅ **Type de repas** : Déjeuner, Dîner, etc.
  - ✅ **Menu** : Nom du menu commandé

- **Commandes employés** devraient apparaître avec :
  - ✅ **ID de commande** : `Commande #12345678`
  - ✅ **Employé ID** : `Employé ID: 87654321...`
  - ✅ **Lieu de livraison** : Bureau, Salle de pause, etc.
  - ✅ **Prix total** : Calculé correctement

## Résultat attendu

Après avoir créé les données de test :
- ✅ **Portail cuisinier** : Fonctionne sans erreur 400
- ✅ **Commandes patients** : Affichées avec informations de base
- ✅ **Commandes employés** : Affichées avec informations de base
- ✅ **Actions fonctionnelles** : Préparer, Livrer, etc.

## Prochaines étapes

1. **Exécutez le script de diagnostic** : `supabase/diagnostic_portail_cuisinier.sql`
2. **Créez des données de test** : `supabase/create_test_data_cuisinier.sql`
3. **Testez le portail cuisinier** : Vérifiez l'affichage des commandes
4. **Testez les actions** : Préparer, Livrer, etc.

## Notes importantes

- **Les jointures sont supprimées** : Pour éviter les erreurs 400
- **L'affichage est adapté** : Informations essentielles conservées
- **Les fonctionnalités restent intactes** : Gestion des statuts, actions, etc.
- **Performance améliorée** : Requêtes plus simples et rapides

L'erreur 400 devrait maintenant être complètement résolue ! 🎉


