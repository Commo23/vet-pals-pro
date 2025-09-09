import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClients } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, Syringe, Shield, AlertTriangle, Info } from 'lucide-react';
import { format, addDays, addYears } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";

// Protocoles vaccinaux prédéfinis
const vaccinationProtocols = {
  'Chien': {
    core: [
      { name: 'DHPP', interval: 365, description: 'Distemper, Hépatite, Parvovirus, Parainfluenza', manufacturer: 'Zoetis' },
      { name: 'Rage', interval: 1095, description: 'Vaccination antirabique obligatoire', manufacturer: 'Merial' }
    ],
    nonCore: [
      { name: 'Bordetella', interval: 365, description: 'Toux de chenil', manufacturer: 'Zoetis' },
      { name: 'Lyme', interval: 365, description: 'Maladie de Lyme', manufacturer: 'Boehringer Ingelheim' },
      { name: 'Leptospirose', interval: 365, description: 'Leptospirose canine', manufacturer: 'Virbac' }
    ]
  },
  'Chat': {
    core: [
      { name: 'FVRCP', interval: 365, description: 'Rhinotrachéite, Calicivirus, Panleucopénie', manufacturer: 'Virbac' },
      { name: 'Rage', interval: 1095, description: 'Vaccination antirabique', manufacturer: 'Merial' }
    ],
    nonCore: [
      { name: 'FeLV', interval: 365, description: 'Leucémie féline', manufacturer: 'Zoetis' },
      { name: 'FIV', interval: 365, description: 'Immunodéficience féline', manufacturer: 'Virbac' }
    ]
  },
  'Furet': {
    core: [
      { name: 'Distemper', interval: 365, description: 'Maladie de Carré', manufacturer: 'Merial' },
      { name: 'Rage', interval: 365, description: 'Vaccination antirabique', manufacturer: 'Merial' }
    ],
    nonCore: []
  },
  'Lapin': {
    core: [
      { name: 'Myxomatose', interval: 180, description: 'Myxomatose', manufacturer: 'Virbac' },
      { name: 'VHD', interval: 365, description: 'Maladie hémorragique virale', manufacturer: 'Virbac' }
    ],
    nonCore: []
  }
};

const locations = [
  { value: 'left_shoulder', label: 'Épaule gauche' },
  { value: 'right_shoulder', label: 'Épaule droite' },
  { value: 'left_hip', label: 'Hanche gauche' },
  { value: 'right_hip', label: 'Hanche droite' },
  { value: 'subcutaneous', label: 'Sous-cutané' }
];

interface NewVaccinationModalProps {
  children?: React.ReactNode;
  selectedPetId?: number;
  selectedClientId?: number;
  isReminder?: boolean; // Indique si c'est un rappel
  originalVaccinationId?: number; // ID du vaccin original (pour les rappels)
  open?: boolean; // Pour contrôler l'ouverture de la modale
  onOpenChange?: (open: boolean) => void; // Callback pour fermer la modale
  editingVaccination?: any; // Vaccination à éditer
}

