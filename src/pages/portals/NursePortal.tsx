import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserInjured, faUtensils, faClock, faCheckCircle, faPlus, faSearch, faBell, faChartLine, faUsers, faClipboardList, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import type { Patient, Order } from '@/types/repas-cdl';

export default function NursePortal() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const [instructions, setInstructions] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (patientsError) throw patientsError;
      setPatients(patientsData as Patient[]);

      // Récupérer les commandes
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, patients(name, room)')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      setOrders(ordersData as Order[]);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSubmit = async () => {
    if (!selectedPatient || !selectedMenu) {
      showError('Veuillez sélectionner un patient et un menu');
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          patient_id: selectedPatient.id,
          meal_type: selectedMenu,
          menu: `${selectedMenu} - ${selectedPatient.diet}`,
          instructions: instructions,
          status: 'En attente d\'approbation'
        }]);

      if (error) throw error;

      showSuccess(`Commande passée pour ${selectedPatient.name}`);
      setIsOrderModalOpen(false);
      setSelectedPatient(null);
      setSelectedMenu('');
      setInstructions('');
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      showError('Impossible de passer la commande');
    }
  };

  const handleOrderCancel = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Annulé' })
        .eq('id', orderId);

      if (error) throw error;

      showSuccess('Commande annulée avec succès');
      fetchData();

    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      showError('Impossible d\'annuler la commande');
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette commande ? Cette action est irréversible.')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      showSuccess('Commande supprimée avec succès');
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Impossible de supprimer la commande');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingOrders = orders.filter(order => order.status === 'En attente d\'approbation');
  const todayOrders = orders.filter(order => 
    new Date(order.created_at || order.date).toDateString() === new Date().toDateString()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du portail infirmier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FontAwesomeIcon icon={faUserInjured} className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Portail Infirmier</h1>
                <p className="text-gray-600">Gestion des commandes patients</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Commandes en attente</p>
                <p className="text-2xl font-bold text-red-600">{pendingOrders.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Commandes aujourd'hui</p>
                <p className="text-2xl font-bold text-green-600">{todayOrders.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUsers} className="text-3xl mr-4" />
                <div>
                  <p className="text-blue-100">Patients Actifs</p>
                  <p className="text-3xl font-bold">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="text-3xl mr-4" />
                <div>
                  <p className="text-yellow-100">En Attente</p>
                  <p className="text-3xl font-bold">{pendingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl mr-4" />
                <div>
                  <p className="text-green-100">Livrées Aujourd'hui</p>
                  <p className="text-3xl font-bold">{todayOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faChartLine} className="text-3xl mr-4" />
                <div>
                  <p className="text-purple-100">Total Commandes</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Liste des patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="mr-2 text-blue-600" />
                  Patients Disponibles
                </span>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Rechercher un patient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setIsOrderModalOpen(true);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <FontAwesomeIcon icon={faUserInjured} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{patient.name}</h3>
                        <p className="text-sm text-gray-600">Chambre {patient.room}</p>
                        <Badge variant="outline" className="mt-1">
                          {patient.diet}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      Commander
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Commandes récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FontAwesomeIcon icon={faClipboardList} className="mr-2 text-green-600" />
                Commandes Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.slice(0, 10).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${
                        order.status === 'Livré' ? 'bg-green-100' :
                        order.status === 'En préparation' ? 'bg-orange-100' :
                        order.status === 'Annulé' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={
                            order.status === 'Livré' ? faCheckCircle :
                            order.status === 'En préparation' ? faClock :
                            order.status === 'Annulé' ? faTimes :
                            faUtensils
                          } 
                          className={`${
                            order.status === 'Livré' ? 'text-green-600' :
                            order.status === 'En préparation' ? 'text-orange-600' :
                            order.status === 'Annulé' ? 'text-red-600' :
                            'text-yellow-600'
                          }`} 
                        />
                      </div>
                      <div>
                        <p className="font-medium">{order.patients?.name}</p>
                        <p className="text-sm text-gray-600">
                          Chambre {order.patients?.room} - {order.meal_type}
                        </p>
                        {order.instructions && (
                          <p className="text-xs text-gray-500 italic">
                            {order.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant={
                        order.status === 'Livré' ? 'default' :
                        order.status === 'En préparation' ? 'secondary' :
                        order.status === 'Annulé' ? 'destructive' :
                        'outline'
                      }>
                        {order.status}
                      </Badge>
                      {/* Boutons d'action pour les commandes en attente */}
                      {order.status === 'En attente d\'approbation' && (
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOrderCancel(order.id)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Annuler
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOrderDelete(order.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                      {/* Bouton d'annulation pour les commandes en préparation */}
                      {order.status === 'En préparation' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOrderCancel(order.id)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de commande */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Nouvelle commande {selectedPatient && `pour ${selectedPatient.name}`}
            </DialogTitle>
            <p className="text-sm text-gray-600">Passez une commande pour le patient sélectionné</p>
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
                <Label htmlFor="menu-select">Type de repas</Label>
                <Select value={selectedMenu} onValueChange={setSelectedMenu}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de repas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petit-déjeuner">Petit-déjeuner</SelectItem>
                    <SelectItem value="Déjeuner">Déjeuner</SelectItem>
                    <SelectItem value="Dîner">Dîner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Instructions spéciales */}
              <div>
                <Label htmlFor="instructions">Instructions spéciales</Label>
                <Input
                  id="instructions"
                  placeholder="Allergies, préférences, etc."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleOrderSubmit}>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Passer la commande
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
