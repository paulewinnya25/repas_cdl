# 🔧 Variables d'Environnement - Centre Diagnostic RepasCDL

## 📋 Variables Utilisées par l'Application

### **Variables Supabase (Obligatoires)**

| Variable | Description | Valeur par défaut | Exemple |
|----------|-------------|-------------------|---------|
| `VITE_SUPABASE_URL` | URL de votre instance Supabase | `http://127.0.0.1:54321` | `https://votre-projet.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | Clé locale par défaut | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### **Variables Optionnelles**

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_APP_NAME` | Nom de l'application | `Centre Diagnostic - RepasCDL` |
| `VITE_APP_VERSION` | Version de l'application | `1.0.0` |

## 🚀 Configuration pour Netlify

### **1. Variables d'Environnement à Configurer :**

Dans les paramètres Netlify → Site settings → Environment variables, ajoutez :

```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre-cle-publique-supabase
VITE_APP_NAME = Centre Diagnostic - RepasCDL
VITE_APP_VERSION = 1.0.0
```

### **2. Pour Supabase Cloud :**

Si vous voulez utiliser Supabase Cloud au lieu de local :

1. **Créez un projet Supabase** sur https://supabase.com
2. **Récupérez l'URL** et la clé publique dans Settings → API
3. **Configurez les variables** dans Netlify
4. **Migrez vos données** vers Supabase Cloud

### **3. Configuration Actuelle (Développement Local) :**

```bash
# Pour le développement local, créez un fichier .env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## ⚠️ Important pour le Déploiement

### **Problème Actuel :**
Votre application utilise Supabase **local** (`http://127.0.0.1:54321`) qui n'est **pas accessible** depuis Netlify.

### **Solutions :**

#### **Option 1 : Supabase Cloud (Recommandé)**
- Créez un projet Supabase Cloud
- Migrez vos données
- Configurez les variables dans Netlify

#### **Option 2 : Base de données alternative**
- Utilisez une base de données hébergée (PostgreSQL, etc.)
- Adaptez la configuration Supabase

#### **Option 3 : Mode démo**
- Créez une version avec des données statiques
- Pas de base de données en temps réel

## 🔒 Sécurité

- ✅ Les clés `VITE_*` sont **publiques** (OK pour Supabase)
- ❌ Ne jamais exposer les clés **secrètes** Supabase
- ✅ Utilisez toujours HTTPS en production

## 📝 Notes

- Les variables `VITE_*` sont accessibles côté client
- Utilisez `import.meta.env.VITE_VARIABLE_NAME` pour y accéder
- Les valeurs par défaut sont définies dans le code
