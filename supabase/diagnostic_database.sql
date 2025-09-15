-- DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES
-- Exécuter dans Supabase SQL Editor pour diagnostiquer le problème

-- 1. Vérifier l'existence des tables
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema IN ('auth', 'public') 
ORDER BY table_schema, table_name;

-- 2. Vérifier la structure de la table auth.users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Vérifier les politiques RLS sur auth.users
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'users';

-- 4. Vérifier les permissions sur auth.users
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' AND table_name = 'users';

-- 5. Vérifier l'état actuel des utilisateurs
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as confirmed_users FROM auth.users WHERE email_confirmed_at IS NOT NULL;

-- 6. Vérifier les extensions installées
SELECT extname, extversion FROM pg_extension WHERE extname IN ('pgcrypto', 'uuid-ossp');

-- 7. Tester la création d'un utilisateur simple
SELECT 'Test de création d\'utilisateur' as test;
