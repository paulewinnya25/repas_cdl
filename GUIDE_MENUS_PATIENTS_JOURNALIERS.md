# Guide - Menus Patients Journaliers avec Régimes Alimentaires

## Fonctionnalité mise à jour ✅

Les menus des patients sont maintenant des **menus journaliers** adaptés aux **régimes alimentaires** des patients, avec une structure complète et professionnelle.

## Nouvelle structure des menus patients

### 🏥 **Régimes alimentaires supportés :**
- **Normal** : Alimentation standard
- **Diabétique** : Contrôle glycémique
- **Cardiaque** : Santé cardiovasculaire
- **Hypertension** : Contrôle tensionnel
- **Sans sel** : Régime hyposodé
- **Sans gluten** : Intolérance au gluten
- **Végétarien** : Sans viande
- **Végétalien** : Sans produits animaux
- **Hypocalorique** : Perte de poids
- **Hypercalorique** : Prise de poids
- **Protéiné** : Régime riche en protéines
- **Liquide** : Alimentation liquide

### 🍽️ **Types de repas :**
- **Petit-déjeuner** : Repas du matin
- **Déjeuner** : Repas de midi
- **Dîner** : Repas du soir
- **Collation** : En-cas entre les repas

### 📅 **Jours de la semaine :**
- Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche

### 📊 **Informations nutritionnelles :**
- **Calories** : Valeur énergétique
- **Protéines** : En grammes
- **Glucides** : En grammes
- **Lipides** : En grammes
- **Fibres** : En grammes

## Actions à effectuer

### 1. Créer la nouvelle table patient_menus
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/create_patient_menus_daily.sql

-- 1. Supprimer l'ancienne table si elle existe
DROP TABLE IF EXISTS public.patient_menus CASCADE;

-- 2. Créer la nouvelle table patient_menus avec structure améliorée
CREATE TABLE public.patient_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    price NUMERIC(10, 2) NOT NULL,
    
    -- Régime alimentaire
    dietary_restriction TEXT NOT NULL CHECK (dietary_restriction IN (
        'Normal', 'Diabétique', 'Cardiaque', 'Hypertension', 
        'Sans sel', 'Sans gluten', 'Végétarien', 'Végétalien',
        'Hypocalorique', 'Hypercalorique', 'Protéiné', 'Liquide'
    )),
    
    -- Type de repas
    meal_type TEXT NOT NULL CHECK (meal_type IN (
        'Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'
    )),
    
    -- Jour de la semaine
    day_of_week TEXT NOT NULL CHECK (day_of_week IN (
        'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
    )),
    
    -- Informations nutritionnelles
    calories INTEGER,
    protein_g NUMERIC(5,2),
    carbs_g NUMERIC(5,2),
    fat_g NUMERIC(5,2),
    fiber_g NUMERIC(5,2),
    
    -- Statut et dates
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Activer RLS et créer les politiques
ALTER TABLE public.patient_menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to authenticated users on patient_menus" ON public.patient_menus;
CREATE POLICY "Allow all access to authenticated users on patient_menus"
ON public.patient_menus FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Créer un index pour les recherches fréquentes
CREATE INDEX idx_patient_menus_dietary_day ON public.patient_menus(dietary_restriction, day_of_week, meal_type);

-- 5. Insérer des menus patients par régime et jour (exemples pour Lundi)
INSERT INTO public.patient_menus (name, description, dietary_restriction, meal_type, day_of_week, price, calories, protein_g, carbs_g, fat_g, fiber_g) VALUES

-- MENUS NORMALS - LUNDI
('Petit-déjeuner Lundi Normal', 'Pain complet, beurre, confiture, café, lait', 'Normal', 'Petit-déjeuner', 'Lundi', 1500, 350, 12, 45, 8, 3),
('Déjeuner Lundi Normal', 'Poulet rôti, riz, légumes vapeur, salade verte', 'Normal', 'Déjeuner', 'Lundi', 2500, 550, 35, 60, 15, 8),
('Dîner Lundi Normal', 'Poisson grillé, purée de pommes de terre, haricots verts', 'Normal', 'Dîner', 'Lundi', 2200, 480, 30, 45, 12, 6),

