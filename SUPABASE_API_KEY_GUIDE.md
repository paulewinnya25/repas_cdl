# 🔑 Configuration des Clés API Supabase

## ⚠️ **Problème Identifié**

L'erreur 400 sur `/auth/v1/token` indique que la clé API utilisée n'est pas valide pour votre projet Supabase.

## 🛠️ **Solution**

### **1. Récupérer la Vraie Clé API**

1. **Connectez-vous** à https://supabase.com/dashboard
2. **Sélectionnez votre projet** : `xmanlflferryarkdhupb`
3. **Allez dans** : **Settings** → **API**
4. **Copiez la clé** : `anon public` (pas la clé de démonstration)

### **2. Mettre à Jour Netlify**

Dans Netlify Dashboard → **Site settings** → **Environment variables** :

```
VITE_SUPABASE_URL = https://xmanlflferryarkdhupb.supabase.co
VITE_SUPABASE_ANON_KEY = votre_vraie_clé_api_ici
```

### **3. Redéployer**

Après avoir mis à jour les variables :
1. **Allez dans** : **Deploys** → **Trigger deploy** → **Deploy site**
2. **Ou** : Attendez le prochain commit automatique

## ✅ **Résultat Attendu**

Une fois la vraie clé API configurée :
- ✅ **Authentification** fonctionnelle
- ✅ **Connexion** sans erreurs 400
- ✅ **Login** opérationnel
- ✅ **Tous les portails** accessibles

## 🔍 **Comment Identifier la Vraie Clé**

La vraie clé API commence généralement par :
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0` ❌ (clé de démonstration)
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.VOTRE_VRAIE_CLE` ✅ (votre vraie clé)

## 📞 **Support**

Si vous avez des difficultés à trouver la clé API, contactez-moi avec :
- L'URL de votre projet Supabase
- Une capture d'écran de la page API
