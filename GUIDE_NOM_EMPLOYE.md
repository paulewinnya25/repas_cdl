# Guide - Ajout du nom de l'employé dans les commandes

## Fonctionnalité ajoutée ✅

L'employé peut maintenant saisir son nom lors de la commande, et ce nom s'affiche dans tous les portails.

## Modifications apportées

### ✅ Interface utilisateur
- **Champ "Nom de l'employé"** ajouté au formulaire de commande
- **Validation** : Le nom est obligatoire pour passer une commande
- **Affichage** : Le nom s'affiche dans les commandes du portail employé et cuisinier

### ✅ Base de données
- **Colonne `employee_name`** ajoutée à la table `employee_orders`
- **Migration** : Script `supabase/add_employee_name_to_orders.sql` créé
- **Données existantes** : Mise à jour automatique avec des noms par défaut

### ✅ Code modifié
- **Types TypeScript** : Interface `EmployeeOrder` mise à jour
- **Portail employé** : Formulaire et affichage des commandes
- **Portail cuisinier** : Affichage du nom de l'employé
- **Validation** : Vérification que le nom est saisi

## Actions à effectuer

### 1. Exécuter la migration de base de données
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/add_employee_name_to_orders.sql
```

### 2. Redémarrer le serveur de développement
```bash
# Arrêtez le serveur (Ctrl+C) et relancez
npm run dev
```

### 3. Tester la fonctionnalité
- **Portail employé** : Cliquez sur un menu → Saisissez votre nom → Validez
- **Portail cuisinier** : Vérifiez que le nom de l'employé s'affiche
- **Historique** : Vérifiez que le nom s'affiche dans les commandes précédentes

## Résultat attendu

### Portail employé :
- ✅ **Formulaire** : Champ "Nom de l'employé *" en haut du formulaire
- ✅ **Validation** : Message d'erreur si le nom n'est pas saisi
- ✅ **Affichage** : Nom de l'employé dans l'historique des commandes

### Portail cuisinier :
- ✅ **Commandes employés** : Affichage "Employé: [Nom]" au lieu de "Employé ID: ..."
- ✅ **Fallback** : Si pas de nom, affichage de l'ID employé

### Base de données :
- ✅ **Colonne `employee_name`** : Ajoutée à `employee_orders`
- ✅ **Données existantes** : Mises à jour avec des noms par défaut
- ✅ **Nouvelles commandes** : Nom de l'employé sauvegardé

## Dépannage

### Si TypeScript affiche des erreurs :
1. **Redémarrez le serveur** : `npm run dev`
2. **Vérifiez les types** : Le fichier `src/types/repas-cdl.ts` doit contenir `employee_name?: string;`
3. **Cache TypeScript** : Parfois il faut redémarrer l'IDE

### Si la migration échoue :
1. **Vérifiez la table** : `SELECT * FROM information_schema.columns WHERE table_name='employee_orders';`
2. **Exécutez manuellement** : `ALTER TABLE public.employee_orders ADD COLUMN employee_name TEXT;`

### Si le nom ne s'affiche pas :
1. **Vérifiez la console** : Messages d'erreur dans le navigateur
2. **Vérifiez la base** : `SELECT employee_name FROM public.employee_orders LIMIT 5;`
3. **Rechargez la page** : Parfois il faut rafraîchir

## Notes importantes

- **Nom obligatoire** : L'employé doit saisir son nom pour passer une commande
- **Affichage partout** : Le nom s'affiche dans tous les portails
- **Fallback gracieux** : Si pas de nom, affichage de l'ID employé
- **Rétrocompatibilité** : Les commandes existantes sont mises à jour automatiquement

**La fonctionnalité est maintenant complète ! L'employé peut saisir son nom et il s'affiche partout.** 🎉



