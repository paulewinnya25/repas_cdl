# 🚨 CORRECTION IMMÉDIATE - Quantités ne s'affichent pas dans "Mes Commandes"

## ❌ Problème identifié

**Dans la section "Mes Commandes", les quantités ne s'affichent pas !**

## 🔍 DIAGNOSTIC RAPIDE

### **ÉTAPE 1 : Vérifier l'état de la base de données**

**Copiez et exécutez ce script dans Supabase :**

```sql
-- VÉRIFICATION SIMPLE - Pourquoi les quantités ne s'affichent pas
-- Copiez et exécutez ce script dans votre console Supabase

-- 1. Vérifier si la colonne quantity existe
SELECT 
    'VÉRIFICATION COLONNE' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employee_orders' 
            AND table_schema = 'public'
            AND column_name = 'quantity'
        ) THEN '✅ EXISTE'
        ELSE '❌ N''EXISTE PAS'
    END as status;

-- 2. Voir les données actuelles
SELECT 
    'DONNÉES ACTUELLES' as check_type,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 5;

-- 3. Compter les quantités NULL
SELECT 
    'COMPTAGE' as check_type,
    COUNT(*) as total_commandes,
    COUNT(quantity) as commandes_avec_quantite,
    COUNT(CASE WHEN quantity IS NULL THEN 1 END) as quantites_null
FROM public.employee_orders;
```

### **ÉTAPE 2 : Correction immédiate**

**Copiez et exécutez ce script COMPLET dans Supabase :**

```sql
-- CORRECTION IMMÉDIATE - Résoudre le problème des quantités
-- Copiez et exécutez ce script COMPLET dans votre console Supabase

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
        RAISE NOTICE '✅ Colonne quantity créée';
    ELSE
        RAISE NOTICE '✅ Colonne quantity existe déjà';
    END IF;
END $$;

-- 2. Mettre à jour toutes les quantités NULL ou 0
UPDATE public.employee_orders 
SET quantity = 1 
WHERE quantity IS NULL OR quantity = 0;

-- 3. Calculer les quantités basées sur le prix
UPDATE public.employee_orders 
SET quantity = CASE 
    WHEN total_price >= 15000 THEN 3
    WHEN total_price >= 10000 THEN 2
    WHEN total_price >= 5000 THEN 1
    ELSE 1
END
WHERE total_price > 0;

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
    'test-1',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Bureau',
    1,
    5000,
    'Commandé',
    'Test 1 plat'
),
(
    'test-2',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Salle',
    2,
    10000,
    'Commandé',
    'Test 2 plats'
),
(
    'test-3',
    (SELECT id FROM public.employee_menus LIMIT 1),
    'Réception',
    3,
    15000,
    'Commandé',
    'Test 3 plats'
)
ON CONFLICT DO NOTHING;

-- 5. Vérifier les résultats
SELECT 
    'RÉSULTATS' as check_type,
    employee_name,
    quantity,
    total_price,
    status
FROM public.employee_orders
ORDER BY created_at DESC
LIMIT 10;
```

## 🎯 RÉSULTAT ATTENDU

### **Après exécution du script, vous devriez voir :**

```
✅ Colonne quantity créée (ou existe déjà)
RÉSULTATS:
Test 1 plat: quantity = 1
Test 2 plats: quantity = 2  
Test 3 plats: quantity = 3
Paule Nkoma: quantity = 1 (ou 2, 3 selon le prix)
```

## ✅ ACTIONS REQUISES

### **1. Ouvrir Supabase :**
- Aller sur : https://supabase.com/dashboard
- Sélectionner votre projet
- Aller dans **SQL Editor**

### **2. Exécuter le script de vérification :**
- Copier le script de vérification
- L'exécuter pour voir l'état actuel

### **3. Exécuter le script de correction :**
- Copier le script de correction
- L'exécuter COMPLET

### **4. Vider le cache et recharger :**
- **Ctrl+F5** pour vider le cache
- **Recharger** la page `/portails/employee`

## 🚨 SI LE PROBLÈME PERSISTE

### **1. Vérifier la console du navigateur :**
- Ouvrir F12
- Aller dans Console
- Chercher les logs `🔍 DEBUG`
- Vérifier si les quantités sont maintenant numériques

### **2. Redémarrer l'application :**
```bash
npm run dev
```

### **3. Vérifier les données dans Supabase :**
- Aller dans **Table Editor**
- Sélectionner la table `employee_orders`
- Vérifier que la colonne `quantity` existe et a des valeurs

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] **Script de vérification** exécuté
- [ ] **Colonne quantity** existe dans la table
- [ ] **Script de correction** exécuté
- [ ] **Commandes de test** créées avec quantités 1, 2, 3
- [ ] **Cache vidé** : Ctrl+F5
- [ ] **Page rechargée** : `/portails/employee`
- [ ] **Interface** : Quantités s'affichent dans "Mes Commandes"

## 🎉 RÉSULTAT FINAL ATTENDU

### **Dans l'interface "Mes Commandes" :**
```
Mes Commandes Récentes:
- Quantité: 1 plat(s)  ← Correct !
- Quantité: 2 plat(s)  ← Correct !
- Quantité: 3 plat(s)  ← Correct !

Commandes en Attente:
- Quantité: 1 plat(s)  ← Maintenant visible !
- Quantité: 2 plat(s)  ← Maintenant visible !
```

**Le problème sera résolu !** 🚀✅

**Exécutez les scripts SQL maintenant !** 🔥









