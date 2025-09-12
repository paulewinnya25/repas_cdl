import { Patient, Order } from '@/types/repas-cdl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faClock, faCheckCircle, faUtensils, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardWidgets } from '../widgets/DashboardWidgets';
import { QuickActions } from '../QuickActions';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface DashboardTabProps {
  patients: Patient[];
  orders: Order[];
  setActiveTab: (tab: string) => void;
}

const StatCard = ({ title, value, icon, colorClass }) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      <div className={`p-2 rounded-full bg-opacity-20 ${colorClass}`}>
        <FontAwesomeIcon icon={icon} className="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const getStatusBadgeVariant = (status: Order['status']): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case 'En attente d\'approbation': return 'secondary';
    case 'Approuvé': return 'secondary';
    case 'En préparation': return 'default';
    case 'Livré': return 'default';
    default: return 'outline';
  }
};

export const DashboardTab = ({ patients, orders, setActiveTab }: DashboardTabProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = today.toDateString();

  const activePatients = patients.filter(p => !p.exit_date);
  const pendingOrders = orders.filter(o => o.status !== 'Livré').length;
  const deliveredMealsToday = orders.filter(o => o.status === 'Livré' && new Date(o.date).toDateString() === todayStr).length;
  const todayMeals = orders.filter(o => new Date(o.date).toDateString() === todayStr);

  const dietCounts = activePatients.reduce((acc, patient) => {
    acc[patient.diet] = (acc[patient.diet] || 0) + 1;
    return acc;
  }, {});

  const dietChartData = {
    labels: Object.keys(dietCounts),
    datasets: [
      {
        data: Object.values(dietCounts),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#f97316', '#84cc16'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
      datalabels: {
        formatter: (value: number, ctx: any) => {
          const datapoints = ctx.chart.data.datasets[0].data as number[];
          const total = datapoints.reduce((total, datapoint) => total + datapoint, 0);
          const percentage = (value / total) * 100;
          if (percentage < 5) {
            return '';
          }
          return `${percentage.toFixed(1)}%`;
        },
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 14,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Aperçu du jour</h2>
        <Button>
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Générer le rapport du jour
        </Button>
      </div>

      {/* Actions rapides */}
      <QuickActions />

      {/* Widgets avancés */}
      <DashboardWidgets />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => setActiveTab('patients')} className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg">
          <StatCard title="Patients Actifs" value={activePatients.length} icon={faUsers} colorClass="bg-blue-500 text-blue-600" />
        </div>
        <div onClick={() => setActiveTab('orders')} className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg">
          <StatCard title="Commandes en attente" value={pendingOrders} icon={faClock} colorClass="bg-yellow-500 text-yellow-600" />
        </div>
        <div onClick={() => setActiveTab('orders')} className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg">
          <StatCard title="Repas livrés (aujourd'hui)" value={deliveredMealsToday} icon={faCheckCircle} colorClass="bg-green-500 text-green-600" />
        </div>
        <div onClick={() => setActiveTab('orders')} className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg">
          <StatCard title="Repas du jour" value={todayMeals.length} icon={faUtensils} colorClass="bg-purple-500 text-purple-600" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Commandes du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Chambre</TableHead>
                    <TableHead>Repas</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayMeals.length > 0 ? todayMeals.map(order => {
                    const patient = patients.find(p => p.id === order.patient_id);
                    return (
                      <TableRow key={order.id}>
                        <TableCell>{patient?.name || 'N/A'}</TableCell>
                        <TableCell>{patient?.room || 'N/A'}</TableCell>
                        <TableCell>{order.meal_type}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Aucune commande pour aujourd'hui.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Répartition par régime</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '300px' }}>
                <Doughnut data={dietChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};