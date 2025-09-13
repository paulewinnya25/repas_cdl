// Configuration PostgreSQL local
// Remplacez la configuration Supabase par PostgreSQL local

import { createClient } from '@supabase/supabase-js';

// Configuration pour PostgreSQL local
// Vous devez installer Supabase CLI et démarrer un projet local
const SUPABASE_URL = "http://localhost:54321"; // URL locale de Supabase
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTk5NjAwLCJleHAiOjE5NTY1NzU2MDB9.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

// Alternative: Configuration PostgreSQL directe (sans Supabase)
// const DATABASE_URL = "postgresql://repas_user:votre_mot_de_passe@localhost:5432/repas_cdl";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Pour une migration complète vers PostgreSQL pur, vous devrez :
// 1. Installer pg (npm install pg @types/pg)
// 2. Créer un client PostgreSQL direct
// 3. Remplacer toutes les requêtes Supabase par des requêtes SQL directes


