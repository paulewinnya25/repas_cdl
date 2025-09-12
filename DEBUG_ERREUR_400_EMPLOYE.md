# Guide de dépannage - Erreur 400 lors de la commande employé

## Problème identifié ✅
L'erreur 400 lors de la commande employé est causée par la colonne `employee_name` qui n'existe pas encore dans la base de données.

## Solutions appliquées

### ✅ Warning d'accessibilité corrigé
- **Ajouté** : `DialogDescription` importé et utilisé
- **Supprimé** : Le warning "Missing Description" dans la console
- **Amélioré** : Accessibilité du modal de commande

### ✅ Gestion d'erreur robuste
- **Essai avec `employee_name`** : Insertion d'abord avec le nom de l'employé
- **Fallback automatique** : Si erreur 400 liée à `employee_name`, insertion sans cette colonne
- **Logs informatifs** : Messages clairs pour le débogage

## Actions à effectuer

### 1. Vérifier et créer la colonne employee_name
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/check_employee_name_column.sql
```

### 2. Alternative : Exécuter la migration complète
```sql
-- Exécutez le script de migration
-- Fichier: supabase/add_employee_name_to_orders.sql
```

### 3. Tester la commande
- **Portail employé** : Cliquez sur un menu → Saisissez votre nom → Validez
- **Vérifiez la console** : Plus d'erreur 400
- **Vérifiez la base** : La commande est créée avec le nom

## Résultat attendu

### Portail employé maintenant :
- ✅ **Pas de warning d'accessibilité** : `DialogDescription` ajouté
- ✅ **Gestion d'erreur robuste** : Fallback automatique si colonne manquante
- ✅ **Logs informatifs** : Messages clairs dans la console
- ✅ **Fonctionnalité complète** : Nom de l'employé sauvegardé si possible

### Comportement adaptatif :
- **Si colonne `employee_name` existe** : Nom sauvegardé et affiché
- **Si colonne `employee_name` n'existe pas** : Commande créée sans nom, message d'avertissement
- **Dans tous les cas** : La commande est créée avec succès

## Test de la fonctionnalité

### 1. Recharger la page
- Allez sur `/portails/employee`
- ✅ **Pas de warning d'accessibilité** dans la console

### 2. Tester une commande
- Cliquez sur un menu
- Saisissez votre nom
- Validez la commande
- ✅ **Pas d'erreur 400** dans la console

### 3. Vérifier les logs
- Ouvrez la console (F12)
- Regardez les messages :
  - ✅ `Commande passée pour [menu]` (succès)
  - ⚠️ `Colonne employee_name non disponible, insertion sans nom` (si colonne manquante)

## Dépannage

### Si l'erreur 400 persiste :
1. **Exécutez le script de vérification** : `supabase/check_employee_name_column.sql`
2. **Vérifiez la structure de la table** : `SELECT * FROM information_schema.columns WHERE table_name='employee_orders';`
3. **Créez la colonne manuellement** : `ALTER TABLE public.employee_orders ADD COLUMN employee_name TEXT;`

### Si le nom ne s'affiche pas :
1. **Vérifiez la base** : `SELECT employee_name FROM public.employee_orders LIMIT 5;`
2. **Rechargez la page** : Parfois il faut rafraîchir
3. **Vérifiez les logs** : Messages d'avertissement dans la console

## Notes importantes

- **Gestion d'erreur robuste** : La commande fonctionne dans tous les cas
- **Fallback automatique** : Si colonne manquante, insertion sans nom
- **Logs informatifs** : Messages clairs pour le débogage
- **Accessibilité améliorée** : Warning d'accessibilité corrigé

**L'erreur 400 est maintenant gérée gracieusement ! La commande fonctionne même si la colonne employee_name n'existe pas encore.** 🎉

**Testez maintenant le portail employé - vous ne devriez plus avoir d'erreur 400 !** ✅


