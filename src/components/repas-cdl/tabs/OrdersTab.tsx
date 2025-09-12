import { useState } from 'react';
import { Order, Patient, UserRole, OrderStatus, WeeklyMenuItem } from '@/types/repas-cdl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck, faUtensils, faBox, faTruck } from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderForm, OrderFormData } from '../OrderForm';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { format, isValid } from 'date-fns';

interface OrdersTabProps {
  orders: Order[];
  patients: Patient[];
  weeklyMenus: WeeklyMenuItem[];
  currentUserRole: UserRole;
  onDataChange: () => void;
}

const getStatusClass = (status: Order['status']) => {
  switch (status) {
    case 'En attente d\'approbation': return 'bg-yellow-100 text-yellow-800';
    case 'Approuvé': return 'bg-blue-100 text-blue-800';
    case 'En préparation': return 'bg-indigo-100 text-indigo-800';
    case 'Prêt pour livraison': return 'bg-purple-100 text-purple-800';
    case 'Livré': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const OrdersTab = ({ orders, patients, weeklyMenus, currentUserRole, onDataChange }: OrdersTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, extraData: object = {}) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, ...extraData })
        .eq('id', orderId);
      if (error) throw error;
      showSuccess(`Commande marquée comme "${newStatus}".`);
      onDataChange();
    } catch (error) {
      showError("Erreur lors de la mise à jour du statut.");
      console.error(error);
    }
  };

  const isCook = currentUserRole === 'Aide Cuisinier' || currentUserRole === 'Chef Cuisinier' || currentUserRole === 'Super Admin';
  const canCreateOrder = currentUserRole === 'Infirmier' || currentUserRole === 'Super Admin';
  const canDeliver = currentUserRole === 'Infirmier' || currentUserRole === 'Super Admin';

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: OrderFormData) => {
    setIsSubmitting(true);
    try {
      const newOrder = {
        ...values,
        status: 'En attente d\'approbation',
        date: new Date().toISOString(),
      };
      const { error } = await supabase.from('orders').insert([newOrder]);
      if (error) throw error;
      showSuccess("Commande créée avec succès.");
      onDataChange();
      handleCloseModal();
    } catch (error) {
      showError("Une erreur est survenue lors de la création de la commande.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTimestamp = (timestamp: string | undefined | null) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (isValid(date)) {
      return format(date, 'HH:mm');
    }
    return 'Heure invalide';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Commandes de Repas</h2>
        {canCreateOrder && (
          <Button onClick={handleOpenModal}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nouvelle Commande
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {orders.map(order => {
          const patient = patients.find(p => p.id === order.patient_id);
          const preparedTime = renderTimestamp(order.prepared_at);
          const deliveredTime = renderTimestamp(order.delivered_at);

          return (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{patient?.name || 'Patient inconnu'}</CardTitle>
                    <p className="text-sm text-gray-500">Chambre {patient?.room} - {order.meal_type}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>{order.status}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p><strong>Menu:</strong> {order.menu}</p>
                {order.instructions && <p><strong>Instructions:</strong> {order.instructions}</p>}
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  {preparedTime && <p><strong>Prêt à:</strong> {preparedTime}</p>}
                  {deliveredTime && <p><strong>Livré à:</strong> {deliveredTime}</p>}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  {isCook && order.status === 'En attente d\'approbation' && (
                    <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'Approuvé')}>
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      Approuver
                    </Button>
                  )}
                  {isCook && order.status === 'Approuvé' && (
                    <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'En préparation')}>
                      <FontAwesomeIcon icon={faUtensils} className="mr-2" />
                      Commencer la préparation
                    </Button>
                  )}
                  {isCook && order.status === 'En préparation' && (
                    <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'Prêt pour livraison', { prepared_at: new Date().toISOString() })}>
                      <FontAwesomeIcon icon={faBox} className="mr-2" />
                      Repas Prêt
                    </Button>
                  )}
                  {canDeliver && order.status === 'Prêt pour livraison' && (
                    <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'Livré', { delivered_at: new Date().toISOString() })}>
                      <FontAwesomeIcon icon={faTruck} className="mr-2" />
                      Marquer comme Livré
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onInteractOutside={(e) => { if (isSubmitting) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle>Nouvelle commande</DialogTitle>
          </DialogHeader>
          <OrderForm
            patients={patients}
            weeklyMenus={weeklyMenus}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};