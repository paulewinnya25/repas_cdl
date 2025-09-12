import { useState, useEffect, useCallback } from 'react';
import { EmployeeMenu, UserRole, EmployeeOrder, EmployeeOrderStatus, Employee } from '@/types/repas-cdl';
import { employees, searchEmployeesByName, getEmployeesByStatus, getEmployeesByPosition, getEmployeesByContractType } from '@/data/employees';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUtensils, faHistory, faBoxOpen, faCheckCircle, faTruck, faUsers, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import { EmployeeMenuForm, EmployeeMenuFormData } from '../EmployeeMenuForm';
import { EmployeeOrderForm, EmployeeOrderFormData } from '../EmployeeOrderForm';
import { EmployeeForm } from '../EmployeeForm';
import { EmployeeStats } from '../EmployeeStats';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeesTabProps {
  currentUserRole: UserRole;
}

const getStatusBadgeVariant = (status: EmployeeOrder['status']): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case 'Commandé': return 'secondary';
    case 'En préparation': return 'secondary';
    case 'Prêt pour livraison': return 'default';
    case 'Livré': return 'default';
    case 'Annulé': return 'destructive';
    default: return 'secondary';
  }
};

const getNotificationMessage = (status: EmployeeOrderStatus, menuName: string) => {
  switch (status) {
    case 'En préparation': return `Votre commande "${menuName}" est en cours de préparation.`;
    case 'Prêt pour livraison': return `Votre commande "${menuName}" est prête pour la livraison.`;
    case 'Livré': return `Votre commande "${menuName}" a été livrée. Bon appétit !`;
    default: return null;
  }
};

