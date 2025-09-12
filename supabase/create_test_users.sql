-- Créer un utilisateur de test pour l'authentification
-- Ce script crée un utilisateur avec l'email de test

-- 1. Créer un utilisateur dans auth.users
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
) VALUES (
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
) ON CONFLICT (id) DO NOTHING;

-- 2. Créer le profil correspondant
INSERT INTO public.profiles (id, first_name, last_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Paule', 'Winnya', 'Infirmier')
ON CONFLICT (id) DO NOTHING;

-- 3. Créer d'autres utilisateurs de test
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
)
ON CONFLICT (id) DO NOTHING;

-- 4. Créer les profils correspondants
INSERT INTO public.profiles (id, first_name, last_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Jean', 'Martin', 'Chef Cuisinier'),
('550e8400-e29b-41d4-a716-446655440012', 'Marie', 'Dubois', 'Employé')
ON CONFLICT (id) DO NOTHING;

