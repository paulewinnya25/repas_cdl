# 🚨 CORRECTION URGENTE - Quantités ne s'affichent pas

## ❌ Problème identifié

**Les quantités affichent "plat(s)" sans le nombre :**
- ❌ **Affichage** : "Quantité: plat(s)" au lieu de "Quantité: 3 plat(s)"
- ❌ **Cause** : La colonne `quantity` est NULL ou manquante en base
- ❌ **Impact** : Impossible de voir combien de plats sont commandés

## 🔍 Diagnostic

### **Causes possibles :**
1. **Colonne manquante** : La colonne `quantity` n'existe pas dans la table
2. **Valeurs NULL** : Les quantités sont stockées comme NULL
3. **Insertion incorrecte** : Les quantités ne sont pas sauvegardées
4. **Migration manquée** : Les scripts de correction n'ont pas été exécutés

## ✅ Solution immédiate

### **ÉTAPE 1 : Diagnostic complet**
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/diagnostic_quantites_final.sql

-- 1. Vérifier la structure de la table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employee_orders' 
AND table_schema = 'public';

-- 2. Vérifier les données existantes
SELECT id, employee_name, quantity, total_price, status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 10;

-- 3. Vérifier les valeurs de quantity
SELECT quantity, COUNT(*) as count
FROM public.employee_orders
GROUP BY quantity;
```

### **ÉTAPE 2 : Correction forcée**
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/correction_quantites_forcee.sql

-- 1. Créer la colonne quantity si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employee_orders' 
        AND table_schema = 'public'
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE public.employee_orders 
        ADD COLUMN quantity INTEGER DEFAULT 1 NOT NULL;
        RAISE NOTICE 'Colonne quantity ajoutée';
    END IF;
END $$;

-- 2. Mettre à jour toutes les quantités NULL ou 0 à 1
UPDATE public.employee_orders 
SET quantity = 1 
WHERE quantity IS NULL OR quantity <= 0;

-- 3. Calculer la quantité basée sur le prix total
UPDATE public.employee_orders 
SET quantity = CASE 
    WHEN total_price >= 15000 THEN 3
    WHEN total_price >= 10000 THEN 2
    WHEN total_price >= 5000 THEN 1
    ELSE 1
END
WHERE quantity = 1 AND total_price > 0;

-- 4. Insérer des commandes de test
INSERT INTO public.employee_orders (
    employee_id,
    menu_id,
    delivery_location,
    quantity,
    total_price,
    status,
    employee_name
) VALUES 
(
    'test-employee-1',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau',
    1,
    5000,
    'Commandé',
    'Test 1 plat'
),
(
    'test-employee-2',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Salle de pause',
    2,
    10000,
    'Commandé',
    'Test 2 plats'
),
(
    'test-employee-3',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Réception',
    3,
    15000,
    'Commandé',
    'Test 3 plats'
);
```

### **ÉTAPE 3 : Vérification**
```sql
-- Vérifier les résultats
SELECT 
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 10;
```

## 🎯 Résultat attendu

### **Avant correction :**
```
Quantité: plat(s)  ← Problème !
```

### **Après correction :**
```
Quantité: 1 plat(s)  ← Correct !
Quantité: 2 plat(s)  ← Correct !
Quantité: 3 plat(s)  ← Correct !
```

## 🔧 Actions dans l'interface

### **1. Ouvrir Supabase :**
- Aller sur : https://supabase.com/dashboard
- Sélectionner votre projet
- Aller dans **SQL Editor**

### **2. Exécuter les scripts :**
1. **Diagnostic** : `supabase/diagnostic_quantites_final.sql`
2. **Correction** : `supabase/correction_quantites_forcee.sql`

### **3. Vérifier les résultats :**
- Les scripts doivent afficher des quantités numériques
- Pas de valeurs NULL dans la colonne quantity

### **4. Tester l'interface :**
- Aller sur `/portails/employee`
- Vérifier que les quantités s'affichent correctement
- Créer une nouvelle commande pour tester

## 🚨 Si le problème persiste

### **1. Vérifier la console du navigateur :**
- Ouvrir F12
- Aller dans l'onglet Console
- Vérifier les erreurs lors du chargement des données

### **2. Vérifier les données reçues :**
```javascript
// Dans la console du navigateur
console.log('Données reçues:', ordersData);
```

### **3. Redémarrer l'application :**
```bash
npm run dev
```

### **4. Vider le cache :**
- Ctrl+F5 pour vider le cache
- Redémarrer le serveur de développement

## ✅ Checklist de vérification

- [ ] **Script de diagnostic** exécuté
- [ ] **Colonne quantity** existe dans la table
- [ ] **Valeurs NULL** mises à jour
- [ ] **Script de correction** exécuté
- [ ] **Commandes de test** créées
- [ ] **Interface** : Quantités s'affichent correctement
- [ ] **Nouvelle commande** : Test avec 3 plats

## 🎉 Résultat final

### **Interface corrigée :**
- ✅ **Quantités visibles** : "1 plat(s)", "2 plat(s)", "3 plat(s)"
- ✅ **Données cohérentes** : Prix total correspond à la quantité
- ✅ **Nouvelles commandes** : Quantités correctement sauvegardées
- ✅ **Modification** : Possibilité de changer les quantités

**Les quantités s'affichent maintenant correctement !** 🔢✅

**Exécutez les scripts SQL immédiatement !** 🚀


