import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faPlus, faEdit, faTrash, faExclamationTriangle, faCheckCircle, faClock, faShoppingCart, faWarehouse, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { showSuccess, showError } from '@/utils/toast';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface RestockRequest {
  id: string;
  itemId: string;
  itemName: string;
  requestedQuantity: number;
  reason: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export const InventoryTab = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Données de démonstration
  useEffect(() => {
    const demoInventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Riz Basmati',
        category: 'Céréales',
        currentStock: 25,
        minStock: 10,
        maxStock: 100,
        unit: 'kg',
        costPerUnit: 1500,
        supplier: 'Fournisseur ABC',
        lastRestocked: '2024-01-15',
        status: 'in_stock'
      },
      {
        id: '2',
        name: 'Poulet Frais',
        category: 'Viandes',
        currentStock: 5,
        minStock: 15,
        maxStock: 50,
        unit: 'kg',
        costPerUnit: 3500,
        supplier: 'Boucherie XYZ',
        lastRestocked: '2024-01-10',
        expiryDate: '2024-01-20',
        status: 'low_stock'
      },
      {
        id: '3',
        name: 'Tomates',
        category: 'Légumes',
        currentStock: 0,
        minStock: 20,
        maxStock: 80,
        unit: 'kg',
        costPerUnit: 800,
        supplier: 'Maraîcher DEF',
        lastRestocked: '2024-01-05',
        status: 'out_of_stock'
      },
      {
        id: '4',
        name: 'Lait UHT',
        category: 'Produits Laitiers',
        currentStock: 30,
        minStock: 10,
        maxStock: 60,
        unit: 'L',
        costPerUnit: 1200,
        supplier: 'Laiterie GHI',
        lastRestocked: '2024-01-12',
        expiryDate: '2024-02-15',
        status: 'in_stock'
      },
      {
        id: '5',
        name: 'Pain Complet',
        category: 'Boulangerie',
        currentStock: 8,
        minStock: 20,
        maxStock: 100,
        unit: 'pièces',
        costPerUnit: 200,
        supplier: 'Boulangerie JKL',
        lastRestocked: '2024-01-14',
        expiryDate: '2024-01-18',
        status: 'low_stock'
      }
    ];

    const demoRequests: RestockRequest[] = [
      {
        id: '1',
        itemId: '2',
        itemName: 'Poulet Frais',
        requestedQuantity: 20,
        reason: 'Stock faible, commandes importantes prévues',
        requestedBy: 'Chef Cuisinier',
        status: 'pending',
        createdAt: '2024-01-16T10:30:00Z'
      },
      {
        id: '2',
        itemId: '3',
        itemName: 'Tomates',
        requestedQuantity: 50,
        reason: 'Rupture de stock',
        requestedBy: 'Aide Cuisinier',
        status: 'approved',
        createdAt: '2024-01-15T14:20:00Z'
      }
    ];

    setInventory(demoInventory);
    setRestockRequests(demoRequests);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="default" className="bg-green-100 text-green-800">En stock</Badge>;
      case 'low_stock':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Stock faible</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Rupture</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Expiré</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return faCheckCircle;
      case 'low_stock': return faExclamationTriangle;
      case 'out_of_stock': return faExclamationTriangle;
      case 'expired': return faExclamationTriangle;
      default: return faBox;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600';
      case 'low_stock': return 'text-yellow-600';
      case 'out_of_stock': return 'text-red-600';
      case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');
  const expiredItems = inventory.filter(item => item.status === 'expired');

  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FontAwesomeIcon icon={faWarehouse} className="mr-3 text-blue-600" />
            Gestion des Stocks
          </h1>
          <p className="text-gray-600">Suivez et gérez votre inventaire</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setIsRestockModalOpen(true)} variant="outline">
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
            Demande de réapprovisionnement
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Ajouter un article
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faBox} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
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
                <p className="text-sm text-gray-600">En Stock</p>
                <p className="text-2xl font-bold">{inventory.filter(i => i.status === 'in_stock').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Stock Faible</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faChartLine} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Valeur Totale</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString('fr-FR')} XAF</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {(lowStockItems.length > 0 || expiredItems.length > 0) && (
        <div className="space-y-3">
          {lowStockItems.length > 0 && (
            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Stock faible détecté</h3>
                    <p className="text-yellow-700">
                      {lowStockItems.length} article(s) nécessitent un réapprovisionnement urgent
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {expiredItems.length > 0 && (
            <Card className="border-l-4 border-l-red-500 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-red-800">Articles expirés</h3>
                    <p className="text-red-700">
                      {expiredItems.length} article(s) ont expiré et doivent être retirés
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Onglets */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="requests">Demandes de Réapprovisionnement</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        {/* Onglet Inventaire */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Filtres */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Liste des articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(item.status)} />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock actuel:</span>
                      <span className="font-medium">{item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock min:</span>
                      <span className="text-sm">{item.minStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Coût unitaire:</span>
                      <span className="text-sm">{item.costPerUnit.toLocaleString('fr-FR')} XAF</span>
                    </div>
                    {item.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Expire le:</span>
                        <span className="text-sm">{new Date(item.expiryDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline">
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Demandes */}
        <TabsContent value="requests" className="space-y-4">
          <div className="space-y-4">
            {restockRequests.map(request => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{request.itemName}</h3>
                        <p className="text-sm text-gray-600">
                          Quantité demandée: {request.requestedQuantity} • 
                          Demandé par: {request.requestedBy}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{request.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={
                        request.status === 'pending' ? 'secondary' :
                        request.status === 'approved' ? 'default' :
                        request.status === 'rejected' ? 'destructive' : 'default'
                      }>
                        {request.status === 'pending' ? 'En attente' :
                         request.status === 'approved' ? 'Approuvé' :
                         request.status === 'rejected' ? 'Rejeté' : 'Terminé'}
                      </Badge>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                            Approuver
                          </Button>
                          <Button size="sm" variant="outline">
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Rapports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Articles par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map(category => {
                    const count = inventory.filter(item => item.category === category).length;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="font-medium">{category}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / Math.max(...categories.map(c => inventory.filter(item => item.category === c).length))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valeur par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map(category => {
                    const value = inventory
                      .filter(item => item.category === category)
                      .reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-gray-600">{value.toLocaleString('fr-FR')} XAF</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal d'ajout d'article */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de l'article</Label>
              <Input id="name" placeholder="Ex: Riz Basmati" />
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cereales">Céréales</SelectItem>
                  <SelectItem value="viandes">Viandes</SelectItem>
                  <SelectItem value="legumes">Légumes</SelectItem>
                  <SelectItem value="produits-laitiers">Produits Laitiers</SelectItem>
                  <SelectItem value="boulangerie">Boulangerie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">Stock actuel</Label>
                <Input id="currentStock" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="minStock">Stock minimum</Label>
                <Input id="minStock" type="number" placeholder="0" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                showSuccess('Article ajouté avec succès');
                setIsModalOpen(false);
              }}>
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de demande de réapprovisionnement */}
      <Dialog open={isRestockModalOpen} onOpenChange={setIsRestockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de réapprovisionnement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item">Article</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un article" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantité demandée</Label>
              <Input id="quantity" type="number" placeholder="0" />
            </div>
            <div>
              <Label htmlFor="reason">Raison</Label>
              <Input id="reason" placeholder="Ex: Stock faible, commandes importantes" />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsRestockModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                showSuccess('Demande de réapprovisionnement envoyée');
                setIsRestockModalOpen(false);
              }}>
                Envoyer la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};



