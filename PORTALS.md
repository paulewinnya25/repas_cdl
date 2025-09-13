# 🚪 Portails Spécialisés - Repas CDL

## 📋 Vue d'ensemble

Le système de portails spécialisés offre des interfaces dédiées et optimisées pour chaque rôle utilisateur dans l'application Repas CDL.

## 🎯 Accès aux Portails

### URL d'accès
```
http://localhost:3000/portails
```

### Navigation
- **Depuis l'application principale** : Cliquez sur "Portails" dans la navigation
- **Accès direct** : Utilisez l'URL `/portails`

## 🏥 Portail Infirmier

### 🎨 Interface
- **Couleur thématique** : Bleu (gradient blue-50 to indigo-100)
- **Icône** : `faUserInjured` (patient)
- **Design** : Interface moderne avec cartes interactives

### 🔧 Fonctionnalités
1. **Gestion des Patients**
   - Liste des patients actifs avec recherche
   - Informations détaillées (chambre, régime, allergies)
   - Sélection rapide pour passer commande

2. **Commandes Patients**
   - Interface de commande simplifiée
   - Sélection du type de repas (Petit-déjeuner, Déjeuner, Dîner)
   - Instructions spéciales pour chaque patient
   - Statuts en temps réel

3. **Tableau de Bord**
   - Statistiques en temps réel
   - Commandes en attente
   - Commandes livrées aujourd'hui
   - Historique des commandes récentes

### 👥 Rôles Autorisés
- `Infirmier`
- `Super Admin`

## 👔 Portail Employé

### 🎨 Interface
- **Couleur thématique** : Vert (gradient green-50 to emerald-100)
- **Icône** : `faUserTie` (employé)
- **Design** : Interface conviviale avec focus sur les menus

### 🔧 Fonctionnalités
1. **Menus Disponibles**
   - Catalogue des menus avec photos
   - Prix et descriptions détaillées
   - Statut de disponibilité en temps réel
   - Interface de commande intuitive

2. **Commandes Personnelles**
   - Historique des commandes personnelles
   - Suivi du statut de livraison
   - Lieu de livraison personnalisable
   - Instructions spéciales

3. **Tableau de Bord Personnel**
   - Mes commandes en attente
   - Commandes livrées aujourd'hui
   - Statistiques personnelles

### 👥 Rôles Autorisés
- `Employé`
- `Super Admin`

## 👨‍🍳 Portail Cuisinier

### 🎨 Interface
- **Couleur thématique** : Orange (gradient orange-50 to red-100)
- **Icône** : `faChefHat` (chef cuisinier)
- **Design** : Interface professionnelle avec gestion complète

### 🔧 Fonctionnalités
1. **Gestion des Commandes**
   - **Commandes Patients** : Vue complète avec statuts
   - **Commandes Employés** : Suivi des commandes personnelles
   - **Mise à jour des statuts** : En attente → En préparation → Livré
   - **Filtrage et tri** par statut et date

2. **Gestion des Menus Employés**
   - **Ajout de menus** : Nom, description, prix, photo
   - **Modification** : Édition complète des menus existants
   - **Suppression** : Gestion des menus obsolètes
   - **Statut de disponibilité** : Activer/désactiver les menus

3. **Tableau de Bord Complet**
   - Statistiques globales (patients + employés)
   - Commandes en attente de traitement
   - Activité du jour
   - Vue d'ensemble des performances

### 👥 Rôles Autorisés
- `Chef Cuisinier`
- `Aide Cuisinier`
- `Super Admin`

## 🔐 Système de Sécurité

### Contrôle d'Accès
- **Authentification** : Supabase Auth
- **Autorisation** : Basée sur les rôles utilisateur
- **Sécurité** : Chaque portail vérifie les permissions

### Rôles et Permissions
```typescript
interface PortalAccess {
  nurse: ['Infirmier', 'Super Admin'];
  employee: ['Employé', 'Super Admin'];
  cook: ['Chef Cuisinier', 'Aide Cuisinier', 'Super Admin'];
}
```

## 🎨 Design System

### Couleurs par Portail
- **Infirmier** : `blue-500` → `blue-600`
- **Employé** : `green-500` → `green-600`
- **Cuisinier** : `orange-500` → `orange-600`

### Composants Communs
- **Cards** : Interface uniforme avec ombres
- **Buttons** : Styles cohérents avec gradients
- **Badges** : Statuts colorés et informatifs
- **Modals** : Formulaires standardisés
- **Loading States** : Animations de chargement

## 📱 Responsive Design

### Breakpoints
- **Mobile** : `< 768px` - Interface adaptée tactile
- **Tablet** : `768px - 1024px` - Layout optimisé
- **Desktop** : `> 1024px` - Interface complète

### Adaptations Mobile
- **Navigation** : Menu hamburger
- **Cards** : Stack vertical
- **Modals** : Plein écran sur mobile
- **Touch** : Zones de clic optimisées

## 🚀 Fonctionnalités Avancées

### Temps Réel
- **Statuts** : Mise à jour automatique des commandes
- **Notifications** : Alertes pour nouveaux statuts
- **Synchronisation** : Données toujours à jour

### Performance
- **Lazy Loading** : Chargement optimisé des composants
- **Caching** : Mise en cache des données fréquentes
- **Optimisation** : Requêtes Supabase optimisées

### UX/UI
- **Animations** : Transitions fluides
- **Feedback** : Confirmation des actions
- **Accessibilité** : Support clavier et lecteurs d'écran

## 🔧 Configuration Technique

### Structure des Fichiers
```
src/pages/portals/
├── NursePortal.tsx      # Portail Infirmier
├── EmployeePortal.tsx   # Portail Employé
└── CookPortal.tsx       # Portail Cuisinier

src/pages/
└── PortalAccess.tsx     # Sélection des portails
```

### Dépendances
- **React** : Hooks et état local
- **Supabase** : Base de données et auth
- **Tailwind CSS** : Styling et responsive
- **FontAwesome** : Icônes
- **shadcn/ui** : Composants UI

## 📊 Métriques et Analytics

### Données Trackées
- **Utilisation** : Fréquence d'accès par portail
- **Performance** : Temps de chargement
- **Erreurs** : Logs d'erreurs par portail
- **Satisfaction** : Feedback utilisateur

## 🎯 Prochaines Améliorations

### Phase 2
- **Notifications Push** : Alertes temps réel
- **Mode Hors Ligne** : Fonctionnalité offline
- **Thème Sombre** : Support mode sombre
- **Raccourcis Clavier** : Navigation rapide

### Phase 3
- **IA** : Suggestions intelligentes
- **Voice Commands** : Commandes vocales
- **AR** : Réalité augmentée pour formation
- **Multi-tenant** : Support multi-hôpitaux

---

*Les portails spécialisés offrent une expérience utilisateur optimisée et des fonctionnalités adaptées à chaque rôle, améliorant significativement l'efficacité et la satisfaction des utilisateurs.*



