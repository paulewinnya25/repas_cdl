// Provinces et villes du Gabon pour les lieux de livraison
export const gabonProvinces = {
  'Villes principales': ['Woleu', 'Ntem', 'Mpassa', 'Lolo', 'Ngounié', 'Ogooué', 'Komo', 'Nyanga', 'Ivindo', 'Abanga', 'Mbei', 'Addis abeba']
} as const;

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
export type GabonProvince = keyof typeof gabonProvinces;


