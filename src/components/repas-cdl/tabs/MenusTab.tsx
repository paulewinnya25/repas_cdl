import { useState } from 'react';
import { WeeklyMenuItem, UserRole, DayOfWeek, MealType } from '@/types/repas-cdl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { MenuForm, MenuFormData } from '../MenuForm';
import { mealTypes } from '@/data/repas-cdl';

const daysOfWeek: DayOfWeek[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface MenusTabProps {
  weeklyMenus: WeeklyMenuItem[];
  currentUserRole: UserRole;
  onDataChange: () => void;
}

export const MenusTab = ({ weeklyMenus, currentUserRole, onDataChange }: MenusTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<Partial<WeeklyMenuItem> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageMenus = currentUserRole === 'Chef Cuisinier' || currentUserRole === 'Super Admin';

  const menuMap = new Map(weeklyMenus.map(item => [`${item.day_of_week}-${item.meal_type}`, item]));

  const handleOpenModal = (day: DayOfWeek, meal: MealType) => {
    const existingItem = menuMap.get(`${day}-${meal}`);
    setSelectedMenuItem(existingItem || { day_of_week: day, meal_type: meal });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSelectedMenuItem(null);
  };

  const handleSubmit = async (values: MenuFormData) => {
    if (!selectedMenuItem) return;
    setIsSubmitting(true);
    try {
      let mediaUrl = selectedMenuItem.photo_url || null;

      if (values.photo_url instanceof File) {
        const file = values.photo_url;
        const filePath = `public/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('menu_media').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('menu_media').getPublicUrl(filePath);
        mediaUrl = urlData.publicUrl;
      }

      const dataToUpsert = {
        ...selectedMenuItem,
        dish_name: values.dish_name,
        description: values.description,
        photo_url: mediaUrl,
      };

      const { error } = await supabase.from('weekly_menu_items').upsert(dataToUpsert, {
        onConflict: 'day_of_week,meal_type'
      });

      if (error) throw error;
      showSuccess("Menu enregistré avec succès.");
      onDataChange();
      handleCloseModal();
    } catch (error) {
      showError("Une erreur est survenue lors de l'enregistrement.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (menuItem: WeeklyMenuItem) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le plat "${menuItem.dish_name}" ?`)) {
      try {
        const { error } = await supabase.from('weekly_menu_items').delete().eq('id', menuItem.id);
        if (error) throw error;
        showSuccess("Plat supprimé avec succès.");
        onDataChange();
      } catch (error) {
        showError("Erreur lors de la suppression.");
        console.error(error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Planification des Menus de la Semaine</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {daysOfWeek.map(day => (
          <div key={day} className="space-y-4">
            <h3 className="text-lg font-semibold text-center">{day}</h3>
            {mealTypes.map(meal => {
              const menuItem = menuMap.get(`${day}-${meal}`);
              return (
                <Card key={meal} className="min-h-[200px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base">{meal}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-center items-center text-center">
                    {menuItem ? (
                      <div className="w-full">
                        {menuItem.photo_url && <img src={menuItem.photo_url} alt={menuItem.dish_name} className="w-full h-24 object-cover rounded-md mb-2" />}
                        <p className="font-semibold">{menuItem.dish_name}</p>
                        <CardDescription>{menuItem.description}</CardDescription>
                        {canManageMenus && (
                          <div className="flex justify-center space-x-2 mt-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(day, meal)}>
                              <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(menuItem)}>
                              <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      canManageMenus ? (
                        <Button variant="outline" onClick={() => handleOpenModal(day, meal)}>
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          Ajouter
                        </Button>
                      ) : (
                        <p className="text-sm text-gray-500">Non défini</p>
                      )
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onInteractOutside={(e) => { if (isSubmitting) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle>{selectedMenuItem?.id ? "Modifier le plat" : "Ajouter un plat"}</DialogTitle>
          </DialogHeader>
          {selectedMenuItem && <MenuForm
            menuItem={selectedMenuItem}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            isSubmitting={isSubmitting}
          />}
        </DialogContent>
      </Dialog>
    </div>
  );
};