import { createClient } from '@supabase/supabase-js';

// Configuration pour PostgreSQL direct (sans Supabase)
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Créer le client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': SUPABASE_PUBLISHABLE_KEY
    }
  }
});

// Fonction pour tester la connexion
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
    
    console.log('✅ Connexion à la base de données réussie');
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    return false;
  }
};

// Fonction pour créer les tables si elles n'existent pas
export const ensureTablesExist = async () => {
  try {
    // Vérifier si les tables existent
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Erreur lors de la vérification des tables:', error);
      return false;
    }
    
    const tableNames = tables?.map(t => t.table_name) || [];
    console.log('📋 Tables existantes:', tableNames);
    
    // Si les tables n'existent pas, les créer
    if (!tableNames.includes('patients')) {
      console.log('🔧 Création des tables...');
      await createTables();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des tables:', error);
    return false;
  }
};

// Fonction pour créer les tables
const createTables = async () => {
  const createTablesSQL = `
    -- Créer les tables
    CREATE TABLE IF NOT EXISTS public.patients (
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

    CREATE TABLE IF NOT EXISTS public.orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
        meal_type TEXT NOT NULL,
        menu TEXT NOT NULL,
        instructions TEXT,
        status TEXT DEFAULT 'En attente d''approbation' NOT NULL,
        date TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        prepared_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS public.employee_menus (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        photo_url TEXT,
        price NUMERIC(10, 2) NOT NULL,
        preparation_time INTEGER DEFAULT 30,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.employee_orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        employee_id UUID NOT NULL,
        menu_id UUID REFERENCES public.employee_menus(id),
        delivery_location TEXT NOT NULL,
        special_instructions TEXT,
        quantity INTEGER DEFAULT 1 NOT NULL,
        total_price NUMERIC(10, 2) NOT NULL,
        status TEXT DEFAULT 'Commandé' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        prepared_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.menus (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        diet_type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.weekly_menu_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        menu_id UUID REFERENCES public.menus(id),
        day_of_week TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.patient_menus (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        patient_id UUID REFERENCES public.patients(id),
        menu_id UUID REFERENCES public.menus(id),
        date DATE NOT NULL,
        meal_type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    if (error) {
      console.error('Erreur lors de la création des tables:', error);
      return false;
    }
    console.log('✅ Tables créées avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    return false;
  }
};






