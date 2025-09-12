# 🏥 Centre Diagnostic - Système de Gestion des Repas

Une application web moderne pour la gestion des repas dans un établissement médical, développée avec React, TypeScript et Supabase.

## 🚀 Fonctionnalités

### 👩‍⚕️ Portail Infirmier
- **Gestion des patients** : Création, modification et suppression des patients
- **Commandes patients** : Passage de commandes avec régimes alimentaires spécifiques
- **Suivi des livraisons** : Suivi en temps réel des commandes
- **Interface intuitive** : Design moderne et responsive

### 👨‍💼 Portail Employé
- **Commandes personnelles** : Système de commande avec accompagnements
- **Prix dynamique** : 1500 FCFA (1 accompagnement) / 2000 FCFA (2 accompagnements)
- **Récupération directe** : Les employés récupèrent leurs commandes à la cuisine
- **Historique des commandes** : Suivi des commandes passées

### 👨‍🍳 Portail Cuisinier
- **Gestion des commandes** : Visualisation et traitement des commandes patients et employés
- **Gestion des menus** : Création et modification des menus employés et patients
- **Statuts des commandes** : En attente → En préparation → Livré
- **Suppression des commandes** : Gestion complète du cycle de vie des commandes

## 🛠️ Technologies Utilisées

- **Frontend** : React 18, TypeScript, Vite
- **UI Components** : Shadcn UI, Tailwind CSS
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Icônes** : FontAwesome
- **Déploiement** : Vercel (configuré)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Docker Desktop (pour Supabase local)
- Git

## 🚀 Installation et Démarrage

### 1. Cloner le dépôt
```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd centre-diagnostic-repas-cdl
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Démarrer Supabase local
```bash
npx supabase start
```

### 4. Initialiser la base de données
```bash
npx supabase db reset
```

### 5. Démarrer l'application
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8081`

## 🗄️ Structure de la Base de Données

### Tables Principales
- **`patients`** : Informations des patients (nom, chambre, service, régime, allergies)
- **`orders`** : Commandes patients (menu, type de repas, statut)
- **`employee_orders`** : Commandes employés (menu, quantité, accompagnements, prix)
- **`employee_menus`** : Menus disponibles pour les employés
- **`patient_menus`** : Menus spécialisés pour patients (régimes, calories)

## 🏗️ Architecture du Projet

```
src/
├── components/
│   ├── ui/                 # Composants UI réutilisables (Shadcn)
│   ├── repas-cdl/          # Composants métier spécifiques
│   └── Header.tsx          # Composant header avec logo
├── pages/
│   ├── portals/            # Pages des différents portails
│   └── PortalAccess.tsx    # Page d'accès aux portails
├── data/                   # Données statiques (villes Gabon, etc.)
├── integrations/
│   └── supabase/           # Configuration Supabase
├── types/                  # Définitions TypeScript
└── utils/                  # Utilitaires (toast, etc.)
```

## 🎨 Interface Utilisateur

- **Design moderne** : Interface claire et professionnelle
- **Responsive** : Adapté aux mobiles et tablettes
- **Logo Centre Diagnostic** : Identité visuelle intégrée
- **Thème cohérent** : Couleurs et typographie harmonieuses
- **Navigation intuitive** : Accès rapide aux fonctionnalités

## 🔧 Configuration

### Variables d'environnement
L'application utilise Supabase en local par défaut :
- **URL** : `http://127.0.0.1:54321`
- **Clé API** : Configurée pour le développement local

### Villes Gabon Supportées
- Woleu, Ntem, Mpassa, Lolo, Ngounié
- Ogooué, Komo, Nyanga, Ivindo, Abanga
- Mbei, Addis Abeba

## 📱 Portails Disponibles

| Portail | URL | Description |
|---------|-----|-------------|
| **Accès** | `/` | Page d'accueil avec sélection du portail |
| **Infirmier** | `/nurse-portal` | Gestion patients et commandes |
| **Employé** | `/employee-portal` | Commandes personnelles |
| **Cuisinier** | `/cook-portal` | Gestion commandes et menus |

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement Supabase
3. Déployez automatiquement

### Autres plateformes
- **Netlify** : Compatible avec Vite
- **Railway** : Support Supabase natif
- **Heroku** : Déploiement Node.js

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Développement** : Équipe Centre Diagnostic
- **Design** : Interface utilisateur moderne
- **Base de données** : Architecture Supabase optimisée

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement
- Consultez la documentation Supabase

---

**Centre Diagnostic** - Système de gestion des repas moderne et efficace 🏥✨