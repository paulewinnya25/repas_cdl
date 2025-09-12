import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faUtensils, faClock, faCheckCircle, faPlus, faSearch, faBell, faChartLine, faShoppingCart, faHistory } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import type { EmployeeMenu, EmployeeOrder } from '@/types/repas-cdl';

export default function EmployeePortal() {
  const [employeeMenus, setEmployeeMenus] = useState<EmployeeMenu[]>([]);
  const [myOrders, setMyOrders] = useState<EmployeeOrder[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<EmployeeMenu | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les menus employés
      const { data: menusData, error: menusError } = await supabase
        .from('employee_menus')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      
      if (menusError) throw menusError;
      setEmployeeMenus(menusData as EmployeeMenu[]);

      // Récupérer mes commandes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: ordersData, error: ordersError } = await supabase
          .from('employee_orders')
          .select('*, employee_menus(name, photo_url)')
          .eq('employee_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) throw ordersError;
        setMyOrders(ordersData as EmployeeOrder[]);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSubmit = async () => {
    if (!selectedMenu) {
      showError('Veuillez sélectionner un menu');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié.");

      const { error } = await supabase
        .from('employee_orders')
        .insert([{
          employee_id: user.id,
          menu_id: selectedMenu.id,
          delivery_location: 'Cuisine',
          special_instructions: specialInstructions,
          total_price: selectedMenu.price,
          status: 'Commandé'
        }]);

      if (error) throw error;

      showSuccess("Commande passée avec succès !");
      setIsOrderModalOpen(false);
      setSelectedMenu(null);
      setSpecialInstructions('');
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      showError('Impossible de passer la commande');
    }
  };

  const pendingOrders = myOrders.filter(order => order.status === 'Commandé');
  const todayOrders = myOrders.filter(order => 
    new Date(order.created_at).toDateString() === new Date().toDateString()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du portail employé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FontAwesomeIcon icon={faUserTie} className="text-green-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Portail Employé</h1>
                <p className="text-gray-600">Commandes personnelles et menus disponibles</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Mes commandes en attente</p>
                <p className="text-2xl font-bold text-orange-600">{pendingOrders.length}</p>
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
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUtensils} className="text-3xl mr-4" />
                <div>
                  <p className="text-green-100">Menus Disponibles</p>
                  <p className="text-3xl font-bold">{employeeMenus.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="text-3xl mr-4" />
                <div>
                  <p className="text-orange-100">En Attente</p>
                  <p className="text-3xl font-bold">{pendingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl mr-4" />
                <div>
                  <p className="text-blue-100">Livrées Aujourd'hui</p>
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
                  <p className="text-3xl font-bold">{myOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Menus disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FontAwesomeIcon icon={faUtensils} className="mr-2 text-green-600" />
                Menus Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {employeeMenus.map(menu => (
                  <div
                    key={menu.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedMenu(menu);
                      setIsOrderModalOpen(true);
                    }}
                  >
                    <div className="flex items-center">
                      {menu.photo_url ? (
                        <img 
                          src={menu.photo_url} 
                          alt={menu.name}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <FontAwesomeIcon icon={faUtensils} className="text-green-600 text-xl" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{menu.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {menu.price.toLocaleString('fr-FR')} XAF
                          </Badge>
                          <Badge variant="default" className="bg-green-600">
                            Disponible
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <FontAwesomeIcon icon={faShoppingCart} className="mr-1" />
                      Commander
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mes commandes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FontAwesomeIcon icon={faHistory} className="mr-2 text-blue-600" />
                Mes Commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {myOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">Aucune commande pour le moment</p>
                    <p className="text-sm text-gray-500">Commencez par commander un menu !</p>
                  </div>
                ) : (
                  myOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          order.status === 'Livré' ? 'bg-green-100' :
                          order.status === 'En préparation' ? 'bg-orange-100' :
                          order.status === 'Prêt pour livraison' ? 'bg-blue-100' :
                          'bg-yellow-100'
                        }`}>
                          <FontAwesomeIcon 
                            icon={
                              order.status === 'Livré' ? faCheckCircle :
                              order.status === 'En préparation' ? faClock :
                              order.status === 'Prêt pour livraison' ? faBell :
                              faShoppingCart
                            } 
                            className={`${
                              order.status === 'Livré' ? 'text-green-600' :
                              order.status === 'En préparation' ? 'text-orange-600' :
                              order.status === 'Prêt pour livraison' ? 'text-blue-600' :
                              'text-yellow-600'
                            }`} 
                          />
                        </div>
                        <div>
                          <p className="font-medium">{order.employee_menus?.name}</p>
                          <p className="text-sm text-gray-600">
                            {order.delivery_location} • {order.total_price.toLocaleString('fr-FR')} XAF
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        order.status === 'Livré' ? 'default' :
                        order.status === 'En préparation' ? 'secondary' :
                        order.status === 'Prêt pour livraison' ? 'default' :
                        'outline'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  ))
                )}
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
              Commander {selectedMenu?.name}
            </DialogTitle>
            <p className="text-sm text-gray-600">Confirmez votre commande personnelle</p>
          </DialogHeader>
          
          {selectedMenu && (
            <div className="space-y-4">
              {/* Informations du menu */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  {selectedMenu.photo_url ? (
                    <img 
                      src={selectedMenu.photo_url} 
                      alt={selectedMenu.name}
                      className="w-20 h-20 object-cover rounded-lg mr-4"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <FontAwesomeIcon icon={faUtensils} className="text-green-600 text-2xl" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-green-800">{selectedMenu.name}</h4>
                    <p className="text-green-700">{selectedMenu.description}</p>
                    <p className="text-lg font-bold text-green-800">
                      {selectedMenu.price.toLocaleString('fr-FR')} XAF
                    </p>
                  </div>
                </div>
              </div>


              {/* Instructions spéciales */}
              <div>
                <Label htmlFor="special-instructions">Instructions spéciales</Label>
                <Textarea
                  id="special-instructions"
                  placeholder="Allergies, préférences, etc."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleOrderSubmit} className="bg-green-600 hover:bg-green-700">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Confirmer la commande
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
