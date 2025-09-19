# 🗄️ Guide de création de la table kitchen_inventory

## 🚨 IMPORTANT : Vous devez créer cette table dans Supabase !

L'erreur 401 sur `kitchen_inventory` indique que la table n'existe pas encore dans votre base de données Supabase.

## 📋 Étapes à suivre

### 1. **Connectez-vous à Supabase**
- Allez sur [supabase.com](https://supabase.com)
- Connectez-vous à votre compte
- Sélectionnez votre projet

### 2. **Accédez à l'éditeur SQL**
- Dans le menu de gauche, cliquez sur **"SQL Editor"**
- Cliquez sur **"New query"**

### 3. **Copiez et exécutez le script complet**
Copiez **TOUT** le contenu du fichier `supabase/create_kitchen_inventory_table.sql` et collez-le dans l'éditeur SQL.

### 4. **Exécutez le script**
- Cliquez sur **"Run"** ou appuyez sur **Ctrl+Enter**
- Attendez que le script se termine (quelques secondes)

### 5. **Vérifiez la création**
- Allez dans **"Table Editor"**
- Vous devriez voir la table `kitchen_inventory`
- Elle devrait contenir 5 articles d'exemple

## ✅ Résultat attendu

Après l'exécution du script, vous devriez voir :
- ✅ Table `kitchen_inventory` créée
- ✅ 5 articles d'exemple insérés
- ✅ Politiques RLS configurées
- ✅ Index de performance créés

## 🔍 Vérification

Une fois la table créée, rechargez votre application et vous devriez voir :
```
✅ Articles de stock chargés: Array(5)
```

**Sans plus d'erreurs 401 !**

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez que vous êtes connecté à Supabase
2. Vérifiez que vous avez les droits d'administration
3. Copiez le script ligne par ligne si nécessaire
4. Vérifiez les logs d'erreur dans Supabase

---

**⚠️ Cette étape est OBLIGATOIRE pour que l'onglet "Gestion Stock" fonctionne !**
