import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faMapMarkerAlt, faClock, faCheckCircle, faExclamationTriangle, faUser, faPhone, faRoute, faLocationArrow, faHistory } from '@fortawesome/free-solid-svg-icons';
import { showSuccess, showError } from '@/utils/toast';

interface Delivery {
  id: string;
  orderId: string;
  patientName: string;
  roomNumber: string;
  deliveryAddress: string;
  status: 'preparing' | 'out_for_delivery' | 'delivered' | 'failed';
  estimatedTime: string;
  actualTime?: string;
  deliveryPerson: string;
  deliveryPersonPhone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: string;
}

export const DeliveryTrackingTab = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    // Données de démonstration
    const demoDeliveries: Delivery[] = [
      {
        id: '1',
        orderId: 'ORD-001',
        patientName: 'Marie Dubois',
        roomNumber: 'Woleu',
        deliveryAddress: 'Woleu, Aile Nord',
        status: 'out_for_delivery',
        estimatedTime: '14:30',
        deliveryPerson: 'Jean Koffi',
        deliveryPersonPhone: '+241 01 23 45 67',
        notes: 'Patient allergique aux noix',
        createdAt: '2024-01-16T12:00:00Z',
        updatedAt: '2024-01-16T13:45:00Z'
      },
      {
        id: '2',
        orderId: 'ORD-002',
        patientName: 'Pierre Nguema',
        roomNumber: 'Ntem',
        deliveryAddress: 'Ntem, Aile Sud',
        status: 'preparing',
        estimatedTime: '15:00',
        deliveryPerson: 'Sarah Mba',
        deliveryPersonPhone: '+241 02 34 56 78',
        createdAt: '2024-01-16T12:30:00Z',
        updatedAt: '2024-01-16T12:30:00Z'
      },
      {
        id: '3',
        orderId: 'ORD-003',
        patientName: 'Anna Okou',
        roomNumber: 'Mpassa',
        deliveryAddress: 'Mpassa, Aile Est',
        status: 'delivered',
        estimatedTime: '13:15',
        actualTime: '13:12',
        deliveryPerson: 'Marc Obiang',
        deliveryPersonPhone: '+241 03 45 67 89',
        createdAt: '2024-01-16T11:00:00Z',
        updatedAt: '2024-01-16T13:12:00Z'
      },
      {
        id: '4',
        orderId: 'ORD-004',
        patientName: 'David Mba',
        roomNumber: 'Lolo',
        deliveryAddress: 'Lolo, Aile Ouest',
        status: 'failed',
        estimatedTime: '14:00',
        deliveryPerson: 'Jean Koffi',
        deliveryPersonPhone: '+241 01 23 45 67',
        notes: 'Patient absent, livraison reportée',
        createdAt: '2024-01-16T11:30:00Z',
        updatedAt: '2024-01-16T14:15:00Z'
      }
    ];

    const demoDeliveryPersons: DeliveryPerson[] = [
      {
        id: '1',
        name: 'Jean Koffi',
        phone: '+241 01 23 45 67',
        status: 'busy',
        currentLocation: 'Aile Nord, Étage 2'
      },
      {
        id: '2',
        name: 'Sarah Mba',
        phone: '+241 02 34 56 78',
        status: 'available',
        currentLocation: 'Cuisine principale'
      },
      {
        id: '3',
        name: 'Marc Obiang',
        phone: '+241 03 45 67 89',
        status: 'available',
        currentLocation: 'Réception'
      }
    ];

    setDeliveries(demoDeliveries);
    setDeliveryPersons(demoDeliveryPersons);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En préparation</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">En livraison</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Livré</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing': return faClock;
      case 'out_for_delivery': return faTruck;
      case 'delivered': return faCheckCircle;
      case 'failed': return faExclamationTriangle;
      default: return faTruck;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'text-yellow-600';
      case 'out_for_delivery': return 'text-blue-600';
      case 'delivered': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const updateDeliveryStatus = (deliveryId: string, newStatus: string) => {
    setDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === deliveryId 
          ? { 
              ...delivery, 
              status: newStatus as any,
              updatedAt: new Date().toISOString(),
              actualTime: newStatus === 'delivered' ? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : delivery.actualTime
            }
          : delivery
      )
    );
    showSuccess('Statut de livraison mis à jour');
  };

  const filteredDeliveries = deliveries.filter(delivery => 
    statusFilter === 'all' || delivery.status === statusFilter
  );

  const activeDeliveries = deliveries.filter(d => d.status === 'out_for_delivery' || d.status === 'preparing');
  const completedToday = deliveries.filter(d => d.status === 'delivered' && new Date(d.updatedAt).toDateString() === new Date().toDateString());

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FontAwesomeIcon icon={faTruck} className="mr-3 text-blue-600" />
            Suivi des Livraisons
          </h1>
          <p className="text-gray-600">Suivez les livraisons en temps réel</p>
        </div>
        <div className="flex space-x-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les livraisons</SelectItem>
              <SelectItem value="preparing">En préparation</SelectItem>
              <SelectItem value="out_for_delivery">En livraison</SelectItem>
              <SelectItem value="delivered">Livrées</SelectItem>
              <SelectItem value="failed">Échecs</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <FontAwesomeIcon icon={faHistory} className="mr-2" />
            Historique
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faTruck} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Livraisons actives</p>
                <p className="text-2xl font-bold">{activeDeliveries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Livrées aujourd'hui</p>
                <p className="text-2xl font-bold">{completedToday.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faUser} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Livreurs disponibles</p>
                <p className="text-2xl font-bold">{deliveryPersons.filter(p => p.status === 'available').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FontAwesomeIcon icon={faClock} className="text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Temps moyen</p>
                <p className="text-2xl font-bold">18min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Livreurs disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-3 text-purple-600" />
            Équipe de Livraison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryPersons.map(person => (
              <div key={person.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  person.status === 'available' ? 'bg-green-100' :
                  person.status === 'busy' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className={`${
                      person.status === 'available' ? 'text-green-600' :
                      person.status === 'busy' ? 'text-yellow-600' : 'text-gray-600'
                    }`} 
                  />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-semibold">{person.name}</h3>
                  <p className="text-sm text-gray-600">{person.phone}</p>
                  <p className="text-xs text-gray-500">{person.currentLocation}</p>
                </div>
                <Badge variant={
                  person.status === 'available' ? 'default' :
                  person.status === 'busy' ? 'secondary' : 'outline'
                }>
                  {person.status === 'available' ? 'Disponible' :
                   person.status === 'busy' ? 'Occupé' : 'Hors ligne'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des livraisons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Livraisons en cours</h2>
        {filteredDeliveries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FontAwesomeIcon icon={faTruck} className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune livraison</h3>
              <p className="text-gray-500">Aucune livraison ne correspond aux critères sélectionnés.</p>
            </CardContent>
          </Card>
        ) : (
          filteredDeliveries.map(delivery => (
            <Card key={delivery.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${getStatusColor(delivery.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(delivery.status)} className="text-xl" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-lg">{delivery.patientName}</h3>
                          <p className="text-sm text-gray-600">
                            Commande {delivery.orderId} • Chambre {delivery.roomNumber}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                            {delivery.deliveryAddress}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Livreur</p>
                          <p className="font-semibold">{delivery.deliveryPerson}</p>
                          <p className="text-xs text-gray-500">{delivery.deliveryPersonPhone}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Heure estimée</p>
                          <p className="font-semibold">{delivery.estimatedTime}</p>
                          {delivery.actualTime && (
                            <p className="text-xs text-green-600">Livré à {delivery.actualTime}</p>
                          )}
                        </div>
                      </div>
                      
                      {delivery.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                          <p className="text-sm text-yellow-800">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                            {delivery.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(delivery.status)}
                    
                    {delivery.status === 'preparing' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateDeliveryStatus(delivery.id, 'out_for_delivery')}
                      >
                        <FontAwesomeIcon icon={faTruck} className="mr-1" />
                        Envoyer en livraison
                      </Button>
                    )}
                    
                    {delivery.status === 'out_for_delivery' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                        Marquer comme livré
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <FontAwesomeIcon icon={faRoute} className="mr-1" />
                      Suivre
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de suivi détaillé */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Suivi de livraison - {selectedDelivery.orderId}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedDelivery(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Informations de livraison</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Patient:</span> {selectedDelivery.patientName}</p>
                    <p><span className="font-medium">Chambre:</span> {selectedDelivery.roomNumber}</p>
                    <p><span className="font-medium">Adresse:</span> {selectedDelivery.deliveryAddress}</p>
                    <p><span className="font-medium">Livreur:</span> {selectedDelivery.deliveryPerson}</p>
                    <p><span className="font-medium">Téléphone:</span> {selectedDelivery.deliveryPersonPhone}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700">Statut et timing</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Statut:</span> {getStatusBadge(selectedDelivery.status)}</p>
                    <p><span className="font-medium">Heure estimée:</span> {selectedDelivery.estimatedTime}</p>
                    {selectedDelivery.actualTime && (
                      <p><span className="font-medium">Heure réelle:</span> {selectedDelivery.actualTime}</p>
                    )}
                    <p><span className="font-medium">Créé le:</span> {new Date(selectedDelivery.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>
              
              {selectedDelivery.notes && (
                <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <h4 className="font-semibold text-yellow-800 mb-2">Notes spéciales</h4>
                  <p className="text-yellow-700">{selectedDelivery.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setSelectedDelivery(null)}>
                  Fermer
                </Button>
                <Button>
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Appeler le livreur
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};


