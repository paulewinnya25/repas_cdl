import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faChartBar, faChartPie, faDownload, faCalendar, faUsers, faUtensils, faClock, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalOrders: number;
  totalPatients: number;
  totalEmployees: number;
  ordersByStatus: Record<string, number>;
  ordersByMealType: Record<string, number>;
  ordersByDiet: Record<string, number>;
  dailyOrders: Array<{ date: string; count: number }>;
  popularMenus: Array<{ name: string; count: number }>;
  averageOrderTime: number;
  satisfactionRate: number;
}

export const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Récupérer les données des commandes
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: employeeOrders } = await supabase.from('employee_orders').select('*');
      const { data: patients } = await supabase.from('patients').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');

      // Calculer les statistiques
      const totalOrders = (orders?.length || 0) + (employeeOrders?.length || 0);
      const totalPatients = patients?.length || 0;
      const totalEmployees = profiles?.length || 0;

      // Statistiques par statut
      const ordersByStatus = {
        'En attente': orders?.filter(o => o.status === 'En attente d\'approbation').length || 0,
        'En préparation': orders?.filter(o => o.status === 'En préparation').length || 0,
        'Livré': orders?.filter(o => o.status === 'Livré').length || 0,
        'Annulé': orders?.filter(o => o.status === 'Annulé').length || 0,
      };

      // Statistiques par type de repas
      const ordersByMealType = {
        'Petit-déjeuner': orders?.filter(o => o.meal_type === 'Petit-déjeuner').length || 0,
        'Déjeuner': orders?.filter(o => o.meal_type === 'Déjeuner').length || 0,
        'Dîner': orders?.filter(o => o.meal_type === 'Dîner').length || 0,
      };

      // Statistiques par régime
      const ordersByDiet = {
        'Normal': orders?.filter(o => o.diet === 'Normal').length || 0,
        'Diabétique': orders?.filter(o => o.diet === 'Diabétique').length || 0,
        'Hypertension': orders?.filter(o => o.diet === 'Hypertension').length || 0,
        'Sans sel': orders?.filter(o => o.diet === 'Sans sel').length || 0,
        'Liquide': orders?.filter(o => o.diet === 'Liquide').length || 0,
      };

      // Menus populaires
      const menuCounts: Record<string, number> = {};
      orders?.forEach(order => {
        menuCounts[order.menu] = (menuCounts[order.menu] || 0) + 1;
      });
      const popularMenus = Object.entries(menuCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Données quotidiennes (simulées pour la démo)
      const dailyOrders = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5
      })).reverse();

      setAnalyticsData({
        totalOrders,
        totalPatients,
        totalEmployees,
        ordersByStatus,
        ordersByMealType,
        ordersByDiet,
        dailyOrders,
        popularMenus,
        averageOrderTime: 25, // minutes
        satisfactionRate: 92 // pourcentage
      });

    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const exportReport = () => {
    if (!analyticsData) return;
    
    const reportData = {
      ...analyticsData,
      generatedAt: new Date().toISOString(),
      timeRange
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faChartLine} className="text-6xl text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600">Aucune donnée disponible</h3>
        <p className="text-gray-500">Les analytics seront disponibles une fois que des commandes auront été passées.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Rapports</h1>
          <p className="text-gray-600">Tableau de bord des performances et tendances</p>
        </div>
        <div className="flex space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faUtensils} className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalOrders}</p>
                <div className="flex items-center mt-1">
                  <FontAwesomeIcon icon={faArrowUp} className="text-green-500 text-xs mr-1" />
                  <span className="text-xs text-green-600">+12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faUsers} className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Patients Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalPatients}</p>
                <div className="flex items-center mt-1">
                  <FontAwesomeIcon icon={faArrowUp} className="text-green-500 text-xs mr-1" />
                  <span className="text-xs text-green-600">+5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FontAwesomeIcon icon={faClock} className="text-orange-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Temps Moyen</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.averageOrderTime}min</p>
                <div className="flex items-center mt-1">
                  <FontAwesomeIcon icon={faArrowDown} className="text-red-500 text-xs mr-1" />
                  <span className="text-xs text-red-600">-3min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faChartPie} className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.satisfactionRate}%</p>
                <div className="flex items-center mt-1">
                  <FontAwesomeIcon icon={faArrowUp} className="text-green-500 text-xs mr-1" />
                  <span className="text-xs text-green-600">+2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faChartBar} className="mr-3 text-blue-600" />
              Commandes par Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      status === 'Livré' ? 'bg-green-500' :
                      status === 'En préparation' ? 'bg-orange-500' :
                      status === 'En attente' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium">{status}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menus populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-3 text-green-600" />
              Menus Populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.popularMenus.map((menu, index) => (
                <div key={menu.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="font-medium">{menu.name}</span>
                  </div>
                  <Badge variant="outline">{menu.count} commandes</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par régime et type de repas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Régime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsData.ordersByDiet).map(([diet, count]) => (
                <div key={diet} className="flex items-center justify-between">
                  <span className="font-medium">{diet}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(analyticsData.ordersByDiet))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Type de Repas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsData.ordersByMealType).map(([mealType, count]) => (
                <div key={mealType} className="flex items-center justify-between">
                  <span className="font-medium">{mealType}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(analyticsData.ordersByMealType))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
