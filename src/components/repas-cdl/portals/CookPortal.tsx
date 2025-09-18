import { useState, useEffect, useCallback } from 'react';
import { EmployeeMenu, EmployeeOrder, EmployeeOrderStatus, Order, OrderStatus } from '@/types/repas-cdl';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faUsers, faUserInjured, faPlus, faEdit, faCheckCircle, faClock, faTruck, faHistory } from '@fortawesome/free-solid-svg-icons';

interface CookPortalProps {
  userProfile: any;
}

export const CookPortal = ({ userProfile }: CookPortalProps) => {
  const [employeeMenus, setEmployeeMenus] = useState<EmployeeMenu[]>([]);
  const [employeeOrders, setEmployeeOrders] = useState<EmployeeOrder[]>([]);
  const [patientOrders, setPatientOrders] = useState<Order[]>([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<EmployeeMenu | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployeeMenus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('employee_menus')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEmployeeMenus(data);
    } catch (error) {
      showError("Impossible de charger les menus employés.");
    }
  }, []);

  const fetchEmployeeOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('employee_orders')
        .select('*, employee_menus(name), profiles(first_name, last_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEmployeeOrders(data as any);
    } catch (error) {
      showError("Impossible de charger les commandes employés.");
    }
  }, []);

  const fetchPatientOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, patients(name, room)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPatientOrders(data);
    } catch (error) {
      showError("Impossible de charger les commandes patients.");
    }
  }, []);

  const toggleMenuAvailability = useCallback(async (menuId: string, nextAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('employee_menus')
        .update({ is_available: nextAvailable })
        .eq('id', menuId);
      if (error) throw error;
      showSuccess(`Menu ${nextAvailable ? 'activé' : 'désactivé'}.`);
      fetchEmployeeMenus();
    } catch (error) {
      showError("Impossible de mettre à jour la disponibilité du menu.");
    }
  }, [fetchEmployeeMenus]);

  useEffect(() => {
    fetchEmployeeMenus();
    fetchEmployeeOrders();
    fetchPatientOrders();
  }, [fetchEmployeeMenus, fetchEmployeeOrders, fetchPatientOrders]);

  const handleMenuSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      let mediaUrl = selectedMenu?.photo_url || null;
      
      // Vérifier si un fichier a été sélectionné
      const selectedFile = (window as any).selectedMenuFile;
      if (selectedFile) {
        const file = selectedFile;
        const filePath = `public/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('menu_media').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('menu_media').getPublicUrl(filePath);
        mediaUrl = urlData.publicUrl;
      } else if (values.photo_url instanceof File) {
        const file = values.photo_url;
        const filePath = `public/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('menu_media').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('menu_media').getPublicUrl(filePath);
        mediaUrl = urlData.publicUrl;
      }

      const dataToSubmit = {
        name: values.name,
        description: values.description || null,
        price: values.price,
        is_available: values.is_available,
        photo_url: mediaUrl,
        accompaniment_options: values.accompaniment_options || null,
      };

      if (selectedMenu) {
        const { error } = await supabase.from('employee_menus').update(dataToSubmit).eq('id', selectedMenu.id);
        if (error) throw error;
        showSuccess("Menu mis à jour.");
      } else {
        const { error } = await supabase.from('employee_menus').insert([dataToSubmit]);
        if (error) throw error;
        showSuccess("Nouveau menu ajouté.");
      }
      fetchEmployeeMenus();
      setIsMenuModalOpen(false);
    } catch (error) {
      showError("Erreur lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmployeeOrderStatusUpdate = async (order: EmployeeOrder, newStatus: EmployeeOrderStatus) => {
    try {
      const { error } = await supabase
        .from('employee_orders')
        .update({ status: newStatus })
        .eq('id', order.id);
      if (error) throw error;

      showSuccess(`Commande employé mise à jour: ${newStatus}`);
      fetchEmployeeOrders();
    } catch (error) {
      showError("Erreur lors de la mise à jour du statut.");
    }
  };

  const handlePatientOrderStatusUpdate = async (order: Order, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);
      if (error) throw error;

      showSuccess(`Commande patient mise à jour: ${newStatus}`);
      fetchPatientOrders();
    } catch (error) {
      showError("Erreur lors de la mise à jour du statut.");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Commandé':
      case 'En attente d\'approbation': return 'secondary';
      case 'En préparation': return 'default';
      case 'Prêt pour livraison':
      case 'Approuvé': return 'default';
      case 'Prêt': return 'default';
      case 'Livré': return 'default';
      case 'Annulé': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Livré': return faCheckCircle;
      case 'Prêt pour livraison':
      case 'Prêt': return faTruck;
      case 'En préparation': return faUtensils;
      default: return faClock;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête du portail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-orange-600">
            <FontAwesomeIcon icon={faUtensils} className="mr-3" />
            Portail Cuisiniers - Gestion des Commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Gérez les commandes des patients et employés, et créez les menus du jour.
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
                <p className="text-sm text-gray-600">Commandes patients</p>
                <p className="text-2xl font-bold">{patientOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUsers} className="text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Commandes employés</p>
                <p className="text-2xl font-bold">{employeeOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faClock} className="text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">En préparation</p>
                <p className="text-2xl font-bold">
                  {employeeOrders.filter(o => o.status === 'En préparation').length + 
                   patientOrders.filter(o => o.status === 'En préparation').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUtensils} className="text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Menus employés</p>
                <p className="text-2xl font-bold">{employeeMenus.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les différentes sections */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="menus">Menus Employés</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Onglet Commandes */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commandes Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <FontAwesomeIcon icon={faUserInjured} className="mr-3" />
                  Commandes Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {patientOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FontAwesomeIcon 
                          icon={getStatusIcon(order.status)} 
                          className={`mr-3 ${
                            order.status === 'Livré' ? 'text-green-600' : 
                            order.status === 'Prêt' ? 'text-blue-600' :
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
                          <p className="text-xs text-gray-500">{order.menu}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                        {order.status !== 'Livré' && order.status !== 'Annulé' && (
                          <Select
                            value={order.status}
                            onValueChange={(value: OrderStatus) => 
                              handlePatientOrderStatusUpdate(order, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="En attente d'approbation">En attente</SelectItem>
                              <SelectItem value="Approuvé">Approuvé</SelectItem>
                              <SelectItem value="En préparation">En préparation</SelectItem>
                              <SelectItem value="Prêt">Prêt</SelectItem>
                              <SelectItem value="Livré">Livré</SelectItem>
                              <SelectItem value="Annulé">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
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
                <CardTitle className="flex items-center text-green-600">
                  <FontAwesomeIcon icon={faUsers} className="mr-3" />
                  Commandes Employés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {employeeOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FontAwesomeIcon 
                          icon={getStatusIcon(order.status)} 
                          className={`mr-3 ${
                            order.status === 'Livré' ? 'text-green-600' : 
                            order.status === 'Prêt pour livraison' ? 'text-blue-600' :
                            order.status === 'En préparation' ? 'text-orange-600' : 
                            'text-gray-600'
                          }`} 
                        />
                        <div>
                          <p className="font-medium">
                            {order.profiles?.first_name} {order.profiles?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.employee_menus?.name} - {order.delivery_location}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.total_price.toLocaleString('fr-FR')} XAF
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                        {order.status !== 'Livré' && order.status !== 'Annulé' && (
                          <Select
                            value={order.status}
                            onValueChange={(value: EmployeeOrderStatus) => 
                              handleEmployeeOrderStatusUpdate(order, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Commandé">Commandé</SelectItem>
                              <SelectItem value="En préparation">En préparation</SelectItem>
                              <SelectItem value="Prêt pour livraison">Prêt</SelectItem>
                              <SelectItem value="Livré">Livré</SelectItem>
                              <SelectItem value="Annulé">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
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
        <TabsContent value="menus" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Menus Employés</h2>
            <Button 
              onClick={() => {
                setSelectedMenu(null);
                setIsMenuModalOpen(true);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Nouveau menu
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employeeMenus.map(menu => (
              <Card key={menu.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                {menu.photo_url && (
                  <img 
                    src={menu.photo_url} 
                    alt={menu.name} 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 ml-3">
                  <h3 className="font-semibold">{menu.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{menu.description}</p>
                  <p className="text-lg font-bold text-orange-600 mt-1">
                    {menu.price.toLocaleString('fr-FR')} XAF
                  </p>
                  <Badge variant={menu.is_available ? 'default' : 'secondary'} className="mt-1">
                    {menu.is_available ? 'Disponible' : 'Indisponible'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedMenu(menu);
                    setIsMenuModalOpen(true);
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Modifier
                </Button>
                <Button
                  size="sm"
                  className={menu.is_available ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 w-full' : 'bg-green-600 hover:bg-green-700 w-full'}
                  onClick={() => toggleMenuAvailability(menu.id as unknown as string, !menu.is_available)}
                >
                  {menu.is_available ? 'Marquer indisponible' : 'Marquer disponible'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>

    {/* Onglet Historique */}
    <TabsContent value="history" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FontAwesomeIcon icon={faHistory} className="mr-3 text-gray-600" />
            Historique des commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Commandes patients livrées */}
            {patientOrders.filter(o => o.status === 'Livré').map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">
                      Patient: {order.patients?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Chambre {order.patients?.room} - {order.meal_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      Livré le {new Date(order.delivered_at || order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <Badge variant="default">Livré</Badge>
              </div>
            ))}

            {/* Commandes employés livrées */}
            {employeeOrders.filter(o => o.status === 'Livré').map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">
                      Employé: {order.profiles?.first_name} {order.profiles?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.employee_menus?.name} - {order.delivery_location}
                    </p>
                    <p className="text-xs text-gray-500">
                      Livré le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <Badge variant="default">Livré</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>

  {/* Modal de gestion des menus */}
  <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {selectedMenu ? 'Modifier le menu' : 'Nouveau menu employé'}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="menu-name">Nom du menu</Label>
          <input
            id="menu-name"
            type="text"
            placeholder="Nom du menu"
            defaultValue={selectedMenu?.name || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <Label htmlFor="menu-description">Description</Label>
          <Textarea
            id="menu-description"
            placeholder="Description du menu"
            defaultValue={selectedMenu?.description || ''}
          />
        </div>

        <div>
          <Label htmlFor="menu-accompaniments">Accompagnements disponibles (séparés par virgules)</Label>
          <input
            id="menu-accompaniments"
            type="text"
            placeholder="Ex: Riz, Plantain, Frites, Salade"
            defaultValue={selectedMenu?.accompaniment_options || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <Label htmlFor="menu-photo">Photo du menu</Label>
          <div className="space-y-2">
            <input
              id="menu-photo-file"
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              aria-label="Sélectionner une image pour le menu"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Stocker le fichier pour l'upload
                  (window as any).selectedMenuFile = file;
                }
              }}
            />
            <p className="text-sm text-gray-500">Ou utilisez une URL existante :</p>
            <input
              id="menu-photo-url"
              type="url"
              placeholder="https://exemple.com/photo.jpg"
              defaultValue={selectedMenu?.photo_url || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="menu-price">Prix (XAF)</Label>
          <input
            id="menu-price"
            type="number"
            placeholder="Prix en XAF"
            defaultValue={selectedMenu?.price || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="menu-available"
            type="checkbox"
            defaultChecked={selectedMenu?.is_available ?? true}
            className="rounded"
            aria-label="Menu disponible"
          />
          <Label htmlFor="menu-available">Menu disponible</Label>
        </div>

        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setIsMenuModalOpen(false)}
          >
            Annuler
          </Button>
          <Button 
            onClick={async () => {
              const nameInput = document.getElementById('menu-name') as HTMLInputElement | null;
              const descInput = document.getElementById('menu-description') as HTMLTextAreaElement | null;
              const priceInput = document.getElementById('menu-price') as HTMLInputElement | null;
              const availableInput = document.getElementById('menu-available') as HTMLInputElement | null;
              const accompInput = document.getElementById('menu-accompaniments') as HTMLInputElement | null;
              const photoUrlInput = document.getElementById('menu-photo-url') as HTMLInputElement | null;

              const values = {
                name: nameInput?.value?.trim() || '',
                description: descInput?.value?.trim() || '',
                price: priceInput?.value ? Number(priceInput.value) : 0,
                is_available: availableInput?.checked ?? true,
                photo_url: photoUrlInput?.value?.trim() || selectedMenu?.photo_url || null,
                accompaniment_options: accompInput?.value?.trim() || ''
              } as any;

              await handleMenuSubmit(values);
            }}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {selectedMenu ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</div>
);
};
