import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export const TestPortal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      // Test de connexion à la base de données
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      
      showSuccess("Connexion à la base de données réussie !");
    } catch (error) {
      console.error('Erreur de connexion:', error);
      showError("Erreur de connexion à la base de données");
    } finally {
      setIsLoading(false);
    }
  };

  const testTables = async () => {
    setIsLoading(true);
    try {
      // Test des tables
      const [patientsResult, menusResult, employeeMenusResult] = await Promise.all([
        supabase.from('patients').select('count').limit(1),
        supabase.from('menus').select('count').limit(1),
        supabase.from('employee_menus').select('count').limit(1)
      ]);

      if (patientsResult.error) throw patientsResult.error;
      if (menusResult.error) throw menusResult.error;
      if (employeeMenusResult.error) throw employeeMenusResult.error;

      showSuccess("Toutes les tables sont accessibles !");
    } catch (error) {
      console.error('Erreur des tables:', error);
      showError("Erreur d'accès aux tables");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test des Portails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testDatabaseConnection}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Test en cours...' : 'Tester la connexion DB'}
          </Button>
          
          <Button 
            onClick={testTables}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Test en cours...' : 'Tester les tables'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};


