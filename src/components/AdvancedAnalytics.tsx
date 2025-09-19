import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrendingUp, faTrendingDown, faChartLine, faUsers, faUtensils, faClock } from '@fortawesome/free-solid-svg-icons';

interface AnalyticsData {
  date: string;
  patientOrders: number;
  employeeOrders: number;
  totalRevenue: number;
  deliveryTime: number;
}

interface AdvancedAnalyticsProps {
  orders: any[];
  employeeOrders: any[];
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ orders, employeeOrders }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);

  // Couleurs du logo
  const LOGO_COLORS = {
    blue: '#5ac2ec',
    green: '#41b8ac'
  };

  // Générer des données d'analytics basées sur les commandes
  useEffect(() => {
    const generateAnalyticsData = () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const data: AnalyticsData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Filtrer les commandes pour cette date
        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at || order.date || '').toISOString().split('T')[0];
          return orderDate === dateStr;
        });
        
        const dayEmployeeOrders = employeeOrders.filter(order => {
          const orderDate = new Date(order.created_at || '').toISOString().split('T')[0];
          return orderDate === dateStr;
        });
        
        data.push({
          date: dateStr,
          patientOrders: dayOrders.length,
          employeeOrders: dayEmployeeOrders.length,
          totalRevenue: dayEmployeeOrders.reduce((sum, order) => sum + (order.total_price || 0), 0),
          deliveryTime: Math.random() * 30 + 15 // Simulation du temps de livraison
        });
      }
      
      setAnalyticsData(data);
    };

    generateAnalyticsData();
  }, [orders, employeeOrders, timeRange]);

  // Calculer les tendances
  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    return ((last - first) / first) * 100;
  };

  const patientTrend = calculateTrend(analyticsData.map(d => d.patientOrders));
  const employeeTrend = calculateTrend(analyticsData.map(d => d.employeeOrders));
  const revenueTrend = calculateTrend(analyticsData.map(d => d.totalRevenue));

  // Données pour le graphique en secteurs
  const pieData = [
    { name: 'Patients', value: analyticsData.reduce((sum, d) => sum + d.patientOrders, 0), color: LOGO_COLORS.green },
    { name: 'Employés', value: analyticsData.reduce((sum, d) => sum + d.employeeOrders, 0), color: LOGO_COLORS.blue }
  ];

  // Statistiques par statut
  const statusData = [
    { name: 'En attente', value: orders.filter(o => o.status?.includes('attente')).length },
    { name: 'En préparation', value: orders.filter(o => o.status === 'En préparation').length },
    { name: 'Livré', value: orders.filter(o => o.status === 'Livré').length }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de période */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: LOGO_COLORS.blue }}>
          📊 Analytics Avancés
        </h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{
                backgroundColor: timeRange === range ? LOGO_COLORS.blue : 'transparent',
                border: `1px solid ${timeRange === range ? LOGO_COLORS.blue : '#e5e7eb'}`
              }}
            >
              {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commandes Patients</p>
                <p className="text-2xl font-bold" style={{ color: LOGO_COLORS.green }}>
                  {analyticsData.reduce((sum, d) => sum + d.patientOrders, 0)}
                </p>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={patientTrend >= 0 ? faTrendingUp : faTrendingDown} 
                  className={`text-sm ${patientTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}
                />
                <span className={`text-xs ml-1 ${patientTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(patientTrend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commandes Employés</p>
                <p className="text-2xl font-bold" style={{ color: LOGO_COLORS.blue }}>
                  {analyticsData.reduce((sum, d) => sum + d.employeeOrders, 0)}
                </p>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={employeeTrend >= 0 ? faTrendingUp : faTrendingDown} 
                  className={`text-sm ${employeeTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}
                />
                <span className={`text-xs ml-1 ${employeeTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(employeeTrend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recettes</p>
                <p className="text-2xl font-bold" style={{ color: LOGO_COLORS.green }}>
                  {analyticsData.reduce((sum, d) => sum + d.totalRevenue, 0).toLocaleString('fr-FR')} XAF
                </p>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={revenueTrend >= 0 ? faTrendingUp : faTrendingDown} 
                  className={`text-sm ${revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}
                />
                <span className={`text-xs ml-1 ${revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(revenueTrend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps Moyen</p>
                <p className="text-2xl font-bold" style={{ color: LOGO_COLORS.blue }}>
                  {Math.round(analyticsData.reduce((sum, d) => sum + d.deliveryTime, 0) / analyticsData.length)}min
                </p>
              </div>
              <FontAwesomeIcon icon={faClock} className="text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendances des commandes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} style={{ color: LOGO_COLORS.blue }} />
              Tendances des Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="patientOrders" 
                  stroke={LOGO_COLORS.green} 
                  strokeWidth={2}
                  name="Patients"
                />
                <Line 
                  type="monotone" 
                  dataKey="employeeOrders" 
                  stroke={LOGO_COLORS.blue} 
                  strokeWidth={2}
                  name="Employés"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des commandes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} style={{ color: LOGO_COLORS.green }} />
              Répartition des Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Statuts des commandes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUtensils} style={{ color: LOGO_COLORS.blue }} />
              Commandes par Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={LOGO_COLORS.blue} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendances des recettes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTrendingUp} style={{ color: LOGO_COLORS.green }} />
              Évolution des Recettes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  formatter={(value) => [`${value.toLocaleString('fr-FR')} XAF`, 'Recettes']}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalRevenue" 
                  stroke={LOGO_COLORS.green} 
                  strokeWidth={2}
                  name="Recettes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
