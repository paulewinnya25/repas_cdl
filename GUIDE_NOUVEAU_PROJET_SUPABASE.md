# 🚨 PROBLÈME IDENTIFIÉ - Votre projet de repas n'est pas visible

## ❌ Problème identifié

**Vous êtes sur Supabase mais votre projet de gestion des repas n'est pas visible !**

## 🔍 ANALYSE DE LA SITUATION

### **Votre dashboard Supabase montre :**
- ✅ **"Quizzcdl"** (projet en pause)
- ✅ **"Projet de yohann.olympio@gmail.com"** (projet en pause)
- ❌ **Projet de gestion des repas** (ID: `gjjjnltiwplzzgovusvf`) - **MANQUANT**

### **Votre configuration actuelle :**
- **URL** : `https://gjjjnltiwplzzgovusvf.supabase.co`
- **Clé publique** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Statut** : ❌ Projet non visible dans votre dashboard

## 🔍 SOLUTIONS POSSIBLES

### **SOLUTION 1 : Vérifier un autre compte**

Le projet `gjjjnltiwplzzgovusvf` pourrait être dans un autre compte Supabase :

1. **Déconnectez-vous** de Supabase
2. **Reconnectez-vous** avec un autre compte email
3. **Vérifiez** si le projet apparaît

### **SOLUTION 2 : Créer un nouveau projet (RECOMMANDÉ)**

Puisque votre projet actuel n'est pas visible, créons un nouveau projet :

#### **ÉTAPE 1 : Créer un nouveau projet**
1. **Cliquer** sur "Nouveau projet" (bouton vert)
2. **Nommer** le projet : "Gestion Repas CDL"
3. **Choisir** une région proche (Europe)
4. **Créer** le projet

#### **ÉTAPE 2 : Récupérer les nouvelles informations**
1. **Aller** dans Settings > API
2. **Copier** la nouvelle URL et clé publique
3. **Mettre à jour** le fichier `src/integrations/supabase/client.ts`

#### **ÉTAPE 3 : Créer les tables nécessaires**
```sql
-- Créer la table employee_orders avec la colonne quantity
CREATE TABLE public.employee_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL,
    employee_name TEXT,
    menu_id TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    special_instructions TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'Commandé' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table employee_menus
CREATE TABLE public.employee_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    photo_url TEXT,
    preparation_time INTEGER DEFAULT 30,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'Employé',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer des données de test
INSERT INTO public.employee_menus (name, description, price) VALUES
('Menu Standard', 'Plat du jour avec accompagnement', 5000),
('Menu Premium', 'Plat premium avec dessert', 10000),
('Menu Deluxe', 'Menu complet avec entrée et dessert', 15000);

-- Insérer des commandes de test avec quantités
INSERT INTO public.employee_orders (employee_id, employee_name, menu_id, delivery_location, quantity, total_price, status) VALUES
('test-employee-1', 'Paule Nkoma', (SELECT id FROM public.employee_menus LIMIT 1), 'Bureau', 1, 5000, 'Commandé'),
('test-employee-2', 'Jean Dupont', (SELECT id FROM public.employee_menus LIMIT 1), 'Salle de pause', 2, 10000, 'Commandé'),
('test-employee-3', 'Marie Martin', (SELECT id FROM public.employee_menus LIMIT 1), 'Réception', 3, 15000, 'Commandé');
```

### **SOLUTION 3 : Utiliser un projet existant**

Si vous voulez utiliser un de vos projets existants :

1. **Cliquer** sur "Quizzcdl" ou "Projet de yohann.olympio@gmail.com"
2. **Aller** dans Settings > API
3. **Copier** l'URL et la clé publique
4. **Mettre à jour** la configuration

## 🔧 CORRECTION IMMÉDIATE

### **ÉTAPE 1 : Créer un nouveau projet**
1. **Cliquer** sur "Nouveau projet"
2. **Nommer** : "Gestion Repas CDL"
3. **Créer** le projet

### **ÉTAPE 2 : Mettre à jour la configuration**
```typescript
// Dans src/integrations/supabase/client.ts
const SUPABASE_URL = "VOTRE_NOUVELLE_URL";
const SUPABASE_PUBLISHABLE_KEY = "VOTRE_NOUVELLE_CLE";
```

### **ÉTAPE 3 : Créer les tables**
Exécuter le script SQL ci-dessus dans SQL Editor

### **ÉTAPE 4 : Tester l'application**
1. **Redémarrer** l'application : `npm run dev`
2. **Aller** sur `/portails/employee`
3. **Vérifier** que les quantités s'affichent

## ✅ ACTIONS REQUISES

### **1. Créer un nouveau projet :**
- Cliquer sur "Nouveau projet"
- Nommer "Gestion Repas CDL"
- Choisir une région proche

### **2. Récupérer les nouvelles informations :**
- Aller dans Settings > API
- Copier URL et clé publique

### **3. Mettre à jour la configuration :**
- Modifier `src/integrations/supabase/client.ts`
- Redémarrer l'application

### **4. Créer les tables :**
- Aller dans SQL Editor
- Exécuter le script de création des tables

## 🎯 RÉSULTAT ATTENDU

### **Après correction :**
```
Mes Commandes Récentes:
- Quantité: 1 plat(s)  ← Correct !
- Quantité: 2 plat(s)  ← Correct !
- Quantité: 3 plat(s)  ← Correct !
```

## 📞 RECOMMANDATION

**Je recommande de créer un nouveau projet** car :
- ✅ Vous avez le contrôle total
- ✅ Pas de problèmes d'accès
- ✅ Configuration propre
- ✅ Données de test incluses

**Créez un nouveau projet maintenant !** 🚀✅


