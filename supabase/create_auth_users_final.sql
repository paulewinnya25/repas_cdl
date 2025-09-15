-- CRÉATION DES UTILISATEURS D'AUTHENTIFICATION
-- Exécuter dans Supabase SQL Editor

-- 1. Activer l'extension pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Supprimer les utilisateurs existants s'ils existent
DELETE FROM auth.users WHERE email IN (
    'paule.winnya@centre-diagnostic.com',
    'chef@centre-diagnostic.com', 
    'employe@centre-diagnostic.com'
);

-- 3. Créer les utilisateurs d'authentification
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440010',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'paule.winnya@centre-diagnostic.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Paule", "last_name": "Winnya", "role": "Infirmier"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'chef@centre-diagnostic.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jean", "last_name": "Martin", "role": "Chef Cuisinier"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '550e8400-e29b-41d4-a716-446655440012',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'employe@centre-diagnostic.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Marie", "last_name": "Dubois", "role": "Employé"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 4. Vérifier que les utilisateurs ont été créés
SELECT id, email, email_confirmed_at, raw_user_meta_data FROM auth.users WHERE email IN (
    'paule.winnya@centre-diagnostic.com',
    'chef@centre-diagnostic.com', 
    'employe@centre-diagnostic.com'
);

-- 5. Vérifier les profils correspondants
SELECT id, first_name, last_name, role FROM profiles WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440012'
);
