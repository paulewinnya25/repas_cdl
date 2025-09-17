import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBellSlash, faCheck, faTimes, faExclamationTriangle, faInfoCircle, faCheckCircle, faClock, faCog } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Simuler des notifications pour la démo
      const demoNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Commande livrée',
          message: 'Votre commande "Riz au poisson" a été livrée avec succès.',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          actionUrl: '/orders',
          actionText: 'Voir la commande'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Menu indisponible',
          message: 'Le menu "Poulet rôti" n\'est plus disponible pour aujourd\'hui.',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          actionUrl: '/menus',
          actionText: 'Voir les menus'
        },
        {
          id: '3',
          type: 'info',
          title: 'Nouveau menu disponible',
          message: 'Un nouveau menu "Salade de fruits" est maintenant disponible.',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          actionUrl: '/menus',
          actionText: 'Découvrir'
        },
        {
          id: '4',
          type: 'error',
          title: 'Problème de livraison',
          message: 'Délai de livraison prolongé pour votre commande en cours.',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          actionUrl: '/orders',
          actionText: 'Suivre la commande'
        }
      ];

      setNotifications(demoNotifications);
      setUnreadCount(demoNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // En production, mettre à jour en base de données
      // await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
      
      showSuccess('Notification marquée comme lue');
    } catch (error) {
      showError('Erreur lors de la mise à jour');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      // En production, mettre à jour en base de données
      // await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', user.id);
      
      showSuccess('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      showError('Erreur lors de la mise à jour');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.isRead ? prev - 1 : prev;
      });
      
      showSuccess('Notification supprimée');
    } catch (error) {
      showError('Erreur lors de la suppression');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return faCheckCircle;
      case 'warning': return faExclamationTriangle;
      case 'error': return faTimes;
      default: return faInfoCircle;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} jour(s)`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FontAwesomeIcon icon={faBell} className="mr-3 text-blue-600" />
            Centre de Notifications
          </h1>
          <p className="text-gray-600">Gérez vos notifications et alertes</p>
        </div>
        <div className="flex space-x-3">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              Tout marquer comme lu
            </Button>
          )}
          <Button variant="outline">
            <FontAwesomeIcon icon={faCog} className="mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FontAwesomeIcon icon={faBell} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Non lues</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Lues</p>
                <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faBell} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Toutes ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Non lues ({unreadCount})</TabsTrigger>
          <TabsTrigger value="important">Importantes</TabsTrigger>
          <TabsTrigger value="archived">Archivées</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FontAwesomeIcon icon={faBellSlash} className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune notification</h3>
                <p className="text-gray-500">Vous n'avez pas encore de notifications.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map(notification => (
              <Card key={notification.id} className={`transition-all duration-200 ${!notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                      <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      
                      {notification.actionUrl && (
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">
                            {notification.actionText}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications.filter(n => !n.isRead).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Toutes les notifications sont lues</h3>
                <p className="text-gray-500">Vous êtes à jour !</p>
              </CardContent>
            </Card>
          ) : (
            notifications.filter(n => !n.isRead).map(notification => (
              <Card key={notification.id} className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                      <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      
                      {notification.actionUrl && (
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">
                            {notification.actionText}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="important" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune notification importante</h3>
              <p className="text-gray-500">Les notifications importantes apparaîtront ici.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <FontAwesomeIcon icon={faBellSlash} className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune notification archivée</h3>
              <p className="text-gray-500">Les notifications supprimées apparaîtront ici.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};









