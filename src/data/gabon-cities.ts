// Villes du Gabon pour les lieux de livraison
export const gabonCities = [
  'Woleu',
  'Ntem',
  'Mpassa',
  'Lolo',
  'Ngounié',
  'Ogooué',
  'Komo',
  'Nyanga',
  'Ivindo',
  'Abanga',
  'Mbei',
  'Addis abeba'
] as const;

export type GabonCity = typeof gabonCities[number];


