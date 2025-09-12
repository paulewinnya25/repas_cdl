import { useState, useEffect, useCallback } from 'react';
import { Patient, Menu, Order, OrderStatus } from '@/types/repas-cdl';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserInjured, faUtensils, faPlus, faEye, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';

interface NursePortalProps {
  userProfile: any;
}

export const NursePortal = ({ userProfile }: NursePortalProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPatients(data);
    } catch (error) {
      showError("Impossible de charger les patients.");
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('meal_type', { ascending: true });
      if (error) throw error;
      setMenus(data);
    } catch (error) {
      showError("Impossible de charger les menus.");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, patients(name, room)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data);
    } catch (error) {
      showError("Impossible de charger les commandes.");
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    fetchMenus();
    fetchOrders();
  }, [fetchPatients, fetchMenus, fetchOrders]);

  const handleOrderSubmit = async () => {
    if (!selectedPatient || !selectedMenu) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          patient_id: selectedPatient.id,
          meal_type: selectedMenu.meal_type,
          menu: selectedMenu.description,
          instructions: instructions,
          status: 'En attente d\'approbation'
        }]);

      if (error) throw error;

      showSuccess(`Commande passée pour ${selectedPatient.name}`);
      setIsOrderModalOpen(false);
      setSelectedPatient(null);
      setSelectedMenu(null);
      setInstructions('');
      fetchOrders();
    } catch (error) {
      showError("Erreur lors de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'En attente d\'approbation': return 'secondary';
      case 'Approuvé': return 'default';
      case 'En préparation': return 'default';
      case 'Prêt': return 'default';
      case 'Livré': return 'default';
      case 'Annulé': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Livré': return faCheckCircle;
      case 'En préparation': return faUtensils;
      default: return faClock;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête du portail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-600">
            <FontAwesomeIcon icon={faUserInjured} className="mr-3" />
            Portail Infirmière - Commandes Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Gérez les commandes de repas pour les patients selon leurs régimes alimentaires.
          </p>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUserInjured} className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUtensils} className="text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Menus disponibles</p>
                <p className="text-2xl font-bold">{menus.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faClock} className="text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Commandes en attente</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'En attente d\'approbation').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Commandes livrées</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'Livré').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Actions rapides</h2>
        <Button 
          onClick={() => setIsOrderModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Liste des patients avec actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map(patient => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{patient.name}</h3>
                  <p className="text-sm text-gray-600">Chambre {patient.room}</p>
                  <Badge variant="outline" className="mt-1">
                    {patient.diet}
                  </Badge>
                </div>
                <FontAwesomeIcon icon={faUserInjured} className="text-blue-600" />
              </div>
              
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedPatient(patient);
                    setIsOrderModalOpen(true);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Commander
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Voir l'historique des commandes de ce patient
                    const patientOrders = orders.filter(o => o.patient_id === patient.id);
                    console.log('Commandes du patient:', patientOrders);
                  }}
                >
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  Historique
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liste des commandes récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 10).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={getStatusIcon(order.status)} 
                    className={`mr-3 ${
                      order.status === 'Livré' ? 'text-green-600' : 
                      order.status === 'En préparation' ? 'text-orange-600' : 
                      'text-gray-600'
                    }`} 
                  />
                  <div>
                    <p className="font-medium">
                      {order.patients?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Chambre {order.patients?.room} - {order.meal_type}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de commande */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Nouvelle commande {selectedPatient && `pour ${selectedPatient.name}`}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              {/* Informations patient */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Patient sélectionné</h4>
                <p className="text-blue-700">
                  {selectedPatient.name} - 
                  Chambre {selectedPatient.room} - 
                  Régime: {selectedPatient.diet}
                </p>
              </div>

              {/* Sélection du menu */}
              <div>
                <Label htmlFor="menu-select">Menu</Label>
                <Select onValueChange={(value) => {
                  const menu = menus.find(m => m.id === value);
                  setSelectedMenu(menu || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un menu" />
                  </SelectTrigger>
                  <SelectContent>
                    {menus
                      .filter(menu => menu.diet === selectedPatient.diet)
                      .map(menu => (
                        <SelectItem key={menu.id} value={menu.id}>
                          {menu.meal_type} - {menu.description}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Instructions spéciales */}
              <div>
                <Label htmlFor="instructions">Instructions spéciales</Label>
                <Textarea
                  id="instructions"
                  placeholder="Ajoutez des instructions spéciales si nécessaire..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOrderModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleOrderSubmit}
                  disabled={!selectedMenu || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'En cours...' : 'Passer la commande'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
