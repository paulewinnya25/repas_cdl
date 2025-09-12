import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Employee, EmployeeStatus, Gender, ContractType, EmployeeType, MaritalStatus, EducationLevel, PaymentMode, RemunerationType } from '@/types/repas-cdl';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (employee: Partial<Employee>) => void;
  onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    statut_dossier: employee?.statut_dossier || 'Dossier à completer',
    matricule: employee?.matricule || '',
    nom_prenom: employee?.nom_prenom || '',
    genre: employee?.genre || null,
    date_naissance: employee?.date_naissance || '',
    age: employee?.age || null,
    age_restant: employee?.age_restant || null,
    date_retraite: employee?.date_retraite || '',
    date_entree: employee?.date_entree || '',
    lieu: employee?.lieu || '',
    adresse: employee?.adresse || '',
    telephone: employee?.telephone || '',
    email: employee?.email || '',
    cnss_number: employee?.cnss_number || '',
    cnamgs_number: employee?.cnamgs_number || '',
    poste_actuel: employee?.poste_actuel || '',
    type_contrat: employee?.type_contrat || null,
    date_fin_contrat: employee?.date_fin_contrat || '',
    employee_type: employee?.employee_type || null,
    nationalite: employee?.nationalite || '',
    functional_area: employee?.functional_area || '',
    entity: employee?.entity || 'CDL',
    responsable: employee?.responsable || '',
    statut_employe: employee?.statut_employe || null,
    statut_marital: employee?.statut_marital || null,
    enfants: employee?.enfants || null,
    niveau_etude: employee?.niveau_etude || null,
    anciennete: employee?.anciennete || '',
    specialisation: employee?.specialisation || '',
    type_remuneration: employee?.type_remuneration || null,
    payment_mode: employee?.payment_mode || null,
    categorie: employee?.categorie || '',
    salaire_base: employee?.salaire_base || null,
    salaire_net: employee?.salaire_net || null,
    prime_responsabilite: employee?.prime_responsabilite || null,
    prime_penibilite: employee?.prime_penibilite || null,
    prime_logement: employee?.prime_logement || null,
    prime_transport: employee?.prime_transport || null,
    prime_anciennete: employee?.prime_anciennete || null,
    prime_enfant: employee?.prime_enfant || null,
    prime_representation: employee?.prime_representation || null,
    prime_performance: employee?.prime_performance || null,
    prime_astreinte: employee?.prime_astreinte || null,
    honoraires: employee?.honoraires || null,
    indemnite_stage: employee?.indemnite_stage || null,
    emergency_contact: employee?.emergency_contact || '',
    emergency_phone: employee?.emergency_phone || '',
    password_initialized: employee?.password_initialized || false,
  });

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const employeeStatusOptions: EmployeeStatus[] = [
    'Dossier complet',
    'Dossier à completer',
    'Dossier en cours de traitement',
    'En stage',
    'En formation',
    'Contrat en cours de traitement',
    'Dossier absent',
    'Dossier à jour',
    'Dossier complet pour passage en CDD',
    'Dossier à completer pour passage en CDD',
    'Abs de contrat',
    'contrat en cours'
  ];

  const genderOptions: Gender[] = ['Homme', 'Femme'];
  const contractTypeOptions: ContractType[] = ['CDI', 'CDD', 'Prestataire', 'stage PNPE', 'Stage'];
  const employeeTypeOptions: EmployeeType[] = ['Local', 'expatrié'];
  const maritalStatusOptions: MaritalStatus[] = ['Célibataire', 'Marié'];
  const educationLevelOptions: EducationLevel[] = [
    'Niveau élémentaire',
    'Niveau Bac',
    'Bac+2/3',
    'Bac+3/4',
    'Bac+4/5 - Ingénieur - Master',
    'Bac+4/5 - Ingénieur-Master',
    'Doctorat',
    'à renseigner'
  ];
  const paymentModeOptions: PaymentMode[] = ['virement cdl', 'espèces', 'chèque'];
  const remunerationTypeOptions: RemunerationType[] = ['Salaire', 'Honoraires', 'Indemnité de Stage'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
          <TabsTrigger value="professional">Informations professionnelles</TabsTrigger>
          <TabsTrigger value="remuneration">Rémunération</TabsTrigger>
          <TabsTrigger value="emergency">Contact d'urgence</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Données personnelles de l'employé</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom_prenom">Nom et prénom *</Label>
                  <Input
                    id="nom_prenom"
                    value={formData.nom_prenom}
                    onChange={(e) => handleInputChange('nom_prenom', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={formData.genre || ''} onValueChange={(value) => handleInputChange('genre', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_naissance">Date de naissance</Label>
                  <Input
                    id="date_naissance"
                    type="date"
                    value={formData.date_naissance || ''}
                    onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalite">Nationalité</Label>
                  <Input
                    id="nationalite"
                    value={formData.nationalite || ''}
                    onChange={(e) => handleInputChange('nationalite', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statut_marital">Statut marital</Label>
                  <Select value={formData.statut_marital || ''} onValueChange={(value) => handleInputChange('statut_marital', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut marital" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatusOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enfants">Nombre d'enfants</Label>
                  <Input
                    id="enfants"
                    type="number"
                    min="0"
                    value={formData.enfants || ''}
                    onChange={(e) => handleInputChange('enfants', parseInt(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone || ''}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Textarea
                  id="adresse"
                  value={formData.adresse || ''}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations professionnelles</CardTitle>
              <CardDescription>Données professionnelles de l'employé</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matricule">Matricule</Label>
                  <Input
                    id="matricule"
                    value={formData.matricule || ''}
                    onChange={(e) => handleInputChange('matricule', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poste_actuel">Poste actuel</Label>
                  <Input
                    id="poste_actuel"
                    value={formData.poste_actuel || ''}
                    onChange={(e) => handleInputChange('poste_actuel', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type_contrat">Type de contrat</Label>
                  <Select value={formData.type_contrat || ''} onValueChange={(value) => handleInputChange('type_contrat', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_type">Type d'employé</Label>
                  <Select value={formData.employee_type || ''} onValueChange={(value) => handleInputChange('employee_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type d'employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeTypeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_entree">Date d'entrée</Label>
                  <Input
                    id="date_entree"
                    type="date"
                    value={formData.date_entree || ''}
                    onChange={(e) => handleInputChange('date_entree', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_fin_contrat">Date de fin de contrat</Label>
                  <Input
                    id="date_fin_contrat"
                    type="date"
                    value={formData.date_fin_contrat || ''}
                    onChange={(e) => handleInputChange('date_fin_contrat', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="functional_area">Zone fonctionnelle</Label>
                  <Input
                    id="functional_area"
                    value={formData.functional_area || ''}
                    onChange={(e) => handleInputChange('functional_area', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsable">Responsable</Label>
                  <Input
                    id="responsable"
                    value={formData.responsable || ''}
                    onChange={(e) => handleInputChange('responsable', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statut_employe">Statut employé</Label>
                  <Select value={formData.statut_employe || ''} onValueChange={(value) => handleInputChange('statut_employe', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cadre">Cadre</SelectItem>
                      <SelectItem value="Non-Cadre">Non-Cadre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niveau_etude">Niveau d'étude</Label>
                  <Select value={formData.niveau_etude || ''} onValueChange={(value) => handleInputChange('niveau_etude', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le niveau d'étude" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevelOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anciennete">Ancienneté</Label>
                  <Input
                    id="anciennete"
                    value={formData.anciennete || ''}
                    onChange={(e) => handleInputChange('anciennete', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialisation">Spécialisation</Label>
                  <Input
                    id="specialisation"
                    value={formData.specialisation || ''}
                    onChange={(e) => handleInputChange('specialisation', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut_dossier">Statut du dossier</Label>
                <Select value={formData.statut_dossier || ''} onValueChange={(value) => handleInputChange('statut_dossier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le statut du dossier" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeStatusOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remuneration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rémunération</CardTitle>
              <CardDescription>Informations de rémunération</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type_remuneration">Type de rémunération</Label>
                  <Select value={formData.type_remuneration || ''} onValueChange={(value) => handleInputChange('type_remuneration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type de rémunération" />
                    </SelectTrigger>
                    <SelectContent>
                      {remunerationTypeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_mode">Mode de paiement</Label>
                  <Select value={formData.payment_mode || ''} onValueChange={(value) => handleInputChange('payment_mode', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le mode de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentModeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Input
                    id="categorie"
                    value={formData.categorie || ''}
                    onChange={(e) => handleInputChange('categorie', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaire_base">Salaire de base</Label>
                  <Input
                    id="salaire_base"
                    type="number"
                    step="0.01"
                    value={formData.salaire_base || ''}
                    onChange={(e) => handleInputChange('salaire_base', parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaire_net">Salaire net</Label>
                  <Input
                    id="salaire_net"
                    type="number"
                    step="0.01"
                    value={formData.salaire_net || ''}
                    onChange={(e) => handleInputChange('salaire_net', parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prime_responsabilite">Prime de responsabilité</Label>
                  <Input
                    id="prime_responsabilite"
                    type="number"
                    step="0.01"
                    value={formData.prime_responsabilite || ''}
                    onChange={(e) => handleInputChange('prime_responsabilite', parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prime_logement">Prime de logement</Label>
                  <Input
                    id="prime_logement"
                    type="number"
                    step="0.01"
                    value={formData.prime_logement || ''}
                    onChange={(e) => handleInputChange('prime_logement', parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prime_transport">Prime de transport</Label>
                  <Input
                    id="prime_transport"
                    type="number"
                    step="0.01"
                    value={formData.prime_transport || ''}
                    onChange={(e) => handleInputChange('prime_transport', parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prime_enfant">Prime enfant</Label>
                  <Input
                    id="prime_enfant"
                    type="number"
                    step="0.01"
                    value={formData.prime_enfant || ''}
                    onChange={(e) => handleInputChange('prime_enfant', parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="honoraires">Honoraires</Label>
                  <Input
                    id="honoraires"
                    type="number"
                    step="0.01"
                    value={formData.honoraires || ''}
                    onChange={(e) => handleInputChange('honoraires', parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="indemnite_stage">Indemnité de stage</Label>
                  <Input
                    id="indemnite_stage"
                    type="number"
                    step="0.01"
                    value={formData.indemnite_stage || ''}
                    onChange={(e) => handleInputChange('indemnite_stage', parseFloat(e.target.value) || null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact d'urgence</CardTitle>
              <CardDescription>Informations de contact d'urgence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Contact d'urgence</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact || ''}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">Téléphone d'urgence</Label>
                  <Input
                    id="emergency_phone"
                    value={formData.emergency_phone || ''}
                    onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {employee ? 'Mettre à jour' : 'Créer'} l'employé
        </Button>
      </div>
    </form>
  );
};

