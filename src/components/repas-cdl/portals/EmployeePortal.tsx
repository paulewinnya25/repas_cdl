import { useState, useEffect, useCallback } from 'react';
import { EmployeeMenu, EmployeeOrder, EmployeeOrderStatus } from '@/types/repas-cdl';
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
import { faUsers, faUtensils, faPlus, faHistory, faCheckCircle, faClock, faTruck } from '@fortawesome/free-solid-svg-icons';

interface EmployeePortalProps {
  userProfile: any;
}

export const EmployeePortal = ({ userProfile }: EmployeePortalProps) => {
  const [menus, setMenus] = useState<EmployeeMenu[]>([]);
  const [myOrders, setMyOrders] = useState<EmployeeOrder[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<EmployeeMenu | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [accompaniments, setAccompaniments] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMenus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('employee_menus')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMenus(data);
    } catch (error) {
      showError("Impossible de charger les menus.");
    }
  }, []);

  const fetchMyOrders = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('employee_orders')
        .select('*, employee_menus(name, photo_url)')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMyOrders(data as any);
    } catch (error) {
      showError("Impossible de charger vos commandes.");
    }
  }, []);

  useEffect(() => {
    fetchMenus();
    fetchMyOrders();
  }, [fetchMenus, fetchMyOrders]);

  const handleOrderSubmit = async () => {
    if (!selectedMenu) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      const calculatePrice = (basePrice: number, accompaniments: number) => {
        return accompaniments === 2 ? 2000 : basePrice;
      };

      const totalPrice = calculatePrice(selectedMenu.price, accompaniments);

      const { error } = await supabase
        .from('employee_orders')
        .insert([{
          employee_id: user.id,
          menu_id: selectedMenu.id,
          delivery_location: 'Cuisine',
          special_instructions: specialInstructions,
          quantity: 1,
          accompaniments: accompaniments,
          total_price: totalPrice,
          status: 'Commandé'
        }]);

      if (error) throw error;

      showSuccess("Commande passée avec succès !");
      setIsOrderModalOpen(false);
      setSelectedMenu(null);
      setSpecialInstructions('');
      setAccompaniments(1);
      fetchMyOrders();
    } catch (error) {
      showError("Erreur lors de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: EmployeeOrderStatus) => {
    switch (status) {
      case 'Commandé': return 'secondary';
      case 'En préparation': return 'default';
      case 'Prêt pour livraison': return 'default';
      case 'Livré': return 'default';
      case 'Annulé': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: EmployeeOrderStatus) => {
    switch (status) {
      case 'Livré': return faCheckCircle;
      case 'Prêt pour livraison': return faTruck;
      case 'En préparation': return faUtensils;
      default: return faClock;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête du portail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <FontAwesomeIcon icon={faUsers} className="mr-3" />
            Portail Employés - Commandes Personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Commandez vos repas et gérez vos commandes personnelles.
          </p>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-gray-600">Commandes en cours</p>
                <p className="text-2xl font-bold">
                  {myOrders.filter(o => ['Commandé', 'En préparation', 'Prêt pour livraison'].includes(o.status)).length}
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
                  {myOrders.filter(o => o.status === 'Livré').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faHistory} className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total commandes</p>
                <p className="text-2xl font-bold">{myOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menus du jour</h2>
        <Button 
          onClick={() => setIsOrderModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Liste des menus disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map(menu => (
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
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {menu.price.toLocaleString('fr-FR')} XAF
                  </p>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setSelectedMenu(menu);
                  setIsOrderModalOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Commander
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mes commandes récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FontAwesomeIcon icon={faHistory} className="mr-3 text-blue-600" />
            Mes commandes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myOrders.slice(0, 10).map(order => (
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
                    <p className="font-medium">{order.employee_menus?.name}</p>
                    <p className="text-sm text-gray-600">
                      {order.delivery_location} - {order.total_price.toLocaleString('fr-FR')} XAF
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
            ))}
            
            {myOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FontAwesomeIcon icon={faHistory} className="text-4xl mb-4" />
                <p>Aucune commande pour le moment</p>
                <p className="text-sm">Commencez par commander un menu !</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de commande */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle commande</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Menu sélectionné */}
            {selectedMenu && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Menu sélectionné</h4>
                <div className="flex items-center mt-2">
                  {selectedMenu.photo_url && (
                    <img 
                      src={selectedMenu.photo_url} 
                      alt={selectedMenu.name} 
                      className="w-16 h-16 object-cover rounded-lg mr-3"
                    />
                  )}
                  <div>
                    <p className="text-green-700 font-medium">{selectedMenu.name}</p>
                    <p className="text-green-600">{selectedMenu.description}</p>
                    <p className="text-green-800 font-bold">
                      {selectedMenu.price.toLocaleString('fr-FR')} XAF
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sélecteur d'accompagnements */}
            <div>
              <Label htmlFor="accompaniments">Nombre d'accompagnements</Label>
              <Select 
                value={accompaniments.toString()} 
                onValueChange={(value) => setAccompaniments(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le nombre d'accompagnements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 accompagnement - {selectedMenu?.price.toLocaleString('fr-FR')} XAF</SelectItem>
                  <SelectItem value="2">2 accompagnements - 2 000 XAF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prix total */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">Prix total</h4>
              <p className="text-blue-800 font-bold text-lg">
                {selectedMenu ? (accompaniments === 2 ? '2 000' : selectedMenu.price.toLocaleString('fr-FR')) : '0'} XAF
              </p>
              {accompaniments === 2 && (
                <p className="text-sm text-green-600">✓ Supplément de 500 XAF pour le 2ème accompagnement</p>
              )}
            </div>

            {/* Instructions spéciales */}
            <div>
              <Label htmlFor="special-instructions">Instructions spéciales</Label>
              <Textarea
                id="special-instructions"
                placeholder="Ajoutez des instructions spéciales si nécessaire..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
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
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'En cours...' : 'Passer la commande'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
