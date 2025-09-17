-- CORRECTION IMMÉDIATE - Créer les utilisateurs d'authentification
-- Ce script corrige le problème d'authentification

-- 1. D'abord, vérifier si les utilisateurs existent
SELECT id, email FROM auth.users WHERE email IN (
    'paule.winnya@centre-diagnostic.com',
    'chef@centre-diagnostic.com', 
    'employe@centre-diagnostic.com'
);

-- 2. Supprimer les utilisateurs existants s'ils existent
DELETE FROM auth.users WHERE email IN (
    'paule.winnya@centre-diagnostic.com',
    'chef@centre-diagnostic.com', 
    'employe@centre-diagnostic.com'
);

-- 3. Créer les utilisateurs avec la méthode correcte
-- Utiliser l'extension pgcrypto pour le hachage des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 4. Insérer les utilisateurs dans auth.users
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
    '{"first_name": "Paule", "last_name": "Winnya"}',
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
    '{"first_name": "Jean", "last_name": "Martin"}',
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
    '{"first_name": "Marie", "last_name": "Dubois"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 5. Vérifier que les utilisateurs ont été créés
SELECT id, email, email_confirmed_at FROM auth.users WHERE email IN (
    'paule.winnya@centre-diagnostic.com',
    'chef@centre-diagnostic.com', 
    'employe@centre-diagnostic.com'
);