-- MENUS DIABÉTIQUES - LUNDI
('Petit-déjeuner Lundi Diabétique', 'Pain complet, fromage blanc, fruits frais, thé sans sucre', 'Diabétique', 'Petit-déjeuner', 'Lundi', 1600, 280, 15, 35, 8, 5),
('Déjeuner Lundi Diabétique', 'Poulet grillé, quinoa, légumes verts, salade', 'Diabétique', 'Déjeuner', 'Lundi', 2600, 420, 40, 35, 12, 10),
('Dîner Lundi Diabétique', 'Saumon vapeur, légumes vapeur, salade de crudités', 'Diabétique', 'Dîner', 'Lundi', 2400, 380, 35, 20, 15, 8),

-- MENUS CARDIAQUES - LUNDI
('Petit-déjeuner Lundi Cardiaque', 'Pain complet, avocat, tomates, jus d\'orange', 'Cardiaque', 'Petit-déjeuner', 'Lundi', 1700, 320, 8, 40, 12, 6),
('Déjeuner Lundi Cardiaque', 'Poulet blanc grillé, riz complet, légumes verts', 'Cardiaque', 'Déjeuner', 'Lundi', 2500, 450, 35, 50, 8, 7),
('Dîner Lundi Cardiaque', 'Poisson blanc vapeur, légumes vapeur, salade', 'Cardiaque', 'Dîner', 'Lundi', 2300, 400, 30, 35, 10, 6),

-- MENUS SANS SEL - LUNDI
('Petit-déjeuner Lundi Sans Sel', 'Pain complet, confiture, fruits frais, tisane', 'Sans sel', 'Petit-déjeuner', 'Lundi', 1500, 300, 8, 50, 5, 4),
('Déjeuner Lundi Sans Sel', 'Poulet grillé sans sel, riz, légumes vapeur', 'Sans sel', 'Déjeuner', 'Lundi', 2400, 400, 35, 45, 8, 6),
('Dîner Lundi Sans Sel', 'Poisson vapeur sans sel, légumes vapeur', 'Sans sel', 'Dîner', 'Lundi', 2200, 350, 30, 30, 6, 5),

-- MENUS VÉGÉTARIENS - LUNDI
('Petit-déjeuner Lundi Végétarien', 'Pain complet, beurre, confiture, fruits, lait végétal', 'Végétarien', 'Petit-déjeuner', 'Lundi', 1600, 320, 10, 50, 8, 4),
('Déjeuner Lundi Végétarien', 'Lentilles, riz complet, légumes vapeur, salade', 'Végétarien', 'Déjeuner', 'Lundi', 2200, 450, 20, 70, 12, 15),
('Dîner Lundi Végétarien', 'Quinoa, légumes grillés, salade de crudités', 'Végétarien', 'Dîner', 'Lundi', 2000, 380, 15, 60, 10, 12),

-- MENUS HYPOCALORIQUES - LUNDI
('Petit-déjeuner Lundi Hypocalorique', 'Pain complet, fromage blanc 0%, fruits frais', 'Hypocalorique', 'Petit-déjeuner', 'Lundi', 1400, 200, 15, 30, 3, 4),
('Déjeuner Lundi Hypocalorique', 'Poulet grillé, légumes vapeur, salade verte', 'Hypocalorique', 'Déjeuner', 'Lundi', 2000, 300, 35, 20, 8, 8),
('Dîner Lundi Hypocalorique', 'Poisson vapeur, légumes vapeur, salade', 'Hypocalorique', 'Dîner', 'Lundi', 1800, 250, 30, 15, 6, 6),

-- MENUS LIQUIDES - LUNDI
('Petit-déjeuner Lundi Liquide', 'Smoothie fruits, yaourt liquide, jus de fruits', 'Liquide', 'Petit-déjeuner', 'Lundi', 1200, 250, 8, 45, 5, 3),
('Déjeuner Lundi Liquide', 'Soupe de légumes, bouillon de poulet, compote', 'Liquide', 'Déjeuner', 'Lundi', 1800, 300, 15, 40, 8, 5),
('Dîner Lundi Liquide', 'Soupe de poisson, bouillon de légumes, jus de fruits', 'Liquide', 'Dîner', 'Lundi', 1600, 280, 12, 35, 6, 4)

