-- Script SQL pour créer la table kitchen_inventory dans Supabase
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- Créer la table kitchen_inventory
CREATE TABLE IF NOT EXISTS kitchen_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit VARCHAR(50),
  supplier VARCHAR(255),
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur la catégorie pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_category ON kitchen_inventory(category);

-- Créer un index sur le nom pour améliorer les recherches
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_name ON kitchen_inventory(name);

-- Créer un index sur le stock minimum pour les alertes
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_stock ON kitchen_inventory(current_stock, min_stock);

-- Activer RLS (Row Level Security)
ALTER TABLE kitchen_inventory ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "kitchen_inventory_select_policy" ON kitchen_inventory
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre l'insertion aux utilisateurs authentifiés
CREATE POLICY "kitchen_inventory_insert_policy" ON kitchen_inventory
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "kitchen_inventory_update_policy" ON kitchen_inventory
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "kitchen_inventory_delete_policy" ON kitchen_inventory
  FOR DELETE USING (auth.role() = 'authenticated');

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_kitchen_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_kitchen_inventory_updated_at_trigger
  BEFORE UPDATE ON kitchen_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_kitchen_inventory_updated_at();

-- Insérer quelques données d'exemple (optionnel)
INSERT INTO kitchen_inventory (name, category, current_stock, min_stock, unit, supplier, cost_per_unit, notes) VALUES
('Riz basmati', 'cereales', 50, 10, 'kg', 'Fournisseur ABC', 2500.00, 'Riz de qualité premium'),
('Poulet', 'viandes', 20, 5, 'kg', 'Boucherie XYZ', 3500.00, 'Poulet frais'),
('Tomates', 'legumes', 30, 8, 'kg', 'Marché Central', 800.00, 'Tomates rouges'),
('Huile de tournesol', 'epices', 15, 3, 'L', 'Fournisseur ABC', 1200.00, 'Huile de cuisson'),
('Oignons', 'legumes', 25, 5, 'kg', 'Marché Central', 600.00, 'Oignons jaunes')
ON CONFLICT (id) DO NOTHING;

-- Commentaires sur la table
COMMENT ON TABLE kitchen_inventory IS 'Table de gestion du stock de la cuisine';
COMMENT ON COLUMN kitchen_inventory.name IS 'Nom de l''article';
COMMENT ON COLUMN kitchen_inventory.category IS 'Catégorie de l''article (viandes, légumes, etc.)';
COMMENT ON COLUMN kitchen_inventory.current_stock IS 'Stock actuel disponible';
COMMENT ON COLUMN kitchen_inventory.min_stock IS 'Stock minimum requis';
COMMENT ON COLUMN kitchen_inventory.unit IS 'Unité de mesure (kg, L, pièces, etc.)';
COMMENT ON COLUMN kitchen_inventory.supplier IS 'Nom du fournisseur';
COMMENT ON COLUMN kitchen_inventory.cost_per_unit IS 'Prix unitaire en XAF';
COMMENT ON COLUMN kitchen_inventory.expiry_date IS 'Date d''expiration (optionnel)';
COMMENT ON COLUMN kitchen_inventory.notes IS 'Notes supplémentaires';
