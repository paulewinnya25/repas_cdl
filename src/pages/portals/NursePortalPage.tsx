import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Patient, Order, UserRole, PatientMenu, EmployeeMenu, EmployeeOrder } from '../../types/repas-cdl';
import { gabonCities } from '../../data/gabon-locations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import jsPDF from 'jspdf';
import { createPDFHeader, createPDFFooter, createSummarySection, createTable, createEnhancedReport, LOGO_COLORS } from '../../utils/pdfReportUtils';
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
  faTimes,
  faSignOutAlt,
  faUtensils
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
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
import { isSameDay } from 'date-fns';

const NursePortalPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [patientMenus, setPatientMenus] = useState<PatientMenu[]>([]);
  const [employeeMenus, setEmployeeMenus] = useState<EmployeeMenu[]>([]);
  const [employeeOrdersToday, setEmployeeOrdersToday] = useState<EmployeeOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'patients' | 'today-orders' | 'pending' | 'recent-orders'>('all');
  const [activeTab, setActiveTab] = useState('patients');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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
    const todayOrders = orders.filter(o => isToday((o as Order & { date?: string }).date || o.created_at));
    
    // Seulement les commandes patients pour le rapport infirmier
    // Calculer les statistiques de plats (patients seulement)
    const totalOrderedDishes = todayOrders.length;
    const totalDeliveredDishes = todayOrders.filter(o => o.status === 'Livré').length;
    
    // Créer un résumé des plats commandés avec quantités (patients seulement)
    const dishesSummary = new Map<string, { quantity: number, type: string, status: string }>();
    
    // Ajouter seulement les plats patients avec quantités
    todayOrders.forEach(order => {
      const key = `Patient - ${order.menu}`;
      const existing = dishesSummary.get(key);
      if (existing) {
        existing.quantity += 1;
      } else {
        dishesSummary.set(key, { 
          quantity: 1, 
          type: 'Patient',
          status: order.status
        });
      }
    });
    
    // Créer les lignes du rapport
    const summaryRows = [
      ['RAPPORT JOURNALIER - PORTAL INFIRMIER'],
      ['Date', new Date().toLocaleDateString('fr-FR')],
      [''],
      ['RÉSUMÉ DU JOUR'],
      ['Total plats commandés aujourd\'hui', totalOrderedDishes.toString()],
      ['Total plats livrés aujourd\'hui', totalDeliveredDishes.toString()],
      [''],
      ['DÉTAIL DES PLATS COMMANDÉS'],
      ['Type', 'Menu', 'Quantité', 'Statut']
    ];
    
    // Ajouter les détails des plats
    Array.from(dishesSummary.entries()).forEach(([menu, data]) => {
      summaryRows.push([data.type, menu.split(' - ')[1], data.quantity.toString(), data.status]);
    });
    
    summaryRows.push([''], ['DÉTAIL DES COMMANDES PATIENTS']);
    
    const patientRows = todayOrders.map(o => [
      o.patients?.name || '', 
      o.patients?.room || '', 
      o.meal_type, 
      o.menu, 
      o.status, 
      (o.created_at || (o as Order & { date?: string }).date) || ''
    ]);
    const patientHeader = ['Nom Patient', 'Chambre', 'Repas', 'Menu', 'Statut', 'Date'];
    
    downloadCSV(`rapport_journalier_infirmier_${new Date().toISOString().slice(0,10)}.csv`, [
      ...summaryRows, 
      patientHeader,
      ...patientRows
    ]);
  };

  const printDailyReport = async () => {
    const todayStr = new Date().toLocaleDateString('fr-FR');
    const todayOrders = orders.filter(o => isToday((o as Order & { date?: string }).date || o.created_at));
    const totalOrderedDishes = todayOrders.length;
    const totalDeliveredDishes = todayOrders.filter(o => o.status === 'Livré').length;

    // Créer un résumé des plats commandés
    const dishesSummary = new Map<string, { quantity: number, type: string }>();
    
    // Ajouter seulement les plats patients
    todayOrders.forEach(order => {
      const key = `Patient - ${order.menu}`;
      dishesSummary.set(key, { 
        quantity: (dishesSummary.get(key)?.quantity || 0) + 1, 
        type: 'Patient' 
      });
    });

    const doc = new jsPDF();
    
    // Couleurs du logo (converties en RGB pour jsPDF)
    const blueColor = [90, 194, 236]; // #5ac2ec
    const greenColor = [65, 184, 172]; // #41b8ac
    
    // Fonction pour charger le logo depuis Cloudinary
    const loadLogoImage = async (): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          // Redimensionner le logo pour le PDF
          const maxWidth = 40;
          const maxHeight = 30;
          const aspectRatio = img.width / img.height;
          
          let width = maxWidth;
          let height = maxWidth / aspectRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load logo'));
        img.src = 'https://res.cloudinary.com/dd64mwkl2/image/upload/v1734533177/Centre_Diagnostic-Logo_cyekdg.svg';
      });
    };

    try {
      // Charger le logo
      const logoDataUrl = await loadLogoImage();
      
      // En-tête avec fond blanc
      doc.setFillColor(255, 255, 255); // Fond blanc
      doc.rect(0, 0, 210, 40, 'F');
      
      // Ajouter le vrai logo (plus petit)
      doc.addImage(logoDataUrl, 'PNG', 20, 5, 25, 20);
      
      // Logo (texte stylisé)
      doc.setFontSize(20);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]); // Texte bleu
      doc.setFont('helvetica', 'bold');
      doc.text('CENTRE DIAGNOSTIC', 50, 15);
      
      doc.setFontSize(12);
      doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]); // Texte vert
      doc.setFont('helvetica', 'normal');
      doc.text('Rapport Journalier - Portail Infirmier', 50, 25);
      
      // Date et informations
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Texte noir
      doc.text(`Date: ${todayStr}`, 150, 10);
      doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, 150, 20);
      
      // Ligne de séparation décorative
      doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.setLineWidth(1);
      doc.line(20, 35, 190, 35);
      
    } catch (error) {
      console.error('Erreur lors du chargement du logo:', error);
      
      // Fallback: utiliser le logo stylisé si le chargement échoue
      doc.setFillColor(255, 255, 255); // Fond blanc
      doc.rect(0, 0, 210, 40, 'F');
      
      // Logo stylisé avec cercle (fallback) - plus petit
      doc.setFillColor(greenColor[0], greenColor[1], greenColor[2]); // Cercle vert
      doc.circle(32, 15, 8, 'F');
      doc.setFillColor(255, 255, 255); // Cercle blanc au centre
      doc.circle(32, 15, 5, 'F');
      doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]); // Point bleu au centre
      doc.circle(32, 15, 3, 'F');
      
      // Logo (texte stylisé)
      doc.setFontSize(20);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]); // Texte bleu
      doc.setFont('helvetica', 'bold');
      doc.text('CENTRE DIAGNOSTIC', 50, 15);
      
      doc.setFontSize(12);
      doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]); // Texte vert
      doc.setFont('helvetica', 'normal');
      doc.text('Rapport Journalier - Portail Infirmier', 50, 25);
      
      // Date et informations
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Texte noir
      doc.text(`Date: ${todayStr}`, 150, 10);
      doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, 150, 20);
      
      // Ligne de séparation décorative
      doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.setLineWidth(1);
      doc.line(20, 35, 190, 35);
    }
    
    let yPosition = 50;
    
    // Résumé du jour
    doc.setFontSize(18);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSUMÉ DU JOUR', 20, yPosition);
    yPosition += 15;
    
    // Boîte de résumé avec design amélioré
    doc.setFillColor(240, 253, 244); // Fond vert très clair
    doc.rect(20, yPosition - 5, 170, 30, 'F');
    doc.setDrawColor(greenColor[0], greenColor[1], greenColor[2]); // Bordure verte
    doc.setLineWidth(1);
    doc.rect(20, yPosition - 5, 170, 30, 'S');
    
    doc.setFontSize(12);
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]); // Texte vert
    doc.setFont('helvetica', 'bold');
    doc.text(`Total plats commandés aujourd'hui: ${totalOrderedDishes}`, 25, yPosition + 8);
    doc.text(`Total plats livrés aujourd'hui: ${totalDeliveredDishes}`, 25, yPosition + 20);
    
    yPosition += 40;
    
    // Détail des plats commandés
    doc.setFontSize(16);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL DES PLATS COMMANDÉS', 20, yPosition);
    yPosition += 15;
    
    if (dishesSummary.size > 0) {
      // En-tête du tableau
      doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.rect(20, yPosition - 5, 170, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      doc.text('Type', 25, yPosition + 2);
      doc.text('Menu', 50, yPosition + 2);
      doc.text('Quantité', 120, yPosition + 2);
      doc.text('Statut', 150, yPosition + 2);
      
      yPosition += 10;
      
      // Données du tableau
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      Array.from(dishesSummary.entries()).forEach(([menu, data], index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Alternance des couleurs de fond
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, yPosition - 5, 170, 10, 'F');
        }
        
        doc.text(data.type, 25, yPosition + 2);
        doc.text(menu.split(' - ')[1], 50, yPosition + 2);
        doc.text(data.quantity.toString(), 120, yPosition + 2);
        doc.text(data.status || 'En attente', 150, yPosition + 2);
        
        yPosition += 10;
      });
    } else {
      doc.setTextColor(100, 100, 100);
      doc.text('Aucun plat commandé aujourd\'hui', 25, yPosition);
      yPosition += 10;
    }
    
    yPosition += 15;
    
    // Détail des commandes patients
    doc.setFontSize(16);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL DES COMMANDES PATIENTS', 20, yPosition);
    yPosition += 15;
    
    if (todayOrders.length > 0) {
      // En-tête du tableau
      doc.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
      doc.rect(20, yPosition - 5, 170, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      doc.text('Patient', 25, yPosition + 2);
      doc.text('Chambre', 60, yPosition + 2);
      doc.text('Repas', 90, yPosition + 2);
      doc.text('Menu', 120, yPosition + 2);
      doc.text('Statut', 160, yPosition + 2);
      
      yPosition += 10;
      
      // Données du tableau
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      todayOrders.forEach((order, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Alternance des couleurs de fond
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, yPosition - 5, 170, 10, 'F');
        }
        
        doc.text(order.patients?.name || 'N/A', 25, yPosition + 2);
        doc.text(order.patients?.room || 'N/A', 60, yPosition + 2);
        doc.text(order.meal_type, 90, yPosition + 2);
        doc.text(order.menu, 120, yPosition + 2);
        doc.text(order.status, 160, yPosition + 2);
        
        yPosition += 10;
      });
    } else {
      doc.setTextColor(100, 100, 100);
      doc.text('Aucune commande patient aujourd\'hui', 25, yPosition);
    }
    
    // Pied de page avec design
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Ligne de pied de page
      doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 280, 190, 280);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} sur ${pageCount}`, 20, 285);
      doc.text('Centre Diagnostic - Système de Gestion des Repas', 150, 285);
    }
    
    // Télécharger le PDF
    doc.save(`rapport_journalier_infirmier_${new Date().toISOString().slice(0,10)}.pdf`);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Fonction pour vérifier si une date est aujourd'hui (plus robuste)
  const isToday = (dateString: string | undefined): boolean => {
    if (!dateString) return false;
    
    try {
      const orderDate = new Date(dateString);
      const today = new Date();
      
      // Vérifier si la date est valide
      if (isNaN(orderDate.getTime())) return false;
      
      // Comparer année, mois et jour
      return orderDate.getFullYear() === today.getFullYear() &&
             orderDate.getMonth() === today.getMonth() &&
             orderDate.getDate() === today.getDate();
    } catch (error) {
      console.error('Erreur lors de la comparaison de dates:', error);
      return false;
    }
  };

  // Debug function pour vérifier les données
  const debugData = () => {
    console.log('=== DEBUG DONNÉES ===');
    console.log('Orders total:', orders.length);
    console.log('Orders:', orders);
    
    const today = new Date();
    console.log('Date actuelle:', today.toISOString());
    console.log('Date actuelle (locale):', today.toLocaleDateString());
    
    orders.forEach((o, index) => {
      const orderDateString = (o as Order & { date?: string }).date || o.created_at || '';
      const isTodayOrder = isToday(orderDateString);
      console.log(`Order ${index}:`, {
        id: o.id,
        status: o.status,
        created_at: o.created_at,
        date: (o as Order & { date?: string }).date,
        orderDateString: orderDateString,
        isToday: isTodayOrder
      });
    });
    
    const todayOrders = orders.filter(o => {
      const orderDateString = (o as Order & { date?: string }).date || o.created_at || '';
      return isToday(orderDateString);
    });
    
    console.log('Orders aujourd\'hui:', todayOrders.length);
    console.log('Orders aujourd\'hui:', todayOrders);
    console.log('===================');
  };

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
    menu: '',
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
  const requiredCode = (import.meta as { env?: { VITE_NURSE_ACCESS_CODE?: string } }).env?.VITE_NURSE_ACCESS_CODE || 'INFIRM_2025';

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
          console.log('Nombre de commandes:', ordersData?.length || 0);
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

  // Fonction pour obtenir le menu complet selon le régime et le jour
  const getAvailableMenusForPatient = (patient: Patient, mealType: string) => {
    const today = getTodayName();
    return patientMenus.filter(m => 
      m.dietary_restriction === patient.diet &&
      m.meal_type === mealType &&
      m.day_of_week === today &&
      m.is_available
    );
  };

  // Fonctions de filtrage
  const getFilteredPatients = () => {
    switch (activeFilter) {
      case 'patients':
        return patients;
      default:
        return patients;
    }
  };

  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'today-orders':
        return todayOrders;
      case 'pending':
        return pendingOrders;
      case 'recent-orders':
        return orders.slice(0, 5); // Les 5 commandes les plus récentes
      default:
        return orders;
    }
  };

  const handleFilterChange = (filter: 'all' | 'patients' | 'today-orders' | 'pending' | 'recent-orders') => {
    setActiveFilter(filter);
    
    // Changer d'onglet automatiquement selon le filtre
    if (filter === 'patients') {
      setActiveTab('patients');
    } else if (filter === 'today-orders' || filter === 'pending' || filter === 'recent-orders') {
      setActiveTab('orders');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPatient || !newOrder.mealType) {
      showError("Veuillez sélectionner le type de repas");
      return;
    }

    // Vérifier qu'un menu a été sélectionné
    if (!newOrder.menu) {
      showError("Veuillez sélectionner un menu pour le patient");
      return;
    }

    try {
      // Créer la commande principale du patient avec le menu sélectionné
      const orderData = {
        patient_id: selectedPatient.id,
        meal_type: newOrder.mealType,
        menu: newOrder.menu,
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
          showError(`Choisissez ${required} accompagnement(s) pour l'accompagnateur.`);
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

      showSuccess(`Commande créée avec succès - Menu: ${newOrder.menu}`);

      setNewOrder({ mealType: '', menu: '', instructions: '', companionMeal: false, companionInstructions: '', companionSelectedMenu: null, companionAccompaniments: 1, companionSelectedOptions: [] });
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
      instructions: order.instructions || '',
      companionMeal: false,
      companionInstructions: '',
      companionSelectedMenu: null,
      companionAccompaniments: 1,
      companionSelectedOptions: []
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
      setNewOrder({ mealType: '', menu: '', instructions: '', companionMeal: false, companionInstructions: '', companionSelectedMenu: null, companionAccompaniments: 1, companionSelectedOptions: [] });
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
            className="w-full text-white rounded-md py-2"
            style={{ backgroundColor: '#5ac2ec' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4fb3d9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5ac2ec'}
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
      <div className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="/logo-centre-diagnostic-official.svg" 
                alt="Centre Diagnostic" 
                className="h-8 w-auto mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#5ac2ec' }}>Portail Infirmier</h1>
                <p className="text-sm text-gray-600">Gestion des commandes patients</p>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Commandes en attente</p>
            <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{pendingOrders.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Commandes aujourd'hui</p>
            <p className="text-2xl font-bold" style={{ color: '#41b8ac' }}>{todayOrders.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card 
            className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow ${activeFilter === 'patients' ? 'ring-4 ring-blue-300' : ''}`}
            onClick={() => handleFilterChange('patients')}
          >
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

          <Card 
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('menus')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Menus Patients</p>
                  <p className="text-3xl font-bold">{patientMenus.length}</p>
                </div>
                <FontAwesomeIcon icon={faUtensils} className="text-4xl text-teal-200" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow ${activeFilter === 'today-orders' ? 'ring-4 ring-green-300' : ''}`}
            onClick={() => handleFilterChange('today-orders')}
          >
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

          <Card 
            className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow ${activeFilter === 'pending' ? 'ring-4 ring-orange-300' : ''}`}
            onClick={() => handleFilterChange('pending')}
          >
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

          <Card 
            className={`bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow ${activeFilter === 'recent-orders' ? 'ring-4 ring-purple-300' : ''}`}
            onClick={() => handleFilterChange('recent-orders')}
          >
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

        {/* Indicateur de filtre actif */}
        {activeFilter !== 'all' && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Filtre actif: {
                  activeFilter === 'patients' ? 'Patients' :
                  activeFilter === 'today-orders' ? 'Commandes Aujourd\'hui' :
                  activeFilter === 'pending' ? 'Commandes en Attente' :
                  activeFilter === 'recent-orders' ? 'Commandes Récentes' :
                  'Toutes les données'
                }
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => handleFilterChange('all')}
                className="text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Effacer le filtre
              </Button>
            </div>
          </div>
        )}

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="menus">Menus Patients</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          </TabsList>

          {/* Onglet Patients */}
          <TabsContent value="patients">
            {(activeFilter === 'all' || activeFilter === 'patients') && (
              <Card data-section="patients">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faUsers} style={{ color: '#5ac2ec' }} />
                      <span>Liste des Patients</span>
                      {activeFilter !== 'all' && (
                        <Badge variant="outline" className="ml-2">
                          {getFilteredPatients().length} patient(s)
                        </Badge>
                      )}
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
                      className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 cursor-pointer hover:border-blue-300"
                      onClick={() => handlePatientClick(patient)}
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
            )}
          </TabsContent>

          {/* Onglet Menus Patients */}
          <TabsContent value="menus">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faUtensils} style={{ color: '#41b8ac' }} />
                  <span>Menus Patients</span>
                  <Badge variant="outline" className="ml-2">
                    {patientMenus.length} menu(s)
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Consultez les menus disponibles pour les patients selon les régimes alimentaires et les jours de la semaine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Filtres par jour de la semaine */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedDay === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(null)}
                      className="text-xs"
                    >
                      Tous les jours
                    </Button>
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => (
                      <Button
                        key={day}
                        variant={selectedDay === day ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDay(day)}
                        className="text-xs"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>

                  {/* Affichage des menus par régime alimentaire */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patientMenus
                      .filter(menu => selectedDay === null || menu.day_of_week === selectedDay)
                      .map((menu) => (
                      <Card key={menu.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{menu.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
                              
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {menu.day_of_week}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {menu.meal_type}
                                </Badge>
                                <Badge 
                                  variant={menu.dietary_restriction === 'Normal' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {menu.dietary_restriction}
                                </Badge>
                              </div>
                            </div>
                            
                            {menu.photo_url && (
                              <img 
                                src={menu.photo_url}
                                alt={menu.name}
                                className="w-16 h-16 object-cover rounded-lg ml-3"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            <p><strong>Régime:</strong> {menu.dietary_restriction}</p>
                            <p><strong>Repas:</strong> {menu.meal_type}</p>
                            <p><strong>Jour:</strong> {menu.day_of_week}</p>
                            {menu.is_available ? (
                              <Badge variant="default" className="mt-2">Disponible</Badge>
                            ) : (
                              <Badge variant="secondary" className="mt-2">Indisponible</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {patientMenus.filter(menu => selectedDay === null || menu.day_of_week === selectedDay).length === 0 && (
                    <div className="text-center py-8">
                      <FontAwesomeIcon icon={faUtensils} className="text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">
                        {selectedDay ? `Aucun menu disponible pour ${selectedDay}` : 'Aucun menu patient disponible'}
                      </p>
                      <p className="text-gray-400">Les menus seront ajoutés par l'équipe cuisine</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Commandes */}
          <TabsContent value="orders">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Commandes Récentes - Affichage conditionnel */}
              {(activeFilter === 'all' || activeFilter === 'recent-orders' || activeFilter === 'today-orders' || activeFilter === 'pending') && (
                <Card data-section="recent-orders">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClipboardList} style={{ color: '#5ac2ec' }} />
                      <span>Commandes Récentes</span>
                      {activeFilter !== 'all' && (
                        <Badge variant="outline" className="ml-2">
                          {getFilteredOrders().length} commande(s)
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getFilteredOrders().slice(0, 5).map((order) => (
                      <div 
                        key={order.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleOrderEdit(order)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Commande #{orders.indexOf(order) + 1}</h4>
                          <Badge 
                            variant={order.status === "En attente d'approbation" ? 'destructive' : 'default'}
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
              )}

              {/* Commandes en Attente - Affichage conditionnel */}
              {(activeFilter === 'all' || activeFilter === 'pending') && (
                <Card data-section="pending-orders">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#eab308' }} />
                      <span>Commandes en Attente</span>
                      {activeFilter !== 'all' && (
                        <Badge variant="outline" className="ml-2">
                          {pendingOrders.length} commande(s)
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4" style={{ borderColor: '#fde68a', backgroundColor: '#fefce8' }}>
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
              )}
            </div>
          </TabsContent>

          {/* Onglet Vue d'ensemble */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faChartLine} style={{ color: '#41b8ac' }} />
                    <span>Statistiques du Jour</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                      <span>Commandes patients aujourd'hui</span>
                      <span className="font-bold" style={{ color: '#41b8ac' }}>{todayOrders.length}</span>
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
                  <div className="space-y-4">
                    {/* Statistiques de plats */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3" style={{ color: '#5ac2ec' }}>📊 Statistiques de plats</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>Total plats commandés</span>
                          <span className="font-bold" style={{ color: '#41b8ac' }}>
                            {orders.filter(o => isToday((o as Order & { date?: string }).date || o.created_at)).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total plats livrés</span>
                          <span className="font-bold" style={{ color: '#41b8ac' }}>
                            {orders.filter(o => isToday((o as Order & { date?: string }).date || o.created_at) && o.status === 'Livré').length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Détail des plats commandés */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3" style={{ color: '#5ac2ec' }}>🍽️ Plats commandés aujourd'hui</h4>
                      <div className="space-y-2 text-sm">
                        {(() => {
                          const dishesSummary = new Map<string, { quantity: number, type: string }>();
                          const todayOrders = orders.filter(o => isToday((o as Order & { date?: string }).date || o.created_at));
                          
                          // Ajouter seulement les plats patients
                          todayOrders.forEach(order => {
                            const key = `Patient - ${order.menu}`;
                            dishesSummary.set(key, { 
                              quantity: (dishesSummary.get(key)?.quantity || 0) + 1, 
                              type: 'Patient' 
                            });
                          });
                          
                          return Array.from(dishesSummary.entries()).map(([menu, data]) => (
                            <div key={menu} className="flex justify-between items-center">
                              <span className="flex items-center space-x-2">
                                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                  {data.type}
                                </span>
                                <span>{menu.split(' - ')[1]}</span>
                              </span>
                              <span className="font-bold" style={{ color: '#41b8ac' }}>{data.quantity}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Statistiques par statut - Patients seulement */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Patients - En attente</span><span className="font-medium">{orders.filter(o => isToday((o as Order & { date?: string }).date || o.created_at) && o.status === "En attente d'approbation").length}</span></div>
                      <div className="flex justify-between"><span>Patients - En préparation</span><span className="font-medium">{orders.filter(o => isToday((o as Order & { date?: string }).date || o.created_at) && o.status === 'En préparation').length}</span></div>
                      <div className="flex justify-between"><span>Patients - Livrés</span><span className="font-medium">{orders.filter(o => isToday((o as Order & { date?: string }).date || o.created_at) && o.status === 'Livré').length}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={exportDailyReportCSV}>Exporter CSV</Button>
                    <Button size="sm" onClick={printDailyReport}>Imprimer / PDF</Button>
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
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
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

                {/* Sélection du menu selon le régime alimentaire */}
                {newOrder.mealType && (
                  <div>
                    <Label className="text-green-800 dark:text-green-200 font-semibold">
                      Menus disponibles pour {selectedPatient.diet} - {newOrder.mealType}
                    </Label>
                    <div className="mt-2 space-y-2">
                      {getAvailableMenusForPatient(selectedPatient, newOrder.mealType).length > 0 ? (
                        getAvailableMenusForPatient(selectedPatient, newOrder.mealType).map((menu) => (
                          <div 
                            key={menu.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              newOrder.menu === menu.name 
                                ? 'border-green-500' 
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                            onClick={() => setNewOrder({...newOrder, menu: menu.name})}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {menu.name}
                                </h4>
                                {menu.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {menu.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {menu.day_of_week}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {menu.dietary_restriction}
                                  </Badge>
                                </div>
                              </div>
                              {menu.photo_url && (
                                <img 
                                  src={menu.photo_url}
                                  alt={menu.name}
                                  className="w-12 h-12 object-cover rounded-lg ml-3"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 border rounded-lg" style={{ borderColor: '#fde68a', backgroundColor: '#fefce8' }}>
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#eab308' }} />
                            <p className="text-sm" style={{ color: '#a16207' }}>
                              Aucun menu disponible pour le régime "{selectedPatient.diet}" en {newOrder.mealType} aujourd'hui ({getTodayName()})
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Affichage du menu sélectionné */}
                {newOrder.menu && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">
                          Menu sélectionné : {newOrder.menu}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          Régime {selectedPatient.diet} - {newOrder.mealType}
                        </p>
                      </div>
                    </div>
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
                                    <div className="w-16 h-16 rounded-lg mr-3" style={{ backgroundColor: '#f0fdf4' }} />
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
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2' }}>
                <h4 className="font-semibold" style={{ color: '#dc2626' }}>Patient à supprimer</h4>
                <p style={{ color: '#dc2626' }}>
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
