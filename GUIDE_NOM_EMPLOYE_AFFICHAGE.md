# Guide - Où s'affiche le nom de l'employé ?

## Emplacements d'affichage du nom de l'employé

Le nom de l'employé devrait s'afficher dans **3 endroits principaux** :

### 1. **Portail Employé** - Historique des commandes
- **Emplacement** : Section "Mes Commandes" et "Commandes en Attente"
- **Affichage** : `Employé: [Nom de l'employé]`
- **Exemple** : `Employé: Marie Dubois`

### 2. **Portail Cuisinier** - Commandes employés
- **Emplacement** : Onglet "Commandes Employés"
- **Affichage** : `[Nom de l'employé]` (sous le numéro de commande)
- **Exemple** : 
  ```
  Commande #1
  Marie Dubois
  Salle de pause • 1 plat(s) • 3 000 XAF
  ```

### 3. **Formulaire de commande** - Champ de saisie
- **Emplacement** : Modal de commande dans le portail employé
- **Affichage** : Champ "Nom de l'employé *" (obligatoire)
- **Exemple** : Input avec placeholder "Votre nom complet"

## Problème identifié

Le nom de l'employé ne s'affiche probablement pas parce que :

1. **Colonne `employee_name` manquante** : La colonne n'existe pas dans la base de données
2. **Données vides** : La colonne existe mais est vide
3. **Erreur d'insertion** : Le nom n'est pas sauvegardé lors de la commande

## Solution

### 1. Exécuter le script de correction
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/fix_employee_name_display.sql
```

### 2. Vérifier l'affichage
- **Portail employé** : Regardez l'historique des commandes
- **Portail cuisinier** : Regardez l'onglet "Commandes Employés"
- **Nouvelle commande** : Saisissez votre nom et vérifiez l'affichage

### 3. Tester le flux complet
- **Portail employé** : Passez une commande avec votre nom
- **Portail cuisinier** : Vérifiez que le nom s'affiche
- **Historique** : Vérifiez que le nom est conservé

## Résultat attendu

### Portail employé :
```
Mes Commandes
├── Commande #1
│   ├── Employé: Marie Dubois
│   ├── Quantité: 1 plat(s)
│   ├── Prix: 3 000 FCFA
│   └── Lieu: Salle de pause
```

### Portail cuisinier :
```
Commandes Employés
├── Commande #1
│   ├── Marie Dubois
│   ├── Salle de pause • 1 plat(s) • 3 000 XAF
│   └── [Bouton Préparer]
```

## Dépannage

### Si le nom ne s'affiche pas dans le portail employé :
1. **Vérifiez la console** : Messages d'erreur lors du chargement
2. **Vérifiez la base** : `SELECT employee_name FROM public.employee_orders;`
3. **Rechargez la page** : Parfois il faut rafraîchir

### Si le nom ne s'affiche pas dans le portail cuisinier :
1. **Vérifiez les logs** : Messages d'avertissement dans la console
2. **Vérifiez la requête** : La colonne `employee_name` est-elle sélectionnée ?
3. **Vérifiez les données** : Les commandes ont-elles un nom ?

### Si le nom n'est pas sauvegardé :
1. **Vérifiez la validation** : Le champ nom est-il obligatoire ?
2. **Vérifiez l'insertion** : Messages d'erreur lors de la commande
3. **Vérifiez la colonne** : Existe-t-elle dans la base de données ?

## Actions immédiates

1. **Exécutez le script** : `supabase/fix_employee_name_display.sql`
2. **Testez une commande** : Saisissez votre nom et validez
3. **Vérifiez l'affichage** : Dans les deux portails
4. **Rechargez les pages** : Pour voir les changements

**Le nom de l'employé devrait maintenant s'afficher partout !** 🎉

**Exécutez le script de correction et testez une nouvelle commande pour voir le nom s'afficher.** ✅






