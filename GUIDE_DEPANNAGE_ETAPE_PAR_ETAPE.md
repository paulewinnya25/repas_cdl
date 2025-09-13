# Guide de dépannage étape par étape - Nom employé ne s'affiche pas

## Problème confirmé ✅

L'image montre "Employé: Non spécifié" pour toutes les commandes, ce qui confirme que le problème persiste.

## Diagnostic étape par étape

### **ÉTAPE 1 : Vérifier la base de données**
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/test_simple_employee_name.sql
```

### **ÉTAPE 2 : Vérifier le code côté client**
Ouvrez la console du navigateur (F12) et regardez :
- Y a-t-il des erreurs JavaScript ?
- Les données sont-elles récupérées correctement ?
- Le champ `employee_name` est-il présent dans les données ?

### **ÉTAPE 3 : Tester l'insertion**
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/test_insertion_avec_nom.sql
```

## Solutions possibles

### **Solution 1 : Colonne manquante**
Si la colonne `employee_name` n'existe pas :
```sql
ALTER TABLE public.employee_orders ADD COLUMN employee_name TEXT;
```

### **Solution 2 : Données vides**
Si la colonne existe mais est vide :
```sql
UPDATE public.employee_orders 
SET employee_name = 'Employé Test ' || SUBSTRING(id::text, 1, 8)
WHERE employee_name IS NULL OR employee_name = '';
```

### **Solution 3 : Problème de cache**
- Rechargez la page (F5)
- Videz le cache du navigateur (Ctrl+Shift+R)
- Redémarrez le serveur de développement

### **Solution 4 : Problème de requête**
Vérifiez que la requête récupère bien la colonne `employee_name` :
```sql
SELECT employee_name FROM public.employee_orders LIMIT 5;
```

## Actions immédiates

### **1. Exécutez le diagnostic complet**
```sql
-- Copiez et exécutez ce script dans votre console Supabase
-- Fichier: supabase/test_simple_employee_name.sql
```

### **2. Vérifiez la console du navigateur**
- Ouvrez F12
- Regardez l'onglet "Console"
- Y a-t-il des erreurs ?

### **3. Testez une nouvelle commande**
- Allez sur le portail employé
- Cliquez sur un menu
- Saisissez votre nom
- Validez la commande
- Vérifiez l'affichage

### **4. Vérifiez la base de données**
```sql
-- Vérifiez que la commande a bien été créée avec le nom
SELECT employee_name, COUNT(*) 
FROM public.employee_orders 
GROUP BY employee_name;
```

## Messages de debug

### **Dans la console Supabase :**
- `✅ Colonne employee_name existe` - La colonne existe
- `❌ Colonne employee_name manquante` - Il faut l'ajouter
- `Commande de test insérée:` - Test réussi

### **Dans la console du navigateur :**
- `Commandes chargées:` - Vérifiez les données
- `Erreur lors du chargement:` - Problème de requête
- `Colonne employee_name non disponible` - Fallback activé

## Résultat attendu

Après correction, vous devriez voir :
```
Mes Commandes Récentes
├── Commande #1
│   ├── Employé: Employé Test 12345678
│   ├── Quantité: 1 plat(s)
│   ├── Prix: 3 000 FCFA
│   └── Lieu: Salle de pause
```

## Prochaines étapes

1. **Exécutez le diagnostic** : `supabase/test_simple_employee_name.sql`
2. **Vérifiez la console** : Erreurs JavaScript ?
3. **Testez l'insertion** : `supabase/test_insertion_avec_nom.sql`
4. **Rechargez la page** : Pour voir les changements

**Exécutez le diagnostic complet et dites-moi ce que vous voyez dans la console Supabase !** 🔍



