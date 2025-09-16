import { services, diets, mealTypes } from "@/data/repas-cdl";

export type Service = typeof services[number];
export type Diet = typeof diets[number];
export type MealType = typeof mealTypes[number];
export type OrderStatus = 'En attente d\'approbation' | 'Approuvé' | 'En préparation' | 'Prêt pour livraison' | 'Livré' | 'Annulé';
export type UserRole = 'Infirmier' | 'Employé' | 'Aide Cuisinier' | 'Chef Cuisinier' | 'Super Admin';
export type DayOfWeek = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';

export const userRoles: UserRole[] = ['Infirmier', 'Employé', 'Aide Cuisinier', 'Chef Cuisinier', 'Super Admin'];

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
}

export interface Patient {
  id: string;
  name: string;
  room: string;
  service: Service;
  diet: Diet;
  allergies: string | null;
  created_at: string;
  entry_date: string;
  exit_date: string | null;
}

export interface Order {
  id: string;
  patient_id: string;
  meal_type: MealType;
  menu: string;
  instructions: string;
  status: OrderStatus;
  date: string;
  created_at?: string;
  prepared_at?: string;
  delivered_at?: string;
  patients?: {
    id: string;
    name: string;
    room: string;
  };
}

export interface Menus {
  [mealType: string]: {
    [diet: string]: string;
  };
}

export interface EmployeeMenu {
  id: string;
  name: string;
  description?: string;
  photo_url: string;
  price: number;
  preparation_time: number;
  is_available: boolean;
  created_at: string;
  accompaniment_options?: string; // CSV: "Riz, Plantain, Frites"
}

export type EmployeeOrderStatus = 'Commandé' | 'En préparation' | 'Prêt pour livraison' | 'Livré' | 'Annulé';

export interface EmployeeOrder {
  id: string;
  employee_id: string;
  employee_name?: string;
  menu_id: string;
  delivery_location: string;
  special_instructions?: string;
  quantity: number;
  accompaniments: number;
  status: EmployeeOrderStatus;
  total_price: number;
  created_at: string;
  employee_menus?: {
    name: string;
    description: string;
    price: number;
  };
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface WeeklyMenuItem {
  id?: string;
  day_of_week: DayOfWeek;
  meal_type: MealType;
  dish_name: string;
  description?: string;
  photo_url?: string;
}

export type DietaryRestriction = 'Normal' | 'Diabétique' | 'Cardiaque' | 'Hypertension' | 
  'Sans sel' | 'Sans gluten' | 'Végétarien' | 'Végétalien' |
  'Hypocalorique' | 'Hypercalorique' | 'Protéiné' | 'Liquide';

export type PatientMealType = 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';

export interface PatientMenu {
  id: string;
  name: string;
  description: string;
  photo_url?: string;
  price: number;
  dietary_restriction: DietaryRestriction;
  meal_type: PatientMealType;
  day_of_week: DayOfWeek;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Types pour les employés basés sur la table effectif
export type EmployeeStatus = 'Dossier complet' | 'Dossier à completer' | 'Dossier en cours de traitement' | 'En stage' | 'En formation' | 'Contrat en cours de traitement' | 'Dossier absent' | 'Dossier à jour' | 'Dossier complet pour passage en CDD' | 'Dossier à completer pour passage en CDD' | 'Abs de contrat' | 'contrat en cours';

export type Gender = 'Homme' | 'Femme';

export type ContractType = 'CDI' | 'CDD' | 'Prestataire' | 'stage PNPE' | 'Stage';

export type EmployeeType = 'Local' | 'expatrié';

export type MaritalStatus = 'Célibataire' | 'Marié';

export type EducationLevel = 'Niveau élémentaire' | 'Niveau Bac' | 'Bac+2/3' | 'Bac+3/4' | 'Bac+4/5 - Ingénieur - Master' | 'Bac+4/5 - Ingénieur-Master' | 'Doctorat' | 'à renseigner';

export type PaymentMode = 'virement cdl' | 'espèces' | 'chèque';

export type RemunerationType = 'Salaire' | 'Honoraires' | 'Indemnité de Stage';

export interface Employee {
  id: number;
  statut_dossier: EmployeeStatus | null;
  matricule: string | null;
  nom_prenom: string;
  genre: Gender | null;
  date_naissance: string | null;
  age: number | null;
  age_restant: number | null;
  date_retraite: string | null;
  date_entree: string | null;
  lieu: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  cnss_number: string | null;
  cnamgs_number: string | null;
  poste_actuel: string | null;
  type_contrat: ContractType | null;
  date_fin_contrat: string | null;
  employee_type: EmployeeType | null;
  nationalite: string | null;
  functional_area: string | null;
  entity: string | null;
  responsable: string | null;
  statut_employe: 'Cadre' | 'Non-Cadre' | null;
  statut_marital: MaritalStatus | null;
  enfants: number | null;
  niveau_etude: EducationLevel | null;
  anciennete: string | null;
  specialisation: string | null;
  type_remuneration: RemunerationType | null;
  payment_mode: PaymentMode | null;
  categorie: string | null;
  salaire_base: number | null;
  salaire_net: number | null;
  prime_responsabilite: number | null;
  prime_penibilite: number | null;
  prime_logement: number | null;
  prime_transport: number | null;
  prime_anciennete: number | null;
  prime_enfant: number | null;
  prime_representation: number | null;
  prime_performance: number | null;
  prime_astreinte: number | null;
  honoraires: number | null;
  indemnite_stage: number | null;
  timemoto_id: string | null;
  password: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  last_login: string | null;
  password_initialized: boolean;
  first_login_date: string | null;
}