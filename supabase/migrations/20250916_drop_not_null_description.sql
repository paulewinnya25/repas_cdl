-- Make description optional in employee and patient menus
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'employee_menus' AND column_name = 'description'
  ) THEN
    BEGIN
      ALTER TABLE public.employee_menus ALTER COLUMN description DROP NOT NULL;
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'menus' AND column_name = 'description'
  ) THEN
    BEGIN
      ALTER TABLE public.menus ALTER COLUMN description DROP NOT NULL;
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;
END $$;



