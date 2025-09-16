import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faClock, faUserPlus, faUtensils, faBell, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { showSuccess, showError } from '@/utils/toast';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: () => void;
}

export const QuickActions = () => {
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isQuickPatientOpen, setIsQuickPatientOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'quick-order',
      title: 'Commande Rapide',
      description: 'Passer une commande rapidement',
      icon: faUtensils,
      color: 'bg-blue-500',
      action: () => setIsQuickOrderOpen(true)
    },
    {
      id: 'quick-patient',
      title: 'Nouveau Patient',
      description: 'Ajouter un nouveau patient',
      icon: faUserPlus,
      color: 'bg-green-500',
      action: () => setIsQuickPatientOpen(true)
    },
    {
      id: 'quick-menu',
      title: 'Menu du Jour',
      description: 'Gérer le menu du jour',
      icon: faUtensils,
      color: 'bg-orange-500',
      action: () => setIsQuickMenuOpen(true)
    },
    {
      id: 'quick-search',
      title: 'Recherche Avancée',
      description: 'Rechercher patients, commandes...',
      icon: faSearch,
      color: 'bg-purple-500',
      action: () => showSuccess('Recherche avancée disponible')
    },
    {
      id: 'quick-notification',
      title: 'Notification',
      description: 'Envoyer une notification',
      icon: faBell,
      color: 'bg-red-500',
      action: () => showSuccess('Système de notification activé')
    },
    {
      id: 'quick-analytics',
      title: 'Rapport Rapide',
      description: 'Générer un rapport',
      icon: faChartLine,
      color: 'bg-indigo-500',
      action: () => showSuccess('Rapport généré')
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Actions Rapides</h2>
        <p className="text-gray-600 dark:text-gray-400">Accédez rapidement aux fonctions les plus utilisées</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map(action => (
          <Card 
            key={action.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={action.action}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${action.color} text-white`}>
                  <FontAwesomeIcon icon={action.icon} className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Commande Rapide */}
      <Dialog open={isQuickOrderOpen} onOpenChange={setIsQuickOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commande Rapide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient">Patient</Label>
              <Input id="patient" placeholder="Nom du patient" />
            </div>
            <div>
              <Label htmlFor="menu">Menu</Label>
              <Input id="menu" placeholder="Type de menu" />
            </div>
            <div>
              <Label htmlFor="notes">Notes spéciales</Label>
              <Textarea id="notes" placeholder="Allergies, préférences..." />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsQuickOrderOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                showSuccess('Commande rapide passée !');
                setIsQuickOrderOpen(false);
              }}>
                Passer la commande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Nouveau Patient */}
      <Dialog open={isQuickPatientOpen} onOpenChange={setIsQuickPatientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" placeholder="Prénom" />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" placeholder="Nom" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room">Chambre</Label>
                <Input id="room" placeholder="Numéro de chambre" />
              </div>
              <div>
                <Label htmlFor="diet">Régime</Label>
                <Input id="diet" placeholder="Type de régime" />
              </div>
            </div>
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea id="allergies" placeholder="Allergies connues..." />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsQuickPatientOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                showSuccess('Patient ajouté avec succès !');
                setIsQuickPatientOpen(false);
              }}>
                Ajouter le patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Menu du Jour */}
      <Dialog open={isQuickMenuOpen} onOpenChange={setIsQuickMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menu du Jour</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mealType">Type de repas</Label>
              <Input id="mealType" placeholder="Petit-déjeuner, Déjeuner, Dîner" />
            </div>
            <div>
              <Label htmlFor="dishName">Nom du plat</Label>
              <Input id="dishName" placeholder="Nom du plat principal" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Description détaillée du plat..." />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsQuickMenuOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                showSuccess('Menu du jour mis à jour !');
                setIsQuickMenuOpen(false);
              }}>
                Mettre à jour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};






