-- Migration script to add employee_id column to employee_orders table
-- Run this script if your employee_orders table doesn't have the employee_id column

-- Add employee_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employee_orders' 
        AND column_name = 'employee_id'
    ) THEN
        ALTER TABLE employee_orders ADD COLUMN employee_id UUID;
        
        -- Update existing records with default employee_id
        UPDATE employee_orders 
        SET employee_id = '550e8400-e29b-41d4-a716-446655440012' 
        WHERE employee_id IS NULL;
        
        -- Make employee_id NOT NULL after updating existing records
        ALTER TABLE employee_orders ALTER COLUMN employee_id SET NOT NULL;
        
        RAISE NOTICE 'employee_id column added successfully';
    ELSE
        RAISE NOTICE 'employee_id column already exists';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employee_orders' 
ORDER BY ordinal_position;
