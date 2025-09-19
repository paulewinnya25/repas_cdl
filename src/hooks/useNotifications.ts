import { useState, useEffect, useCallback } from 'react';
import { Notification } from './NotificationSystem';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Charger les notifications depuis le localStorage au démarrage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convertir les timestamps en objets Date
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    }
  }, []);

  // Sauvegarder les notifications dans le localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Ajouter une nouvelle notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Garder seulement les 50 dernières

    // Auto-suppression après 24h
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 24 * 60 * 60 * 1000);
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  // Supprimer une notification
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Supprimer toutes les notifications lues
  const clearReadNotifications = useCallback(() => {
    setNotifications(prev => prev.filter(n => !n.read));
  }, []);

  // Supprimer toutes les notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearReadNotifications,
    clearAllNotifications
  };
};

// Fonctions utilitaires pour créer des notifications spécifiques
export const createOrderNotification = (orderType: 'patient' | 'employee', action: 'created' | 'updated' | 'delivered') => {
  const messages = {
    patient: {
      created: { title: 'Nouvelle commande patient', message: 'Une nouvelle commande patient a été créée' },
      updated: { title: 'Commande patient mise à jour', message: 'Le statut d\'une commande patient a été modifié' },
      delivered: { title: 'Commande patient livrée', message: 'Une commande patient a été livrée avec succès' }
    },
    employee: {
      created: { title: 'Nouvelle commande employé', message: 'Une nouvelle commande employé a été créée' },
      updated: { title: 'Commande employé mise à jour', message: 'Le statut d\'une commande employé a été modifié' },
      delivered: { title: 'Commande employé livrée', message: 'Une commande employé a été livrée avec succès' }
    }
  };

  return {
    type: action === 'delivered' ? 'success' as const : 'info' as const,
    category: 'order' as const,
    ...messages[orderType][action]
  };
};

export const createStockNotification = (itemName: string, level: 'low' | 'critical' | 'empty') => {
  const messages = {
    low: { title: 'Stock bas', message: `Le stock de ${itemName} est faible` },
    critical: { title: 'Stock critique', message: `Le stock de ${itemName} est critique` },
    empty: { title: 'Stock épuisé', message: `Le stock de ${itemName} est épuisé` }
  };

  return {
    type: level === 'empty' ? 'error' as const : 'warning' as const,
    category: 'stock' as const,
    ...messages[level]
  };
};

export const createDeliveryNotification = (orderId: string, status: 'ready' | 'delayed' | 'completed') => {
  const messages = {
    ready: { title: 'Commande prête', message: `La commande ${orderId} est prête pour la livraison` },
    delayed: { title: 'Livraison en retard', message: `La commande ${orderId} est en retard` },
    completed: { title: 'Livraison terminée', message: `La commande ${orderId} a été livrée` }
  };

  return {
    type: status === 'delayed' ? 'warning' as const : 'success' as const,
    category: 'delivery' as const,
    ...messages[status]
  };
};
