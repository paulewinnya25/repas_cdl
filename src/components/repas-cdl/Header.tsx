import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faUserCircle, faBell } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState, useCallback } from 'react';
import { UserRole } from '@/types/repas-cdl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  notificationCount: number;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export const Header = ({ currentUserRole, setCurrentUserRole, notificationCount, activeTab, setActiveTab }: HeaderProps) => {
  const [currentDate, setCurrentDate] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Erreur de chargement des notifications", error);
    } else {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  }, []);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);

    if (error) {
      console.error("Erreur de mise à jour des notifications", error);
    } else {
      fetchNotifications();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            {activeTab && setActiveTab && (
              <MobileMenu 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                currentUserRole={currentUserRole}
                notificationCount={notificationCount}
              />
            )}
            <FontAwesomeIcon icon={faUtensils} className="text-blue-600 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RepasCDL</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Centre de Diagnostic de Libreville</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:inline">{currentDate}</span>
            <ThemeToggle />
            <div className="flex items-center space-x-4">
              <Select value={currentUserRole} onValueChange={(value: UserRole) => setCurrentUserRole(value)}>
                <SelectTrigger className="w-[180px]">
                  <FontAwesomeIcon icon={faUserCircle} className="text-gray-600 mr-2" />
                  <SelectValue placeholder="Changer de rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Infirmier">Infirmier</SelectItem>
                  <SelectItem value="Aide Cuisinier">Aide Cuisinier</SelectItem>
                  <SelectItem value="Chef Cuisinier">Chef Cuisinier</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="relative">
                    <FontAwesomeIcon icon={faBell} className="text-gray-600 text-lg" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Vos 10 dernières notifications.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      {notifications.length > 0 ? notifications.map(notif => (
                        <div key={notif.id} className={`text-sm p-2 rounded-md ${!notif.read ? 'bg-blue-50' : ''}`}>
                          <p>{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      )) : <p className="text-sm text-gray-500">Aucune notification.</p>}
                    </div>
                    {unreadCount > 0 && (
                      <Button onClick={handleMarkAllAsRead} size="sm">Marquer tout comme lu</Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};