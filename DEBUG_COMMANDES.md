# Guide de débogage - Commandes non visibles dans le portail cuisinier

## Problème
Les commandes créées dans le portail employé n'apparaissent pas dans le portail cuisinier.

## Étapes de débogage

### 1. Vérifier la console du navigateur
Ouvrez la console (F12) et regardez les logs :
- `Commandes employés chargées:` - Doit afficher un tableau
- Erreurs éventuelles lors du chargement

### 2. Vérifier la base de données
Exécutez ce script dans votre console Supabase :
```sql
-- Voir toutes les commandes employés
SELECT 
    eo.id,
    eo.employee_id,
    eo.menu_id,
    eo.delivery_location,
    eo.total_price,
    eo.status,
    eo.created_at,
    em.name as menu_name
FROM public.employee_orders eo
LEFT JOIN public.employee_menus em ON eo.menu_id = em.id
ORDER BY eo.created_at DESC;
```

### 3. Vérifier les menus employés
```sql
-- Vérifier s'il y a des menus
SELECT 
    id,
    name,
    price,
    is_available
FROM public.employee_menus
ORDER BY created_at DESC;
```

### 4. Tester la création d'une commande
1. Allez sur `/portails/employee`
2. Cliquez sur un plat
3. Remplissez le formulaire
4. Validez la commande
5. Vérifiez dans la console s'il y a des erreurs

### 5. Vérifier les permissions RLS
Le problème pourrait être lié aux politiques RLS. Vérifiez :
```sql
-- Voir les politiques sur employee_orders
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'employee_orders';
```

## Solutions possibles

### Solution 1 : Problème de jointure
- ✅ **Corrigé** : Suppression de la jointure avec `profiles`
- ✅ **Corrigé** : Affichage de l'ID employé au lieu du nom

### Solution 2 : Problème de permissions
Si les commandes existent mais ne s'affichent pas, vérifiez les politiques RLS.

### Solution 3 : Problème de données
Si aucune commande n'est créée, vérifiez :
- La table `employee_menus` contient des menus
- L'utilisateur est bien connecté
- Les colonnes existent dans `employee_orders`

## Test rapide

1. **Créer un menu de test** :
```sql
INSERT INTO public.employee_menus (name, description, price, is_available)
VALUES ('Test Menu', 'Menu de test', 1000, true);
```

2. **Créer une commande de test** :
```sql
INSERT INTO public.employee_orders (employee_id, menu_id, delivery_location, total_price, status)
VALUES (
    'votre-employee-id',
    'votre-menu-id',
    'Bureau',
    1000,
    'Commandé'
);
```

3. **Vérifier dans le portail cuisinier**

## Logs à surveiller

Dans la console du navigateur :
- `Commandes employés chargées:` - Doit montrer les commandes
- Erreurs Supabase éventuelles
- Erreurs de réseau (400, 500, etc.)






