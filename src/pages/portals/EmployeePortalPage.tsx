import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { EmployeeMenu, EmployeeOrder, UserRole } from '../../types/repas-cdl';

interface EmployeeOrderWithProfile extends EmployeeOrder {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
}
import { gabonCities } from '../../data/gabon-locations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserTie, 
  faUtensils, 
  faClock, 
  faCheckCircle, 
  faPlus, 
  faSearch,
  faFilter,
  faCalendarDay,
  faExclamationTriangle,
  faUsers,
  faChartLine,
  faBell,
  faShoppingCart,
  faMapMarkerAlt,
  faCreditCard,
  faEdit,
  faTrash,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Header } from '../../components/ui/Header';
import { showSuccess, showError } from '../../utils/toast';
// MultiMenuOrderModal retiré selon demande

const EmployeePortalPage: React.FC = () => {
  const [menus, setMenus] = useState<EmployeeMenu[]>([]);
  const [orders, setOrders] = useState<EmployeeOrderWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMenu, setSelectedMenu] = useState<EmployeeMenu | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  // Plus de modal multi-menus
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<EmployeeOrderWithProfile | null>(null);
  const [newOrder, setNewOrder] = useState({
    employeeName: '',
    specialInstructions: '',
    quantity: 1,
    accompaniments: 1,
    perPlateAccompaniments: [1] as number[],
    perPlateDetails: [''] as string[]
  });
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Employé');
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetchData();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      // Simuler un utilisateur pour les tests sans authentification
      setUser({ id: '550e8400-e29b-41d4-a716-446655440012' });
      setCurrentUserRole('Employé');
      
      // Optionnel : essayer de récupérer le vrai utilisateur si connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role) {
          setCurrentUserRole(profile.role as UserRole);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      // En cas d'erreur, utiliser les valeurs par défaut
      setUser({ id: '550e8400-e29b-41d4-a716-446655440012' });
      setCurrentUserRole('Employé');
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les menus disponibles
      const { data: menusData, error: menusError } = await supabase
        .from('employee_menus')
        .select('*')
        .eq('is_available', true)
        .order('name', { ascending: true });
      
      if (menusError) {
        console.error('Erreur lors du chargement des menus:', menusError);
        throw menusError;
      }
      console.log('Menus chargés:', menusData);
      setMenus(menusData as EmployeeMenu[]);

      // Récupérer les commandes de l'utilisateur (sans jointure avec profiles pour éviter l'erreur 400)
      const userId = user?.id || '550e8400-e29b-41d4-a716-446655440012';
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('employee_orders')
        .select('*')
        .eq('employee_id', userId)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Erreur lors du chargement des commandes:', ordersError);
        throw ordersError;
      }
      console.log('Commandes chargées:', ordersData);
      
      // DEBUG: Log des données reçues pour diagnostiquer le problème des quantités
      console.log('🔍 DEBUG - Données des commandes reçues:', ordersData);
      if (ordersData && ordersData.length > 0) {
        console.log('🔍 DEBUG - Première commande:', ordersData[0]);
        console.log('🔍 DEBUG - Quantité première commande:', ordersData[0].quantity);
        console.log('🔍 DEBUG - Type de quantité:', typeof ordersData[0].quantity);
        console.log('🔍 DEBUG - Quantité est null?', ordersData[0].quantity === null);
        console.log('🔍 DEBUG - Quantité est undefined?', ordersData[0].quantity === undefined);
      }
      
      setOrders(ordersData as EmployeeOrderWithProfile[]);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError("Impossible de charger les données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = (menu: EmployeeMenu) => {
    setSelectedMenu(menu);
    setIsOrderModalOpen(true);
  };

  // plus utilisé (multi-menus retiré)
  const addMenuToOrder = (_menu: EmployeeMenu, _accompaniments: number) => {};

  const removeMenuFromOrder = (_menuId: string) => {};

  const handlePlaceOrder = async () => {
    if (!selectedMenu || !newOrder.employeeName) {
      showError("Veuillez remplir le nom de l'employé");
      return;
    }

    try {
      // Utiliser l'utilisateur simulé ou l'utilisateur connecté
      const userId = user?.id || '550e8400-e29b-41d4-a716-446655440012';

      // Calculer le prix selon le nombre d'accompagnements
      const calculatePrice = (basePrice: number, accompaniments: number) => {
        return accompaniments === 2 ? 2000 : basePrice;
      };

      // Créer une ligne par plat avec son nombre d'accompagnements
      const ordersToInsert = Array.from({ length: newOrder.quantity }, (_, index) => {
        const accomp = newOrder.perPlateAccompaniments[index] ?? 1;
        const unitPrice = calculatePrice(selectedMenu.price, accomp);
        const perPlateNote = newOrder.perPlateDetails[index]?.trim();
        return {
          employee_id: userId,
          employee_name: newOrder.employeeName,
          menu_id: selectedMenu.id,
          delivery_location: 'Cuisine',
          quantity: 1,
          accompaniments: accomp,
          total_price: unitPrice,
          status: 'Commandé',
          special_instructions: [
            newOrder.specialInstructions?.trim() || '',
            perPlateNote ? `(Plat ${index + 1}) ${perPlateNote}` : ''
          ].filter(Boolean).join(' | ')
        };
      });

      const { error } = await supabase
        .from('employee_orders')
        .insert(ordersToInsert);

      if (error) {
        console.error('Erreur lors de l\'insertion:', error);
        throw error;
      }

      const twoAcc = newOrder.perPlateAccompaniments.filter(a => a === 2).length;
      const oneAcc = newOrder.quantity - twoAcc;
      showSuccess(`Commande passée pour ${selectedMenu.name}: ${oneAcc} plat(s) avec 1 accompagnement et ${twoAcc} plat(s) avec 2 accompagnements`);

      setNewOrder({ employeeName: '', specialInstructions: '', quantity: 1, accompaniments: 1, perPlateAccompaniments: [1], perPlateDetails: [''] });
      setIsOrderModalOpen(false);
      setSelectedMenu(null);
      
      // Rafraîchir les données pour afficher la nouvelle commande
      await fetchData();
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      showError("Impossible de passer la commande");
    }
  };

  const handlePlaceOrderFromModal = async (employeeName: string, specialInstructions: string, selectedMenus: Array<{menu: EmployeeMenu, accompaniments: number}>) => {
    try {
      // Utiliser l'utilisateur simulé ou l'utilisateur connecté
      const userId = user?.id || '550e8400-e29b-41d4-a716-446655440012';

      // Créer une commande pour chaque menu sélectionné
      const ordersToInsert = selectedMenus.map(selectedItem => {
        const { menu, accompaniments } = selectedItem;
        
        // Calculer le prix selon le nombre d'accompagnements
        const calculatePrice = (basePrice: number, accompaniments: number) => {
          return accompaniments === 2 ? 2000 : basePrice;
        };

        const unitPrice = calculatePrice(menu.price, accompaniments);
        const totalPrice = unitPrice; // 1 plat par menu sélectionné

        return {
          employee_id: userId,
          employee_name: employeeName,
          menu_id: menu.id,
          delivery_location: 'Cuisine',
          quantity: 1, // 1 plat par menu
          accompaniments: accompaniments,
          total_price: totalPrice,
          status: 'Commandé',
          special_instructions: specialInstructions
        };
      });

      const { error } = await supabase
        .from('employee_orders')
        .insert(ordersToInsert);

      if (error) {
        console.error('Erreur lors de l\'insertion:', error);
        throw error;
      }

      const totalMenus = ordersToInsert.length;
      const totalAccompaniments = ordersToInsert.reduce((sum, item) => sum + (item.accompaniments || 1), 0);
      showSuccess(`Commande passée pour ${totalMenus} plat${totalMenus > 1 ? 's' : ''} avec ${totalAccompaniments} accompagnement${totalAccompaniments > 1 ? 's' : ''}`);
      
      // Rafraîchir les données pour afficher la nouvelle commande
      await fetchData();
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      showError("Impossible de passer la commande");
    }
  };

  const handleEditOrder = (order: EmployeeOrderWithProfile) => {
    setEditingOrder(order);
    setNewOrder({
      employeeName: order.employee_name || '',
      specialInstructions: order.special_instructions || '',
      quantity: order.quantity,
      accompaniments: order.accompaniments || 1,
      perPlateAccompaniments: Array.from({ length: order.quantity }, (_, i) => i === 0 ? (order.accompaniments || 1) : 1),
      perPlateDetails: Array.from({ length: order.quantity }, () => '')
    });
    setIsEditOrderModalOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder || !newOrder.employeeName) {
      showError("Veuillez remplir le nom de l'employé");
      return;
    }

    try {
      // Calculer le prix selon le nombre d'accompagnements
      const calculatePrice = (basePrice: number, accompaniments: number) => {
        return accompaniments === 2 ? 2000 : basePrice;
      };

      const unitPrice = calculatePrice(selectedMenu?.price || editingOrder.total_price / editingOrder.quantity, newOrder.accompaniments);
      const totalPrice = unitPrice * newOrder.quantity;

      const { error } = await supabase
        .from('employee_orders')
        .update({
          employee_name: newOrder.employeeName,
          delivery_location: 'Cuisine',
          special_instructions: newOrder.specialInstructions,
          quantity: newOrder.quantity,
          accompaniments: newOrder.accompaniments,
          total_price: totalPrice
        })
        .eq('id', editingOrder.id);

      if (error) throw error;

      showSuccess('Commande modifiée avec succès !');
      setIsEditOrderModalOpen(false);
      setEditingOrder(null);
      setNewOrder({ employeeName: '', specialInstructions: '', quantity: 1, accompaniments: 1, perPlateAccompaniments: [1], perPlateDetails: [''] });
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      showError("Impossible de modifier la commande");
    }
  };

  const handleCancelOrder = (order: EmployeeOrderWithProfile) => {
    setEditingOrder(order);
    setIsCancelOrderModalOpen(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (!editingOrder) return;

    try {
      const { error } = await supabase
        .from('employee_orders')
        .update({ status: 'Annulé' })
        .eq('id', editingOrder.id);

      if (error) throw error;

      showSuccess('Commande annulée avec succès !');
      setIsCancelOrderModalOpen(false);
      setEditingOrder(null);
      fetchData();

    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      showError("Impossible d'annuler la commande");
    }
  };

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingOrders = orders.filter(order => order.status === 'Commandé');
  const todayOrders = orders.filter(order => 
    new Date(order.created_at).toDateString() === new Date().toDateString()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <Header 
        title="Portail Employé" 
        subtitle="Commandes personnelles"
        showLogo={true}
      />
      
      {/* Statistiques rapides */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-end space-x-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Mes commandes</p>
            <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Commandes aujourd'hui</p>
            <p className="text-2xl font-bold text-green-600">{todayOrders.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Menus Disponibles</p>
                  <p className="text-3xl font-bold">{menus.length}</p>
                </div>
                <FontAwesomeIcon icon={faUtensils} className="text-4xl text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Mes Commandes</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
                <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">En Attente</p>
                  <p className="text-3xl font-bold">{pendingOrders.length}</p>
                </div>
                <FontAwesomeIcon icon={faClock} className="text-4xl text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Aujourd'hui</p>
                  <p className="text-3xl font-bold">{todayOrders.length}</p>
                </div>
                <FontAwesomeIcon icon={faCalendarDay} className="text-4xl text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation par onglets */}
        <Tabs defaultValue="menus" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="orders">Mes Commandes</TabsTrigger>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          </TabsList>

          {/* Onglet Menus */}
          <TabsContent value="menus">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faUtensils} className="text-green-600" />
                  <span>Menus Disponibles</span>
                </CardTitle>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="relative flex-1">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Rechercher un menu..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {/* Bouton multi-menus retiré */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenus.map((menu) => (
                    <Card 
                      key={menu.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
                      onClick={() => handleMenuClick(menu)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{menu.name}</h3>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {menu.price} FCFA
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {menu.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                            {menu.preparation_time} min
                          </span>
                          <span>
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1 text-green-500" />
                            Disponible
                          </span>
                        </div>
                        <Button className="w-full mt-3" size="sm">
                          <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                          Commander
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredMenus.length === 0 && (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faUtensils} className="text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Aucun menu disponible</p>
                    <p className="text-gray-400">Les menus seront ajoutés par l'équipe cuisine</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Mes Commandes */}
          <TabsContent value="orders">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-blue-600" />
                    <span>Mes Commandes Récentes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Commande #{orders.indexOf(order) + 1}</h4>
                          <Badge 
                            variant={order.status === 'Commandé' ? 'destructive' : 'default'}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p><strong>Employé:</strong> {order.employee_name || (order.profiles ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() : 'Non spécifié')}</p>
                          <p><strong>Quantité:</strong> {order.quantity} plat(s)</p>
                          <p><strong>Prix:</strong> {order.total_price} FCFA</p>
                          <p><strong>Lieu de livraison:</strong> {order.delivery_location}</p>
                          {order.special_instructions && (
                            <p><strong>Instructions:</strong> {order.special_instructions}</p>
                          )}
                          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        {order.status === 'Commandé' && (
                          <div className="flex justify-end space-x-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditOrder(order)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-1" />
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelOrder(order)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FontAwesomeIcon icon={faTimes} className="mr-1" />
                              Annuler
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="text-center py-8">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-gray-300 mb-2" />
                        <p className="text-gray-500">Aucune commande passée</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-600" />
                    <span>Commandes en Attente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Commande #{orders.indexOf(order) + 1}</h4>
                          <Badge variant="destructive">En attente</Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p><strong>Employé:</strong> {order.employee_name || (order.profiles ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() : 'Non spécifié')}</p>
                          <p><strong>Prix:</strong> {order.total_price} FCFA</p>
                          <p><strong>Lieu:</strong> {order.delivery_location}</p>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditOrder(order)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelOrder(order)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingOrders.length === 0 && (
                      <p className="text-center text-gray-500 py-8">Aucune commande en attente</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Vue d'ensemble */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faChartLine} className="text-green-600" />
                    <span>Mes Statistiques</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span>Commandes aujourd'hui</span>
                      <span className="font-bold text-green-600">{todayOrders.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span>En attente</span>
                      <span className="font-bold text-orange-600">{pendingOrders.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span>Total commandes</span>
                      <span className="font-bold text-blue-600">{orders.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span>Menus disponibles</span>
                      <span className="font-bold text-purple-600">{menus.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faBell} className="text-purple-600" />
                    <span>Actions Rapides</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <FontAwesomeIcon icon={faUtensils} className="mr-2" />
                      Voir tous les menus
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                      Mes commandes
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                      Historique des commandes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de commande */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Commander {selectedMenu?.name}
            </DialogTitle>
            <DialogDescription>
              Confirmez votre commande personnelle en remplissant les informations ci-dessous
            </DialogDescription>
          </DialogHeader>
          
          {selectedMenu && (
            <div className="space-y-4">
              {/* Informations du menu */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Informations du Menu</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Nom:</strong> {selectedMenu.name}</p>
                    <p><strong>Prix:</strong> {selectedMenu.price} FCFA</p>
                  </div>
                  <div>
                    <p><strong>Temps de préparation:</strong> {selectedMenu.preparation_time} min</p>
                    <p><strong>Disponible:</strong> Oui</p>
                  </div>
                </div>
                <p className="mt-2 text-sm"><strong>Description:</strong> {selectedMenu.description}</p>
              </div>

              {/* Formulaire de commande */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee-name">Nom de l'employé *</Label>
                  <Input
                    id="employee-name"
                    type="text"
                    placeholder="Votre nom complet"
                    value={newOrder.employeeName}
                    onChange={(e) => setNewOrder({...newOrder, employeeName: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Nombre de plats</Label>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const nextQty = Math.max(1, newOrder.quantity - 1);
                        const nextPerPlate = newOrder.perPlateAccompaniments.slice(0, nextQty);
                        setNewOrder({ ...newOrder, quantity: nextQty, perPlateAccompaniments: nextPerPlate });
                      }}
                      disabled={newOrder.quantity <= 1}
                      className="w-10 h-10"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    
                    <div className="flex items-center justify-center min-w-[60px] h-10 border rounded-md bg-gray-50 dark:bg-gray-800">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {newOrder.quantity}
                      </span>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const nextQty = Math.min(10, newOrder.quantity + 1);
                        const nextPerPlate = [...newOrder.perPlateAccompaniments];
                        while (nextPerPlate.length < nextQty) nextPerPlate.push(1);
                        setNewOrder({ ...newOrder, quantity: nextQty, perPlateAccompaniments: nextPerPlate });
                      }}
                      disabled={newOrder.quantity >= 10}
                      className="w-10 h-10"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  </div>
                  
                  {/* Affichage visuel du nombre de plats */}
                  <div className="mt-2 flex items-center space-x-1">
                    {Array.from({length: newOrder.quantity}, (_, i) => (
                      <div key={i} className="w-3 h-3 bg-green-500 rounded-full"></div>
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      {newOrder.quantity} plat{newOrder.quantity > 1 ? 's' : ''} sélectionné{newOrder.quantity > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Sélecteur d'accompagnements par plat */}
                <div className="space-y-2">
                  <Label>Nombre d'accompagnements par plat</Label>
                  {Array.from({ length: newOrder.quantity }, (_, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-md bg-white dark:bg-gray-900">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Plat {index + 1}</span>
                        <Select
                          value={(newOrder.perPlateAccompaniments[index] ?? 1).toString()}
                          onValueChange={(value) => {
                            const next = [...newOrder.perPlateAccompaniments];
                            next[index] = parseInt(value);
                            while (next.length < newOrder.quantity) next.push(1);
                            const nextDetails = [...newOrder.perPlateDetails];
                            while (nextDetails.length < newOrder.quantity) nextDetails.push('');
                            setNewOrder({ ...newOrder, perPlateAccompaniments: next, perPlateDetails: nextDetails });
                          }}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Choisir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 accompagnement - {selectedMenu?.price.toLocaleString('fr-FR')} XAF</SelectItem>
                            <SelectItem value="2">2 accompagnements - 2 000 XAF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Détail des accompagnements (ex: riz + plantain)</Label>
                        <Textarea
                          placeholder="Précisez les accompagnements souhaités pour ce plat"
                          value={newOrder.perPlateDetails[index] ?? ''}
                          onChange={(e) => {
                            const next = [...newOrder.perPlateDetails];
                            while (next.length < newOrder.quantity) next.push('');
                            next[index] = e.target.value;
                            setNewOrder({ ...newOrder, perPlateDetails: next });
                          }}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <Label htmlFor="special-instructions">Instructions spéciales</Label>
                  <Textarea
                    id="special-instructions"
                    placeholder="Instructions particulières pour votre commande..."
                    value={newOrder.specialInstructions}
                    onChange={(e) => setNewOrder({...newOrder, specialInstructions: e.target.value})}
                  />
                </div>

                {/* Résumé de la commande */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Résumé de la commande</h4>
                  
                  {/* Affichage visuel des plats */}
                  <div className="mb-3 flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Plats sélectionnés:</span>
                    <div className="flex space-x-1">
                      {Array.from({length: newOrder.quantity}, (_, i) => (
                        <div key={i} className="w-4 h-4 bg-green-500 rounded-full"></div>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {newOrder.quantity} plat{newOrder.quantity > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {(() => {
                      const base = selectedMenu.price;
                      const twoAcc = newOrder.perPlateAccompaniments.filter(a => a === 2).length;
                      const oneAcc = newOrder.quantity - twoAcc;
                      const subtotal = oneAcc * base + twoAcc * 2000;
                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span>{selectedMenu.name}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">x {newOrder.quantity}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                ({oneAcc} plat(s) à 1 accompagnement, {twoAcc} plat(s) à 2 accompagnements)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Sous-total</span>
                            <span className="font-bold">{subtotal.toLocaleString('fr-FR')} XAF</span>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-lg text-green-600">{subtotal.toLocaleString('fr-FR')} XAF</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handlePlaceOrder}>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Confirmer la commande
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de modification de commande */}
      <Dialog open={isEditOrderModalOpen} onOpenChange={setIsEditOrderModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Modifier la commande
            </DialogTitle>
            <DialogDescription>
              Modifiez les détails de votre commande
            </DialogDescription>
          </DialogHeader>
          
          {editingOrder && (
            <div className="space-y-4">
              {/* Informations de la commande */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Commande à modifier</h4>
                <p className="text-sm text-gray-600">
                  Commande #{orders.indexOf(editingOrder) + 1} - {editingOrder.employee_menus?.name || 'Menu inconnu'}
                </p>
              </div>

              {/* Nom de l'employé */}
              <div>
                <Label htmlFor="edit-employee-name">Nom de l'employé *</Label>
                <Input
                  id="edit-employee-name"
                  placeholder="Ex: Marie Dubois"
                  value={newOrder.employeeName}
                  onChange={(e) => setNewOrder({...newOrder, employeeName: e.target.value})}
                />
              </div>

              {/* Quantité */}
              <div>
                <Label htmlFor="edit-quantity">Quantité *</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewOrder({...newOrder, quantity: Math.max(1, newOrder.quantity - 1)})}
                    disabled={newOrder.quantity <= 1}
                    className="w-10 h-10"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                  
                  <div className="flex items-center justify-center min-w-[60px] h-10 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {newOrder.quantity}
                    </span>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewOrder({...newOrder, quantity: Math.min(10, newOrder.quantity + 1)})}
                    disabled={newOrder.quantity >= 10}
                    className="w-10 h-10"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>
                
                {/* Affichage visuel du nombre de plats */}
                <div className="mt-2 flex items-center space-x-1">
                  {Array.from({length: newOrder.quantity}, (_, i) => (
                    <div key={i} className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    {newOrder.quantity} plat{newOrder.quantity > 1 ? 's' : ''} sélectionné{newOrder.quantity > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Sélecteur d'accompagnements */}
              <div>
                <Label htmlFor="edit-accompaniments">Nombre d'accompagnements</Label>
                <Select 
                  value={newOrder.accompaniments.toString()} 
                  onValueChange={(value) => setNewOrder({...newOrder, accompaniments: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le nombre d'accompagnements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 accompagnement - {editingOrder?.employee_menus?.price?.toLocaleString('fr-FR') || '1 500'} XAF</SelectItem>
                    <SelectItem value="2">2 accompagnements - 2 000 XAF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Instructions spéciales */}
              <div>
                <Label htmlFor="edit-special-instructions">Instructions spéciales</Label>
                <Textarea
                  id="edit-special-instructions"
                  placeholder="Instructions particulières pour votre commande..."
                  value={newOrder.specialInstructions}
                  onChange={(e) => setNewOrder({...newOrder, specialInstructions: e.target.value})}
                />
              </div>

              {/* Résumé de la modification */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Résumé de la modification</h4>
                
                {/* Affichage visuel des plats */}
                <div className="mb-3 flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nouveaux plats sélectionnés:</span>
                  <div className="flex space-x-1">
                    {Array.from({length: newOrder.quantity}, (_, i) => (
                      <div key={i} className="w-4 h-4 bg-green-500 rounded-full"></div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {newOrder.quantity} plat{newOrder.quantity > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span>{editingOrder.employee_menus?.name || 'Menu'}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">x {newOrder.quantity}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({newOrder.accompaniments} accompagnement{newOrder.accompaniments > 1 ? 's' : ''})
                      </span>
                    </div>
                    <span className="font-bold">
                      {newOrder.accompaniments === 2 ? '2 000' : (editingOrder.total_price / editingOrder.quantity).toLocaleString('fr-FR')} XAF
                    </span>
                  </div>
                  {newOrder.accompaniments === 2 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>✓ Supplément pour 2 accompagnements</span>
                      <span>+{((2000 - (editingOrder.total_price / editingOrder.quantity)) * newOrder.quantity).toLocaleString('fr-FR')} XAF</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="font-semibold">Nouveau total</span>
                    <span className="font-bold text-lg text-green-600">
                      {newOrder.accompaniments === 2 ? (2000 * newOrder.quantity).toLocaleString('fr-FR') : ((editingOrder.total_price / editingOrder.quantity) * newOrder.quantity).toLocaleString('fr-FR')} XAF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditOrderModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateOrder}>
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Modifier la commande
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation d'annulation */}
      <Dialog open={isCancelOrderModalOpen} onOpenChange={setIsCancelOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Annuler la commande
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cette commande ?
            </DialogDescription>
          </DialogHeader>
          
          {editingOrder && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Commande à annuler</h4>
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p><strong>Commande #:</strong> {orders.indexOf(editingOrder) + 1}</p>
                  <p><strong>Menu:</strong> {editingOrder.employee_menus?.name || 'Menu inconnu'}</p>
                  <p><strong>Quantité:</strong> {editingOrder.quantity} plat(s)</p>
                  <p><strong>Prix:</strong> {editingOrder.total_price} FCFA</p>
                  <p><strong>Lieu:</strong> {editingOrder.delivery_location}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                  Cette action est irréversible. La commande sera marquée comme annulée.
                </p>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsCancelOrderModalOpen(false)}>
              Garder la commande
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmCancelOrder}
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Annuler la commande
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Multi-Menus retiré */}
    </div>
  );
};

export default EmployeePortalPage;
