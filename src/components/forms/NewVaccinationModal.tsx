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
}

export default function NewVaccinationModal({ 
  children, 
  selectedPetId, 
  selectedClientId 
}: NewVaccinationModalProps) {
  const { clients, pets, addVaccination, getVaccinationProtocolsBySpecies } = useClients();
  const { settings } = useSettings();
  
  // Fallback veterinarians list if not available in settings
  const defaultVeterinarians = [
    { id: 1, name: 'Dr. Martin', isActive: true },
    { id: 2, name: 'Dr. Dupont', isActive: true }
  ];
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [showProtocols, setShowProtocols] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: selectedClientId || '',
    petId: selectedPetId || '',
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

  const [selectedProtocols, setSelectedProtocols] = useState<VaccinationProtocol[]>([]);
  const [nextDueDates, setNextDueDates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedClientId) {
      setFormData(prev => ({ ...prev, clientId: selectedClientId.toString() }));
    }
    if (selectedPetId) {
      setFormData(prev => ({ ...prev, petId: selectedPetId.toString() }));
    }
  }, [selectedClientId, selectedPetId]);

  // Effet pour initialiser les dates de rappel par défaut
  useEffect(() => {
    if (selectedProtocols.length > 0 && formData.dateGiven) {
      const defaults: Record<string, string> = {};
      selectedProtocols.forEach(protocol => {
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
  }, [selectedProtocols, formData.dateGiven]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.petId || (selectedProtocols.length === 0 && !formData.vaccineName)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
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

    if (selectedProtocols.length > 0) {
      selectedProtocols.forEach(protocol => {
        if (protocol.intervals && Array.isArray(protocol.intervals)) {
          protocol.intervals.forEach(interval => {
            const key = `${protocol.id}-${interval.offsetDays}`;
            const dueDate = nextDueDates[key] || '';
            addVaccination({
              clientId: parseInt(formData.clientId as string),
              clientName: clients.find(c => c.id === parseInt(formData.clientId as string))?.name || '',
              petId: parseInt(formData.petId as string),
              petName: pets.find(p => p.id === parseInt(formData.petId as string))?.name || '',
              vaccineName: `${protocol.name} (${interval.label})`,
              vaccineType: protocol.vaccineType,
              dateGiven: formData.dateGiven,
              nextDueDate: dueDate,
              batchNumber: formData.batchNumber,
              veterinarian: formData.veterinarian,
              notes: formData.notes,
              status: interval.offsetDays === 0 || !dueDate ? 'completed' : 'scheduled',
              cost: formData.cost,
              location: formData.location as any,
              manufacturer: protocol.manufacturer || formData.manufacturer,
              expirationDate: formData.expirationDate,
              adverseReactions: formData.adverseReactions
            });
          });
        }
      });
      toast({title: 'Vaccinations enregistrées', description: `${selectedProtocols.length} vaccinations ajoutées.`});
      setSelectedProtocols([]);
      setOpen(false);
      return;
    }

    addVaccination({
      clientId: parseInt(formData.clientId as string),
      clientName: client.name,
      petId: parseInt(formData.petId as string),
      petName: pet.name,
      vaccineName: formData.vaccineName,
      vaccineType: formData.vaccineType as 'core' | 'non-core' | 'rabies' | 'custom',
      dateGiven: formData.dateGiven,
      nextDueDate: formData.nextDueDate,
      batchNumber: formData.batchNumber,
      veterinarian: formData.veterinarian,
      notes: formData.notes,
      status: 'completed',
      cost: formData.cost,
      location: formData.location as any,
      manufacturer: formData.manufacturer,
      expirationDate: formData.expirationDate,
      adverseReactions: formData.adverseReactions
    });

    toast({
      title: "Vaccination enregistrée",
      description: `Vaccination ${formData.vaccineName} ajoutée pour ${pet.name}`,
    });

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
    setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
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
            Nouvelle Vaccination
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sélection Client/Animal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId">Client *</Label>
                  <Select 
                    value={formData.clientId} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, clientId: value, petId: '' }));
                      setSelectedProtocol(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
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
                    disabled={!formData.clientId}
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
          {availableProtocols.length > 0 && (
            <div className="space-y-2 mb-4">
              <Label>Protocoles suggérés pour {selectedPet?.type} (sélection multiple)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableProtocols.map(protocol => {
                  const checked = selectedProtocols.some(p => p.id === protocol.id);
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
              {selectedProtocols.length > 0 ? (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Vaccins sélectionnés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-sm">
                      {selectedProtocols.map(protocol => (
                        <li key={protocol.id}>{protocol.name}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : (
                // Nom et type du vaccin pour sélection unique
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vaccineName">Nom du vaccin *</Label>
                    <Input
                      id="vaccineName"
                      value={formData.vaccineName}
                      onChange={(e) => setFormData(prev => ({ ...prev, vaccineName: e.target.value }))}
                      placeholder="Ex: DHPP, Rage, FVRCP..."
                      required
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateGiven">Date d'administration *</Label>
                  <Input
                    id="dateGiven"
                    type="date"
                    value={formData.dateGiven}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateGiven: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="nextDueDate">Date de rappel</Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextDueDate: e.target.value }))}
                  />
                </div>
              </div>

          {/* Dates de rappel spécifiques par intervalle */}
          {selectedProtocols.length > 0 && (
            <div className="space-y-4 mb-4">
              {selectedProtocols.map(protocol => (
                <div key={protocol.id} className="space-y-2">
                  <div className="font-medium text-sm">Étapes pour {protocol.name}</div>
                  {protocol.intervals.map(interval => {
                    const key = `${protocol.id}-${interval.offsetDays}`;
                    return (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <div className="text-sm">
                          {interval.label} (+{interval.offsetDays} jours)
                        </div>
                        <div>
                          <Label htmlFor={key}>Date exacte</Label>
                          <Input
                            id={key}
                            type="date"
                            value={nextDueDates[key] || ''}
                            onChange={e => setNextDueDates(prev => ({ ...prev, [key]: e.target.value }))}
                          />
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
                      {(settings.veterinarians || defaultVeterinarians)
                        .filter(vet => vet.isActive)
                        .map(vet => (
                          <SelectItem key={vet.id} value={vet.name}>
                            {vet.name}
                          </SelectItem>
                        ))}
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
