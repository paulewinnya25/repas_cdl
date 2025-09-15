import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faMinus, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { EmployeeMenu } from '@/types/repas-cdl';

interface MultiMenuOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menus: EmployeeMenu[];
  onPlaceOrder: (employeeName: string, specialInstructions: string, selectedMenus: Array<{menu: EmployeeMenu, accompaniments: number}>) => void;
}

const MultiMenuOrderModal: React.FC<MultiMenuOrderModalProps> = ({
  isOpen,
  onClose,
  menus,
  onPlaceOrder
}) => {
  const [employeeName, setEmployeeName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedMenus, setSelectedMenus] = useState<Array<{menu: EmployeeMenu, accompaniments: number}>>([]);

  const addMenuToOrder = (menu: EmployeeMenu) => {
    const existingIndex = selectedMenus.findIndex(item => item.menu.id === menu.id);
    
    if (existingIndex >= 0) {
      // Menu déjà sélectionné, augmenter les accompagnements
      const updatedMenus = [...selectedMenus];
      updatedMenus[existingIndex].accompaniments += 1;
      setSelectedMenus(updatedMenus);
    } else {
      // Nouveau menu
      setSelectedMenus([...selectedMenus, {menu, accompaniments: 1}]);
    }
  };

  const removeMenuFromOrder = (menuId: string) => {
    setSelectedMenus(selectedMenus.filter(item => item.menu.id !== menuId));
  };

  const updateAccompaniments = (menuId: string, accompaniments: number) => {
    if (accompaniments < 1) return;
    
    const updatedMenus = selectedMenus.map(item => 
      item.menu.id === menuId ? {...item, accompaniments} : item
    );
    setSelectedMenus(updatedMenus);
  };

  const calculateTotalPrice = () => {
    return selectedMenus.reduce((total, item) => {
      const calculatePrice = (basePrice: number, accompaniments: number) => {
        return accompaniments === 2 ? 2000 : basePrice;
      };
      return total + calculatePrice(item.menu.price, item.accompaniments);
    }, 0);
  };

  const handleSubmit = () => {
    if (!employeeName || selectedMenus.length === 0) {
      return;
    }
    
    onPlaceOrder(employeeName, specialInstructions, selectedMenus);
    
    // Reset form
    setEmployeeName('');
    setSpecialInstructions('');
    setSelectedMenus([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Commande Multi-Menus</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations employé */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee-name">Nom de l'employé *</Label>
              <Input
                id="employee-name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Nom complet de l'employé"
              />
            </div>
            
            <div>
              <Label htmlFor="special-instructions">Instructions spéciales</Label>
              <Textarea
                id="special-instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Instructions particulières..."
                rows={3}
              />
            </div>
          </div>

          {/* Sélection des menus */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sélectionner les menus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menus.map(menu => (
                <div key={menu.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  {menu.photo_url ? (
                    <img 
                      src={menu.photo_url} 
                      alt={menu.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <FontAwesomeIcon icon={faUtensils} className="text-green-600 text-2xl" />
                    </div>
                  )}
                  
                  <h4 className="font-semibold text-lg mb-2">{menu.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{menu.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {menu.price.toLocaleString('fr-FR')} XAF
                    </Badge>
                    <Badge variant={menu.is_available ? 'default' : 'secondary'}>
                      {menu.is_available ? 'Disponible' : 'Indisponible'}
                    </Badge>
                  </div>
                  
                  <Button 
                    onClick={() => addMenuToOrder(menu)}
                    disabled={!menu.is_available}
                    className="w-full"
                    size="sm"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Ajouter au panier
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Panier de commande */}
          {selectedMenus.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Panier de commande</h3>
              <div className="space-y-3">
                {selectedMenus.map(item => (
                  <div key={item.menu.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faUtensils} className="text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.menu.name}</h4>
                        <p className="text-sm text-gray-600">{item.menu.price.toLocaleString('fr-FR')} XAF</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAccompaniments(item.menu.id, item.accompaniments - 1)}
                          disabled={item.accompaniments <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </Button>
                        <span className="w-8 text-center">{item.accompaniments}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAccompaniments(item.menu.id, item.accompaniments + 1)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </Button>
                      </div>
                      
                      <span className="font-medium w-20 text-right">
                        {(item.accompaniments === 2 ? 2000 : item.menu.price).toLocaleString('fr-FR')} XAF
                      </span>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeMenuFromOrder(item.menu.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      {calculateTotalPrice().toLocaleString('fr-FR')} XAF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!employeeName || selectedMenus.length === 0}
            >
              Passer la commande
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiMenuOrderModal;
