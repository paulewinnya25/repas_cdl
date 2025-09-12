import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faUsers, faClipboardList, faBook, faTruck, faChartBar, faUserTie, faCog, faHome, faBell, faBox, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/repas-cdl';

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: faTachometerAlt },
  { id: 'portails', label: 'Portails', icon: faHome, external: true },
  { id: 'patients', label: 'Patients', icon: faUsers },
  { id: 'orders', label: 'Commandes', icon: faClipboardList },
  { id: 'menus', label: 'Menus', icon: faBook },
  { id: 'employees', label: 'Employés', icon: faUserTie },
  { id: 'deliveries', label: 'Livraisons', icon: faTruck },
  { id: 'inventory', label: 'Stocks', icon: faWarehouse },
  { id: 'reports', label: 'Analytics', icon: faChartBar },
  { id: 'notifications', label: 'Notifications', icon: faBell },
];

const adminNavItems = [
    { id: 'settings', label: 'Paramètres', icon: faCog },
];

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserRole: UserRole;
}

export const Navigation = ({ activeTab, setActiveTab, currentUserRole }: NavigationProps) => {
  const allNavItems = [...navItems, ...(currentUserRole === 'Super Admin' ? adminNavItems : [])];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto">
                 {allNavItems.map(item => (
                   <button
                     key={item.id}
                     className={cn(
                       'px-3 py-2 rounded-t-lg text-sm font-medium flex items-center whitespace-nowrap',
                       activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                     )}
                     onClick={() => {
                       if (item.external) {
                         window.location.href = '/portails';
                       } else {
                         setActiveTab(item.id);
                       }
                     }}
                   >
                     <FontAwesomeIcon icon={item.icon} className="mr-2" />
                     {item.label}
                   </button>
                 ))}
        </div>
      </div>
    </nav>
  );
};