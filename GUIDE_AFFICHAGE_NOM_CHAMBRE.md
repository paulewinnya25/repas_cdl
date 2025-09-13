# Guide - Affichage Nom Patient et Chambre

## Fonctionnalité mise à jour ✅

Les commandes des patients affichent maintenant le **nom du patient** et le **numéro de la chambre** au lieu des IDs techniques.

## Modifications apportées

### 🏥 **Portail Cuisinier :**
- ✅ **Requête améliorée** : Récupération des informations des patients avec les commandes
- ✅ **Affichage amélioré** : "Nom Patient - Chambre XXX" au lieu de "Patient ID: xxxxxxxx"
- ✅ **Informations complètes** : Nom, chambre, type de repas et menu

### 🏥 **Portail Infirmier :**
- ✅ **Requête améliorée** : Récupération des informations des patients avec les commandes
- ✅ **Affichage amélioré** : "Patient: Nom" et "Chambre: XXX" séparément
- ✅ **Informations complètes** : Nom, chambre, repas, menu et instructions

### 📊 **Types TypeScript :**
- ✅ **Interface Order mise à jour** : Ajout de `patients?: { id, name, room }`
- ✅ **Champ created_at ajouté** : Pour la cohérence avec la base de données

## Actions à effectuer

### 1. Créer la table patients avec des données de test
```sql
-- Exécutez ce script dans votre console Supabase
-- Fichier: supabase/create_patients_table.sql

-- 1. Créer la table patients si elle n'existe pas
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

-- 3. Insérer des patients de test
INSERT INTO public.patients (name, room, service, diet, allergies, entry_date) VALUES
('Marie Dubois', '101', 'Cardiologie', 'Cardiaque', 'Aucune', '2024-01-15'),
('Jean Martin', '102', 'Diabétologie', 'Diabétique', 'Gluten', '2024-01-16'),
('Sophie Laurent', '103', 'Médecine interne', 'Normal', 'Aucune', '2024-01-17'),
('Pierre Durand', '104', 'Cardiologie', 'Sans sel', 'Aucune', '2024-01-18'),
('Claire Moreau', '105', 'Endocrinologie', 'Diabétique', 'Aucune', '2024-01-19'),
('Antoine Petit', '106', 'Gastro-entérologie', 'Sans gluten', 'Aucune', '2024-01-20'),
('Isabelle Roux', '107', 'Médecine interne', 'Végétarien', 'Aucune', '2024-01-21'),
('Michel Blanc', '108', 'Cardiologie', 'Hypocalorique', 'Aucune', '2024-01-22'),
('Nathalie Vert', '109', 'Neurologie', 'Liquide', 'Aucune', '2024-01-23'),
('Philippe Noir', '110', 'Médecine interne', 'Normal', 'Aucune', '2024-01-24')
ON CONFLICT DO NOTHING;
```

### 2. Tester la nouvelle fonctionnalité
- Allez sur `/portails/cook` et vérifiez l'onglet "Commandes"
- Allez sur `/portails/nurse` et vérifiez l'onglet "Commandes"
- Vérifiez que les noms des patients et les chambres s'affichent correctement

### 3. Vérifier l'intégration
- Les commandes affichent le nom du patient et la chambre
- Les informations sont récupérées depuis la table `patients`
- L'interface est cohérente entre les deux portails

## Résultat attendu

### **Portail Cuisinier - Commandes Patients :**
```
Commandes Patients
├── Commande #1
│   ├── Marie Dubois - Chambre 101
│   ├── Déjeuner - Poulet rôti
│   └── [Statut: En attente d'approbation]
├── Commande #2
│   ├── Jean Martin - Chambre 102
│   ├── Petit-déjeuner - Pain complet
│   └── [Statut: En préparation]
└── Commande #3
    ├── Sophie Laurent - Chambre 103
    ├── Dîner - Poisson grillé
    └── [Statut: Livré]
```

### **Portail Infirmier - Commandes :**
```
Commandes Récentes
├── Commande #1
│   ├── Patient: Marie Dubois
│   ├── Chambre: 101
│   ├── Repas: Déjeuner
│   ├── Menu: Poulet rôti
│   └── [Statut: En attente d'approbation]
├── Commande #2
│   ├── Patient: Jean Martin
│   ├── Chambre: 102
│   ├── Repas: Petit-déjeuner
│   ├── Menu: Pain complet
│   └── [Statut: En préparation]
└── Commande #3
    ├── Patient: Sophie Laurent
    ├── Chambre: 103
    ├── Repas: Dîner
    ├── Menu: Poisson grillé
    └── [Statut: Livré]
```

## Fonctionnalités disponibles

### **Affichage amélioré :**
- **Nom du patient** : Au lieu de l'ID technique
- **Numéro de chambre** : Information claire et utile
- **Informations complètes** : Repas, menu, statut
- **Interface cohérente** : Même style dans les deux portails

### **Données de test créées :**
- **10 patients** : Avec noms, chambres, services et régimes
- **Services variés** : Cardiologie, Diabétologie, Médecine interne, etc.
- **Régimes divers** : Normal, Diabétique, Cardiaque, Sans sel, etc.
- **Chambres** : 101 à 110

## Dépannage

### Si les noms ne s'affichent pas :
1. **Exécutez le script** : `supabase/create_patients_table.sql`
2. **Vérifiez la table** : `SELECT COUNT(*) FROM public.patients;`
3. **Vérifiez les relations** : `SELECT * FROM public.orders LIMIT 5;`

### Si les commandes ne s'affichent pas :
1. **Vérifiez la table orders** : `SELECT COUNT(*) FROM public.orders;`
2. **Vérifiez les politiques RLS** : Permissions d'accès
3. **Vérifiez les logs** : Messages dans la console

### Si les relations ne fonctionnent pas :
1. **Vérifiez les clés étrangères** : `patient_id` dans `orders`
2. **Vérifiez les données** : Correspondance entre `orders.patient_id` et `patients.id`
3. **Redémarrez le serveur** : `npm run dev`

## Prochaines étapes

1. **Exécutez le script de création** : `supabase/create_patients_table.sql`
2. **Testez les deux portails** : Cuisinier et Infirmier
3. **Vérifiez l'affichage** : Noms et chambres des patients
4. **Testez les commandes** : Création et affichage des commandes

## Notes importantes

- **Affichage professionnel** : Noms et chambres au lieu d'IDs techniques
- **Informations utiles** : Facilite l'identification des patients
- **Interface cohérente** : Même style dans les deux portails
- **Données de test** : 10 patients avec informations complètes
- **Relations fonctionnelles** : Jointures entre `orders` et `patients`

**L'affichage des commandes patients est maintenant professionnel avec noms et chambres !** 🏥👥

**Exécutez le script et testez la nouvelle fonctionnalité !** ✅



