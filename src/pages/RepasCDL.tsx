import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/repas-cdl/Header';
import { Navigation } from '@/components/repas-cdl/Navigation';
import { AnalyticsTab } from '@/components/repas-cdl/tabs/AnalyticsTab';
import { NotificationCenter } from '@/components/repas-cdl/NotificationCenter';
import { InventoryTab } from '@/components/repas-cdl/tabs/InventoryTab';
import { DeliveryTrackingTab } from '@/components/repas-cdl/tabs/DeliveryTrackingTab';
import { MobileMenu } from '@/components/repas-cdl/MobileMenu';
import { ThemeToggle } from '@/components/repas-cdl/ThemeToggle';
import type { Patient, Order, UserRole, WeeklyMenuItem } from '@/types/repas-cdl';
import { PatientsTab } from '../components/repas-cdl/tabs/PatientsTab';
import { OrdersTab } from '../components/repas-cdl/tabs/OrdersTab';
import { DashboardTab } from '../components/repas-cdl/tabs/DashboardTab';
import { EmployeesTab } from '../components/repas-cdl/tabs/EmployeesTab';
import { MenusTab } from '../components/repas-cdl/tabs/MenusTab';
import { SettingsTab } from '../components/repas-cdl/tabs/SettingsTab';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

// Components are now imported above

const RepasCDL = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [weeklyMenus, setWeeklyMenus] = useState<WeeklyMenuItem[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Infirmier');

  const fetchInitialData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;
        if (profile) setCurrentUserRole(profile.role as UserRole);
      }

      const { data: patientsData, error: patientsError } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (patientsError) throw patientsError;
      setPatients(patientsData as Patient[]);

      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (ordersError) throw ordersError;
      setOrders(ordersData as Order[]);

      const { data: weeklyMenusData, error: weeklyMenusError } = await supabase.from('weekly_menu_items').select('*');
      if (weeklyMenusError) throw weeklyMenusError;
      setWeeklyMenus(weeklyMenusData as WeeklyMenuItem[]);

    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      showError("Impossible de charger les données depuis la base de données.");
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const notificationCount = orders.filter(o => o.status === 'En attente d\'approbation').length;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab patients={patients} orders={orders} setActiveTab={setActiveTab} />;
      case 'patients':
        return <PatientsTab patients={patients} currentUserRole={currentUserRole} onDataChange={fetchInitialData} />;
      case 'orders':
        return <OrdersTab orders={orders} patients={patients} weeklyMenus={weeklyMenus} currentUserRole={currentUserRole} onDataChange={fetchInitialData} />;
      case 'menus':
        return <MenusTab weeklyMenus={weeklyMenus} currentUserRole={currentUserRole} onDataChange={fetchInitialData} />;
      case 'employees':
        return <EmployeesTab currentUserRole={currentUserRole} />;
      case 'deliveries':
        return <DeliveryTrackingTab />;
      case 'reports':
        return <AnalyticsTab />;
      case 'notifications':
        return <NotificationCenter />;
      case 'inventory':
        return <InventoryTab />;
      case 'settings':
        return currentUserRole === 'Super Admin' ? <SettingsTab /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Header 
        currentUserRole={currentUserRole} 
        setCurrentUserRole={setCurrentUserRole}
        notificationCount={notificationCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} currentUserRole={currentUserRole} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default RepasCDL;