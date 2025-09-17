# Migration vers PostgreSQL local
# Instructions pour installer et configurer PostgreSQL localement

## 1. Installation de PostgreSQL

### Windows :
1. Téléchargez PostgreSQL depuis https://www.postgresql.org/download/windows/
2. Installez avec les paramètres par défaut
3. Notez le mot de passe du superutilisateur (postgres)

### macOS :
```bash
# Avec Homebrew
brew install postgresql
brew services start postgresql

# Ou avec MacPorts
sudo port install postgresql15
```

### Linux (Ubuntu/Debian) :
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. Configuration de la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer une base de données pour votre projet
CREATE DATABASE repas_cdl;

# Créer un utilisateur
CREATE USER repas_user WITH PASSWORD 'votre_mot_de_passe';

# Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE repas_cdl TO repas_user;

# Se connecter à la nouvelle base
\c repas_cdl

# Donner les permissions sur le schéma public
GRANT ALL ON SCHEMA public TO repas_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO repas_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO repas_user;
```

## 3. Créer les tables

```sql
-- Table patients
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    room TEXT NOT NULL,
    service TEXT NOT NULL,
    diet TEXT NOT NULL,
    allergies TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    entry_date DATE NOT NULL,
    exit_date DATE
);

-- Table orders
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL,
    menu TEXT NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- Table employee_menus
CREATE TABLE employee_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    price NUMERIC(10, 2) NOT NULL,
    preparation_time INTEGER DEFAULT 30,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table employee_orders
CREATE TABLE employee_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    menu_id UUID REFERENCES employee_menus(id),
    delivery_location TEXT NOT NULL,
    special_instructions TEXT,
    quantity INTEGER DEFAULT 1 NOT NULL,
    status TEXT DEFAULT 'Commandé' NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table profiles (pour l'authentification)
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'Employé',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

## 4. Insérer des données de test

```sql
-- Patients de test
INSERT INTO patients (name, room, service, diet, allergies, entry_date) VALUES
('Marie Dubois', '101', 'Cardiologie', 'Cardiaque', 'Aucune', '2024-01-15'),
('Jean Martin', '102', 'Diabétologie', 'Diabétique', 'Gluten', '2024-01-16'),
('Sophie Laurent', '103', 'Médecine interne', 'Normal', 'Aucune', '2024-01-17');

-- Menus employés de test
INSERT INTO employee_menus (name, description, price, is_available) VALUES
('Poulet rôti aux légumes', 'Poulet rôti avec légumes de saison', 2500, true),
('Poisson grillé avec riz', 'Poisson frais grillé avec riz basmati', 3000, true),
('Salade composée', 'Salade fraîche avec légumes et protéines', 2000, true);

-- Commandes de test
INSERT INTO orders (patient_id, menu, meal_type, status, instructions) VALUES
((SELECT id FROM patients LIMIT 1), 'Poulet rôti aux légumes', 'Déjeuner', 'En attente d''approbation', 'Sans épices'),
((SELECT id FROM patients LIMIT 1 OFFSET 1), 'Poisson grillé avec riz', 'Dîner', 'En attente d''approbation', 'Régime sans sel'),
((SELECT id FROM patients LIMIT 1 OFFSET 2), 'Salade composée', 'Déjeuner', 'En préparation', 'Vinaigrette légère');
```






