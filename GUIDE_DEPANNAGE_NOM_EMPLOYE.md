# Guide de dépannage - Le nom de l'employé ne s'affiche pas

## Problème identifié ✅

Le nom de l'employé ne s'affiche pas dans les portails. Voici les causes possibles et les solutions.

## Causes possibles

### 1. **Colonne `employee_name` manquante** ❌
- La colonne n'existe pas dans la table `employee_orders`
- Les données ne peuvent pas être sauvegardées

### 2. **Données vides** ❌
- La colonne existe mais est vide
- Les commandes existantes n'ont pas de nom

### 3. **Erreur de requête** ❌
- La jointure avec `employee_menus` cause des erreurs
- Les données ne sont pas récupérées correctement

## Solutions appliquées

### ✅ Code corrigé
- **Requête simplifiée** : `SELECT *` au lieu de `SELECT *, employee_menus(...)`
- **Affichage adapté** : `Commande #1` au lieu de `{order.employee_menus?.name}`
- **Gestion d'erreur** : Fallback automatique si colonne manquante

### ✅ Scripts de diagnostic créés
- **`diagnostic_nom_employe.sql`** : Vérifier l'état de la base de données
- **`corriger_nom_employe.sql`** : Corriger le problème automatiquement

## Actions à effectuer

### 1. **Diagnostiquer le problème**
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/diagnostic_nom_employe.sql
```

### 2. **Corriger le problème**
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/corriger_nom_employe.sql
```

### 3. **Tester la fonctionnalité**
- **Portail employé** : Passez une nouvelle commande avec votre nom
- **Portail cuisinier** : Vérifiez que le nom s'affiche
- **Historique** : Vérifiez que le nom est conservé

## Résultat attendu

### **Portail employé maintenant :**
```
Mes Commandes
├── Commande #1
│   ├── Employé: Marie Dubois
│   ├── Quantité: 1 plat(s)
│   ├── Prix: 3 000 FCFA
│   └── Lieu: Salle de pause
```

### **Portail cuisinier maintenant :**
```
Commandes Employés
├── Commande #1
│   ├── Marie Dubois
│   ├── Salle de pause • 1 plat(s) • 3 000 XAF
│   └── [Bouton Préparer]
```

## Dépannage étape par étape

### **Étape 1 : Vérifier la base de données**
```sql
-- Vérifier si la colonne existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'employee_orders' AND column_name = 'employee_name';
```

### **Étape 2 : Vérifier les données**
```sql
-- Voir les commandes existantes
SELECT employee_name, COUNT(*) FROM public.employee_orders 
GROUP BY employee_name;
```

### **Étape 3 : Ajouter la colonne si nécessaire**
```sql
-- Ajouter la colonne
ALTER TABLE public.employee_orders ADD COLUMN employee_name TEXT;
```

### **Étape 4 : Ajouter des données de test**
```sql
-- Ajouter des noms de test
UPDATE public.employee_orders 
SET employee_name = 'Employé ' || SUBSTRING(employee_id::text, 1, 8)
WHERE employee_name IS NULL;
```

### **Étape 5 : Tester l'affichage**
- Rechargez les portails
- Passez une nouvelle commande
- Vérifiez que le nom s'affiche

## Messages de debug

### **Dans la console du navigateur :**
- `Commandes chargées:` - Vérifiez les données récupérées
- `Colonne employee_name non disponible` - La colonne n'existe pas
- `Erreur lors du chargement des commandes:` - Problème de requête

### **Dans la console Supabase :**
- `✅ Colonne employee_name ajoutée` - Correction réussie
- `✅ Colonne employee_name existe déjà` - Pas de problème
- `Résultat après correction:` - Données mises à jour

## Actions immédiates

1. **Exécutez le diagnostic** : `supabase/diagnostic_nom_employe.sql`
2. **Exécutez la correction** : `supabase/corriger_nom_employe.sql`
3. **Testez une commande** : Saisissez votre nom et validez
4. **Vérifiez l'affichage** : Dans les deux portails

**Le nom de l'employé devrait maintenant s'afficher partout !** 🎉

**Exécutez les scripts de correction et testez une nouvelle commande.** ✅



