import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/ui/Header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faUtensils, faClock, faCheckCircle, faPlus, faEdit, faTrash, faUsers, faClipboardList, faChartLine, faBell, faDownload, faSignOutAlt, faTimes, faWarehouse, faBox, faExclamationTriangle, faMinus, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import type { Patient, Order, EmployeeMenu, EmployeeOrder, PatientMenu, DietaryRestriction, PatientMealType, DayOfWeek } from '@/types/repas-cdl';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createPDFHeader, createPDFFooter, createSummarySection, createTable, LOGO_COLORS } from '../../utils/pdfReportUtils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { isSameDay } from 'date-fns';

export default function CookPortalPage() {
  const [patientOrders, setPatientOrders] = useState<Order[]>([]);
  const [employeeOrders, setEmployeeOrders] = useState<EmployeeOrder[]>([]);
  const [employeeMenus, setEmployeeMenus] = useState<EmployeeMenu[]>([]);
  const [patientMenus, setPatientMenus] = useState<PatientMenu[]>([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [isPatientMenuModalOpen, setIsPatientMenuModalOpen] = useState(false);
  const [isEditPatientMenuModalOpen, setIsEditPatientMenuModalOpen] = useState(false);
  const [isDeleteOrderModalOpen, setIsDeleteOrderModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'patients' | 'employees' | 'pending' | 'delivered'>('all');
  const [activeTab, setActiveTab] = useState('orders');
  
  // États pour la gestion de stock
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isEditInventoryModalOpen, setIsEditInventoryModalOpen] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<any>(null);
  const [newInventoryItem, setNewInventoryItem] = useState({
    name: '',
    category: '',
    current_stock: 0,
    min_stock: 0,
    unit: '',
    supplier: '',
    cost_per_unit: 0,
    expiry_date: '',
    notes: ''
  });
  const downloadCSV = (filename: string, rows: string[][]) => {
    const csvContent = rows.map(r => r.map(c => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportDailyReportCSV = () => {
    const todayPatientOrders = patientOrders.filter(o => isSameDay(new Date((o as any).date || o.created_at || ''), new Date()));
    const todayEmployeeOrders = employeeOrders.filter(o => isSameDay(new Date(o.created_at || ''), new Date()));
    
    // Calculer les statistiques de plats
    const totalOrderedDishes = todayPatientOrders.length + todayEmployeeOrders.reduce((sum, order) => sum + order.quantity, 0);
    const totalDeliveredDishes = todayPatientOrders.filter(o => o.status === 'Livré').length + 
                                 todayEmployeeOrders.filter(o => o.status === 'Livré').reduce((sum, order) => sum + order.quantity, 0);
    
    // Calculer les recettes
    const totalRevenue = todayEmployeeOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    
    // Créer un résumé des plats commandés avec quantités et statuts
    const dishesSummary = new Map<string, { quantity: number, type: string, status: string, revenue: number }>();
    
    // Ajouter les plats patients (1 plat par commande)
    todayPatientOrders.forEach(order => {
      const key = `Patient - ${order.menu}`;
      const existing = dishesSummary.get(key);
      if (existing) {
        existing.quantity += 1;
      } else {
        dishesSummary.set(key, { 
          quantity: 1, 
          type: 'Patient',
          status: order.status,
          revenue: 0
        });
      }
    });
    
    // Ajouter les plats employés avec quantités
    todayEmployeeOrders.forEach(order => {
      const key = `Employé - ${order.employee_menus?.name || 'Menu inconnu'}`;
      const existing = dishesSummary.get(key);
      if (existing) {
        existing.quantity += order.quantity;
        existing.revenue += order.total_price || 0;
      } else {
        dishesSummary.set(key, { 
          quantity: order.quantity, 
          type: 'Employé',
          status: order.status,
          revenue: order.total_price || 0
        });
      }
    });
    
    // Créer les lignes du rapport
    const summaryRows = [
      ['RAPPORT JOURNALIER - PORTAL CUISINIER'],
      ['Date', new Date().toLocaleDateString('fr-FR')],
      [''],
      ['RÉSUMÉ DU JOUR'],
      ['Total plats commandés', totalOrderedDishes.toString()],
      ['Total plats livrés', totalDeliveredDishes.toString()],
      ['Total recette', totalRevenue.toLocaleString('fr-FR') + ' XAF'],
      [''],
      ['DÉTAIL PAR MENU AVEC QUANTITÉS ET STATUTS'],
      ['Type', 'Menu', 'Quantité', 'Statut', 'Recette (XAF)']
    ];
    
    // Ajouter les détails des plats
    Array.from(dishesSummary.entries()).forEach(([menu, data]) => {
      summaryRows.push([
        data.type, 
        menu.split(' - ')[1], 
        data.quantity.toString(), 
        data.status,
        data.revenue.toLocaleString('fr-FR')
      ]);
    });
    
    summaryRows.push([''], ['DÉTAIL DES COMMANDES PATIENTS']);
    
    const patientRows = todayPatientOrders.map(o => [
      o.patients?.name || '', 
      o.patients?.room || '', 
      o.meal_type, 
      o.menu || '', 
      o.status,
      (o.created_at || o.date || '').toString().replace('T', ' ').substring(0, 16)
    ]);
    const patientHeader = ['Nom Patient', 'Chambre', 'Repas', 'Menu', 'Statut', 'Heure'];
    
    summaryRows.push([''], ['DÉTAIL DES COMMANDES EMPLOYÉS']);
    
    const employeeRows = todayEmployeeOrders.map(o => [
      o.employee_name || '', 
      o.employee_menus?.name || '', 
      o.quantity.toString(), 
      o.status,
      (o.created_at || '').toString().replace('T', ' ').substring(0, 16),
      (o.total_price || 0).toLocaleString('fr-FR') + ' XAF'
    ]);
    const employeeHeader = ['Nom Employé', 'Menu', 'Quantité', 'Statut', 'Heure', 'Prix Total'];
    
    downloadCSV(`rapport_journalier_cuisinier_${new Date().toISOString().slice(0,10)}.csv`, [
      ...summaryRows, 
      patientHeader, 
      ...patientRows,
      [''],
      employeeHeader,
      ...employeeRows
    ]);
  };
  const [editingMenu, setEditingMenu] = useState<EmployeeMenu | null>(null);
  const [editingPatientMenu, setEditingPatientMenu] = useState<PatientMenu | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<{type: 'patient' | 'employee', order: Order | EmployeeOrder} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [accessCode, setAccessCode] = useState<string>('');
  const requiredCode = (import.meta as any).env?.VITE_COOK_ACCESS_CODE || 'CUISIN_2025';

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Rediriger vers la page d'accueil
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      showError('Erreur lors de la déconnexion');
    }
  };

  // Form states for employee menus
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuPhotoUrl, setMenuPhotoUrl] = useState('');
  const [menuAvailable, setMenuAvailable] = useState(true);
  const [menuAccompaniments, setMenuAccompaniments] = useState('');

  // Form states for patient menus
  const [patientMenuName, setPatientMenuName] = useState('');
  const [patientMenuDescription, setPatientMenuDescription] = useState('');
  const [patientMenuPhotoUrl, setPatientMenuPhotoUrl] = useState('');
  const [patientMenuDietaryRestriction, setPatientMenuDietaryRestriction] = useState<DietaryRestriction>('Normal');
  const [patientMenuMealType, setPatientMenuMealType] = useState<PatientMealType>('Déjeuner');
  const [patientMenuDayOfWeek, setPatientMenuDayOfWeek] = useState<DayOfWeek>('Lundi');
  const [patientMenuCalories, setPatientMenuCalories] = useState('');
  const [patientMenuProtein, setPatientMenuProtein] = useState('');
  const [patientMenuCarbs, setPatientMenuCarbs] = useState('');
  const [patientMenuFat, setPatientMenuFat] = useState('');
  const [patientMenuFiber, setPatientMenuFiber] = useState('');
  const [patientMenuAvailable, setPatientMenuAvailable] = useState(true);

  useEffect(() => {
    fetchData();
    // Demander le code à chaque accès (pas de persistance)
    setHasAccess(false);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les commandes patients avec informations des patients (gestion d'erreur gracieuse)
      try {
        const { data: patientOrdersData, error: patientOrdersError } = await supabase
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
        
        if (patientOrdersError) {
          console.warn('Table orders non disponible:', patientOrdersError);
          setPatientOrders([]);
        } else {
          console.log('Commandes patients chargées:', patientOrdersData);
          setPatientOrders(patientOrdersData as Order[]);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des commandes patients:', error);
        setPatientOrders([]);
      }

      // Récupérer les commandes employés avec les informations du menu (sans jointure profiles)
      try {
        const { data: employeeOrdersData, error: employeeOrdersError } = await supabase
          .from('employee_orders')
          .select('*, employee_menus(name, description, price)')
          .order('created_at', { ascending: false });
        
        if (employeeOrdersError) {
          console.warn('Table employee_orders non disponible:', employeeOrdersError);
          setEmployeeOrders([]);
        } else {
          console.log('Commandes employés chargées:', employeeOrdersData);
          setEmployeeOrders(employeeOrdersData as EmployeeOrder[]);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des commandes employés:', error);
        setEmployeeOrders([]);
      }

      // Récupérer les menus employés (gestion d'erreur gracieuse)
      try {
        const { data: menusData, error: menusError } = await supabase
          .from('employee_menus')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (menusError) {
          console.warn('Table employee_menus non disponible:', menusError);
          setEmployeeMenus([]);
        } else {
          console.log('Menus employés chargés:', menusData);
          setEmployeeMenus(menusData as EmployeeMenu[]);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des menus employés:', error);
        setEmployeeMenus([]);
      }

      // Récupérer les menus patients (gestion d'erreur gracieuse)
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
          setPatientMenus(patientMenusData || []);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des menus patients:', error);
        setPatientMenus([]);
      }

      // Charger les données de stock
      await fetchInventoryData();

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions de filtrage
  const getFilteredPatientOrders = () => {
    switch (activeFilter) {
      case 'patients':
        return patientOrders;
      case 'pending':
        return patientOrders.filter(order => order.status === 'En attente d\'approbation' || order.status === 'En préparation');
      case 'delivered':
        return patientOrders.filter(order => order.status === 'Prêt pour livraison' && isSameDay(new Date(order.created_at), new Date()));
      default:
        return patientOrders;
    }
  };

  const getFilteredEmployeeOrders = () => {
    switch (activeFilter) {
      case 'employees':
        return employeeOrders;
      case 'pending':
        return employeeOrders.filter(order => order.status === 'En attente d\'approbation' || order.status === 'En préparation');
      case 'delivered':
        return employeeOrders.filter(order => order.status === 'Prêt pour livraison' && isSameDay(new Date(order.created_at), new Date()));
      default:
        return employeeOrders;
    }
  };

  const handleFilterChange = (filter: 'all' | 'patients' | 'employees' | 'pending' | 'delivered') => {
    setActiveFilter(filter);
    // Changer automatiquement vers l'onglet Commandes pour voir les résultats du filtre
    setActiveTab('orders');
  };

  const handleClearFilter = () => {
    setActiveFilter('all');
    // Ne pas changer d'onglet, rester sur l'onglet actuel
  };

  // Fonctions de gestion de stock
  const fetchInventoryData = async () => {
    try {
      const { data, error } = await supabase
        .from('kitchen_inventory')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.warn('Table kitchen_inventory non disponible:', error);
        setInventoryItems([]);
      } else {
        setInventoryItems(data || []);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du stock:', error);
      setInventoryItems([]);
    }
  };

  const handleInventorySubmit = async () => {
    if (!newInventoryItem.name || !newInventoryItem.category) {
      showError('Veuillez remplir le nom et la catégorie');
      return;
    }

    try {
      const { error } = await supabase
        .from('kitchen_inventory')
        .insert([newInventoryItem]);

      if (error) throw error;

      showSuccess('Article ajouté au stock avec succès');
      setNewInventoryItem({
        name: '',
        category: '',
        current_stock: 0,
        min_stock: 0,
        unit: '',
        supplier: '',
        cost_per_unit: 0,
        expiry_date: '',
        notes: ''
      });
      setIsInventoryModalOpen(false);
      fetchInventoryData();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article:', error);
      showError('Erreur lors de l\'ajout de l\'article');
    }
  };

  const handleInventoryUpdate = async () => {
    if (!editingInventoryItem) return;

    try {
      const { error } = await supabase
        .from('kitchen_inventory')
        .update(editingInventoryItem)
        .eq('id', editingInventoryItem.id);

      if (error) throw error;

      showSuccess('Article mis à jour avec succès');
      setIsEditInventoryModalOpen(false);
      setEditingInventoryItem(null);
      fetchInventoryData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showError('Erreur lors de la mise à jour');
    }
  };

  const handleInventoryDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('kitchen_inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      showSuccess('Article supprimé avec succès');
      fetchInventoryData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur lors de la suppression');
    }
  };

  const updateInventoryStock = async (itemId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('kitchen_inventory')
        .update({ current_stock: newStock })
        .eq('id', itemId);

      if (error) throw error;

      // Trouver l'article mis à jour pour vérifier le stock
      const updatedItem = inventoryItems.find(item => item.id === itemId);
      if (updatedItem) {
        const item = { ...updatedItem, current_stock: newStock };
        
        // Afficher une alerte si le stock atteint le minimum
        if (newStock <= item.min_stock) {
          showError(`⚠️ ALERTE STOCK BAS: ${item.name} - Stock: ${newStock} ${item.unit} (Min: ${item.min_stock} ${item.unit})`);
        } else if (newStock <= item.min_stock * 1.5) {
          showError(`⚡ ATTENTION: ${item.name} approche du stock minimal - Stock: ${newStock} ${item.unit}`);
        } else {
          showSuccess(`Stock mis à jour: ${item.name} - ${newStock} ${item.unit}`);
        }
      }

      fetchInventoryData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      showError('Erreur lors de la mise à jour du stock');
    }
  };

  const handleMenuSubmit = async () => {
    if (!menuName || !menuPrice || !menuAccompaniments.trim()) {
      showError('Veuillez remplir le nom, le prix et les accompagnements');
      return;
    }

    try {
      let finalPhotoUrl = menuPhotoUrl;
      
      // Vérifier si un fichier a été sélectionné
      const selectedFile = (window as any).selectedMenuFile;
      if (selectedFile) {
        // TEMPORAIRE: Désactiver l'upload de fichiers en raison de problèmes de configuration
        alert("L'upload de fichiers est temporairement désactivé. Veuillez utiliser une URL d'image.");
        return;
        
        /* Code d'upload désactivé temporairement
        const file = selectedFile;
        const filePath = `public/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('menu_media').upload(filePath, file, {
          contentType: file.type
        });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('menu_media').getPublicUrl(filePath);
        finalPhotoUrl = urlData.publicUrl;
        */
      }

      const descriptionCombined = menuAccompaniments
        ? (menuDescription ? `${menuDescription}\nAccompagnements: ${menuAccompaniments}` : `Accompagnements: ${menuAccompaniments}`)
        : menuDescription;
      const { error } = await supabase
        .from('employee_menus')
        .insert([{
          name: menuName,
          description: descriptionCombined || '',
          price: parseFloat(menuPrice),
          photo_url: finalPhotoUrl,
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
    if (!editingMenu || !menuName || !menuPrice || !menuAccompaniments.trim()) {
      showError('Veuillez remplir le nom, le prix et les accompagnements');
      return;
    }

    try {
      let finalPhotoUrl = menuPhotoUrl;
      
      // Vérifier si un fichier a été sélectionné
      const selectedFile = (window as any).selectedMenuFile;
      if (selectedFile) {
        // TEMPORAIRE: Désactiver l'upload de fichiers en raison de problèmes de configuration
        alert("L'upload de fichiers est temporairement désactivé. Veuillez utiliser une URL d'image.");
        return;
        
        /* Code d'upload désactivé temporairement
        const file = selectedFile;
        const filePath = `public/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('menu_media').upload(filePath, file, {
          contentType: file.type
        });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('menu_media').getPublicUrl(filePath);
        finalPhotoUrl = urlData.publicUrl;
        */
      }

      const descriptionCombined = menuAccompaniments
        ? (menuDescription ? `${menuDescription}\nAccompagnements: ${menuAccompaniments}` : `Accompagnements: ${menuAccompaniments}`)
        : menuDescription;
      const { error } = await supabase
        .from('employee_menus')
        .update({
          name: menuName,
          description: descriptionCombined || '',
          price: parseFloat(menuPrice),
          photo_url: finalPhotoUrl,
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
    setMenuAccompaniments('');
    setMenuPrice('');
    setMenuPhotoUrl('');
    setMenuAvailable(true);
  };

  const openEditModal = (menu: EmployeeMenu) => {
    setEditingMenu(menu);
    // Extraire les accompagnements depuis la description existante si présents
    const desc = menu.description || '';
    const match = desc.match(/Accompagnements:\s*(.*)$/m);
    const accomp = match ? match[1].trim() : '';
    const baseDesc = match ? desc.replace(/\n?Accompagnements:\s*.*$/m, '').trim() : desc;

    setMenuName(menu.name);
    setMenuDescription(baseDesc);
    setMenuAccompaniments(accomp);
    setMenuPrice(menu.price.toString());
    setMenuPhotoUrl(menu.photo_url || '');
    setMenuAvailable(menu.is_available);
    setIsEditMenuModalOpen(true);
  };

  // Fonctions pour les menus patients
  const handlePatientMenuSubmit = async () => {
    if (!patientMenuName || !patientMenuDescription) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('patient_menus')
        .insert([{
          name: patientMenuName,
          description: patientMenuDescription,
          price: 0,
          photo_url: patientMenuPhotoUrl,
          dietary_restriction: patientMenuDietaryRestriction,
          meal_type: patientMenuMealType,
          day_of_week: patientMenuDayOfWeek,
          calories: patientMenuCalories ? parseInt(patientMenuCalories) : null,
          protein_g: patientMenuProtein ? parseFloat(patientMenuProtein) : null,
          carbs_g: patientMenuCarbs ? parseFloat(patientMenuCarbs) : null,
          fat_g: patientMenuFat ? parseFloat(patientMenuFat) : null,
          fiber_g: patientMenuFiber ? parseFloat(patientMenuFiber) : null,
          is_available: patientMenuAvailable
        }]);

      if (error) throw error;

      showSuccess('Menu patient ajouté avec succès');
      resetPatientMenuForm();
      setIsPatientMenuModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du menu patient:', error);
      showError('Impossible d\'ajouter le menu patient');
    }
  };

  const handlePatientMenuUpdate = async () => {
    if (!editingPatientMenu || !patientMenuName || !patientMenuDescription) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('patient_menus')
        .update({
          name: patientMenuName,
          description: patientMenuDescription,
          price: 0,
          photo_url: patientMenuPhotoUrl,
          dietary_restriction: patientMenuDietaryRestriction,
          meal_type: patientMenuMealType,
          day_of_week: patientMenuDayOfWeek,
          calories: patientMenuCalories ? parseInt(patientMenuCalories) : null,
          protein_g: patientMenuProtein ? parseFloat(patientMenuProtein) : null,
          carbs_g: patientMenuCarbs ? parseFloat(patientMenuCarbs) : null,
          fat_g: patientMenuFat ? parseFloat(patientMenuFat) : null,
          fiber_g: patientMenuFiber ? parseFloat(patientMenuFiber) : null,
          is_available: patientMenuAvailable
        })
        .eq('id', editingPatientMenu.id);

      if (error) throw error;

      showSuccess('Menu patient mis à jour avec succès');
      resetPatientMenuForm();
      setIsEditPatientMenuModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du menu patient:', error);
      showError('Impossible de mettre à jour le menu patient');
    }
  };

  const handlePatientMenuDelete = async (menuId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce menu patient ?')) return;

    try {
      const { error } = await supabase
        .from('patient_menus')
        .delete()
        .eq('id', menuId);

      if (error) throw error;

      showSuccess('Menu patient supprimé avec succès');
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression du menu patient:', error);
      showError('Impossible de supprimer le menu patient');
    }
  };

  const resetPatientMenuForm = () => {
    setPatientMenuName('');
    setPatientMenuDescription('');
    setPatientMenuPhotoUrl('');
    setPatientMenuDietaryRestriction('Normal');
    setPatientMenuMealType('Déjeuner');
    setPatientMenuDayOfWeek('Lundi');
    setPatientMenuCalories('');
    setPatientMenuProtein('');
    setPatientMenuCarbs('');
    setPatientMenuFat('');
    setPatientMenuFiber('');
    setPatientMenuAvailable(true);
  };

  const openEditPatientMenuModal = (menu: PatientMenu) => {
    setEditingPatientMenu(menu);
    setPatientMenuName(menu.name);
    setPatientMenuDescription(menu.description);
    // Prix non utilisé (menus patients gratuits)
    setPatientMenuPhotoUrl(menu.photo_url || '');
    setPatientMenuDietaryRestriction(menu.dietary_restriction);
    setPatientMenuMealType(menu.meal_type);
    setPatientMenuDayOfWeek(menu.day_of_week);
    setPatientMenuCalories(menu.calories?.toString() || '');
    setPatientMenuProtein(menu.protein_g?.toString() || '');
    setPatientMenuCarbs(menu.carbs_g?.toString() || '');
    setPatientMenuFat(menu.fat_g?.toString() || '');
    setPatientMenuFiber(menu.fiber_g?.toString() || '');
    setPatientMenuAvailable(menu.is_available);
    setIsEditPatientMenuModalOpen(true);
  };

  // Fonctions de gestion des commandes
  const handleDeleteOrder = (type: 'patient' | 'employee', order: Order | EmployeeOrder) => {
    setDeletingOrder({ type, order });
    setIsDeleteOrderModalOpen(true);
  };

  const handleConfirmDeleteOrder = async () => {
    if (!deletingOrder) return;

    try {
      if (deletingOrder.type === 'patient') {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', deletingOrder.order.id);

        if (error) throw error;
        showSuccess('Commande patient supprimée avec succès');
      } else {
        const { error } = await supabase
          .from('employee_orders')
          .delete()
          .eq('id', deletingOrder.order.id);

        if (error) throw error;
        showSuccess('Commande employé supprimée avec succès');
      }

      setIsDeleteOrderModalOpen(false);
      setDeletingOrder(null);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      showError('Impossible de supprimer la commande');
    }
  };

  const pendingPatientOrders = patientOrders.filter(order => order.status === 'En attente d\'approbation');
  const pendingEmployeeOrders = employeeOrders.filter(order => order.status === 'Commandé');
  const todayPatientOrders = patientOrders.filter(order => 
    isSameDay(new Date((order as any).date || order.created_at || ''), new Date())
  );
  const todayEmployeeOrders = employeeOrders.filter(order => 
    isSameDay(new Date(order.created_at || ''), new Date())
  );

  // Données pour les graphiques (section visuelle)
  const statusCounts = [
    { name: 'En attente', value: patientOrders.filter(o => o.status === "En attente d'approbation").length + employeeOrders.filter(o => o.status === 'Commandé').length },
    { name: 'En préparation', value: patientOrders.filter(o => o.status === 'En préparation').length + employeeOrders.filter(o => o.status === 'En préparation').length },
    { name: 'Livré', value: patientOrders.filter(o => o.status === 'Livré').length + employeeOrders.filter(o => o.status === 'Livré').length },
  ];
  const todaySplit = [
    { name: 'Patients', value: todayPatientOrders.length },
    { name: 'Employés', value: todayEmployeeOrders.length },
  ];
  const COLORS = ['#f97316', '#10b981', '#3b82f6'];

  // Export PDF cuisine (avec logo et tableau patients + employés)
  const fetchImageAsDataUrl = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const svgText = await response.text();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const urlCreator = URL.createObjectURL(svgBlob);
      const img = new Image();
      const dataUrl: string = await new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 2;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas context not available')); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngDataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(urlCreator);
          resolve(pngDataUrl);
        };
        img.onerror = (e) => reject(e);
        img.src = urlCreator;
      });
      return dataUrl;
    } catch (e) {
      console.warn('Logo non chargé pour PDF:', e);
      return null;
    }
  };

  const exportDailyReportPDF = async () => {
    const doc = new jsPDF();
    
    // Créer l'en-tête
    await createPDFHeader(doc, 'Rapport Journalier - Portail Cuisinier', '');
    
    let yPosition = 50;
    
    // Résumé du jour
    const totalPending = pendingPatientOrders.length + pendingEmployeeOrders.length;
    const totalToday = todayPatientOrders.length + todayEmployeeOrders.length;
    const totalRevenue = employeeOrders
      .filter(o => isSameDay(new Date(o.created_at || ''), new Date()))
      .reduce((s, o) => s + (o.total_price || 0), 0);
    
    // Calculer les statistiques de plats
    const totalOrderedDishes = todayPatientOrders.length + todayEmployeeOrders.reduce((sum, order) => sum + order.quantity, 0);
    const totalDeliveredDishes = todayPatientOrders.filter(o => o.status === 'Livré').length + 
                                 todayEmployeeOrders.filter(o => o.status === 'Livré').reduce((sum, order) => sum + order.quantity, 0);
    
    const summaryData = [
      { label: 'En attente', value: totalPending },
      { label: 'Commandes aujourd\'hui', value: totalToday },
      { label: 'Total plats commandés', value: totalOrderedDishes },
      { label: 'Total plats livrés', value: totalDeliveredDishes },
      { label: 'Total recette', value: `${totalRevenue.toLocaleString('fr-FR').replace(/\s/g, ' ')} XAF` }
    ];
    yPosition = createSummarySection(doc, yPosition, 'RÉSUMÉ DU JOUR', summaryData);
    
    // Tableau Patients (aujourd'hui)
    const patientRows = todayPatientOrders.map(o => [
      o.patients?.name || 'N/A',
      o.patients?.room || 'N/A',
      o.meal_type || 'N/A',
      o.menu || 'N/A',
      o.status || 'N/A',
      (o.created_at || o.date || '').toString().replace('T', ' ').substring(0, 16)
    ]);
    yPosition = createTable(doc, yPosition, 'COMMANDES PATIENTS', 
      ['Patient', 'Chambre', 'Repas', 'Menu', 'Statut', 'Heure'], patientRows, LOGO_COLORS.green);
    
    // Tableau Employés (aujourd'hui)
    const employeeRows = todayEmployeeOrders.map(o => [
      o.employee_name || 'N/A',
      o.employee_menus?.name || 'N/A',
      o.quantity.toString(),
      o.status || 'N/A',
      (o.created_at || '').toString().replace('T', ' ').substring(0, 16),
      `${(o.total_price || 0).toLocaleString('fr-FR').replace(/\s/g, ' ')} XAF`
    ]);
    yPosition = createTable(doc, yPosition, 'COMMANDES EMPLOYÉS', 
      ['Employé', 'Menu', 'Quantité', 'Statut', 'Heure', 'Total'], employeeRows, LOGO_COLORS.blue);
    
    // Pied de page
    createPDFFooter(doc);
    
    // Télécharger le PDF
    doc.save(`rapport-cuisine-${new Date().toISOString().slice(0,10)}.pdf`);
  };

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

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-bold text-orange-700 mb-2">Portail Cuisinier</h1>
          <p className="text-sm text-gray-600 mb-4">Saisissez le code d'accès pour continuer.</p>
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Code d'accès"
            className="w-full border rounded-md px-3 py-2 mb-4"
            aria-label="Code d'accès cuisinier"
          />
          <button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-md py-2"
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="/logo-centre-diagnostic-official.svg" 
                alt="Centre Diagnostic" 
                className="h-8 w-auto mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#5ac2ec' }}>Portail Cuisinier</h1>
                <p className="text-sm text-gray-600">Gestion des commandes et menus</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
      
      {/* Statistiques rapides */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-end space-x-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Commandes en attente</p>
            <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{pendingPatientOrders.length + pendingEmployeeOrders.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Commandes aujourd'hui</p>
            <p className="text-2xl font-bold" style={{ color: '#41b8ac' }}>{todayPatientOrders.length + todayEmployeeOrders.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className={`text-white cursor-pointer hover:shadow-lg transition-shadow ${activeFilter === 'patients' ? 'ring-4' : ''}`}
            style={{ 
              background: 'linear-gradient(to right, #5ac2ec, #4fb3d9)',
              ringColor: activeFilter === 'patients' ? '#5ac2ec' : undefined
            }}
            onClick={() => handleFilterChange('patients')}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUsers} className="text-3xl mr-4" />
                <div>
                  <p className="text-blue-100">Commandes Patients</p>
                  <p className="text-3xl font-bold">{patientOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`text-white cursor-pointer hover:shadow-lg transition-shadow ${activeFilter === 'employees' ? 'ring-4' : ''}`}
            style={{ 
              background: 'linear-gradient(to right, #41b8ac, #3aa89c)',
              ringColor: activeFilter === 'employees' ? '#41b8ac' : undefined
            }}
            onClick={() => handleFilterChange('employees')}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUtensils} className="text-3xl mr-4" />
                <div>
                  <p className="text-green-100">Commandes Employés</p>
                  <p className="text-3xl font-bold">{employeeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`text-white cursor-pointer hover:shadow-lg transition-shadow ${activeFilter === 'pending' ? 'ring-4' : ''}`}
            style={{ 
              background: 'linear-gradient(to right, #dc2626, #ef4444)',
              ringColor: activeFilter === 'pending' ? '#dc2626' : undefined
            }}
            onClick={() => handleFilterChange('pending')}
          >
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

          <Card 
            className={`text-white cursor-pointer hover:shadow-lg transition-shadow ${activeFilter === 'delivered' ? 'ring-4' : ''}`}
            style={{ 
              background: 'linear-gradient(to right, #41b8ac, #3aa89c)',
              ringColor: activeFilter === 'delivered' ? '#41b8ac' : undefined
            }}
            onClick={() => handleFilterChange('delivered')}
          >
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

          {/* Carte d'alerte pour les stocks bas */}
          {inventoryItems.filter(item => item.current_stock <= item.min_stock).length > 0 && (
            <Card 
              className="text-white cursor-pointer hover:shadow-lg transition-shadow animate-pulse"
              style={{ background: 'linear-gradient(to right, #dc2626, #ef4444)' }}
              onClick={() => setActiveTab('inventory')}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl mr-4 animate-bounce" />
                  <div>
                    <p className="text-red-100">⚠️ ALERTE STOCK BAS</p>
                    <p className="text-3xl font-bold">{inventoryItems.filter(item => item.current_stock <= item.min_stock).length}</p>
                    <p className="text-sm text-red-200">Articles critiques</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Indicateur de filtre actif */}
        {activeFilter !== 'all' && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Filtre actif: {
                  activeFilter === 'patients' ? 'Commandes Patients' :
                  activeFilter === 'employees' ? 'Commandes Employés' :
                  activeFilter === 'pending' ? 'Commandes en Attente' :
                  activeFilter === 'delivered' ? 'Commandes Livrées Aujourd\'hui' :
                  'Toutes les commandes'
                }
              </Badge>
              <Button 
                variant="outline" 
                onClick={handleClearFilter}
                className="text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Effacer le filtre
              </Button>
            </div>
          </div>
        )}

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="menus">Menus Employés</TabsTrigger>
            <TabsTrigger value="patient-menus">Menus Patients</TabsTrigger>
            <TabsTrigger value="inventory">Gestion Stock</TabsTrigger>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          </TabsList>

          {/* Onglet Commandes */}
          <TabsContent value="orders" className="space-y-6" data-tab="orders">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Commandes Patients - Affichage conditionnel */}
              {(activeFilter === 'all' || activeFilter === 'patients' || activeFilter === 'pending' || activeFilter === 'delivered') && (
                <Card data-section="patient-orders">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FontAwesomeIcon icon={faUsers} className="mr-2" style={{ color: '#5ac2ec' }} />
                      Commandes Patients
                      {activeFilter !== 'all' && (
                        <Badge variant="outline" className="ml-2">
                          {getFilteredPatientOrders().length} résultat(s)
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredPatientOrders().slice(0, 10).map(order => (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => {
                          // Action par défaut : mettre à jour le statut si possible
                          if (order.status === 'En attente d\'approbation') {
                            updateOrderStatus(order.id, 'En préparation');
                          } else if (order.status === 'En préparation') {
                            updateOrderStatus(order.id, 'Livré');
                          }
                        }}
                      >
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
                            <p className="font-medium">Commande #{patientOrders.indexOf(order) + 1}</p>
                            <p className="text-sm text-gray-600">
                              {order.patients?.name || 'Patient inconnu'} - Chambre {order.patients?.room || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">{order.meal_type} - {order.menu}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge 
                            style={{
                              backgroundColor: order.status === 'Livré' ? '#41b8ac' :
                                             order.status === 'En préparation' ? '#eab308' :
                                             '#dc2626',
                              color: 'white'
                            }}
                          >
                            {order.status}
                          </Badge>
                          <div className="flex space-x-2">
                            {order.status === 'En attente d\'approbation' && (
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOrderStatus(order.id, 'En préparation');
                                }}
                              >
                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                Préparer
                              </Button>
                            )}
                            {order.status === 'En préparation' && (
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOrderStatus(order.id, 'Livré');
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                Livré
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder('patient', order);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Commandes Employés - Affichage conditionnel */}
              {(activeFilter === 'all' || activeFilter === 'employees' || activeFilter === 'pending' || activeFilter === 'delivered') && (
                <Card data-section="employee-orders">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FontAwesomeIcon icon={faUtensils} className="mr-2 text-green-600" />
                      Commandes Employés
                      {activeFilter !== 'all' && (
                        <Badge variant="outline" className="ml-2">
                          {getFilteredEmployeeOrders().length} résultat(s)
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredEmployeeOrders().slice(0, 10).map(order => (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => {
                          // Action par défaut : mettre à jour le statut si possible
                          if (order.status === 'Commandé') {
                            updateOrderStatus(order.id, 'En préparation', true);
                          } else if (order.status === 'En préparation') {
                            updateOrderStatus(order.id, 'Livré', true);
                          }
                        }}
                      >
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
                            <p className="font-medium">Commande #{employeeOrders.indexOf(order) + 1}</p>
                            <p className="text-sm text-gray-600">
                              {order.employee_name || ((order as any).profiles ? `${(order as any).profiles.first_name || ''} ${(order as any).profiles.last_name || ''}`.trim() : `Employé ${employeeOrders.indexOf(order) + 1}`)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.employee_menus?.name || 'Menu inconnu'} • {order.quantity} plat(s)
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.delivery_location} • {order.total_price.toLocaleString('fr-FR')} XAF
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge 
                            style={{
                              backgroundColor: order.status === 'Livré' ? '#41b8ac' :
                                             order.status === 'En préparation' ? '#eab308' :
                                             '#dc2626',
                              color: 'white'
                            }}
                          >
                            {order.status}
                          </Badge>
                          <div className="flex space-x-2">
                            {order.status === 'Commandé' && (
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOrderStatus(order.id, 'En préparation', true);
                                }}
                              >
                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                Préparer
                              </Button>
                            )}
                            {order.status === 'En préparation' && (
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOrderStatus(order.id, 'Livré', true);
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                Livré
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder('employee', order);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              )}
            </div>
          </TabsContent>

          {/* Onglet Menus Employés */}
          <TabsContent value="menus" className="space-y-6">
            {/* Indicateur de filtre actif */}
            {activeFilter !== 'all' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faClipboardList} style={{ color: '#5ac2ec' }} />
                    <span className="text-blue-800 dark:text-blue-200 font-medium">
                      Filtre actif: {
                        activeFilter === 'patients' ? 'Commandes Patients' :
                        activeFilter === 'employees' ? 'Commandes Employés' :
                        activeFilter === 'pending' ? 'Commandes en Attente' :
                        activeFilter === 'delivered' ? 'Commandes Livrées Aujourd\'hui' :
                        'Toutes les commandes'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('orders')}
                      style={{ color: '#5ac2ec', borderColor: '#5ac2ec' }}
                      className="hover:bg-blue-50"
                    >
                      Voir les résultats
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearFilter}
                      className="text-gray-600"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-1" />
                      Effacer
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faUtensils} className="mr-2 text-orange-600" />
                    Menus Employés
                  </span>
                  <Button 
                    onClick={() => setIsMenuModalOpen(true)}
                    style={{ backgroundColor: '#5ac2ec', borderColor: '#5ac2ec' }}
                    className="hover:bg-blue-600"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Ajouter un menu
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employeeMenus.map(menu => (
                    <div 
                      key={menu.id} 
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer hover:border-orange-300"
                      onClick={() => openEditModal(menu)}
                    >
                      {menu.photo_url ? (
                        <img 
                          src={menu.photo_url} 
                          alt={menu.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          onError={(e) => {
                            console.warn('Erreur de chargement de l\'image du menu:', menu.name, e);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-32 rounded-lg flex items-center justify-center mb-3 ${menu.photo_url ? 'hidden' : ''}`} style={{ backgroundColor: '#fef3c7' }}>
                        <FontAwesomeIcon icon={faUtensils} className="text-2xl" style={{ color: '#d97706' }} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{menu.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{menu.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" style={{ backgroundColor: '#fef3c7', color: '#d97706', borderColor: '#fbbf24' }}>
                          {menu.price.toLocaleString('fr-FR')} XAF
                        </Badge>
                        <Badge 
                          style={{
                            backgroundColor: menu.is_available ? '#41b8ac' : '#6b7280',
                            color: 'white'
                          }}
                        >
                          {menu.is_available ? 'Disponible' : 'Indisponible'}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(menu);
                          }}
                          className="flex-1"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuDelete(menu.id);
                          }}
                          title="Supprimer le menu"
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

          {/* Onglet Menus Patients */}
          <TabsContent value="patient-menus" className="space-y-6">
            {/* Indicateur de filtre actif */}
            {activeFilter !== 'all' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faClipboardList} style={{ color: '#5ac2ec' }} />
                    <span className="text-blue-800 dark:text-blue-200 font-medium">
                      Filtre actif: {
                        activeFilter === 'patients' ? 'Commandes Patients' :
                        activeFilter === 'employees' ? 'Commandes Employés' :
                        activeFilter === 'pending' ? 'Commandes en Attente' :
                        activeFilter === 'delivered' ? 'Commandes Livrées Aujourd\'hui' :
                        'Toutes les commandes'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('orders')}
                      style={{ color: '#5ac2ec', borderColor: '#5ac2ec' }}
                      className="hover:bg-blue-50"
                    >
                      Voir les résultats
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearFilter}
                      className="text-gray-600"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-1" />
                      Effacer
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faUtensils} className="text-green-600" />
                    <span>Menus Patients</span>
                  </div>
                  <Button onClick={() => setIsPatientMenuModalOpen(true)}>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Ajouter un menu
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Filtres */}
                  <div className="flex flex-wrap gap-2">
                    <Select value={patientMenuDietaryRestriction} onValueChange={(value: DietaryRestriction) => setPatientMenuDietaryRestriction(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrer par régime" />
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

                  {/* Affichage par jour de la semaine */}
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => {
                    const dayMenus = patientMenus.filter(menu => 
                      menu.day_of_week === day && 
                      (patientMenuDietaryRestriction === 'Normal' || menu.dietary_restriction === patientMenuDietaryRestriction)
                    );
                    
                    if (dayMenus.length === 0) return null;
                    
                    return (
                      <div key={day} className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#5ac2ec' }}>{day}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {dayMenus.map((menu) => (
                            <div key={menu.id} className="border rounded-lg p-4 bg-gray-50">
                              {/* Image du menu */}
                              <div className="mb-3">
                                {menu.photo_url ? (
                                  <img 
                                    src={menu.photo_url} 
                                    alt={menu.name}
                                    className="w-full h-32 object-cover rounded-lg"
                                    onError={(e) => {
                                      console.warn('Erreur de chargement de l\'image du menu:', menu.name, e);
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-32 rounded-lg flex items-center justify-center ${menu.photo_url ? 'hidden' : ''}`} style={{ backgroundColor: '#f0fdf4' }}>
                                  <FontAwesomeIcon icon={faUtensils} className="text-2xl" style={{ color: '#41b8ac' }} />
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-sm">{menu.name}</h4>
                                <Badge 
                                  className="text-xs"
                                  style={{
                                    backgroundColor: menu.is_available ? '#41b8ac' : '#6b7280',
                                    color: 'white'
                                  }}
                                >
                                  {menu.is_available ? 'Disponible' : 'Indisponible'}
                                </Badge>
                              </div>
                              <div className="space-y-1 mb-3">
                                <p className="text-xs text-gray-600">{menu.description}</p>
                                <div className="flex justify-between text-xs">
                                  <span className="font-medium" style={{ color: '#5ac2ec' }}>{menu.dietary_restriction}</span>
                                  <span className="font-medium text-green-600">{menu.meal_type}</span>
                                </div>
                                {/* Prix supprimé car menus patients gratuits */}
                                {menu.calories && (
                                  <div className="text-xs text-gray-500">
                                    {menu.calories} cal • {menu.protein_g}g protéines • {menu.carbs_g}g glucides
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => openEditPatientMenuModal(menu)}
                                  className="flex-1 text-xs"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                  Modifier
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handlePatientMenuDelete(menu.id)}
                                  title="Supprimer le menu patient"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {patientMenus.length === 0 && (
                  <div className="text-center py-8">
                    <FontAwesomeIcon icon={faUtensils} className="text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500">Aucun menu patient disponible</p>
                    <Button 
                      onClick={() => setIsPatientMenuModalOpen(true)}
                      className="mt-4"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Ajouter le premier menu
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {/* Indicateur de filtre actif */}
            {activeFilter !== 'all' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faClipboardList} style={{ color: '#5ac2ec' }} />
                    <span className="text-blue-800 dark:text-blue-200 font-medium">
                      Filtre actif: {
                        activeFilter === 'patients' ? 'Commandes Patients' :
                        activeFilter === 'employees' ? 'Commandes Employés' :
                        activeFilter === 'pending' ? 'Commandes en Attente' :
                        activeFilter === 'delivered' ? 'Commandes Livrées Aujourd\'hui' :
                        'Toutes les commandes'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('orders')}
                      style={{ color: '#5ac2ec', borderColor: '#5ac2ec' }}
                      className="hover:bg-blue-50"
                    >
                      Voir les résultats
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearFilter}
                      className="text-gray-600"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-1" />
                      Effacer
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commandes par Statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusCounts}>
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#f97316" name="Commandes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rapport Journalier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>Patients (aujourd'hui)</span><Badge variant="outline">{todayPatientOrders.length}</Badge></div>
                    <div className="flex justify-between"><span>Employés (aujourd'hui)</span><Badge variant="outline">{todayEmployeeOrders.length}</Badge></div>
                    <div className="flex justify-between"><span>Total (aujourd'hui)</span><Badge variant="default">{todayPatientOrders.length + todayEmployeeOrders.length}</Badge></div>
                    <div className="flex justify-between"><span>Recettes employés (aujourd'hui)</span><span className="font-semibold">{employeeOrders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((s, o) => s + (o.total_price || 0), 0).toLocaleString('fr-FR')} XAF</span></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={todaySplit} dataKey="value" nameKey="name" outerRadius={60} label>
                            {todaySplit.map((entry, index) => (
                              <Cell key={`slice-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-start gap-2">
                      <Button size="sm" variant="outline" onClick={exportDailyReportCSV}>
                        Exporter CSV
                      </Button>
                      <Button size="sm" onClick={exportDailyReportPDF}>
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Exporter PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Gestion de Stock */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faWarehouse} className="mr-2" style={{ color: '#5ac2ec' }} />
                    Gestion de Stock de la Cuisine
                  </span>
                  <Button 
                    onClick={() => setIsInventoryModalOpen(true)}
                    style={{ backgroundColor: '#5ac2ec', borderColor: '#5ac2ec' }}
                    className="hover:bg-blue-600"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Ajouter un article
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Section d'alertes de stock */}
                {inventoryItems.filter(item => item.current_stock <= item.min_stock).length > 0 && (
                  <div className="mb-6 p-4 border-l-4 rounded-lg" style={{ backgroundColor: '#fef2f2', borderLeftColor: '#dc2626' }}>
                    <div className="flex items-center mb-3">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl mr-3" style={{ color: '#dc2626' }} />
                      <h3 className="text-lg font-semibold" style={{ color: '#dc2626' }}>
                        ⚠️ Alertes de Stock Minimal
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inventoryItems
                        .filter(item => item.current_stock <= item.min_stock)
                        .map((item) => (
                          <div 
                            key={item.id}
                            className="bg-white p-3 rounded-lg border shadow-sm"
                            style={{ borderColor: '#fecaca' }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold" style={{ color: '#dc2626' }}>{item.name}</h4>
                                <p className="text-sm" style={{ color: '#dc2626' }}>
                                  Stock: <span className="font-bold">{item.current_stock}</span> {item.unit} 
                                  (Min: {item.min_stock} {item.unit})
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="destructive" className="mb-2">
                                  Stock Bas
                                </Badge>
                                <div className="flex items-center space-x-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateInventoryStock(item.id, item.current_stock + 1)}
                                    className="hover:bg-green-50"
                                    style={{ color: '#41b8ac', borderColor: '#41b8ac' }}
                                  >
                                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingInventoryItem(item);
                                      setIsEditInventoryModalOpen(true);
                                    }}
                                    className="hover:bg-blue-50"
                                    style={{ color: '#5ac2ec', borderColor: '#5ac2ec' }}
                                  >
                                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="mt-3 text-sm" style={{ color: '#dc2626' }}>
                      <FontAwesomeIcon icon={faBell} className="mr-2" />
                      <strong>Action requise :</strong> Réapprovisionner ces articles pour éviter les ruptures de stock.
                    </div>
                  </div>
                )}

                {/* Section d'alertes de stock moyen */}
                {inventoryItems.filter(item => item.current_stock > item.min_stock && item.current_stock <= item.min_stock * 1.5).length > 0 && (
                  <div className="mb-6 p-4 border-l-4 rounded-lg" style={{ backgroundColor: '#fefce8', borderLeftColor: '#eab308' }}>
                    <div className="flex items-center mb-3">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl mr-3" style={{ color: '#eab308' }} />
                      <h3 className="text-lg font-semibold" style={{ color: '#a16207' }}>
                        ⚡ Attention - Stock Moyen
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inventoryItems
                        .filter(item => item.current_stock > item.min_stock && item.current_stock <= item.min_stock * 1.5)
                        .map((item) => (
                          <div 
                            key={item.id}
                            className="bg-white p-3 rounded-lg border shadow-sm"
                            style={{ borderColor: '#fde68a' }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold" style={{ color: '#a16207' }}>{item.name}</h4>
                                <p className="text-sm" style={{ color: '#a16207' }}>
                                  Stock: <span className="font-bold">{item.current_stock}</span> {item.unit} 
                                  (Min: {item.min_stock} {item.unit})
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="secondary" className="mb-2" style={{ backgroundColor: '#fde68a', color: '#a16207' }}>
                                  Stock Moyen
                                </Badge>
                                <div className="flex items-center space-x-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateInventoryStock(item.id, item.current_stock + 1)}
                                    className="hover:bg-green-50"
                                    style={{ color: '#41b8ac', borderColor: '#41b8ac' }}
                                  >
                                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingInventoryItem(item);
                                      setIsEditInventoryModalOpen(true);
                                    }}
                                    className="hover:bg-blue-50"
                                    style={{ color: '#5ac2ec', borderColor: '#5ac2ec' }}
                                  >
                                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="mt-3 text-sm" style={{ color: '#a16207' }}>
                      <FontAwesomeIcon icon={faBell} className="mr-2" />
                      <strong>Surveillance :</strong> Ces articles approchent du stock minimal. Planifiez le réapprovisionnement.
                    </div>
                  </div>
                )}

                {/* Résumé des alertes */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mr-3" style={{ color: '#dc2626' }} />
                      <div>
                        <h4 className="font-semibold" style={{ color: '#dc2626' }}>Stock Bas</h4>
                        <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>
                          {inventoryItems.filter(item => item.current_stock <= item.min_stock).length}
                        </p>
                        <p className="text-sm" style={{ color: '#dc2626' }}>Articles critiques</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#fefce8', borderColor: '#fde68a' }}>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mr-3" style={{ color: '#eab308' }} />
                      <div>
                        <h4 className="font-semibold" style={{ color: '#a16207' }}>Stock Moyen</h4>
                        <p className="text-2xl font-bold" style={{ color: '#a16207' }}>
                          {inventoryItems.filter(item => item.current_stock > item.min_stock && item.current_stock <= item.min_stock * 1.5).length}
                        </p>
                        <p className="text-sm" style={{ color: '#a16207' }}>À surveiller</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-2xl mr-3" style={{ color: '#41b8ac' }} />
                      <div>
                        <h4 className="font-semibold" style={{ color: '#41b8ac' }}>Stock OK</h4>
                        <p className="text-2xl font-bold" style={{ color: '#41b8ac' }}>
                          {inventoryItems.filter(item => item.current_stock > item.min_stock * 1.5).length}
                        </p>
                        <p className="text-sm" style={{ color: '#41b8ac' }}>Articles suffisants</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventoryItems.map((item) => (
                    <Card 
                      key={item.id} 
                      className="border-l-4"
                      style={{
                        borderLeftColor: item.current_stock <= item.min_stock 
                          ? '#dc2626' 
                          : item.current_stock <= item.min_stock * 1.5 
                            ? '#eab308' 
                            : '#41b8ac',
                        backgroundColor: item.current_stock <= item.min_stock 
                          ? '#fef2f2' 
                          : item.current_stock <= item.min_stock * 1.5 
                            ? '#fefce8' 
                            : '#f0fdf4'
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <Badge 
                            style={{
                              backgroundColor: item.current_stock <= item.min_stock 
                                ? '#dc2626' 
                                : item.current_stock <= item.min_stock * 1.5 
                                  ? '#eab308' 
                                  : '#41b8ac',
                              color: 'white'
                            }}
                          >
                            {item.current_stock <= item.min_stock ? 'Stock bas' : 
                             item.current_stock <= item.min_stock * 1.5 ? 'Stock moyen' : 'Stock OK'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Catégorie:</span>
                            <span className="font-medium">{item.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stock actuel:</span>
                            <span className="font-medium">{item.current_stock} {item.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stock minimum:</span>
                            <span className="font-medium">{item.min_stock} {item.unit}</span>
                          </div>
                          {item.supplier && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fournisseur:</span>
                              <span className="font-medium">{item.supplier}</span>
                            </div>
                          )}
                          {item.cost_per_unit > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Prix unitaire:</span>
                              <span className="font-medium">{item.cost_per_unit.toLocaleString('fr-FR')} XAF</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateInventoryStock(item.id, item.current_stock - 1)}
                              disabled={item.current_stock <= 0}
                              style={{ color: '#dc2626', borderColor: '#dc2626' }}
                              className="hover:bg-red-50"
                            >
                              <FontAwesomeIcon icon={faMinus} className="mr-1" />
                            </Button>
                            <span className="font-medium">{item.current_stock}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateInventoryStock(item.id, item.current_stock + 1)}
                              style={{ color: '#41b8ac', borderColor: '#41b8ac' }}
                              className="hover:bg-green-50"
                            >
                              <FontAwesomeIcon icon={faPlus} className="mr-1" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingInventoryItem(item);
                                setIsEditInventoryModalOpen(true);
                              }}
                              style={{ color: '#5ac2ec', borderColor: '#5ac2ec' }}
                              className="hover:bg-blue-50"
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleInventoryDelete(item.id)}
                              style={{ color: '#dc2626', borderColor: '#dc2626' }}
                              className="hover:bg-red-50"
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {inventoryItems.length === 0 && (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faWarehouse} className="text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Aucun article en stock</p>
                    <p className="text-gray-400">Commencez par ajouter des articles à votre inventaire</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal d'ajout de menu */}
      <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau menu</DialogTitle>
            <DialogDescription>
              Créez un nouveau menu pour les employés
            </DialogDescription>
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
              <Label htmlFor="menu-description">Description (optionnel)</Label>
              <Textarea
                id="menu-description"
                placeholder="Description détaillée du menu..."
                value={menuDescription}
                onChange={(e) => setMenuDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="menu-accompaniments">Accompagnements (obligatoire)</Label>
              <Textarea
                id="menu-accompaniments"
                placeholder="Ex: Riz, Plantain, Frites..."
                value={menuAccompaniments}
                onChange={(e) => setMenuAccompaniments(e.target.value)}
                rows={2}
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
              <Label htmlFor="menu-photo">Photo du menu</Label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Sélectionner une image pour le menu"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Vérifier le type MIME du fichier
                      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                      if (!allowedTypes.includes(file.type)) {
                        alert('Format d\'image non supporté. Veuillez utiliser JPG, PNG ou GIF.');
                        e.target.value = '';
                        return;
                      }
                      // Stocker le fichier pour l'upload
                      (window as any).selectedMenuFile = file;
                    }
                  }}
                />
                <p className="text-sm text-gray-500">Ou utilisez une URL existante :</p>
                <Input
                  id="menu-photo"
                  placeholder="https://exemple.com/photo.jpg"
                  value={menuPhotoUrl}
                  onChange={(e) => setMenuPhotoUrl(e.target.value)}
                />
              </div>
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
            <DialogDescription>
              Modifiez les informations du menu sélectionné
            </DialogDescription>
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
              <Label htmlFor="edit-menu-description">Description (optionnel)</Label>
              <Textarea
                id="edit-menu-description"
                placeholder="Description détaillée du menu..."
                value={menuDescription}
                onChange={(e) => setMenuDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-menu-accompaniments">Accompagnements (obligatoire)</Label>
              <Textarea
                id="edit-menu-accompaniments"
                placeholder="Ex: Riz, Plantain, Frites..."
                value={menuAccompaniments}
                onChange={(e) => setMenuAccompaniments(e.target.value)}
                rows={2}
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
              <Label htmlFor="edit-menu-photo">Photo du menu</Label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Sélectionner une image pour le menu"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Vérifier le type MIME du fichier
                      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                      if (!allowedTypes.includes(file.type)) {
                        alert('Format d\'image non supporté. Veuillez utiliser JPG, PNG ou GIF.');
                        e.target.value = '';
                        return;
                      }
                      // Stocker le fichier pour l'upload
                      (window as any).selectedMenuFile = file;
                    }
                  }}
                />
                <p className="text-sm text-gray-500">Ou utilisez une URL existante :</p>
                <Input
                  id="edit-menu-photo"
                  placeholder="https://exemple.com/photo.jpg"
                  value={menuPhotoUrl}
                  onChange={(e) => setMenuPhotoUrl(e.target.value)}
                />
              </div>
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

      {/* Modal d'ajout de menu patient */}
      <Dialog open={isPatientMenuModalOpen} onOpenChange={setIsPatientMenuModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau menu patient</DialogTitle>
            <DialogDescription>
              Créez un nouveau menu pour les patients
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient-menu-name">Nom du menu</Label>
                <Input
                  id="patient-menu-name"
                  placeholder="Ex: Poulet rôti"
                  value={patientMenuName}
                  onChange={(e) => setPatientMenuName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="patient-menu-description">Description</Label>
              <Textarea
                id="patient-menu-description"
                placeholder="Description du menu..."
                value={patientMenuDescription}
                onChange={(e) => setPatientMenuDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="patient-menu-dietary">Régime alimentaire</Label>
                <Select value={patientMenuDietaryRestriction} onValueChange={(value: DietaryRestriction) => setPatientMenuDietaryRestriction(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un régime" />
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
                <Label htmlFor="patient-menu-meal-type">Type de repas</Label>
                <Select value={patientMenuMealType} onValueChange={(value: PatientMealType) => setPatientMenuMealType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de repas" />
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
                <Label htmlFor="patient-menu-day">Jour de la semaine</Label>
                <Select value={patientMenuDayOfWeek} onValueChange={(value: DayOfWeek) => setPatientMenuDayOfWeek(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Jour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lundi">Lundi</SelectItem>
                    <SelectItem value="Mardi">Mardi</SelectItem>
                    <SelectItem value="Mercredi">Mercredi</SelectItem>
                    <SelectItem value="Jeudi">Jeudi</SelectItem>
                    <SelectItem value="Vendredi">Vendredi</SelectItem>
                    <SelectItem value="Samedi">Samedi</SelectItem>
                    <SelectItem value="Dimanche">Dimanche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="patient-menu-photo">URL de la photo</Label>
              <Input
                id="patient-menu-photo"
                placeholder="https://example.com/photo.jpg"
                value={patientMenuPhotoUrl}
                onChange={(e) => setPatientMenuPhotoUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient-menu-calories">Calories</Label>
                <Input
                  id="patient-menu-calories"
                  type="number"
                  placeholder="350"
                  value={patientMenuCalories}
                  onChange={(e) => setPatientMenuCalories(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="patient-menu-protein">Protéines (g)</Label>
                <Input
                  id="patient-menu-protein"
                  type="number"
                  step="0.1"
                  placeholder="25.5"
                  value={patientMenuProtein}
                  onChange={(e) => setPatientMenuProtein(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="patient-menu-carbs">Glucides (g)</Label>
                <Input
                  id="patient-menu-carbs"
                  type="number"
                  step="0.1"
                  placeholder="45.0"
                  value={patientMenuCarbs}
                  onChange={(e) => setPatientMenuCarbs(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="patient-menu-fat">Lipides (g)</Label>
                <Input
                  id="patient-menu-fat"
                  type="number"
                  step="0.1"
                  placeholder="12.0"
                  value={patientMenuFat}
                  onChange={(e) => setPatientMenuFat(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="patient-menu-fiber">Fibres (g)</Label>
                <Input
                  id="patient-menu-fiber"
                  type="number"
                  step="0.1"
                  placeholder="8.0"
                  value={patientMenuFiber}
                  onChange={(e) => setPatientMenuFiber(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="patient-menu-available"
                checked={patientMenuAvailable}
                onChange={(e) => setPatientMenuAvailable(e.target.checked)}
                title="Menu disponible"
              />
              <Label htmlFor="patient-menu-available">Menu disponible</Label>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsPatientMenuModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handlePatientMenuSubmit}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Ajouter le menu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition de menu patient */}
      <Dialog open={isEditPatientMenuModalOpen} onOpenChange={setIsEditPatientMenuModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le menu patient</DialogTitle>
            <DialogDescription>
              Modifiez les informations du menu patient sélectionné
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-patient-menu-name">Nom du menu</Label>
                <Input
                  id="edit-patient-menu-name"
                  placeholder="Ex: Poulet rôti"
                  value={patientMenuName}
                  onChange={(e) => setPatientMenuName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-patient-menu-description">Description</Label>
              <Textarea
                id="edit-patient-menu-description"
                placeholder="Description du menu..."
                value={patientMenuDescription}
                onChange={(e) => setPatientMenuDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-patient-menu-dietary">Régime alimentaire</Label>
                <Select value={patientMenuDietaryRestriction} onValueChange={(value: DietaryRestriction) => setPatientMenuDietaryRestriction(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un régime" />
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
                <Label htmlFor="edit-patient-menu-meal-type">Type de repas</Label>
                <Select value={patientMenuMealType} onValueChange={(value: PatientMealType) => setPatientMenuMealType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de repas" />
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
                <Label htmlFor="edit-patient-menu-day">Jour de la semaine</Label>
                <Select value={patientMenuDayOfWeek} onValueChange={(value: DayOfWeek) => setPatientMenuDayOfWeek(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Jour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lundi">Lundi</SelectItem>
                    <SelectItem value="Mardi">Mardi</SelectItem>
                    <SelectItem value="Mercredi">Mercredi</SelectItem>
                    <SelectItem value="Jeudi">Jeudi</SelectItem>
                    <SelectItem value="Vendredi">Vendredi</SelectItem>
                    <SelectItem value="Samedi">Samedi</SelectItem>
                    <SelectItem value="Dimanche">Dimanche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-patient-menu-photo">URL de la photo</Label>
              <Input
                id="edit-patient-menu-photo"
                placeholder="https://example.com/photo.jpg"
                value={patientMenuPhotoUrl}
                onChange={(e) => setPatientMenuPhotoUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-patient-menu-calories">Calories</Label>
                <Input
                  id="edit-patient-menu-calories"
                  type="number"
                  placeholder="350"
                  value={patientMenuCalories}
                  onChange={(e) => setPatientMenuCalories(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-patient-menu-protein">Protéines (g)</Label>
                <Input
                  id="edit-patient-menu-protein"
                  type="number"
                  step="0.1"
                  placeholder="25.5"
                  value={patientMenuProtein}
                  onChange={(e) => setPatientMenuProtein(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-patient-menu-carbs">Glucides (g)</Label>
                <Input
                  id="edit-patient-menu-carbs"
                  type="number"
                  step="0.1"
                  placeholder="45.0"
                  value={patientMenuCarbs}
                  onChange={(e) => setPatientMenuCarbs(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-patient-menu-fat">Lipides (g)</Label>
                <Input
                  id="edit-patient-menu-fat"
                  type="number"
                  step="0.1"
                  placeholder="12.0"
                  value={patientMenuFat}
                  onChange={(e) => setPatientMenuFat(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-patient-menu-fiber">Fibres (g)</Label>
                <Input
                  id="edit-patient-menu-fiber"
                  type="number"
                  step="0.1"
                  placeholder="8.0"
                  value={patientMenuFiber}
                  onChange={(e) => setPatientMenuFiber(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-patient-menu-available"
                checked={patientMenuAvailable}
                onChange={(e) => setPatientMenuAvailable(e.target.checked)}
                title="Menu disponible"
              />
              <Label htmlFor="edit-patient-menu-available">Menu disponible</Label>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsEditPatientMenuModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handlePatientMenuUpdate}>
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Mettre à jour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression de commande */}
      <Dialog open={isDeleteOrderModalOpen} onOpenChange={setIsDeleteOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {deletingOrder && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800">
                  Commande {deletingOrder.type === 'patient' ? 'Patient' : 'Employé'} à supprimer
                </h4>
                <div className="text-red-700 mt-2">
                  {deletingOrder.type === 'patient' ? (
                    <>
                      <p><strong>Patient:</strong> {(deletingOrder.order as Order).patients?.name || 'Patient inconnu'}</p>
                      <p><strong>Chambre:</strong> {(deletingOrder.order as Order).patients?.room || 'N/A'}</p>
                      <p><strong>Menu:</strong> {(deletingOrder.order as Order).menu}</p>
                      <p><strong>Type de repas:</strong> {(deletingOrder.order as Order).meal_type}</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Employé:</strong> {(deletingOrder.order as EmployeeOrder).employee_name || 'Employé inconnu'}</p>
                      <p><strong>Menu:</strong> {(deletingOrder.order as EmployeeOrder).employee_menus?.name || 'Menu inconnu'}</p>
                      <p><strong>Quantité:</strong> {(deletingOrder.order as EmployeeOrder).quantity} plat(s)</p>
                      <p><strong>Prix total:</strong> {(deletingOrder.order as EmployeeOrder).total_price.toLocaleString('fr-FR')} XAF</p>
                    </>
                  )}
                  <p><strong>Statut:</strong> {deletingOrder.order.status}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBell} className="text-yellow-600 mr-2" />
                  <p className="text-yellow-800 font-medium">
                    Attention: Cette action supprimera définitivement la commande et toutes ses données associées.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteOrderModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeleteOrder}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Supprimer définitivement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'ajout d'article de stock */}
      <Dialog open={isInventoryModalOpen} onOpenChange={setIsInventoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un article au stock</DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel article à l'inventaire de la cuisine
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inventory-name">Nom de l'article *</Label>
              <Input
                id="inventory-name"
                placeholder="Ex: Riz basmati"
                value={newInventoryItem.name}
                onChange={(e) => setNewInventoryItem({...newInventoryItem, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="inventory-category">Catégorie *</Label>
              <Select 
                value={newInventoryItem.category} 
                onValueChange={(value) => setNewInventoryItem({...newInventoryItem, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viandes">Viandes</SelectItem>
                  <SelectItem value="poissons">Poissons</SelectItem>
                  <SelectItem value="legumes">Légumes</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="cereales">Céréales</SelectItem>
                  <SelectItem value="epices">Épices</SelectItem>
                  <SelectItem value="produits-laitiers">Produits laitiers</SelectItem>
                  <SelectItem value="boissons">Boissons</SelectItem>
                  <SelectItem value="autres">Autres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inventory-current-stock">Stock actuel</Label>
                <Input
                  id="inventory-current-stock"
                  type="number"
                  min="0"
                  value={newInventoryItem.current_stock}
                  onChange={(e) => setNewInventoryItem({...newInventoryItem, current_stock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="inventory-min-stock">Stock minimum</Label>
                <Input
                  id="inventory-min-stock"
                  type="number"
                  min="0"
                  value={newInventoryItem.min_stock}
                  onChange={(e) => setNewInventoryItem({...newInventoryItem, min_stock: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="inventory-unit">Unité</Label>
              <Input
                id="inventory-unit"
                placeholder="Ex: kg, L, pièces"
                value={newInventoryItem.unit}
                onChange={(e) => setNewInventoryItem({...newInventoryItem, unit: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="inventory-supplier">Fournisseur</Label>
              <Input
                id="inventory-supplier"
                placeholder="Ex: Fournisseur ABC"
                value={newInventoryItem.supplier}
                onChange={(e) => setNewInventoryItem({...newInventoryItem, supplier: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="inventory-cost">Prix unitaire (XAF)</Label>
              <Input
                id="inventory-cost"
                type="number"
                min="0"
                placeholder="0"
                value={newInventoryItem.cost_per_unit}
                onChange={(e) => setNewInventoryItem({...newInventoryItem, cost_per_unit: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="inventory-expiry">Date d'expiration</Label>
              <Input
                id="inventory-expiry"
                type="date"
                value={newInventoryItem.expiry_date}
                onChange={(e) => setNewInventoryItem({...newInventoryItem, expiry_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="inventory-notes">Notes</Label>
              <Textarea
                id="inventory-notes"
                placeholder="Notes supplémentaires..."
                value={newInventoryItem.notes}
                onChange={(e) => setNewInventoryItem({...newInventoryItem, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsInventoryModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleInventorySubmit}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Ajouter l'article
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition d'article de stock */}
      <Dialog open={isEditInventoryModalOpen} onOpenChange={setIsEditInventoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'article de stock</DialogTitle>
            <DialogDescription>
              Modifiez les informations de cet article
            </DialogDescription>
          </DialogHeader>
          {editingInventoryItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-inventory-name">Nom de l'article *</Label>
                <Input
                  id="edit-inventory-name"
                  value={editingInventoryItem.name}
                  onChange={(e) => setEditingInventoryItem({...editingInventoryItem, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-inventory-category">Catégorie *</Label>
                <Select 
                  value={editingInventoryItem.category} 
                  onValueChange={(value) => setEditingInventoryItem({...editingInventoryItem, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viandes">Viandes</SelectItem>
                    <SelectItem value="poissons">Poissons</SelectItem>
                    <SelectItem value="legumes">Légumes</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="cereales">Céréales</SelectItem>
                    <SelectItem value="epices">Épices</SelectItem>
                    <SelectItem value="produits-laitiers">Produits laitiers</SelectItem>
                    <SelectItem value="boissons">Boissons</SelectItem>
                    <SelectItem value="autres">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-inventory-current-stock">Stock actuel</Label>
                  <Input
                    id="edit-inventory-current-stock"
                    type="number"
                    min="0"
                    value={editingInventoryItem.current_stock}
                    onChange={(e) => setEditingInventoryItem({...editingInventoryItem, current_stock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-inventory-min-stock">Stock minimum</Label>
                  <Input
                    id="edit-inventory-min-stock"
                    type="number"
                    min="0"
                    value={editingInventoryItem.min_stock}
                    onChange={(e) => setEditingInventoryItem({...editingInventoryItem, min_stock: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-inventory-unit">Unité</Label>
                <Input
                  id="edit-inventory-unit"
                  value={editingInventoryItem.unit}
                  onChange={(e) => setEditingInventoryItem({...editingInventoryItem, unit: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-inventory-supplier">Fournisseur</Label>
                <Input
                  id="edit-inventory-supplier"
                  value={editingInventoryItem.supplier}
                  onChange={(e) => setEditingInventoryItem({...editingInventoryItem, supplier: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-inventory-cost">Prix unitaire (XAF)</Label>
                <Input
                  id="edit-inventory-cost"
                  type="number"
                  min="0"
                  value={editingInventoryItem.cost_per_unit}
                  onChange={(e) => setEditingInventoryItem({...editingInventoryItem, cost_per_unit: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit-inventory-expiry">Date d'expiration</Label>
                <Input
                  id="edit-inventory-expiry"
                  type="date"
                  value={editingInventoryItem.expiry_date}
                  onChange={(e) => setEditingInventoryItem({...editingInventoryItem, expiry_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-inventory-notes">Notes</Label>
                <Textarea
                  id="edit-inventory-notes"
                  value={editingInventoryItem.notes}
                  onChange={(e) => setEditingInventoryItem({...editingInventoryItem, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditInventoryModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleInventoryUpdate}>
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Mettre à jour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
