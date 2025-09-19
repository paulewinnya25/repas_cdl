import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserInjured, 
  faPlus, 
  faSearch, 
  faFilter,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faBars,
  faTimes,
  faBell,
  faQrcode,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface MobileNurseInterfaceProps {
  patients: any[];
  orders: any[];
  onPlaceOrder: (orderData: any) => void;
  onScanPatient: (patientId: string) => void;
}

const MobileNurseInterface: React.FC<MobileNurseInterfaceProps> = ({
  patients,
  orders,
  onPlaceOrder,
  onScanPatient
}) => {
  const [activeTab, setActiveTab] = useState<'patients' | 'orders' | 'scan'>('patients');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    mealType: '',
    menu: '',
    instructions: ''
  });

  // Couleurs du logo
  const LOGO_COLORS = {
    blue: '#5ac2ec',
    green: '#41b8ac'
  };

  // Filtrer les patients
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques rapides
  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString();
    const orderDate = new Date(order.created_at || order.date || '').toDateString();
    return orderDate === today;
  });

  const pendingOrders = orders.filter(order => order.status?.includes('attente'));

  const handleQuickOrder = (patient: any) => {
    setSelectedPatient(patient);
    setIsOrderModalOpen(true);
  };

  const handleScanQR = () => {
    // Simulation du scan QR - dans une vraie app, ceci utiliserait la caméra
    const mockPatientId = patients[0]?.id;
    if (mockPatientId) {
      onScanPatient(mockPatientId);
      setSelectedPatient(patients[0]);
      setIsOrderModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                <FontAwesomeIcon icon={faBars} className="text-lg" />
              </Button>
              <div>
                <h1 className="text-lg font-bold" style={{ color: LOGO_COLORS.blue }}>
                  Portail Infirmier
                </h1>
                <p className="text-xs text-gray-600">Mobile</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2"
                style={{ color: LOGO_COLORS.blue }}
              >
                <FontAwesomeIcon icon={faBell} className="text-lg" />
                {pendingOrders.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs"
                  >
                    {pendingOrders.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Mobile */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'patients'
                ? 'border-b-2 text-blue-600'
                : 'text-gray-600'
            }`}
            style={{ borderBottomColor: activeTab === 'patients' ? LOGO_COLORS.blue : 'transparent' }}
          >
            <FontAwesomeIcon icon={faUserInjured} className="mr-2" />
            Patients
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'orders'
                ? 'border-b-2 text-blue-600'
                : 'text-gray-600'
            }`}
            style={{ borderBottomColor: activeTab === 'orders' ? LOGO_COLORS.blue : 'transparent' }}
          >
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            Commandes
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'scan'
                ? 'border-b-2 text-blue-600'
                : 'text-gray-600'
            }`}
            style={{ borderBottomColor: activeTab === 'scan' ? LOGO_COLORS.blue : 'transparent' }}
          >
            <FontAwesomeIcon icon={faQrcode} className="mr-2" />
            Scanner
          </button>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="p-4 space-y-4">
        {/* Statistiques Rapides */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Aujourd'hui</p>
              <p className="text-xl font-bold" style={{ color: LOGO_COLORS.blue }}>
                {todayOrders.length}
              </p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">En attente</p>
              <p className="text-xl font-bold" style={{ color: LOGO_COLORS.green }}>
                {pendingOrders.length}
              </p>
            </div>
          </Card>
        </div>

        {/* Onglet Patients */}
        {activeTab === 'patients' && (
          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Liste des patients */}
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{patient.name}</h3>
                      <p className="text-xs text-gray-600">Chambre {patient.room}</p>
                      <p className="text-xs text-gray-500">{patient.service}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleQuickOrder(patient)}
                      className="text-xs"
                      style={{ backgroundColor: LOGO_COLORS.blue }}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      Commander
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Commandes */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filtres rapides */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                style={{ borderColor: LOGO_COLORS.blue, color: LOGO_COLORS.blue }}
              >
                <FontAwesomeIcon icon={faFilter} className="mr-1" />
                Toutes
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
              >
                En attente
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Livrées
              </Button>
            </div>

            {/* Liste des commandes */}
            <div className="space-y-2">
              {todayOrders.slice(0, 10).map((order) => (
                <Card key={order.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{order.patients?.name || 'Patient'}</h3>
                      <p className="text-xs text-gray-600">{order.menu}</p>
                      <p className="text-xs text-gray-500">{order.meal_type}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={order.status === 'Livré' ? 'default' : 'secondary'}
                        className="text-xs"
                        style={{ 
                          backgroundColor: order.status === 'Livré' ? LOGO_COLORS.green : '#f3f4f6',
                          color: order.status === 'Livré' ? 'white' : 'black'
                        }}
                      >
                        {order.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.created_at || order.date || '').toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Scanner */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            <Card className="p-6 text-center">
              <FontAwesomeIcon 
                icon={faQrcode} 
                className="text-6xl mb-4"
                style={{ color: LOGO_COLORS.blue }}
              />
              <h3 className="font-medium mb-2">Scanner QR Code Patient</h3>
              <p className="text-sm text-gray-600 mb-4">
                Scannez le QR code du patient pour une commande rapide
              </p>
              <Button
                onClick={handleScanQR}
                className="w-full"
                style={{ backgroundColor: LOGO_COLORS.blue }}
              >
                <FontAwesomeIcon icon={faCamera} className="mr-2" />
                Scanner QR Code
              </Button>
            </Card>

            {/* Instructions */}
            <Card className="p-4">
              <h4 className="font-medium mb-2">Comment utiliser :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pointez la caméra vers le QR code du patient</li>
                <li>• Le patient sera automatiquement sélectionné</li>
                <li>• Remplissez les détails de la commande</li>
                <li>• Confirmez la commande</li>
              </ul>
            </Card>
          </div>
        )}
      </div>

      {/* Modal de commande rapide */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>
              Commande pour {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="meal-type">Type de repas</Label>
              <Select value={newOrder.mealType} onValueChange={(value) => setNewOrder({...newOrder, mealType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petit-déjeuner">Petit-déjeuner</SelectItem>
                  <SelectItem value="Déjeuner">Déjeuner</SelectItem>
                  <SelectItem value="Dîner">Dîner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="menu">Menu</Label>
              <Select value={newOrder.menu} onValueChange={(value) => setNewOrder({...newOrder, menu: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Menu Standard">Menu Standard</SelectItem>
                  <SelectItem value="Menu Diététique">Menu Diététique</SelectItem>
                  <SelectItem value="Menu Sans Sel">Menu Sans Sel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="instructions">Instructions spéciales</Label>
              <Textarea
                id="instructions"
                placeholder="Instructions pour la cuisine..."
                value={newOrder.instructions}
                onChange={(e) => setNewOrder({...newOrder, instructions: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOrderModalOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  onPlaceOrder({
                    ...newOrder,
                    patientId: selectedPatient?.id
                  });
                  setIsOrderModalOpen(false);
                  setNewOrder({ mealType: '', menu: '', instructions: '' });
                }}
                className="flex-1"
                style={{ backgroundColor: LOGO_COLORS.blue }}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobileNurseInterface;
