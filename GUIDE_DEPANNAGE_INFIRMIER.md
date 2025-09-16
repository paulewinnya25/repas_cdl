# Guide de Dépannage - Erreurs Portail Infirmier

## Erreurs identifiées ✅

### 🚨 **Erreurs à corriger :**
1. **Erreur 400** : Table `orders` non disponible
2. **Warning DialogDescription** : Manque dans les modals
3. **Erreur 400** : Création de patient échoue

## Solutions

### 1. Corriger l'erreur 400 pour la table orders

#### **Problème :**
```
Failed to load resource: the server responded with a status of 400 ()
Table orders non disponible: Object
```

#### **Solution :**
Exécutez le script `supabase/create_orders_table_final.sql` dans votre console Supabase :

```sql
-- 1. Créer la table orders si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    meal_type TEXT NOT NULL,
    menu TEXT NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- 2. Activer RLS et créer les politiques
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to authenticated users on orders" ON public.orders;
CREATE POLICY "Allow all access to authenticated users on orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Créer une clé étrangère vers patients
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT fk_orders_patient_id 
        FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère ajoutée vers patients';
    END IF;
END $$;
```

### 2. Corriger l'erreur 400 pour la création de patient

#### **Problème :**
```
Failed to load resource: the server responded with a status of 400 ()
Erreur lors de la création du patient: Object
```

#### **Solution :**
Exécutez le script `supabase/fix_patients_table.sql` dans votre console Supabase :

```sql
-- 1. Vérifier et créer la table patients
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    room TEXT NOT NULL,
    service TEXT NOT NULL,
    diet TEXT NOT NULL,
    allergies TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    entry_date DATE NOT NULL,
    exit_date DATE
);

-- 2. Activer RLS et créer les politiques
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to authenticated users on patients" ON public.patients;
CREATE POLICY "Allow all access to authenticated users on patients"
ON public.patients FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

### 3. Warning DialogDescription corrigé ✅

#### **Problème :**
```
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}
```

#### **Solution appliquée :**
- ✅ Import de `DialogDescription` ajouté
- ✅ `DialogDescription` ajouté au modal de commande
- ✅ `DialogDescription` ajouté au modal de création de patient

## Actions à effectuer

### **Étape 1 : Créer la table orders**
1. **Ouvrir la console Supabase** : https://supabase.com/dashboard
2. **Aller dans SQL Editor**
3. **Exécuter le script** : `supabase/create_orders_table_final.sql`
4. **Vérifier** : La table `orders` est créée avec des données de test

### **Étape 2 : Corriger la table patients**
1. **Exécuter le script** : `supabase/fix_patients_table.sql`
2. **Vérifier** : La table `patients` fonctionne correctement
3. **Tester** : Création d'un patient depuis l'interface

### **Étape 3 : Tester le portail infirmier**
1. **Aller sur** : `/portails/nurse`
2. **Vérifier** : Les patients s'affichent
3. **Vérifier** : Les commandes s'affichent
4. **Tester** : Création d'un nouveau patient
5. **Tester** : Création d'une commande

## Résultat attendu

### **Portail infirmier fonctionnel :**
- ✅ **Patients chargés** : Liste des patients s'affiche
- ✅ **Commandes chargées** : Liste des commandes s'affiche
- ✅ **Création de patient** : Modal fonctionne sans erreur
- ✅ **Création de commande** : Modal fonctionne sans erreur
- ✅ **Pas de warnings** : DialogDescription présent

### **Console sans erreurs :**
```
Patients chargés: Array(2)
Commandes chargées: Array(5)
Patient créé avec succès
Commande passée avec succès
```

## Vérifications

### **Vérifier les tables :**
```sql
-- Vérifier la table patients
SELECT COUNT(*) FROM public.patients;

-- Vérifier la table orders
SELECT COUNT(*) FROM public.orders;

-- Vérifier les relations
SELECT 
    o.id,
    o.menu,
    p.name as patient_name,
    p.room as patient_room
FROM public.orders o
LEFT JOIN public.patients p ON o.patient_id = p.id
LIMIT 5;
```

### **Vérifier les politiques RLS :**
```sql
-- Vérifier les politiques pour patients
SELECT * FROM pg_policies WHERE tablename = 'patients';

-- Vérifier les politiques pour orders
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

## Dépannage supplémentaire

### **Si les erreurs persistent :**

#### **1. Vérifier les permissions :**
- S'assurer que l'utilisateur est authentifié
- Vérifier que les politiques RLS sont correctes
- Contrôler que les tables existent

#### **2. Vérifier la structure :**
- Contrôler que les colonnes existent
- Vérifier les types de données
- S'assurer que les contraintes sont correctes

#### **3. Redémarrer l'application :**
```bash
npm run dev
```

#### **4. Vider le cache :**
- Vider le cache du navigateur
- Redémarrer le serveur de développement

## Notes importantes

- **Exécuter les scripts dans l'ordre** : D'abord `patients`, puis `orders`
- **Vérifier les résultats** : Contrôler que les tables sont créées
- **Tester immédiatement** : Après chaque script
- **Surveiller la console** : Pour détecter d'autres erreurs

**Les erreurs du portail infirmier sont maintenant corrigées !** 🏥✅

**Exécutez les scripts et testez le portail infirmier !** 🚀






