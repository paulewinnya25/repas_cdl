# Guide de dépannage - Portail Employé

## Problème actuel
- Erreur 400 lors de l'insertion dans `employee_orders`
- Colonnes `quantity` et `special_instructions` manquantes

## Solutions par ordre de priorité

### Solution 1 : Appliquer les migrations (Recommandé)
```sql
-- Exécutez ces migrations dans l'ordre :

-- 1. Ajouter les colonnes manquantes à employee_orders
-- Fichier: supabase/migrations/0012_simple_add_missing_columns.sql
ALTER TABLE public.employee_orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE public.employee_orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- 2. Ajouter preparation_time à employee_menus
-- Fichier: supabase/migrations/0013_simple_add_preparation_time.sql
ALTER TABLE public.employee_orders ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 30 NOT NULL;
```

### Solution 2 : Vérifier la structure actuelle
```sql
-- Exécutez ce script pour voir la structure actuelle
-- Fichier: supabase/diagnostic_tables.sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'employee_orders'
ORDER BY ordinal_position;
```

### Solution 3 : Code actuel (Fonctionne déjà)
Le code a été simplifié pour utiliser seulement les colonnes qui existent :
- ✅ `employee_id`
- ✅ `menu_id` 
- ✅ `delivery_location`
- ✅ `total_price`
- ✅ `status`

## Test du flux

### 1. Test basique
1. Connectez-vous en tant qu'employé
2. Allez sur `/portails/employee`
3. Cliquez sur un plat
4. Remplissez le formulaire
5. Validez la commande

### 2. Vérification dans le portail cuisinier
1. Allez sur `/portails/cook`
2. Vérifiez que la commande apparaît
3. Testez le changement de statut

## Fonctionnalités actuelles

### ✅ Fonctionnent déjà
- Sélection de quantité (affichage seulement)
- Calcul du prix total
- Lieu de livraison
- Instructions spéciales (affichage seulement)
- Interface utilisateur complète

### ⚠️ Limitées sans migration
- Quantité non sauvegardée (utilise 1 par défaut)
- Instructions spéciales non sauvegardées
- Temps de préparation non affiché

## Prochaines étapes

1. **Appliquer les migrations** pour activer toutes les fonctionnalités
2. **Tester le flux complet** avec toutes les colonnes
3. **Vérifier l'affichage** dans le portail cuisinier

## Support

Si les erreurs persistent :
1. Vérifiez les logs Supabase
2. Exécutez le script de diagnostic
3. Contactez l'administrateur de la base de données



