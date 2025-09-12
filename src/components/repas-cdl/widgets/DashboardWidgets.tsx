import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faClock, faUsers, faUtensils, faExclamationTriangle, faCheckCircle, faCalendar, faChartLine } from '@fortawesome/free-solid-svg-icons';

interface WidgetData {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  averageTime: number;
  satisfactionRate: number;
  dailyTrend: number;
  weeklyTrend: number;
}

export const DashboardWidgets = () => {
  const [widgetData, setWidgetData] = useState<WidgetData>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageTime: 0,
    satisfactionRate: 0,
    dailyTrend: 0,
    weeklyTrend: 0
  });

  useEffect(() => {
    // Simuler des données en temps réel
    const interval = setInterval(() => {
      setWidgetData({
        totalOrders: Math.floor(Math.random() * 200) + 150,
        pendingOrders: Math.floor(Math.random() * 20) + 5,
        completedOrders: Math.floor(Math.random() * 180) + 120,
        averageTime: Math.floor(Math.random() * 10) + 15,
        satisfactionRate: Math.floor(Math.random() * 10) + 85,
        dailyTrend: Math.floor(Math.random() * 20) - 10,
        weeklyTrend: Math.floor(Math.random() * 15) - 5
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, change, icon, color, trend }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                <FontAwesomeIcon 
                  icon={trend === 'up' ? faArrowUp : trend === 'down' ? faArrowDown : faClock} 
                  className={`text-xs mr-1 ${
                    trend === 'up' ? 'text-green-500' : 
                    trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`} 
                />
                <span className={`text-xs ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <FontAwesomeIcon icon={icon} className="text-white text-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProgressWidget = ({ title, value, max, color, icon }: {
    title: string;
    value: number;
    max: number;
    color: string;
    icon: any;
  }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <FontAwesomeIcon icon={icon} className="mr-2 text-gray-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{value}/{max}</span>
            <span>{Math.round((value / max) * 100)}%</span>
          </div>
          <Progress value={(value / max) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );

  const AlertWidget = ({ type, message, count }: {
    type: 'warning' | 'error' | 'info' | 'success';
    message: string;
    count: number;
  }) => {
    const getIcon = () => {
      switch (type) {
        case 'warning': return faExclamationTriangle;
        case 'error': return faExclamationTriangle;
        case 'info': return faClock;
        case 'success': return faCheckCircle;
        default: return faClock;
      }
    };

    const getColor = () => {
      switch (type) {
        case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
        case 'error': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
        case 'info': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
        case 'success': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
        default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
      }
    };

    return (
      <Card className={`border-l-4 ${getColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-center">
            <FontAwesomeIcon 
              icon={getIcon()} 
              className={`mr-3 ${
                type === 'warning' ? 'text-yellow-600' :
                type === 'error' ? 'text-red-600' :
                type === 'info' ? 'text-blue-600' :
                'text-green-600'
              }`} 
            />
            <div className="flex-1">
              <p className="font-medium">{message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{count} élément(s)</p>
            </div>
            <Badge variant={type === 'error' ? 'destructive' : 'secondary'}>
              {count}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Commandes Total"
          value={widgetData.totalOrders}
          change={widgetData.dailyTrend}
          icon={faUtensils}
          color="bg-blue-500"
          trend={widgetData.dailyTrend > 0 ? 'up' : widgetData.dailyTrend < 0 ? 'down' : 'neutral'}
        />
        <StatCard
          title="En Attente"
          value={widgetData.pendingOrders}
          change={-5}
          icon={faClock}
          color="bg-yellow-500"
          trend="down"
        />
        <StatCard
          title="Livrées"
          value={widgetData.completedOrders}
          change={widgetData.weeklyTrend}
          icon={faCheckCircle}
          color="bg-green-500"
          trend={widgetData.weeklyTrend > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Temps Moyen"
          value={`${widgetData.averageTime}min`}
          change={-2}
          icon={faClock}
          color="bg-purple-500"
          trend="down"
        />
      </div>

      {/* Widgets de progression */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgressWidget
          title="Taux de Satisfaction"
          value={widgetData.satisfactionRate}
          max={100}
          color="bg-green-500"
          icon={faCheckCircle}
        />
        <ProgressWidget
          title="Commandes du Jour"
          value={widgetData.totalOrders}
          max={250}
          color="bg-blue-500"
          icon={faCalendar}
        />
        <ProgressWidget
          title="Efficacité"
          value={85}
          max={100}
          color="bg-purple-500"
          icon={faChartLine}
        />
      </div>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AlertWidget
          type="warning"
          message="Stock faible détecté"
          count={3}
        />
        <AlertWidget
          type="info"
          message="Livraisons en cours"
          count={widgetData.pendingOrders}
        />
        <AlertWidget
          type="success"
          message="Commandes livrées aujourd'hui"
          count={widgetData.completedOrders}
        />
        <AlertWidget
          type="error"
          message="Problèmes de livraison"
          count={2}
        />
      </div>

      {/* Widget de tendances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="mr-3 text-blue-600" />
            Tendances des 7 derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Commandes</span>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faArrowUp} className="text-green-500 mr-2" />
                <span className="text-green-600 font-medium">+12%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Temps de livraison</span>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faArrowDown} className="text-green-500 mr-2" />
                <span className="text-green-600 font-medium">-8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Satisfaction</span>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faArrowUp} className="text-green-500 mr-2" />
                <span className="text-green-600 font-medium">+3%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget d'activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-3 text-purple-600" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Commande livrée', patient: 'Marie Dubois', time: 'Il y a 5 min', status: 'success' },
              { action: 'Nouveau patient', patient: 'Pierre Nguema', time: 'Il y a 12 min', status: 'info' },
              { action: 'Menu mis à jour', patient: 'Chef Cuisinier', time: 'Il y a 18 min', status: 'info' },
              { action: 'Commande annulée', patient: 'Anna Okou', time: 'Il y a 25 min', status: 'warning' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'info' ? 'bg-blue-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{activity.patient}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
