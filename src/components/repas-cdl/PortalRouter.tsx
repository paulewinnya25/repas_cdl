import { useState, useEffect } from 'react';
import { UserRole } from '@/types/repas-cdl';
import { supabase } from '@/integrations/supabase/client';
import { NursePortal } from './portals/NursePortal';
import { EmployeePortal } from './portals/EmployeePortal';
import { CookPortal } from './portals/CookPortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserNurse, faUsers, faUtensils } from '@fortawesome/free-solid-svg-icons';

interface PortalRouterProps {
  currentUserRole: UserRole;
}

export const PortalRouter = ({ currentUserRole }: PortalRouterProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du portail...</p>
        </div>
      </div>
    );
  }

  // Déterminer le portail à afficher selon le rôle
  const renderPortal = () => {
    switch (currentUserRole) {
      case 'Infirmier':
      case 'Infirmière':
      case 'Cadre de santé':
        return <NursePortal userProfile={userProfile} />;
      
      case 'Agent d\'accueil et facturation':
      case 'Assistante comptable':
      case 'Coursier':
      case 'Opérateur de saisie':
      case 'Secrétaire médicale':
      case 'Technicien superieur de biologie médicale':
      case 'Technicien supérieur en imagerie médicale':
      case 'Equipière polyvalente':
      case 'Médecin généraliste':
      case 'VP-Médecin réanimateur anesthesiste':
      case 'Biologiste':
      case 'Médecin Généraliste de garde':
        return <EmployeePortal userProfile={userProfile} />;
      
      case 'Chef Cuisinier':
      case 'Aide Cuisinier':
      case 'Super Admin':
        return <CookPortal userProfile={userProfile} />;
      
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-600">
                  <FontAwesomeIcon icon={faUserNurse} className="mr-3 text-blue-600" />
                  Sélectionnez votre portail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <FontAwesomeIcon icon={faUserNurse} className="text-4xl text-blue-600 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Portail Infirmière</h3>
                      <p className="text-sm text-gray-600">Commandes pour les patients</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <FontAwesomeIcon icon={faUsers} className="text-4xl text-green-600 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Portail Employés</h3>
                      <p className="text-sm text-gray-600">Commandes personnelles</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <FontAwesomeIcon icon={faUtensils} className="text-4xl text-orange-600 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Portail Cuisiniers</h3>
                      <p className="text-sm text-gray-600">Gestion des commandes</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {renderPortal()}
      </div>
    </div>
  );
};



