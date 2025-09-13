# 🔧 Configuration Supabase Cloud - Centre Diagnostic RepasCDL

## 🚨 Problème Identifié

Votre application utilise actuellement une instance Supabase **locale** (`http://127.0.0.1:54321`) qui n'est **pas accessible** depuis votre application déployée.

## ✅ Solution Immédiate

### 1. Créer un Projet Supabase Cloud

1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Notez l'URL et la clé publique dans Settings → API

### 2. Configurer les Variables d'Environnement

Créez un fichier `.env.local` dans votre projet :

```bash
# Remplacez par vos vraies valeurs Supabase Cloud
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Exécuter le Script de Migration

1. Dans votre dashboard Supabase → SQL Editor
2. Exécutez le contenu de `supabase/init_cloud_database.sql`
3. Puis exécutez `supabase/migrate_employee_orders.sql` si nécessaire

## 🔧 Configuration Alternative (Développement)

Si vous voulez continuer en local :

```bash
# Dans .env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## 📋 Vérification

Après configuration, vérifiez que :

1. ✅ Les tables sont créées avec la bonne structure
2. ✅ La colonne `employee_id` existe dans `employee_orders`
3. ✅ Les politiques RLS sont activées
4. ✅ Les données de test sont insérées

## 🚀 Déploiement

Pour Netlify/Vercel, configurez les variables d'environnement dans les paramètres du projet.