ON CONFLICT DO NOTHING;
```

### 2. Tester la nouvelle fonctionnalité
- Allez sur `/portails/cook`
- Cliquez sur l'onglet "Menus Patients"
- Testez le filtre par régime alimentaire
- Testez l'ajout, la modification et la suppression de menus

### 3. Vérifier l'intégration
- Les menus s'affichent par jour de la semaine
- Le filtre par régime fonctionne
- Les informations nutritionnelles s'affichent
- L'interface est responsive

## Résultat attendu

### Portail cuisinier - Onglet "Menus Patients" :

#### **Interface améliorée :**
- ✅ **Filtre par régime** : Sélection du régime alimentaire
- ✅ **Affichage par jour** : Organisation par jour de la semaine
- ✅ **Informations complètes** : Régime, type de repas, prix, calories
- ✅ **Actions disponibles** : Ajouter, modifier, supprimer

#### **Exemple d'affichage :**
```
Menus Patients

[Filtre par régime: Normal ▼]

Lundi
├── Petit-déjeuner Lundi Normal (1500 FCFA) [Normal] [Petit-déjeuner] [Disponible]
│   350 cal • 12g protéines • 45g glucides
├── Déjeuner Lundi Normal (2500 FCFA) [Normal] [Déjeuner] [Disponible]
│   550 cal • 35g protéines • 60g glucides
└── Dîner Lundi Normal (2200 FCFA) [Normal] [Dîner] [Disponible]
    480 cal • 30g protéines • 45g glucides

Mardi
├── [Menus du mardi...]
└── [Menus du mardi...]
```

#### **Modal d'ajout de menu :**
- **Nom du menu** : Ex: "Poulet rôti"
- **Description** : Description détaillée
- **Prix** : En FCFA
- **Régime alimentaire** : Sélection dans la liste
- **Type de repas** : Petit-déjeuner, Déjeuner, Dîner, Collation
- **Jour de la semaine** : Lundi à Dimanche
- **URL de la photo** : Lien vers l'image
- **Informations nutritionnelles** : Calories, protéines, glucides, lipides, fibres
- **Disponibilité** : Actif/Inactif

## Fonctionnalités disponibles

### **Gestion des menus patients :**
- **Ajout** : Création de nouveaux menus avec tous les paramètres
- **Modification** : Édition des informations existantes
- **Suppression** : Suppression avec confirmation
- **Filtrage** : Par régime alimentaire
- **Organisation** : Par jour de la semaine

### **Informations complètes :**
- **Régime alimentaire** : 12 types de régimes
- **Type de repas** : 4 types de repas
- **Jour de la semaine** : 7 jours
- **Valeurs nutritionnelles** : 5 paramètres nutritionnels
- **Prix** : En FCFA
- **Disponibilité** : Statut actif/inactif

## Dépannage

### Si l'onglet "Menus Patients" ne s'affiche pas :
1. **Exécutez le script** : `supabase/create_patient_menus_daily.sql`
2. **Rechargez la page** : Parfois il faut rafraîchir
3. **Vérifiez la console** : Messages d'erreur

### Si les menus ne s'affichent pas :
1. **Vérifiez la table** : `SELECT COUNT(*) FROM public.patient_menus;`
2. **Vérifiez les politiques RLS** : Permissions d'accès
3. **Vérifiez les logs** : Messages dans la console

### Si les actions ne fonctionnent pas :
1. **Vérifiez la console** : Erreurs JavaScript
2. **Vérifiez la base** : Structure de la table
3. **Redémarrez le serveur** : `npm run dev`

## Prochaines étapes

1. **Exécutez le script de création** : `supabase/create_patient_menus_daily.sql`
2. **Testez l'onglet "Menus Patients"** : Vérifiez l'affichage par jour
3. **Testez le filtre par régime** : Vérifiez le filtrage
4. **Testez les actions** : Ajouter, modifier, supprimer
5. **Intégrez avec le portail infirmier** : Les menus patients seront disponibles pour les commandes selon le régime du patient

## Notes importantes

- **Structure professionnelle** : Menus adaptés aux régimes médicaux
- **Organisation claire** : Par jour de la semaine et par régime
- **Informations complètes** : Valeurs nutritionnelles détaillées
- **Interface intuitive** : Filtrage et organisation logique
- **Gestion complète** : CRUD complet pour tous les menus

**Les menus patients sont maintenant des menus journaliers professionnels adaptés aux régimes alimentaires !** 🏥🍽️

**Exécutez le script et testez la nouvelle fonctionnalité !** ✅



