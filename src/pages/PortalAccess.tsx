import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserInjured, 
  faUserTie, 
  faUtensils,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';

const PortalAccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Header 
        title="RepasCDL" 
        subtitle="Système de gestion des repas"
        showLogo={true}
      />
      
      {/* Login Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-end">
          <Link to="/login">
            <Button variant="outline">
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
              Connexion
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Accès aux Portails
          </h2>
          <p className="text-xl text-gray-600">
            Sélectionnez le portail correspondant à votre rôle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Portail Infirmier */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserInjured} className="text-blue-600 text-2xl" />
              </div>
              <CardTitle className="text-xl text-blue-800">Portail Infirmier</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Gestion des commandes patients, création de nouvelles commandes, 
                annulation et suppression des commandes.
              </p>
              <Link to="/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <FontAwesomeIcon icon={faUserInjured} className="mr-2" />
                  Se connecter - Portail Infirmier
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Portail Cuisinier */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserTie} className="text-orange-600 text-2xl" />
              </div>
              <CardTitle className="text-xl text-orange-800">Portail Cuisinier</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Gestion des commandes patients et employés, mise à jour des statuts, 
                gestion des menus employés.
              </p>
              <Link to="/login" className="block">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <FontAwesomeIcon icon={faUserTie} className="mr-2" />
                  Se connecter - Portail Cuisinier
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Portail Employé */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FontAwesomeIcon icon={faUtensils} className="text-green-600 text-2xl" />
              </div>
              <CardTitle className="text-xl text-green-800">Portail Employé</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Consultation des menus disponibles, commande de repas personnels, 
                suivi des commandes.
              </p>
              <Link to="/employee-portal" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <FontAwesomeIcon icon={faUtensils} className="mr-2" />
                  Accéder au Portail Employé
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Informations de connexion */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Informations de Connexion</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Infirmier</h4>
              <p><strong>Email:</strong> paule.winnya@centre-diagnostic.com</p>
              <p><strong>Mot de passe:</strong> password123</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Cuisinier</h4>
              <p><strong>Email:</strong> chef@centre-diagnostic.com</p>
              <p><strong>Mot de passe:</strong> password123</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Employé</h4>
              <p><strong>Email:</strong> employe@centre-diagnostic.com</p>
              <p><strong>Mot de passe:</strong> password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalAccess;