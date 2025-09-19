# 🧹 Instructions pour nettoyer le cache Netlify

## Problème identifié
Le fichier `sw.js` est toujours référencé dans le cache de Netlify et retourne du HTML au lieu de JavaScript.

## Solutions à appliquer

### 1. **Nettoyage du cache Netlify (RECOMMANDÉ)**
1. Allez sur [netlify.com](https://netlify.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre site `repascdl`
4. Allez dans **"Deploys"**
5. Cliquez sur **"Trigger deploy"** → **"Clear cache and deploy site"**

### 2. **Redéploiement complet**
1. Dans Netlify, allez dans **"Deploys"**
2. Cliquez sur **"Trigger deploy"** → **"Deploy site"**
3. Attendez que le déploiement se termine

### 3. **Vérification du nettoyage**
Après le redéploiement, vous devriez voir dans la console :
```
🧹 Désactivation de tous les Service Workers...
✅ Tous les Service Workers désactivés
```

**Sans plus d'erreurs :**
- ❌ `sw.js:1 Uncaught SyntaxError: Unexpected token '<'`
- ❌ `Failed to update a ServiceWorker`
- ❌ `ServiceWorker script evaluation failed`

## Alternative : Attendre le cache expire
Le cache Netlify expire automatiquement après quelques heures, mais le redéploiement est plus rapide.

---

**⚠️ Le redéploiement avec nettoyage du cache est nécessaire pour résoudre définitivement le problème !**
