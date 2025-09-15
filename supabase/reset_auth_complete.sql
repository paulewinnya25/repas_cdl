-- RÉINITIALISATION COMPLÈTE DE L'AUTHENTIFICATION
-- Exécuter dans Supabase SQL Editor

-- 1. Désactiver temporairement RLS sur auth.users
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes sur auth.users
DROP POLICY IF EXISTS "Users can view own profile" ON auth.users;
DROP POLICY IF EXISTS "Users can update own profile" ON auth.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON auth.users;

-- 3. Créer une politique permissive temporaire
CREATE POLICY "Allow all operations on auth.users" ON auth.users
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Activer RLS avec la nouvelle politique
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- 5. Vérifier que l'extension pgcrypto est installée
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 6. Nettoyer les utilisateurs existants problématiques
DELETE FROM auth.users WHERE email IN (
    'paule.winnya@centre-diagnostic.com',
    'chef@centre-diagnostic.com', 
    'employe@centre-diagnostic.com'
);

-- 7. Créer les utilisateurs avec une approche simplifiée
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'paule.winnya@centre-diagnostic.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Paule", "last_name": "Winnya", "role": "Infirmier"}',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'chef@centre-diagnostic.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jean", "last_name": "Martin", "role": "Chef Cuisinier"}',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'employe@centre-diagnostic.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Marie", "last_name": "Dubois", "role": "Employé"}',
    NOW(),
    NOW()
);

-- 8. Vérifier la création
SELECT id, email, email_confirmed_at FROM auth.users WHERE email IN (
    'paule.winnya@centre-diagnostic.com',
    'chef@centre-diagnostic.com', 
    'employe@centre-diagnostic.com'
);

-- 9. Restaurer les politiques de sécurité appropriées
DROP POLICY IF EXISTS "Allow all operations on auth.users" ON auth.users;

CREATE POLICY "Users can view own profile" ON auth.users
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON auth.users
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON auth.users
FOR INSERT TO authenticated
WITH CHECK (true);
