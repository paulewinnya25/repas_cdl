import type { Patient, Menus } from '@/types/repas-cdl';

export const initialPatients: Omit<Patient, 'id' | 'created_at'>[] = [
  {
    name: 'Marie KOUMBA',
    room: '101',
    service: 'Cardiologie',
    diet: 'Sans sel',
    allergies: 'Aucune',
    entry_date: new Date().toISOString(),
    exit_date: null,
  },
  {
    name: 'Jean MBENG',
    room: '205',
    service: 'Chirurgie',
    diet: 'Normal',
    allergies: 'Allergie aux fruits de mer',
    entry_date: new Date().toISOString(),
    exit_date: null,
  },
  {
    name: 'Sophie NDONG',
    room: '301',
    service: 'Médecine Interne',
    diet: 'Diabétique',
    allergies: 'Aucune',
    entry_date: new Date().toISOString(),
    exit_date: null,
  }
];

export const initialMenus: Menus = {
  'Petit-déjeuner': {
    'Normal': 'Café/Thé, Pain beurre confiture, Œuf à la coque, Fruit',
    'Diabétique': 'Café/Thé sans sucre, Pain complet, Œuf à la coque, Fruit',
    'Hypertension': 'Café/Thé, Pain sans sel, Œuf à la coque, Fruit',
    'Sans sel': 'Café/Thé, Pain sans sel, Œuf à la coque, Fruit',
    'Liquide': 'Bouillon, Jus de fruit, Thé',
    'Sans résidu': 'Thé léger, biscottes, gelée de fruits',
    'Mixé': 'Porridge fin, compote de fruits mixée, yaourt liquide',
    'Enrichi': 'Lait entier avec poudre de protéines, pain de mie avec beurre et miel',
    'Hypocalorique': 'Thé ou café sans sucre, yaourt 0%, tranche de pain complet',
  },
  'Déjeuner': {
    'Normal': 'Riz, Poisson grillé, Légumes sautés, Salade, Fruit',
    'Diabétique': 'Riz complet, Poisson grillé, Légumes vapeur, Salade, Fruit',
    'Hypertension': 'Riz, Poisson grillé sans sel, Légumes vapeur, Salade',
    'Sans sel': 'Riz, Poisson grillé sans sel, Légumes vapeur, Salade',
    'Liquide': 'Bouillon de légumes, Jus de fruit, Compote',
    'Sans résidu': 'Filet de poisson blanc vapeur, purée de carottes, riz blanc',
    'Mixé': 'Purée de légumes et poulet mixé, semoule fine',
    'Enrichi': 'Viande hachée avec crème, purée de pommes de terre enrichie, légumes',
    'Hypocalorique': 'Blanc de poulet grillé, quinoa, salade verte, fruit',
  },
  'Dîner': {
    'Normal': 'Soupe, Poulet rôti, Purée de pommes de terre, Légumes',
    'Diabétique': 'Soupe de légumes, Poulet grillé, Purée sans beurre, Légumes',
    'Hypertension': 'Soupe sans sel, Poulet grillé sans sel, Purée, Légumes',
    'Sans sel': 'Soupe sans sel, Poulet grillé sans sel, Purée, Légumes',
    'Liquide': 'Bouillon, Jus de légumes, Compote',
    'Sans résidu': 'Velouté de courgettes, jambon blanc, pâtes fines',
    'Mixé': 'Soupe de légumes mixée, poisson blanc mixé',
    'Enrichi': 'Soupe enrichie en protéines, gratin de pâtes à la béchamel',
    'Hypocalorique': 'Soupe de légumes, filet de colin vapeur, haricots verts',
  },
  'Collation': {
    'Normal': 'Fruit, Yaourt',
    'Diabétique': 'Fruit, Yaourt sans sucre',
    'Hypertension': 'Fruit, Yaourt nature',
    'Sans sel': 'Fruit, Yaourt nature',
    'Liquide': 'Jus de fruit',
    'Sans résidu': 'Compote de pomme',
    'Mixé': 'Yaourt à boire',
    'Enrichi': 'Milkshake protéiné',
    'Hypocalorique': 'Pomme',
  }
};

export const services = ['Cardiologie', 'Chirurgie', 'Médecine Interne', 'Gynécologie', 'Pédiatrie'] as const;
export const diets = ['Normal', 'Diabétique', 'Hypertension', 'Sans sel', 'Liquide', 'Sans résidu', 'Mixé', 'Enrichi', 'Hypocalorique'] as const;
export const mealTypes = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'] as const;