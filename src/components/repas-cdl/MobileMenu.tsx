import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faHome, faUsers, faClipboardList, faBook, faUserTie, faTruck, faChartBar, faCog, faBell } from '@fortawesome/free-solid-svg-icons';
import { UserRole } from '@/types/repas-cdl';

interface MobileMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserRole: UserRole;
  notificationCount: number;
}

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: faHome },
  { id: 'portail', label: 'Portail', icon: faHome },
  { id: 'patients', label: 'Patients', icon: faUsers },
  { id: 'orders', label: 'Commandes', icon: faClipboardList },
  { id: 'menus', label: 'Menus', icon: faBook },
  { id: 'employees', label: 'Employés', icon: faUserTie },
  { id: 'deliveries', label: 'Livraisons', icon: faTruck },
  { id: 'reports', label: 'Rapports', icon: faChartBar },
];

const adminNavItems = [
  { id: 'settings', label: 'Paramètres', icon: faCog },
];

export const MobileMenu = ({ activeTab, setActiveTab, currentUserRole, notificationCount }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const allNavItems = [...navItems, ...(currentUserRole === 'Super Admin' ? adminNavItems : [])];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <FontAwesomeIcon icon={faBars} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <FontAwesomeIcon icon={faHome} className="mr-2 text-blue-600" />
            Repas CDL
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-2">
          {/* Notifications */}
          {notificationCount > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faBell} className="text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  {notificationCount} notification{notificationCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          {allNavItems.map(item => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleTabClick(item.id)}
            >
              <FontAwesomeIcon icon={item.icon} className="mr-3" />
              {item.label}
            </Button>
          ))}
        </div>
        
        {/* User info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUserTie} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">Utilisateur</p>
              <p className="text-sm text-gray-600">{currentUserRole}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};