export default function NewVaccinationModal({ 
  children, 
  selectedPetId, 
  selectedClientId,
  isReminder = false,
  originalVaccinationId,
  open,
  onOpenChange,
  editingVaccination
}: NewVaccinationModalProps) {
  const { clients, pets, addVaccination, updateVaccination, getVaccinationProtocolsBySpecies, calculateDueDateFromProtocol } = useClients();
  const { settings } = useSettings();
  
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const modalOpen = open !== undefined ? open : internalOpen;
  const setModalOpen = onOpenChange || setInternalOpen;
  const [showProtocols, setShowProtocols] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: selectedClientId || '',
    petId: selectedPetId || '',
    vaccineName: '',
    vaccineType: '',
    dateGiven: format(new Date(), 'yyyy-MM-dd'),
    batchNumber: '',
    veterinarian: '',
    notes: '',
    cost: '',
    location: '',
    manufacturer: '',
    expirationDate: '',
    adverseReactions: ''
  });

  const [selectedProtocols, setSelectedProtocols] = useState<VaccinationProtocol[]>([]);
  
  // Protection contre undefined
  const safeSelectedProtocols = selectedProtocols || [];
  const [nextDueDates, setNextDueDates] = useState<Record<string, string>>({});
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);
  const [calculatedDueDate, setCalculatedDueDate] = useState<string>(''); // Date suggérée par le protocole

  useEffect(() => {
    if (selectedClientId) {
      setFormData(prev => ({ ...prev, clientId: selectedClientId.toString() }));
    }
    if (selectedPetId) {
      setFormData(prev => ({ ...prev, petId: selectedPetId.toString() }));
    }
  }, [selectedClientId, selectedPetId]);

  // Pré-remplir le formulaire pour l'édition
  useEffect(() => {
    if (editingVaccination) {
      setFormData({
        clientId: editingVaccination.clientId.toString(),
        petId: editingVaccination.petId.toString(),
        vaccineName: editingVaccination.vaccineName,
        vaccineType: editingVaccination.vaccineType,
        dateGiven: editingVaccination.dateGiven,
        nextDueDate: editingVaccination.nextDueDate,
        batchNumber: editingVaccination.batchNumber || '',
        veterinarian: editingVaccination.veterinarian || '',
        notes: editingVaccination.notes || '',
        cost: editingVaccination.cost || '',
        location: editingVaccination.location || '',
        manufacturer: editingVaccination.manufacturer || '',
        injectionSite: editingVaccination.injectionSite || ''
      });
    }
  }, [editingVaccination]);

  // Calculer automatiquement la date de rappel selon le protocole
  useEffect(() => {
    if (formData.vaccineName && formData.dateGiven && formData.petId) {
      const selectedPet = pets.find(p => p.id === parseInt(formData.petId));
      if (selectedPet) {
        const calculatedDate = calculateDueDateFromProtocol(
          formData.vaccineName, 
          selectedPet.type, 
          formData.dateGiven
        );
        if (calculatedDate) {
          setCalculatedDueDate(calculatedDate);
        }
      }
    }
  }, [formData.vaccineName, formData.dateGiven, formData.petId, pets, calculateDueDateFromProtocol]);

  // Effet pour initialiser les dates de rappel par défaut
  useEffect(() => {
    if (safeSelectedProtocols.length > 0 && formData.dateGiven) {
      const defaults: Record<string, string> = {};
      safeSelectedProtocols.forEach(protocol => {
        protocol.intervals.forEach(interval => {
          const key = `${protocol.id}-${interval.offsetDays}`;
          defaults[key] = format(
            addDays(new Date(formData.dateGiven), interval.offsetDays),
            'yyyy-MM-dd'
          );
        });
      });
      setNextDueDates(defaults);
    } else {
      setNextDueDates({});
    }
  }, [safeSelectedProtocols, formData.dateGiven]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation différente selon le mode
    if (editingVaccination) {
      // En mode édition, seuls client et animal sont obligatoires (déjà pré-remplis)
      if (!formData.clientId || !formData.petId) {
        toast({
          title: "Erreur",
          description: "Client ou animal manquant",
          variant: "destructive"
        });
        return;
      }
    } else {
      // En mode création, validation complète
      if (!formData.clientId || !formData.petId || (safeSelectedProtocols.length === 0 && !formData.vaccineName)) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }
    }

    const client = clients.find(c => c.id === parseInt(formData.clientId as string));
    const pet = pets.find(p => p.id === parseInt(formData.petId as string));

    if (!client || !pet) {
      toast({
        title: "Erreur",
        description: "Client ou animal introuvable",
        variant: "destructive"
      });
      return;
    }

    // Ne traiter les protocoles que si on n'est pas en mode édition
    if (safeSelectedProtocols.length > 0 && !editingVaccination) {
      safeSelectedProtocols.forEach(protocol => {
        if (protocol.intervals && Array.isArray(protocol.intervals)) {
          let originalVaccinationId: number | undefined = undefined;
          
          // Créer d'abord la vaccination originale (offsetDays === 0)
          const originalInterval = protocol.intervals.find(interval => interval.offsetDays === 0);
          if (originalInterval) {
            const key = `${protocol.id}-${originalInterval.offsetDays}`;
            const dueDate = nextDueDates[key] || '';
            originalVaccinationId = addVaccination({
              clientId: parseInt(formData.clientId as string),
              clientName: clients.find(c => c.id === parseInt(formData.clientId as string))?.name || '',
              petId: parseInt(formData.petId as string),
              petName: pets.find(p => p.id === parseInt(formData.petId as string))?.name || '',
              vaccineName: `${protocol.name} (${originalInterval.label})`,
              vaccineType: protocol.vaccineType,
              dateGiven: formData.dateGiven, // Date de la vaccination originale
              nextDueDate: dueDate,
              batchNumber: formData.batchNumber,
              veterinarian: formData.veterinarian,
              notes: formData.notes,
              status: 'completed',
              cost: formData.cost,
              location: formData.location as any,
              manufacturer: protocol.manufacturer || formData.manufacturer,
              expirationDate: formData.expirationDate,
              adverseReactions: formData.adverseReactions,
              vaccinationCategory: 'new',
              isReminder: false
            });
          }
          
          // Créer ensuite les rappels (offsetDays > 0)
          protocol.intervals.forEach(interval => {
            if (interval.offsetDays > 0) {
              const key = `${protocol.id}-${interval.offsetDays}`;
              const dueDate = nextDueDates[key] || '';
              addVaccination({
                clientId: parseInt(formData.clientId as string),
                clientName: clients.find(c => c.id === parseInt(formData.clientId as string))?.name || '',
                petId: parseInt(formData.petId as string),
                petName: pets.find(p => p.id === parseInt(formData.petId as string))?.name || '',
                vaccineName: `${protocol.name} (${interval.label})`,
                vaccineType: protocol.vaccineType,
                dateGiven: dueDate, // Date spécifique du rappel
                nextDueDate: dueDate,
                batchNumber: formData.batchNumber,
                veterinarian: formData.veterinarian,
                notes: formData.notes,
                status: 'scheduled',
                cost: formData.cost,
                location: formData.location as any,
                manufacturer: protocol.manufacturer || formData.manufacturer,
                expirationDate: formData.expirationDate,
                adverseReactions: formData.adverseReactions,
                vaccinationCategory: 'reminder',
                originalVaccinationId: originalVaccinationId,
                isReminder: true
              });
            }
          });
        }
      });
      toast({title: 'Vaccinations enregistrées', description: `${safeSelectedProtocols.length} vaccinations ajoutées.`});
      setSelectedProtocols([]);
      setModalOpen(false);
      return;
    }

    // Trouver la dernière date de rappel (généralement le rappel annuel)
    const lastReminderDate = Object.values(nextDueDates).sort().pop() || calculatedDueDate || formData.dateGiven;

    if (editingVaccination) {
      // Mode édition - traiter uniquement cette ligne spécifique
      const vaccinationType = editingVaccination.vaccinationCategory === 'reminder' ? 'rappel' : 'vaccination';
      
      updateVaccination(editingVaccination.id, {
        clientId: parseInt(formData.clientId as string),
        clientName: client.name,
        petId: parseInt(formData.petId as string),
        petName: pet.name,
        vaccineName: formData.vaccineName,
        vaccineType: formData.vaccineType as 'core' | 'non-core' | 'rabies' | 'custom',
        vaccinationCategory: editingVaccination.vaccinationCategory, // Conserver la catégorie originale
        dateGiven: formData.dateGiven,
        nextDueDate: editingVaccination.vaccinationCategory === 'reminder' ? formData.dateGiven : lastReminderDate,
        calculatedDueDate: calculatedDueDate,
        batchNumber: formData.batchNumber,
        veterinarian: formData.veterinarian,
        notes: formData.notes,
        status: editingVaccination.status, // Conserver le statut original
        cost: formData.cost,
        location: formData.location as any,
        manufacturer: formData.manufacturer,
        expirationDate: formData.expirationDate,
        adverseReactions: formData.adverseReactions,
        originalVaccinationId: editingVaccination.originalVaccinationId,
        isReminder: editingVaccination.isReminder
      });

      toast({
        title: `${vaccinationType.charAt(0).toUpperCase() + vaccinationType.slice(1)} modifiée`,
        description: `${vaccinationType.charAt(0).toUpperCase() + vaccinationType.slice(1)} ${formData.vaccineName} modifiée pour ${pet.name}`,
      });
    } else {
      // Mode création
      addVaccination({
        clientId: parseInt(formData.clientId as string),
        clientName: client.name,
        petId: parseInt(formData.petId as string),
        petName: pet.name,
        vaccineName: formData.vaccineName,
        vaccineType: formData.vaccineType as 'core' | 'non-core' | 'rabies' | 'custom',
        vaccinationCategory: isReminder ? 'reminder' : 'new', // Distinction nouveau/rappel
        dateGiven: formData.dateGiven,
        nextDueDate: lastReminderDate, // Dernière date de rappel (généralement annuelle)
        calculatedDueDate: calculatedDueDate, // Date suggérée par le protocole
        batchNumber: formData.batchNumber,
        veterinarian: formData.veterinarian,
        notes: formData.notes,
        status: 'completed',
        cost: formData.cost,
        location: formData.location as any,
        manufacturer: formData.manufacturer,
        expirationDate: formData.expirationDate,
        adverseReactions: formData.adverseReactions,
        originalVaccinationId: isReminder ? originalVaccinationId : undefined,
        isReminder: isReminder
      });

      toast({
        title: "Vaccination enregistrée",
        description: `Vaccination ${formData.vaccineName} ajoutée pour ${pet.name}`,
      });
    }

    // Reset form
    setFormData({
      clientId: selectedClientId?.toString() || '',
      petId: selectedPetId?.toString() || '',
      vaccineName: '',
      vaccineType: '',
      dateGiven: format(new Date(), 'yyyy-MM-dd'),
      nextDueDate: '',
      batchNumber: '',
      veterinarian: '',
      notes: '',
      cost: '',
      location: '',
      manufacturer: '',
      expirationDate: '',
      adverseReactions: ''
    });
    setSelectedProtocols([]);
    setModalOpen(false);
  };

  const handleProtocolSelect = (protocol: any, type: string) => {
    setSelectedProtocol(protocol);
    setFormData(prev => ({
      ...prev,
      vaccineName: protocol.name,
      vaccineType: protocol.vaccineType,
      manufacturer: protocol.manufacturer || ''
    }));
    setShowProtocols(false);
  };

  const selectedPet = pets.find(p => p.id === parseInt(formData.petId));
  const availableProtocols = selectedPet ? getVaccinationProtocolsBySpecies(selectedPet.type) : [];

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Vaccination
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            {editingVaccination ? 
              (editingVaccination.vaccinationCategory === 'reminder' ? 'Modifier le Rappel' : 'Modifier la Vaccination') : 
              'Nouvelle Vaccination'
            }
          </DialogTitle>
          {editingVaccination && editingVaccination.vaccinationCategory === 'reminder' && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded-md border border-orange-200">
              <strong>Mode édition de rappel :</strong> Vous modifiez uniquement ce rappel spécifique. 
              Les autres rappels de la même vaccination ne seront pas affectés.
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sélection Client/Animal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editingVaccination && (
                  <div className="col-span-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-200">
                    <strong>Mode édition :</strong> Vous modifiez uniquement cette vaccination spécifique. 
                    Le client et l'animal sont verrouillés. Les protocoles ne sont pas affichés car ils ne s'appliquent qu'à la création.
                  </div>
                )}
                <div>
                  <Label htmlFor="clientId">Client *</Label>
                  <Select 
                    value={formData.clientId} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, clientId: value, petId: '' }));
                      setSelectedProtocol(null);
                    }}
                    disabled={editingVaccination ? true : false}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients && Array.isArray(clients) && clients.length > 0 ? (
                        clients.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-clients" disabled>
                          Aucun client trouvé
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="petId">Animal *</Label>
                  <Select 
                    value={formData.petId} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, petId: value }));
                      setSelectedProtocol(null);
                    }}
                    disabled={editingVaccination ? true : !formData.clientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets
                        .filter(pet => pet.ownerId === parseInt(formData.clientId))
                        .map(pet => (
                          <SelectItem key={pet.id} value={pet.id.toString()}>
                            {pet.name} ({pet.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

                        {/* Protocoles suggérés */}
          {availableProtocols.length > 0 && !editingVaccination && (
            <div className="space-y-2 mb-4">
              <Label>Protocoles suggérés pour {selectedPet?.type} (sélection multiple)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableProtocols.map(protocol => {
                  const checked = safeSelectedProtocols.some(p => p.id === protocol.id);
                  return (
                    <div key={protocol.id} className="flex items-center p-2 border rounded hover:bg-muted/50">
                      <Checkbox
                        id={`protocol-${protocol.id}`}
                        checked={checked}
                        onCheckedChange={(value) => {
                          if (value) setSelectedProtocols(prev => [...prev, protocol]);
                          else setSelectedProtocols(prev => prev.filter(p => p.id !== protocol.id));
                        }}
                      />
                      <label htmlFor={`protocol-${protocol.id}`} className="ml-2 flex-1 text-sm">
                        <div className="font-medium">{protocol.name}</div>
                        <div className="text-xs text-gray-600">{protocol.description}</div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

              {/* Affichage des vaccins sélectionnés si multi-selection */}
              {safeSelectedProtocols.length > 0 && !editingVaccination ? (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Vaccins sélectionnés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-sm">
                      {safeSelectedProtocols.map(protocol => (
                        <li key={protocol.id}>{protocol.name}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : (
                // Nom et type du vaccin pour sélection unique
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vaccineName">Nom du vaccin {!editingVaccination && '*'}</Label>
                    <Input
                      id="vaccineName"
                      value={formData.vaccineName}
                      onChange={(e) => setFormData(prev => ({ ...prev, vaccineName: e.target.value }))}
                      placeholder="Ex: DHPP, Rage, FVRCP..."
                      required={!editingVaccination}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vaccineType">Type de vaccin</Label>
                    <Select 
                      value={formData.vaccineType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, vaccineType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type de vaccin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="core">Essentiel</SelectItem>
                        <SelectItem value="non-core">Optionnel</SelectItem>
                        <SelectItem value="rabies">Rage</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
              }

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="dateGiven">Date d'administration {!editingVaccination && '*'}</Label>
                  <Input
                    id="dateGiven"
                    type="date"
                    value={formData.dateGiven}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateGiven: e.target.value }))}
                    required={!editingVaccination}
                  />
                </div>
              </div>

          {/* Dates de rappel spécifiques par intervalle */}
          {safeSelectedProtocols.length > 0 && !editingVaccination && (
            <div className="space-y-4 mb-4">
              {safeSelectedProtocols.map(protocol => (
                <div key={protocol.id} className="space-y-2">
                  <div className="font-medium text-sm">Étapes pour {protocol.name}</div>
                  {protocol.intervals.map(interval => {
                    const key = `${protocol.id}-${interval.offsetDays}`;
                    // Calculer la date suggérée basée sur la date d'administration + offset
                    const suggestedDate = new Date(formData.dateGiven);
                    suggestedDate.setDate(suggestedDate.getDate() + interval.offsetDays);
                    const suggestedDateString = suggestedDate.toISOString().split('T')[0];
                    
                    return (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <div className="text-sm">
                          {interval.label} (+{interval.offsetDays} jours)
                        </div>
                        <div>
                          <Label htmlFor={key}>Date de rappel</Label>
                          <Input
                            id={key}
                            type="date"
                            value={nextDueDates[key] || suggestedDateString}
                            onChange={e => setNextDueDates(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Suggérée: {suggestedDate.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="veterinarian">Vétérinaire</Label>
                  <Select 
                    value={formData.veterinarian} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, veterinarian: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un vétérinaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        console.log('Vétérinaires disponibles dans le formulaire:', settings.veterinarians);
                        return settings.veterinarians
                          .filter(vet => vet.isActive)
                          .map(vet => (
                            <SelectItem key={vet.id} value={vet.name}>
                              {vet.name}
                            </SelectItem>
                          ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Site d'injection</Label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le site" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="batchNumber">Numéro de lot</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                    placeholder="Ex: VAC2024-001"
                  />
                </div>

                <div>
                  <Label htmlFor="manufacturer">Fabricant</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    placeholder="Ex: Zoetis, Merial"
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Coût ({settings.currency})</Label>
                  <Input
                    id="cost"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expirationDate">Date d'expiration du vaccin</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes sur la vaccination..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="adverseReactions">Réactions adverses</Label>
                <Textarea
                  id="adverseReactions"
                  value={formData.adverseReactions}
                  onChange={(e) => setFormData(prev => ({ ...prev, adverseReactions: e.target.value }))}
                  placeholder="Décrire toute réaction adverse observée..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  <Syringe className="h-4 w-4 mr-2" />
                  Enregistrer la vaccination
                </Button>
              </div>
            </form>
          </div>

          {/* Panneau d'informations */}
          <div className="space-y-4">
            {selectedPet && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informations Animal</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom:</strong> {selectedPet.name}</div>
                    <div><strong>Type:</strong> {selectedPet.type}</div>
                    <div><strong>Race:</strong> {selectedPet.breed || 'Non spécifiée'}</div>
                    <div><strong>Âge:</strong> {
                      selectedPet.birthDate 
                        ? `${Math.floor((new Date().getTime() - new Date(selectedPet.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans`
                        : 'Non spécifié'
                    }</div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Important
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Vérifiez la date d'expiration du vaccin</li>
                  <li>• Respectez la chaîne du froid</li>
                  <li>• Surveillez les réactions dans les 24h</li>
                  <li>• Enregistrez le numéro de lot</li>
                  <li>• Planifiez le rappel</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
