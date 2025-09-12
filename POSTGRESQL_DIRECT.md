# Configuration PostgreSQL direct (sans Docker)

## 1. Installer PostgreSQL
- Téléchargez PostgreSQL depuis https://www.postgresql.org/download/windows/
- Installez avec les paramètres par défaut
- Notez le mot de passe du superutilisateur (postgres)

## 2. Créer la base de données
```sql
-- Se connecter à PostgreSQL
psql -U postgres

-- Créer la base de données
CREATE DATABASE repas_cdl;

-- Créer un utilisateur
CREATE USER repas_user WITH PASSWORD 'votre_mot_de_passe';

-- Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE repas_cdl TO repas_user;
```

## 3. Modifier la configuration de l'application
```typescript
// Dans src/integrations/supabase/client.ts
// Remplacer par une configuration PostgreSQL directe
```

## 4. Installer les dépendances PostgreSQL
```bash
npm install pg @types/pg
```

