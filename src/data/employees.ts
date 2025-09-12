import { Employee } from "@/types/repas-cdl";
import { completeEmployeesList } from "./complete-employees-list";

export const employees: Employee[] = completeEmployeesList;

// Fonction utilitaire pour obtenir les employés par statut
export const getEmployeesByStatus = (status: string) => {
  return employees.filter(emp => emp.statut_dossier === status);
};

// Fonction utilitaire pour rechercher des employés par nom
export const searchEmployeesByName = (searchTerm: string) => {
  return employees.filter(emp => 
    emp.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Fonction utilitaire pour obtenir les employés par poste
export const getEmployeesByPosition = (position: string) => {
  return employees.filter(emp => 
    emp.poste_actuel?.toLowerCase().includes(position.toLowerCase())
  );
};

// Fonction utilitaire pour obtenir les employés par type de contrat
export const getEmployeesByContractType = (contractType: string) => {
  return employees.filter(emp => emp.type_contrat === contractType);
};
