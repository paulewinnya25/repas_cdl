import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faUtensils, faClock, faCheckCircle, faPlus, faEdit, faTrash, faUsers, faClipboardList, faChartLine, faBell, faTimes } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import type { Patient, Order, EmployeeMenu, EmployeeOrder } from '@/types/repas-cdl';

export default function CookPortal() {
  const [patientOrders, setPatientOrders] = useState<Order[]>([]);
  const [employeeOrders, setEmployeeOrders] = useState<EmployeeOrder[]>([]);
  const [employeeMenus, setEmployeeMenus] = useState<EmployeeMenu[]>([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<EmployeeMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuPhotoUrl, setMenuPhotoUrl] = useState('');
  const [menuAvailable, setMenuAvailable] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les commandes patients
      const { data: patientOrdersData, error: patientOrdersError } = await supabase
        .from('orders')
        .select('*, patients(name, room)')
        .order('created_at', { ascending: false });
      
      if (patientOrdersError) throw patientOrdersError;
      setPatientOrders(patientOrdersData as Order[]);

      // Récupérer les commandes employés
      const { data: employeeOrdersData, error: employeeOrdersError } = await supabase
        .from('employee_orders')
        .select('*, employee_menus(name, photo_url)')
        .order('created_at', { ascending: false });
      
      if (employeeOrdersError) throw employeeOrdersError;
      setEmployeeOrders(employeeOrdersData as EmployeeOrder[]);

      // Récupérer les menus employés
      const { data: menusData, error: menusError } = await supabase
        .from('employee_menus')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (menusError) throw menusError;
      setEmployeeMenus(menusData as EmployeeMenu[]);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuSubmit = async () => {
    if (!menuName || !menuDescription || !menuPrice) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('employee_menus')
        .insert([{
          name: menuName,
          description: menuDescription,
          price: parseFloat(menuPrice),
          photo_url: menuPhotoUrl,
          is_available: menuAvailable
        }]);

      if (error) throw error;

      showSuccess('Menu ajouté avec succès !');
      setIsMenuModalOpen(false);
      resetForm();
      fetchData();

    } catch (error) {
      console.error('Erreur lors de l\'ajout du menu:', error);
      showError('Impossible d\'ajouter le menu');
    }
  };

  const handleMenuUpdate = async () => {
    if (!editingMenu || !menuName || !menuDescription || !menuPrice) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('employee_menus')
        .update({
          name: menuName,
          description: menuDescription,
          price: parseFloat(menuPrice),
          photo_url: menuPhotoUrl,
          is_available: menuAvailable
        })
        .eq('id', editingMenu.id);

      if (error) throw error;

      showSuccess('Menu mis à jour avec succès !');
      setIsEditMenuModalOpen(false);
      setEditingMenu(null);
      resetForm();
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la mise à jour du menu:', error);
      showError('Impossible de mettre à jour le menu');
    }
  };

  const handleMenuDelete = async (menuId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) return;

    try {
      const { error } = await supabase
        .from('employee_menus')
        .delete()
        .eq('id', menuId);

      if (error) throw error;

      showSuccess('Menu supprimé avec succès !');
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la suppression du menu:', error);
      showError('Impossible de supprimer le menu');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, isEmployeeOrder = false) => {
    try {
      const table = isEmployeeOrder ? 'employee_orders' : 'orders';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      showSuccess('Statut de commande mis à jour !');
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showError('Impossible de mettre à jour le statut');
    }
  };

  const resetForm = () => {
    setMenuName('');
    setMenuDescription('');
    setMenuPrice('');
    setMenuPhotoUrl('');
    setMenuAvailable(true);
  };

  const openEditModal = (menu: EmployeeMenu) => {
    setEditingMenu(menu);
    setMenuName(menu.name);
    setMenuDescription(menu.description);
    setMenuPrice(menu.price.toString());
    setMenuPhotoUrl(menu.photo_url || '');
    setMenuAvailable(menu.is_available);
    setIsEditMenuModalOpen(true);
  };

  const pendingPatientOrders = patientOrders.filter(order => order.status === 'En attente d\'approbation');
  const pendingEmployeeOrders = employeeOrders.filter(order => order.status === 'Commandé');
  const todayPatientOrders = patientOrders.filter(order => 
    new Date(order.created_at || order.date).toDateString() === new Date().toDateString()
  );
  const todayEmployeeOrders = employeeOrders.filter(order => 
    new Date(order.created_at).toDateString() === new Date().toDateString()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du portail cuisinier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <FontAwesomeIcon icon={faUserTie} className="text-orange-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Portail Cuisinier</h1>
                <p className="text-gray-600">Gestion des commandes et menus</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Commandes en attente</p>
                <p className="text-2xl font-bold text-red-600">{pendingPatientOrders.length + pendingEmployeeOrders.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Commandes aujourd'hui</p>
                <p className="text-2xl font-bold text-green-600">{todayPatientOrders.length + todayEmployeeOrders.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUsers} className="text-3xl mr-4" />
                <div>
                  <p className="text-orange-100">Commandes Patients</p>
                  <p className="text-3xl font-bold">{patientOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUtensils} className="text-3xl mr-4" />
                <div>
                  <p className="text-blue-100">Commandes Employés</p>
                  <p className="text-3xl font-bold">{employeeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="text-3xl mr-4" />
                <div>
                  <p className="text-red-100">En Attente</p>
                  <p className="text-3xl font-bold">{pendingPatientOrders.length + pendingEmployeeOrders.length}</p>
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
                  <p className="text-3xl font-bold">{todayPatientOrders.length + todayEmployeeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="menus">Menus Employés</TabsTrigger>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          </TabsList>

          {/* Onglet Commandes */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Commandes Patients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FontAwesomeIcon icon={faUsers} className="mr-2 text-blue-600" />
                    Commandes Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {patientOrders.slice(0, 10).map(order => (
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
                                faBell
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
                            <p className="text-xs text-gray-500">{order.menu}</p>
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
                          {order.status === 'En attente d\'approbation' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'En préparation')}
                            >
                              <FontAwesomeIcon icon={faClock} className="mr-1" />
                              Préparer
                            </Button>
                          )}
                          {order.status === 'En préparation' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'Livré')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                              Livré
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Commandes Employés */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FontAwesomeIcon icon={faUtensils} className="mr-2 text-green-600" />
                    Commandes Employés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {employeeOrders.slice(0, 10).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${
                            order.status === 'Livré' ? 'bg-green-100' :
                            order.status === 'En préparation' ? 'bg-orange-100' :
                            'bg-yellow-100'
                          }`}>
                            <FontAwesomeIcon 
                              icon={
                                order.status === 'Livré' ? faCheckCircle :
                                order.status === 'En préparation' ? faClock :
                                faBell
                              } 
                              className={`${
                                order.status === 'Livré' ? 'text-green-600' :
                                order.status === 'En préparation' ? 'text-orange-600' :
                                'text-yellow-600'
                              }`} 
                            />
                          </div>
                          <div>
                            <p className="font-medium">{order.employee_menus?.name}</p>
                            <p className="text-sm text-gray-600">
                              {order.employee_name || 'Employé'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.delivery_location} • {order.total_price.toLocaleString('fr-FR')} XAF
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={
                            order.status === 'Livré' ? 'default' :
                            order.status === 'En préparation' ? 'secondary' :
                            'outline'
                          }>
                            {order.status}
                          </Badge>
                          {order.status === 'Commandé' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'En préparation', true)}
                            >
                              <FontAwesomeIcon icon={faClock} className="mr-1" />
                              Préparer
                            </Button>
                          )}
                          {order.status === 'En préparation' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'Livré', true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                              Livré
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Menus Employés */}
          <TabsContent value="menus" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faUtensils} className="mr-2 text-orange-600" />
                    Menus Employés
                  </span>
                  <Button onClick={() => setIsMenuModalOpen(true)}>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Ajouter un menu
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employeeMenus.map(menu => (
                    <div key={menu.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      {menu.photo_url ? (
                        <img 
                          src={menu.photo_url} 
                          alt={menu.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="w-full h-32 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                          <FontAwesomeIcon icon={faUtensils} className="text-orange-600 text-2xl" />
                        </div>
                      )}
                      <h3 className="font-semibold text-lg mb-2">{menu.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{menu.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {menu.price.toLocaleString('fr-FR')} XAF
                        </Badge>
                        <Badge variant={menu.is_available ? 'default' : 'secondary'}>
                          {menu.is_available ? 'Disponible' : 'Indisponible'}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => openEditModal(menu)}
                          className="flex-1"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMenuDelete(menu.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commandes par Statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>En attente</span>
                      <Badge variant="outline">{pendingPatientOrders.length + pendingEmployeeOrders.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>En préparation</span>
                      <Badge variant="secondary">
                        {patientOrders.filter(o => o.status === 'En préparation').length + 
                         employeeOrders.filter(o => o.status === 'En préparation').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Livrées</span>
                      <Badge variant="default">
                        {patientOrders.filter(o => o.status === 'Livré').length + 
                         employeeOrders.filter(o => o.status === 'Livré').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activité Aujourd'hui</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Commandes patients</span>
                      <Badge variant="outline">{todayPatientOrders.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Commandes employés</span>
                      <Badge variant="outline">{todayEmployeeOrders.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total</span>
                      <Badge variant="default">{todayPatientOrders.length + todayEmployeeOrders.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal d'ajout de menu */}
      <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau menu</DialogTitle>
            <p className="text-sm text-gray-600">Créez un nouveau menu pour les employés</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="menu-name">Nom du menu</Label>
              <Input
                id="menu-name"
                placeholder="Ex: Poulet rôti aux légumes"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="menu-description">Description</Label>
              <Textarea
                id="menu-description"
                placeholder="Description détaillée du menu..."
                value={menuDescription}
                onChange={(e) => setMenuDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="menu-price">Prix (XAF)</Label>
              <Input
                id="menu-price"
                type="number"
                placeholder="Ex: 2500"
                value={menuPrice}
                onChange={(e) => setMenuPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="menu-photo">URL de la photo (optionnel)</Label>
              <Input
                id="menu-photo"
                placeholder="https://exemple.com/photo.jpg"
                value={menuPhotoUrl}
                onChange={(e) => setMenuPhotoUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="menu-available"
                checked={menuAvailable}
                onChange={(e) => setMenuAvailable(e.target.checked)}
                aria-label="Menu disponible"
              />
              <Label htmlFor="menu-available">Menu disponible</Label>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsMenuModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleMenuSubmit}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Ajouter le menu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition de menu */}
      <Dialog open={isEditMenuModalOpen} onOpenChange={setIsEditMenuModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le menu</DialogTitle>
            <p className="text-sm text-gray-600">Modifiez les informations du menu sélectionné</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-menu-name">Nom du menu</Label>
              <Input
                id="edit-menu-name"
                placeholder="Ex: Poulet rôti aux légumes"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-menu-description">Description</Label>
              <Textarea
                id="edit-menu-description"
                placeholder="Description détaillée du menu..."
                value={menuDescription}
                onChange={(e) => setMenuDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-menu-price">Prix (XAF)</Label>
              <Input
                id="edit-menu-price"
                type="number"
                placeholder="Ex: 2500"
                value={menuPrice}
                onChange={(e) => setMenuPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-menu-photo">URL de la photo (optionnel)</Label>
              <Input
                id="edit-menu-photo"
                placeholder="https://exemple.com/photo.jpg"
                value={menuPhotoUrl}
                onChange={(e) => setMenuPhotoUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-menu-available"
                checked={menuAvailable}
                onChange={(e) => setMenuAvailable(e.target.checked)}
                aria-label="Menu disponible"
              />
              <Label htmlFor="edit-menu-available">Menu disponible</Label>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsEditMenuModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleMenuUpdate}>
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Mettre à jour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
