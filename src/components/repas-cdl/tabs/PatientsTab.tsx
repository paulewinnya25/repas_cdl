import { useState } from 'react';
import { Patient, UserRole } from '@/types/repas-cdl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faHospital, faUtensils, faExclamationTriangle, faCalendarAlt, faPersonWalkingArrowRight } from '@fortawesome/free-solid-svg-icons';
import { PatientForm, PatientFormData } from '../PatientForm';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { format, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';

interface PatientsTabProps {
  patients: Patient[];
  currentUserRole: UserRole;
  onDataChange: () => void;
}

export const PatientsTab = ({ patients, currentUserRole, onDataChange }: PatientsTabProps) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dischargeDate, setDischargeDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManagePatients = currentUserRole === 'Infirmier' || currentUserRole === 'Super Admin';

  const handleOpenFormModal = (patient?: Patient) => {
    setSelectedPatient(patient || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (isSubmitting) return;
    setIsFormModalOpen(false);
    setSelectedPatient(null);
  };

  const handleOpenDischargeModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setDischargeDate(new Date());
    setIsDischargeModalOpen(true);
  };

  const handleCloseDischargeModal = () => {
    setIsDischargeModalOpen(false);
    setSelectedPatient(null);
  };

  const handleSubmit = async (values: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const patientData = {
        name: values.name,
        room: values.room,
        service: values.service,
        diet: values.diet,
        allergies: values.allergies || null,
      };

      if (selectedPatient) {
        const { error } = await supabase.from('patients').update(patientData).eq('id', selectedPatient.id);
        if (error) throw error;
        showSuccess("Patient mis à jour avec succès.");
      } else {
        const { error } = await supabase.from('patients').insert([patientData]);
        if (error) throw error;
        showSuccess("Patient ajouté avec succès.");
      }
      onDataChange();
      handleCloseFormModal();
    } catch (error: any) {
      console.error("Detailed error:", error);
      const errorMessage = error.message || "Une erreur inconnue est survenue.";
      showError(`Erreur: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDischarge = async () => {
    if (!selectedPatient || !dischargeDate) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({ exit_date: format(dischargeDate, 'yyyy-MM-dd') })
        .eq('id', selectedPatient.id);
      if (error) throw error;
      showSuccess(`${selectedPatient.name} a été marqué comme sorti.`);
      onDataChange();
      handleCloseDischargeModal();
    } catch (error: any) {
      console.error("Detailed discharge error:", error);
      const errorMessage = error.message || "Une erreur inconnue est survenue.";
      showError(`Erreur: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.')) {
      try {
        const { error } = await supabase.from('patients').delete().eq('id', patientId);
        if (error) throw error;
        showSuccess("Patient supprimé avec succès.");
        onDataChange();
      } catch (error: any) {
        console.error("Detailed delete error:", error);
        const errorMessage = error.message || "Une erreur inconnue est survenue.";
        showError(`Erreur: ${errorMessage}`);
      }
    }
  };

  const activePatients = patients.filter(p => !p.exit_date);

  const renderEntryDate = (dateString: string) => {
    if (!dateString) return 'Date non spécifiée';
    const date = new Date(`${dateString}T00:00:00`);
    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy');
    }
    return 'Date invalide';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Patients Actifs</h2>
        {canManagePatients && (
          <Button onClick={() => handleOpenFormModal()}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nouveau Patient
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activePatients.map(patient => (
          <Card key={patient.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">{patient.name}</CardTitle>
              {canManagePatients && (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenFormModal(patient)}>
                    <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePatient(patient.id)}>
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600 mb-4">Chambre {patient.room}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-2" /> Entré le {renderEntryDate(patient.entry_date)}</div>
                <div className="flex items-center"><FontAwesomeIcon icon={faHospital} className="text-gray-400 mr-2" /> {patient.service}</div>
                <div className="flex items-center"><FontAwesomeIcon icon={faUtensils} className="text-gray-400 mr-2" /> <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{patient.diet}</span></div>
                {patient.allergies && patient.allergies !== 'Aucune' && (
                  <div className="flex items-center text-red-600"><FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 mr-2" /> {patient.allergies}</div>
                )}
              </div>
            </CardContent>
            {canManagePatients && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleOpenDischargeModal(patient)}>
                  <FontAwesomeIcon icon={faPersonWalkingArrowRight} className="mr-2" />
                  Fin d'hospitalisation
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent onInteractOutside={(e) => { if (isSubmitting) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle>{selectedPatient ? "Modifier le patient" : "Nouveau patient"}</DialogTitle>
          </DialogHeader>
          <PatientForm 
            patient={selectedPatient} 
            onSubmit={handleSubmit} 
            onCancel={handleCloseFormModal}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isDischargeModalOpen} onOpenChange={setIsDischargeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fin d'hospitalisation</DialogTitle>
            <DialogDescription>
              Confirmez la date de sortie pour {selectedPatient?.name}. Le patient sera ensuite archivé.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="discharge-date">Date de sortie</Label>
            <Calendar
              id="discharge-date"
              mode="single"
              selected={dischargeDate}
              onSelect={setDischargeDate}
              className="rounded-md border mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDischargeModal}>Annuler</Button>
            <Button onClick={handleDischarge} disabled={isSubmitting || !dischargeDate}>
              {isSubmitting ? "Enregistrement..." : "Confirmer la sortie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};