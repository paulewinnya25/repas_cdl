import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Patient, Order, UserRole, PatientMenu, EmployeeMenu, EmployeeOrder } from '../../types/repas-cdl';
import { gabonCities } from '../../data/gabon-locations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserInjured, 
  faClipboardList, 
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

const NursePortalPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [patientMenus, setPatientMenus] = useState<PatientMenu[]>([]);
  const [employeeMenus, setEmployeeMenus] = useState<EmployeeMenu[]>([]);
  const [employeeOrdersToday, setEmployeeOrdersToday] = useState<EmployeeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [isDeletePatientModalOpen, setIsDeletePatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState({
    mealType: '',
    instructions: '',
    companionMeal: false,
    companionInstructions: '',
    companionSelectedMenu: null as EmployeeMenu | null,
    companionAccompaniments: 1,
    companionSelectedOptions: [] as string[]
  });

  const parseAccompanimentOptions = (menu: EmployeeMenu | null): string[] => {
    if (!menu) return [];
    const explicit = (menu.accompaniment_options || '').trim();
    if (explicit) {
      return explicit.split(/[,;+]/).map(t => t.trim()).filter(Boolean);
    }
    const text = (menu.description || '').toString();
    const match = text.match(/Accompagnements\s*:\s*(.*)$/im);
    const list = match ? match[1] : '';
    return list.split(/[,;+]/).map(t => t.trim()).filter(Boolean);
  };
  const [newPatient, setNewPatient] = useState({
    name: '',
    room: '',
    service: '',
    diet: '',
    allergies: ''
  });
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Infirmier');
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [accessCode, setAccessCode] = useState<string>('');
  const requiredCode = (import.meta as any).env?.VITE_NURSE_ACCESS_CODE || 'INFIRM_2025';

  useEffect(() => {
    fetchData();
    checkUserRole();
    // Le code sera demandé à chaque accès (pas de persistance)
    setHasAccess(false);
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les patients (gestion d'erreur gracieuse)
      try {
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .order('name', { ascending: true });
        
        if (patientsError) {
          console.warn('Table patients non disponible:', patientsError);
          setPatients([]);
        } else {
          console.log('Patients chargés:', patientsData);
          setPatients(patientsData as Patient[]);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des patients:', error);
        setPatients([]);
      }

      // Récupérer les commandes avec informations des patients (gestion d'erreur gracieuse)
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            patients (
              id,
              name,
              room
            )
          `)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.warn('Table orders non disponible:', ordersError);
          setOrders([]);
        } else {
          console.log('Commandes chargées:', ordersData);
          setOrders(ordersData as Order[]);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des commandes:', error);
        setOrders([]);
      }

      // Récupérer les menus patients (jour/régime/type)
      try {
        const { data: patientMenusData, error: patientMenusError } = await supabase
          .from('patient_menus')
          .select('*')
          .order('created_at', { ascending: false });
        if (patientMenusError) {
          console.warn('Table patient_menus non disponible:', patientMenusError);
          setPatientMenus([]);
        } else {
          console.log('Menus patients chargés:', patientMenusData);
          setPatientMenus((patientMenusData || []) as PatientMenu[]);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des menus patients:', error);
        setPatientMenus([]);
      }

      // Récupérer les menus employés disponibles pour l'accompagnateur
      try {
        const { data: empMenus, error: empMenusErr } = await supabase
          .from('employee_menus')
          .select('*')
          .order('created_at', { ascending: false });
        if (empMenusErr) {
          console.warn('Table employee_menus non disponible:', empMenusErr);
          setEmployeeMenus([]);
        } else {
          setEmployeeMenus((empMenus || []) as EmployeeMenu[]);
        }
      } catch (error) {
        console.warn('Erreur chargement employee_menus:', error);
        setEmployeeMenus([]);
      }

      // Récupérer les commandes employés du jour (pour rapport)
      try {
        const start = new Date();
        start.setHours(0,0,0,0);
        const end = new Date();
        end.setHours(23,59,59,999);
        const { data: empOrders, error: empOrdersErr } = await supabase
          .from('employee_orders')
          .select('*')
          .gte('created_at', start.toISOString())
          .lt('created_at', end.toISOString());
        if (empOrdersErr) {
          console.warn('Chargement employee_orders (rapport) échoué:', empOrdersErr);
          setEmployeeOrdersToday([]);
        } else {
          setEmployeeOrdersToday((empOrders || []) as EmployeeOrder[]);
        }
      } catch (error) {
        console.warn('Erreur chargement employee_orders (rapport):', error);
        setEmployeeOrdersToday([]);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError("Impossible de charger les données");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsOrderModalOpen(true);
  };

  // Déterminer automatiquement le menu du jour depuis patient_menus selon régime et type de repas
  const getTodayName = () => {
    const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    return days[new Date().getDay()];
  };

  const getMenuForDiet = (diet: string, mealType: string) => {
    const today = getTodayName();
    const found = patientMenus.find(m => 
      m.dietary_restriction === diet &&
      m.meal_type === mealType &&
      m.day_of_week === today &&
      m.is_available
    );
    if (found) return found.name;
    // fallback si non défini en base
    return `${mealType} - ${diet}`;
  };

  const handlePlaceOrder = async () => {
    if (!selectedPatient || !newOrder.mealType) {
      showError("Veuillez sélectionner le type de repas");
      return;
    }

    try {
      // Déterminer le menu automatiquement selon le régime alimentaire
      const menu = getMenuForDiet(selectedPatient.diet, newOrder.mealType);

      // Créer la commande principale du patient
      const orderData = {
        patient_id: selectedPatient.id,
        meal_type: newOrder.mealType,
        menu: menu,
        instructions: newOrder.instructions,
        status: 'En attente d\'approbation'
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      // Si un accompagnateur est demandé, créer une commande employé avec menu choisi
      if (newOrder.companionMeal) {
        if (!newOrder.companionSelectedMenu) {
          showError('Sélectionnez un menu employé pour l\'accompagnateur.');
          return;
        }
        // Validation des accompagnements
        const required = newOrder.companionAccompaniments;
        if ((newOrder.companionSelectedOptions || []).length < required) {
          showError(`Choisissez ${required} accompagnement(s) pour l\'accompagnateur.`);
          return;
        }
        const accompText = newOrder.companionSelectedOptions.join(' + ');
        const mergedInstr = [
          (newOrder.companionInstructions || '').trim(),
          accompText ? `Accompagnements: ${accompText}` : ''
        ].filter(Boolean).join(' | ');

        const { error: empOrderErr } = await supabase
          .from('employee_orders')
          .insert([{
            employee_id: selectedPatient.id, // rattacher à l'ID du patient (UUID)
            employee_name: `Accompagnateur de ${selectedPatient.name}`,
            menu_id: newOrder.companionSelectedMenu.id,
            delivery_location: `Chambre ${selectedPatient.room}`,
            special_instructions: mergedInstr,
            quantity: 1,
            accompaniments: newOrder.companionAccompaniments,
            total_price: newOrder.companionAccompaniments === 2 ? 2000 : newOrder.companionSelectedMenu.price,
            status: 'Commandé'
          }]);
        if (empOrderErr) {
          console.error('Erreur commande employé pour accompagnateur:', empOrderErr);
        }
      }

      if (error) throw error;

      showSuccess(`Commande créée avec succès - Menu: ${menu}`);

      setNewOrder({ mealType: '', instructions: '', companionMeal: false, companionInstructions: '', companionSelectedMenu: null, companionAccompaniments: 1, companionSelectedOptions: [] });
      setIsOrderModalOpen(false);
      setSelectedPatient(null);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      showError("Impossible de passer la commande");
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatient.name || !newPatient.room || !newPatient.service || !newPatient.diet) {
      showError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .insert([{
          name: newPatient.name,
          room: newPatient.room,
          service: newPatient.service,
          diet: newPatient.diet,
          allergies: newPatient.allergies || null,
          entry_date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;

      showSuccess('Patient créé avec succès');
      setNewPatient({ name: '', room: '', service: '', diet: '', allergies: '' });
      setIsPatientModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la création du patient:', error);
      showError("Impossible de créer le patient");
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setNewPatient({
      name: patient.name,
      room: patient.room,
      service: patient.service,
      diet: patient.diet,
      allergies: patient.allergies || ''
    });
    setIsEditPatientModalOpen(true);
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient || !newPatient.name || !newPatient.room || !newPatient.service || !newPatient.diet) {
      showError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .update({
          name: newPatient.name,
          room: newPatient.room,
          service: newPatient.service,
          diet: newPatient.diet,
          allergies: newPatient.allergies || null
        })
        .eq('id', editingPatient.id);

      if (error) throw error;

      showSuccess('Patient modifié avec succès');
      setIsEditPatientModalOpen(false);
      setEditingPatient(null);
      setNewPatient({ name: '', room: '', service: '', diet: '', allergies: '' });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la modification du patient:', error);
      showError("Impossible de modifier le patient");
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    setDeletingPatient(patient);
    setIsDeletePatientModalOpen(true);
  };

  const handleConfirmDeletePatient = async () => {
    if (!deletingPatient) return;

    try {
      // Vérifier s'il y a des commandes en cours pour ce patient
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('patient_id', deletingPatient.id)
        .in('status', ['En attente d\'approbation', 'En préparation', 'Prêt pour livraison']);

      if (ordersError) {
        console.warn('Erreur lors de la vérification des commandes:', ordersError);
      } else if (ordersData && ordersData.length > 0) {
        showError("Impossible de supprimer ce patient car il a des commandes en cours");
        setIsDeletePatientModalOpen(false);
        setDeletingPatient(null);
        return;
      }

      // Supprimer le patient
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', deletingPatient.id);

      if (error) throw error;

      showSuccess('Patient supprimé avec succès');
      setIsDeletePatientModalOpen(false);
      setDeletingPatient(null);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
      showError("Impossible de supprimer le patient");
    }
  };

  // Fonctions de gestion des commandes
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

  const handleOrderEdit = (order: Order) => {
    setEditingOrder(order);
    setNewOrder({
      mealType: order.meal_type,
      menu: order.menu,
      instructions: order.instructions || ''
    });
    setIsEditOrderModalOpen(true);
  };

  const handleOrderUpdate = async () => {
    if (!editingOrder || !newOrder.mealType || !newOrder.menu) {
      showError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          meal_type: newOrder.mealType,
          menu: newOrder.menu,
          instructions: newOrder.instructions
        })
        .eq('id', editingOrder.id);

      if (error) throw error;

      showSuccess('Commande modifiée avec succès');
      setNewOrder({ mealType: '', menu: '', instructions: '' });
      setIsEditOrderModalOpen(false);
      setEditingOrder(null);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      showError('Impossible de modifier la commande');
    }
  };

  const canModifyOrder = (order: Order) => {
    return order.status === 'En attente d\'approbation';
  };

  const canCancelOrder = (order: Order) => {
    return order.status === 'En attente d\'approbation';
  };

  const canDeleteOrder = (order: Order) => {
    return order.status === 'En attente d\'approbation' || order.status === 'Livré' || order.status === 'Annulé';
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
          <p className="mt-4 text-lg text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Écran de contrôle d'accès
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-bold text-blue-700 mb-2">Portail Infirmier</h1>
          <p className="text-sm text-gray-600 mb-4">Saisissez le code d'accès pour continuer.</p>
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Code d'accès"
            className="w-full border rounded-md px-3 py-2 mb-4"
            aria-label="Code d'accès infirmier"
          />
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2"
            onClick={() => {
              if (accessCode === requiredCode) {
                setHasAccess(true);
              } else {
                alert('Code invalide');
              }
            }}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <Header 
        title="Portail Infirmier" 
        subtitle="Gestion des commandes patients"
        showLogo={true}
      />
      
      {/* Statistiques rapides */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-end space-x-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Commandes en attente</p>
            <p className="text-2xl font-bold text-red-600">{pendingOrders.length}</p>
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
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Patients</p>
                  <p className="text-3xl font-bold">{patients.length}</p>
                </div>
                <FontAwesomeIcon icon={faUsers} className="text-4xl text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Commandes Aujourd'hui</p>
                  <p className="text-3xl font-bold">{todayOrders.length}</p>
                </div>
                <FontAwesomeIcon icon={faCalendarDay} className="text-4xl text-green-200" />
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
                  <p className="text-purple-100">Total Commandes</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
                <FontAwesomeIcon icon={faClipboardList} className="text-4xl text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation par onglets */}
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          </TabsList>

          {/* Onglet Patients */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
                    <span>Liste des Patients</span>
                  </div>
                  <Button onClick={() => setIsPatientModalOpen(true)}>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Ajouter un patient
                  </Button>
                </CardTitle>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="relative flex-1">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Rechercher un patient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.map((patient) => (
                    <Card 
                      key={patient.id} 
                      className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{patient.name}</h3>
                          <Badge variant="outline">{patient.service}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p><strong>Chambre:</strong> {patient.room}</p>
                          <p><strong>Régime:</strong> {patient.diet}</p>
                          {patient.allergies && (
                            <p><strong>Allergies:</strong> {patient.allergies}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button 
                            className="flex-1" 
                            size="sm"
                            onClick={() => handlePatientClick(patient)}
                          >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Commander
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPatient(patient);
                            }}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePatient(patient);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Commandes */}
          <TabsContent value="orders">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faClipboardList} className="text-blue-600" />
                    <span>Commandes Récentes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Commande #{orders.indexOf(order) + 1}</h4>
                          <Badge 
                            variant={order.status === 'En attente d\'approbation' ? 'destructive' : 'default'}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p><strong>Patient:</strong> {order.patients?.name || 'Patient inconnu'}</p>
                          <p><strong>Chambre:</strong> {order.patients?.room || 'N/A'}</p>
                          <p><strong>Repas:</strong> {order.meal_type}</p>
                          <p><strong>Menu:</strong> {order.menu}</p>
                          {order.instructions && (
                            <p><strong>Instructions:</strong> {order.instructions}</p>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                          {canModifyOrder(order) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOrderEdit(order)}
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-1" />
                              Modifier
                            </Button>
                          )}
                          {canCancelOrder(order) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleOrderCancel(order.id)}
                            >
                              <FontAwesomeIcon icon={faTimes} className="mr-1" />
                              Annuler
                            </Button>
                          )}
                          {canDeleteOrder(order) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOrderDelete(order.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1" />
                              Supprimer
                            </Button>
                          )}
                          {order.status === 'En préparation' && (
                            <div className="text-sm text-gray-500 italic">
                              En cours de préparation - Aucune action possible
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
                          <p><strong>Patient:</strong> {order.patients?.name || 'Patient inconnu'}</p>
                          <p><strong>Chambre:</strong> {order.patients?.room || 'N/A'}</p>
                          <p><strong>Repas:</strong> {order.meal_type}</p>
                          <p><strong>Menu:</strong> {order.menu}</p>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                          {canModifyOrder(order) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOrderEdit(order)}
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-1" />
                              Modifier
                            </Button>
                          )}
                          {canCancelOrder(order) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleOrderCancel(order.id)}
                            >
                              <FontAwesomeIcon icon={faTimes} className="mr-1" />
                              Annuler
                            </Button>
                          )}
                          {canDeleteOrder(order) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOrderDelete(order.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1" />
                              Supprimer
                            </Button>
                          )}
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
                    <span>Statistiques du Jour</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span>Commandes patients aujourd'hui</span>
                      <span className="font-bold text-green-600">{todayOrders.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span>Commandes employés aujourd'hui</span>
                      <span className="font-bold text-blue-600">{employeeOrdersToday.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span>Total recettes employés (aujourd'hui)</span>
                      <span className="font-bold text-purple-600">{employeeOrdersToday.reduce((sum, o) => sum + (o.total_price || 0), 0).toLocaleString('fr-FR')} XAF</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rapport journalier détaillé */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faClipboardList} className="text-blue-600" />
                    <span>Rapport journalier</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Patients - En attente</span><span className="font-medium">{orders.filter(o => new Date(o.created_at || o.date).toDateString() === new Date().toDateString() && o.status === "En attente d'approbation").length}</span></div>
                    <div className="flex justify-between"><span>Patients - En préparation</span><span className="font-medium">{orders.filter(o => new Date(o.created_at || o.date).toDateString() === new Date().toDateString() && o.status === 'En préparation').length}</span></div>
                    <div className="flex justify-between"><span>Patients - Livrés</span><span className="font-medium">{orders.filter(o => new Date(o.created_at || o.date).toDateString() === new Date().toDateString() && o.status === 'Livré').length}</span></div>
                    <hr className="my-2" />
                    <div className="flex justify-between"><span>Employés - Commandés</span><span className="font-medium">{employeeOrdersToday.filter(o => o.status === 'Commandé').length}</span></div>
                    <div className="flex justify-between"><span>Employés - En préparation</span><span className="font-medium">{employeeOrdersToday.filter(o => o.status === 'En préparation').length}</span></div>
                    <div className="flex justify-between"><span>Employés - Livrés</span><span className="font-medium">{employeeOrdersToday.filter(o => o.status === 'Livré').length}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de commande */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Nouvelle commande {selectedPatient && `pour ${selectedPatient.name}`}
            </DialogTitle>
            <DialogDescription>
              Passez une commande pour le patient sélectionné
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              {/* Informations patient */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Informations Patient</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Nom:</strong> {selectedPatient.name}</p>
                    <p><strong>Chambre:</strong> {selectedPatient.room}</p>
                  </div>
                  <div>
                    <p><strong>Service:</strong> {selectedPatient.service}</p>
                    <p><strong>Régime:</strong> {selectedPatient.diet}</p>
                  </div>
                </div>
                {selectedPatient.allergies && (
                  <p className="mt-2 text-sm"><strong>Allergies:</strong> {selectedPatient.allergies}</p>
                )}
              </div>

              {/* Formulaire de commande */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meal-type">Type de repas</Label>
                  <Select value={newOrder.mealType} onValueChange={(value) => setNewOrder({...newOrder, mealType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type de repas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petit-déjeuner">Petit-déjeuner</SelectItem>
                      <SelectItem value="Déjeuner">Déjeuner</SelectItem>
                      <SelectItem value="Dîner">Dîner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Menu automatique selon le régime alimentaire */}
                {newOrder.mealType && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <Label className="text-green-800 dark:text-green-200">Menu automatique</Label>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {getMenuForDiet(selectedPatient.diet, newOrder.mealType)}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="instructions">Instructions spéciales</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Instructions particulières..."
                    value={newOrder.instructions}
                    onChange={(e) => setNewOrder({...newOrder, instructions: e.target.value})}
                  />
                </div>

                {/* Commande pour accompagnateur */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      id="companion-meal"
                      checked={newOrder.companionMeal}
                      onChange={(e) => setNewOrder({...newOrder, companionMeal: e.target.checked})}
                      className="rounded"
                      aria-label="Commande pour accompagnateur"
                    />
                    <Label htmlFor="companion-meal" className="text-sm font-medium">
                      Commande pour accompagnateur
                    </Label>
                  </div>
                  
                  {newOrder.companionMeal && (
                    <div className="space-y-4">
                      <Label htmlFor="companion-instructions">Instructions pour l'accompagnateur</Label>
                      <Textarea
                        id="companion-instructions"
                        placeholder="Instructions particulières pour l'accompagnateur..."
                        value={newOrder.companionInstructions}
                        onChange={(e) => setNewOrder({...newOrder, companionInstructions: e.target.value})}
                        className="mt-1"
                      />

                      {/* Sélection du menu employé */}
                      <div>
                        <Label>Choisir un menu employé</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-72 overflow-y-auto">
                          {employeeMenus.map((m) => {
                            const unavailable = !m.is_available;
                            const selected = newOrder.companionSelectedMenu?.id === m.id;
                            return (
                              <div
                                key={m.id}
                                className={`p-3 border rounded-lg cursor-pointer ${unavailable ? 'opacity-60 cursor-not-allowed' : selected ? 'border-green-600 ring-1 ring-green-300' : 'hover:shadow'}`}
                                onClick={() => { if (!unavailable) setNewOrder({ ...newOrder, companionSelectedMenu: m, companionSelectedOptions: [] }); }}
                              >
                                <div className="flex items-center">
                                  {m.photo_url ? (
                                    <img src={m.photo_url} alt={m.name} className="w-16 h-16 object-cover rounded-lg mr-3" />
                                  ) : (
                                    <div className="w-16 h-16 bg-green-100 rounded-lg mr-3" />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{m.name}</span>
                                      <Badge variant="outline">{m.price} FCFA</Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">{m.description}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nombre d'accompagnements */}
                      <div>
                        <Label>Nombre d'accompagnements</Label>
                        <Select
                          value={newOrder.companionAccompaniments.toString()}
                          onValueChange={(value) => setNewOrder({ ...newOrder, companionAccompaniments: parseInt(value), companionSelectedOptions: [] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 accompagnement - {newOrder.companionSelectedMenu?.price?.toLocaleString('fr-FR') || '1 500'} XAF</SelectItem>
                            <SelectItem value="2">2 accompagnements - 2 000 XAF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Choix des accompagnements depuis les options du menu sélectionné */}
                      <div>
                        <Label>Choisissez les accompagnements</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {parseAccompanimentOptions(newOrder.companionSelectedMenu).map((opt) => {
                              const checked = newOrder.companionSelectedOptions.includes(opt);
                              const disabled = !checked && newOrder.companionSelectedOptions.length >= newOrder.companionAccompaniments;
                              return (
                                <label key={opt} className={`flex items-center space-x-2 text-sm ${disabled ? 'opacity-60' : ''}`}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={(e) => {
                                      setNewOrder(prev => {
                                        const next = [...prev.companionSelectedOptions];
                                        if (e.target.checked) {
                                          if (!next.includes(opt) && next.length < prev.companionAccompaniments) next.push(opt);
                                        } else {
                                          const i = next.indexOf(opt);
                                          if (i >= 0) next.splice(i, 1);
                                        }
                                        return { ...prev, companionSelectedOptions: next };
                                      });
                                    }}
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          {parseAccompanimentOptions(newOrder.companionSelectedMenu).length === 0 && (
                            <div className="col-span-2 text-sm text-gray-500">Aucune option d'accompagnement définie pour ce menu.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handlePlaceOrder}>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Passer la commande
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de création de patient */}
      <Dialog open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau patient</DialogTitle>
            <DialogDescription>
              Créez un nouveau patient avec ses informations médicales
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient-name">Nom du patient</Label>
              <Input
                id="patient-name"
                placeholder="Ex: Marie Dubois"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="patient-room">Chambre</Label>
              <Select value={newPatient.room} onValueChange={(value) => setNewPatient({...newPatient, room: value})}>
                <SelectTrigger id="patient-room">
                  <SelectValue placeholder="Sélectionner la chambre" />
                </SelectTrigger>
                <SelectContent>
                  {/* Villes principales */}
                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">Villes principales</div>
                  {['Woleu', 'Ntem', 'Mpassa', 'Lolo', 'Ngounié', 'Ogooué', 'Komo', 'Nyanga', 'Ivindo', 'Abanga', 'Mbei', 'Addis abeba'].map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="patient-service">Service</Label>
              <Select value={newPatient.service} onValueChange={(value) => setNewPatient({...newPatient, service: value})}>
                <SelectTrigger id="patient-service">
                  <SelectValue placeholder="Sélectionner le service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                  <SelectItem value="Diabétologie">Diabétologie</SelectItem>
                  <SelectItem value="Médecine interne">Médecine interne</SelectItem>
                  <SelectItem value="Endocrinologie">Endocrinologie</SelectItem>
                  <SelectItem value="Gastro-entérologie">Gastro-entérologie</SelectItem>
                  <SelectItem value="Neurologie">Neurologie</SelectItem>
                  <SelectItem value="Pneumologie">Pneumologie</SelectItem>
                  <SelectItem value="Néphrologie">Néphrologie</SelectItem>
                  <SelectItem value="Rhumatologie">Rhumatologie</SelectItem>
                  <SelectItem value="Dermatologie">Dermatologie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="patient-diet">Régime alimentaire</Label>
              <Select value={newPatient.diet} onValueChange={(value) => setNewPatient({...newPatient, diet: value})}>
                <SelectTrigger id="patient-diet">
                  <SelectValue placeholder="Sélectionner le régime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Diabétique">Diabétique</SelectItem>
                  <SelectItem value="Cardiaque">Cardiaque</SelectItem>
                  <SelectItem value="Hypertension">Hypertension</SelectItem>
                  <SelectItem value="Sans sel">Sans sel</SelectItem>
                  <SelectItem value="Sans gluten">Sans gluten</SelectItem>
                  <SelectItem value="Végétarien">Végétarien</SelectItem>
                  <SelectItem value="Végétalien">Végétalien</SelectItem>
                  <SelectItem value="Hypocalorique">Hypocalorique</SelectItem>
                  <SelectItem value="Hypercalorique">Hypercalorique</SelectItem>
                  <SelectItem value="Protéiné">Protéiné</SelectItem>
                  <SelectItem value="Liquide">Liquide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="patient-allergies">Allergies (optionnel)</Label>
              <Input
                id="patient-allergies"
                placeholder="Ex: Gluten, Arachides"
                value={newPatient.allergies}
                onChange={(e) => setNewPatient({...newPatient, allergies: e.target.value})}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsPatientModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreatePatient}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Créer le patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de modification de commande */}
      <Dialog open={isEditOrderModalOpen} onOpenChange={setIsEditOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la commande</DialogTitle>
            <DialogDescription>
              Modifiez les détails de cette commande
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-meal-type">Type de repas</Label>
              <Select value={newOrder.mealType} onValueChange={(value) => setNewOrder({...newOrder, mealType: value})}>
                <SelectTrigger id="edit-meal-type">
                  <SelectValue placeholder="Sélectionner le type de repas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petit-déjeuner">Petit-déjeuner</SelectItem>
                  <SelectItem value="Déjeuner">Déjeuner</SelectItem>
                  <SelectItem value="Dîner">Dîner</SelectItem>
                  <SelectItem value="Collation">Collation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-menu">Menu</Label>
              <Input
                id="edit-menu"
                placeholder="Ex: Poulet rôti aux légumes"
                value={newOrder.menu}
                onChange={(e) => setNewOrder({...newOrder, menu: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-instructions">Instructions spéciales</Label>
              <Textarea
                id="edit-instructions"
                placeholder="Instructions particulières..."
                value={newOrder.instructions}
                onChange={(e) => setNewOrder({...newOrder, instructions: e.target.value})}
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditOrderModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleOrderUpdate}>
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Modifier la commande
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de modification de patient */}
      <Dialog open={isEditPatientModalOpen} onOpenChange={setIsEditPatientModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le patient</DialogTitle>
            <DialogDescription>
              Modifiez les informations du patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-patient-name">Nom du patient</Label>
              <Input
                id="edit-patient-name"
                placeholder="Ex: Marie Dubois"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-patient-room">Chambre</Label>
              <Select value={newPatient.room} onValueChange={(value) => setNewPatient({...newPatient, room: value})}>
                <SelectTrigger id="edit-patient-room">
                  <SelectValue placeholder="Sélectionner une chambre" />
                </SelectTrigger>
                <SelectContent>
                  {gabonCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-patient-service">Service</Label>
              <Select value={newPatient.service} onValueChange={(value) => setNewPatient({...newPatient, service: value})}>
                <SelectTrigger id="edit-patient-service">
                  <SelectValue placeholder="Sélectionner un service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Médecine interne">Médecine interne</SelectItem>
                  <SelectItem value="Chirurgie">Chirurgie</SelectItem>
                  <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                  <SelectItem value="Gynécologie">Gynécologie</SelectItem>
                  <SelectItem value="Urgences">Urgences</SelectItem>
                  <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                  <SelectItem value="Neurologie">Neurologie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-patient-diet">Régime alimentaire</Label>
              <Select value={newPatient.diet} onValueChange={(value) => setNewPatient({...newPatient, diet: value})}>
                <SelectTrigger id="edit-patient-diet">
                  <SelectValue placeholder="Sélectionner un régime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Sans sel">Sans sel</SelectItem>
                  <SelectItem value="Diabétique">Diabétique</SelectItem>
                  <SelectItem value="Hypocalorique">Hypocalorique</SelectItem>
                  <SelectItem value="Sans gluten">Sans gluten</SelectItem>
                  <SelectItem value="Végétarien">Végétarien</SelectItem>
                  <SelectItem value="Végétalien">Végétalien</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-patient-allergies">Allergies (optionnel)</Label>
              <Input
                id="edit-patient-allergies"
                placeholder="Ex: Allergique aux noix, lactose..."
                value={newPatient.allergies}
                onChange={(e) => setNewPatient({...newPatient, allergies: e.target.value})}
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditPatientModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdatePatient}>
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Modifier le patient
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={isDeletePatientModalOpen} onOpenChange={setIsDeletePatientModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {deletingPatient && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800">Patient à supprimer</h4>
                <p className="text-red-700">
                  <strong>Nom:</strong> {deletingPatient.name}<br/>
                  <strong>Chambre:</strong> {deletingPatient.room}<br/>
                  <strong>Service:</strong> {deletingPatient.service}
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mr-2" />
                  <p className="text-yellow-800 font-medium">
                    Attention: Cette action supprimera définitivement le patient et toutes ses données associées.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeletePatientModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeletePatient}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Supprimer définitivement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NursePortalPage;