export const EmployeesTab = ({ currentUserRole }: EmployeesTabProps) => {
  const [menus, setMenus] = useState<EmployeeMenu[]>([]);
  const [myOrders, setMyOrders] = useState<EmployeeOrder[]>([]);
  const [allEmployeeOrders, setAllEmployeeOrders] = useState<EmployeeOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<EmployeeMenu | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour la gestion des employés
  const [employeeList, setEmployeeList] = useState<Employee[]>(employees);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [contractFilter, setContractFilter] = useState<string>('all');

  const isCook = currentUserRole === 'Aide Cuisinier' || currentUserRole === 'Chef Cuisinier' || currentUserRole === 'Super Admin';
  const isAdmin = currentUserRole === 'Super Admin';

  // Fonctions de filtrage des employés
  const filterEmployees = useCallback(() => {
    let filtered = employees;

    // Filtrage par nom
    if (searchTerm) {
      filtered = searchEmployeesByName(searchTerm);
    }

    // Filtrage par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.statut_dossier === statusFilter);
    }

    // Filtrage par poste
    if (positionFilter !== 'all') {
      filtered = filtered.filter(emp => 
        emp.poste_actuel?.toLowerCase().includes(positionFilter.toLowerCase())
      );
    }

    // Filtrage par type de contrat
    if (contractFilter !== 'all') {
      filtered = filtered.filter(emp => emp.type_contrat === contractFilter);
    }

    setEmployeeList(filtered);
  }, [searchTerm, statusFilter, positionFilter, contractFilter]);

  useEffect(() => {
    filterEmployees();
  }, [filterEmployees]);

  // Fonction pour obtenir les options uniques pour les filtres
  const getUniqueStatuses = () => {
    const statuses = employees.map(emp => emp.statut_dossier).filter(Boolean);
    return Array.from(new Set(statuses));
  };

  const getUniquePositions = () => {
    const positions = employees.map(emp => emp.poste_actuel).filter(Boolean);
    return Array.from(new Set(positions));
  };

  const getUniqueContractTypes = () => {
    const contracts = employees.map(emp => emp.type_contrat).filter(Boolean);
    return Array.from(new Set(contracts));
  };

  const handleEmployeeSubmit = async (employeeData: Partial<Employee>) => {
    setIsSubmitting(true);
    try {
      // Ici vous pouvez ajouter la logique pour sauvegarder en base de données
      // Pour l'instant, on simule juste une mise à jour locale
      if (selectedEmployee) {
        showSuccess("Employé mis à jour avec succès !");
      } else {
        showSuccess("Nouvel employé créé avec succès !");
      }
      setIsEmployeeModalOpen(false);
      setSelectedEmployee(null);
      // Recharger la liste des employés si nécessaire
    } catch (error) {
      showError("Erreur lors de l'enregistrement de l'employé.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMenus = useCallback(async () => {
    try {
      const query = supabase.from('employee_menus').select('*');
      if (!isCook) {
        query.eq('is_available', true);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setMenus(data);
    } catch (error) {
      showError("Impossible de charger les menus.");
    }
  }, [isCook]);

  const fetchMyOrders = useCallback(async () => {
    if (isCook) return;
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
  }, [isCook]);

  const fetchAllEmployeeOrders = useCallback(async () => {
    if (!isCook) return;
    try {
      const { data, error } = await supabase
        .from('employee_orders')
        .select('*, employee_menus(name), profiles(first_name, last_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAllEmployeeOrders(data as any);
    } catch (error) {
      showError("Impossible de charger les commandes des employés.");
    }
  }, [isCook]);

  useEffect(() => {
    fetchMenus();
    fetchMyOrders();
    fetchAllEmployeeOrders();
  }, [fetchMenus, fetchMyOrders, fetchAllEmployeeOrders]);

  const handleStatusUpdate = async (order: EmployeeOrder, newStatus: EmployeeOrderStatus) => {
    try {
      const { error } = await supabase.from('employee_orders').update({ status: newStatus }).eq('id', order.id);
      if (error) throw error;

      const message = getNotificationMessage(newStatus, order.employee_menus.name);
      if (message) {
        const { error: notifError } = await supabase.from('notifications').insert({
          recipient_id: order.employee_id,
          message: message,
        });
        if (notifError) throw notifError;
      }

      showSuccess(`Commande mise à jour: ${newStatus}`);
      fetchAllEmployeeOrders();
    } catch (error) {
      showError("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleMenuSubmit = async (values: EmployeeMenuFormData) => {
    setIsSubmitting(true);
    try {
      let mediaUrl = selectedMenu?.photo_url || null;
      if (values.photo_url instanceof File) {
        const file = values.photo_url;
        const filePath = `public/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('menu_media').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('menu_media').getPublicUrl(filePath);
        mediaUrl = urlData.publicUrl;
      }

      const dataToSubmit = {
        name: values.name,
        description: values.description,
        price: values.price,
        is_available: values.is_available,
        photo_url: mediaUrl,
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
      fetchMenus();
      setIsModalOpen(false);
    } catch (error) {
      showError("Erreur lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Interface simplifiée pour les employés - juste noms et postes avec commande
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faUsers} className="mr-3 text-blue-600" />
          Employés ({employeeList.length})
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employeeList.map(employee => (
          <Card 
            key={employee.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => {
              // Ouvrir le modal de commande pour cet employé
              setSelectedEmployee(employee);
              setIsOrderModalOpen(true);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{employee.nom_prenom}</h3>
                  <p className="text-sm text-gray-600">{employee.poste_actuel || 'Poste non renseigné'}</p>
                  {employee.email && (
                    <p className="text-xs text-gray-500">{employee.email}</p>
                  )}
                </div>
                <div className="text-right">
                  <Button size="sm" variant="outline">
                    <FontAwesomeIcon icon={faUtensils} className="mr-1" />
                    Commander
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog pour passer une commande */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Commande pour {selectedEmployee?.nom_prenom}
            </DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">{selectedEmployee.nom_prenom}</h4>
                <p className="text-sm text-gray-600">{selectedEmployee.poste_actuel}</p>
                {selectedEmployee.email && (
                  <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Menus disponibles</h4>
                <div className="grid grid-cols-1 gap-3">
                  {menus.filter(menu => menu.is_available).map(menu => (
                    <Card key={menu.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {menu.photo_url && (
                              <img src={menu.photo_url} alt={menu.name} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div>
                              <h5 className="font-medium">{menu.name}</h5>
                              <p className="text-sm text-gray-600">{menu.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{menu.price.toLocaleString('fr-FR')} XAF</p>
                            <Button 
                              size="sm" 
                              onClick={async () => {
                                setIsSubmitting(true);
                                try {
                                  const { data: { user } } = await supabase.auth.getUser();
                                  if (!user) throw new Error("Utilisateur non authentifié.");
                                  
                                  const newOrder = { 
                                    employee_id: user.id, 
                                    menu_id: menu.id, 
                                    delivery_location: selectedEmployee.poste_actuel || 'Bureau',
                                    total_price: menu.price, 
                                    status: 'Commandé' 
                                  };
                                  
                                  const { error } = await supabase.from('employee_orders').insert([newOrder]);
                                  if (error) throw error;
                                  
                                  showSuccess(`Commande passée pour ${selectedEmployee.nom_prenom} !`);
                                  setIsOrderModalOpen(false);
                                  setSelectedEmployee(null);
                                } catch (error) {
                                  showError("Erreur lors de la commande.");
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              disabled={isSubmitting}
                            >
                              Commander
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};