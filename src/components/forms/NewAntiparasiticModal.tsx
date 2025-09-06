// Nouveau modal antiparasitaire
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClients, AntiparasiticProtocol } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { Plus } from 'lucide-react';

interface NewAntiparasiticModalProps {
  children?: React.ReactNode;
  selectedPetId?: number;
  selectedClientId?: number;
}

export default function NewAntiparasiticModal({ children, selectedClientId, selectedPetId }: NewAntiparasiticModalProps) {
  const { clients, pets, addAntiparasitic, getAntiparasiticProtocolsBySpecies, addAppointment } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    clientId: selectedClientId?.toString() || '',
    petId: selectedPetId?.toString() || '',
    dateGiven: format(new Date(), 'yyyy-MM-dd'),
    nextDueDate: '',
    dosage: '',
    administrationRoute: '',
    veterinarian: '',
    notes: '',
    batchNumber: '',
    manufacturer: '',
    weight: '',
    cost: '',
    sideEffects: ''
  });
  const [selectedProtocols, setSelectedProtocols] = useState<AntiparasiticProtocol[]>([]);
  
  // Protection contre undefined
  const safeSelectedProtocols = selectedProtocols || [];
  const [nextDueDates, setNextDueDates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedClientId) setFormData(prev => ({ ...prev, clientId: selectedClientId.toString(), petId: '' }));
    if (selectedPetId) setFormData(prev => ({ ...prev, petId: selectedPetId.toString() }));
  }, [selectedClientId, selectedPetId]);

  // Initialize defaults for each protocol interval
  useEffect(() => {
    if (safeSelectedProtocols.length && formData.dateGiven) {
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

  const availableProtocols = formData.petId
    ? getAntiparasiticProtocolsBySpecies(
        pets.find(p => p.id === parseInt(formData.petId))?.type || ''
      )
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.petId) {
      toast({ title: 'Erreur', description: 'Client et animal requis.', variant: 'destructive' });
      return;
    }
    const client = clients.find(c => c.id === parseInt(formData.clientId));
    const pet = pets.find(p => p.id === parseInt(formData.petId));
    if (!client || !pet) {
      toast({ title: 'Erreur', description: 'Client ou animal introuvable.', variant: 'destructive' });
      return;
    }

    if (safeSelectedProtocols.length > 0) {
      // Traiter chaque protocole sélectionné
      safeSelectedProtocols.forEach(protocol => {
        protocol.intervals.forEach(interval => {
          const key = `${protocol.id}-${interval.offsetDays}`;
          addAntiparasitic({
            clientId: client.id,
            clientName: client.name,
            petId: pet.id,
            petName: pet.name,
            productName: `${protocol.name} (${interval.label})`, 
            productType: protocol.productType,
            targetParasites: protocol.targetParasites,
            dateGiven: formData.dateGiven,
            nextDueDate: nextDueDates[key] || '',
            dosage: formData.dosage,
            administrationRoute: formData.administrationRoute || protocol.productType as any,
            veterinarian: formData.veterinarian,
            notes: formData.notes,
            batchNumber: formData.batchNumber,
            manufacturer: formData.manufacturer || protocol.manufacturer || '',
            weight: formData.weight,
            status: interval.offsetDays === 0 ? 'completed' : 'scheduled',
            cost: formData.cost,
            sideEffects: formData.sideEffects
          });
        });
      });
      
      // Programmer rappels antiparasitaires
      safeSelectedProtocols.forEach(protocol => {
        (protocol.intervals || []).forEach(interval => {
          const key = `${protocol.id}-${interval.offsetDays}`;
          const dueDate = nextDueDates[key];
          if (dueDate && interval.offsetDays > 0) { // Seuls les rappels futurs
            addAppointment({
              clientId: client.id,
              clientName: client.name,
              petId: pet.id,
              petName: pet.name,
              date: dueDate,
              time: '09:00',
              type: 'consultation',
              duration: 15,
              reason: `Rappel antiparasitaire ${protocol.name}`,
              status: 'scheduled',
              reminderSent: false
            });
          }
        });
      });
      
      toast({ 
        title: 'Traitements ajoutés', 
        description: `${safeSelectedProtocols.reduce((total, p) => total + p.intervals.length, 0)} traitement(s) enregistré(s) dans le dossier médical et rappels programmés.` 
      });
    } else {
      // Traitement manuel sans protocole
      const productName = formData.notes || 'Traitement antiparasitaire';
      addAntiparasitic({
        clientId: client.id,
        clientName: client.name,
        petId: pet.id,
        petName: pet.name,
        productName: productName,
        productType: 'external' as any,
        targetParasites: 'Non spécifié' as any,
        dateGiven: formData.dateGiven,
        nextDueDate: formData.nextDueDate,
        dosage: formData.dosage,
        administrationRoute: formData.administrationRoute as any,
        veterinarian: formData.veterinarian,
        notes: formData.notes,
        batchNumber: formData.batchNumber,
        manufacturer: formData.manufacturer,
        weight: formData.weight,
        status: 'completed',
        cost: formData.cost,
        sideEffects: formData.sideEffects
      });
      
      // Programmer rappel si date spécifiée
      if (formData.nextDueDate) {
        addAppointment({
          clientId: client.id,
          clientName: client.name,
          petId: pet.id,
          petName: pet.name,
          date: formData.nextDueDate,
          time: '09:00',
          type: 'consultation',
          duration: 15,
          reason: `Rappel antiparasitaire ${productName}`,
          status: 'scheduled',
          reminderSent: false
        });
      }
      
      toast({ 
        title: 'Traitement ajouté', 
        description: `Traitement pour ${pet.name} enregistré dans le dossier médical.` 
      });
    }

    console.log('Antiparasitaire ajouté avec succès - Données synchronisées dans le dossier médical');

    // Reset and close
    setSelectedProtocols([]);
    setFormData({ 
      clientId: selectedClientId?.toString() || '', 
      petId: selectedPetId?.toString() || '', 
      dateGiven: format(new Date(), 'yyyy-MM-dd'), 
      nextDueDate: '', 
      dosage: '', 
      administrationRoute: '', 
      veterinarian: '', 
      notes: '', 
      batchNumber: '', 
      manufacturer: '', 
      weight: '', 
      cost: '', 
      sideEffects: '' 
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button className="gap-2"><Plus className="h-4 w-4" />Nouveau traitement</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau traitement antiparasitaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client & Pet Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Client *</Label>
              <Select value={formData.clientId} onValueChange={v => setFormData(prev => ({ ...prev, clientId: v, petId: '' }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                <SelectContent>
                  {clients && Array.isArray(clients) && clients.length > 0 ? (
                    clients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)
                  ) : (
                    <SelectItem value="no-clients" disabled>
                      Aucun client trouvé
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Animal *</Label>
              <Select value={formData.petId} onValueChange={v => setFormData(prev => ({ ...prev, petId: v }))} disabled={!formData.clientId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un animal" /></SelectTrigger>
                <SelectContent>
                  {pets.filter(p => p.ownerId === parseInt(formData.clientId)).map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.type})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Protocol Selection */}
          {availableProtocols.length > 0 && (
            <div className="space-y-2">
              <Label>Protocoles suggérés ({pets.find(p => p.id===parseInt(formData.petId))?.type})</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableProtocols.map(protocol => {
                  const checked = safeSelectedProtocols.some(p => p.id === protocol.id);
                  return (
                    <div key={protocol.id} className="flex items-center p-2 border rounded hover:bg-muted/50">
                      <Checkbox checked={checked} onCheckedChange={val => val ? setSelectedProtocols(prev => [...prev, protocol]) : setSelectedProtocols(prev => prev.filter(x => x.id !== protocol.id))} />
                      <label className="ml-2 flex-1 text-sm">
                        <div className="font-medium">{protocol.name}</div>
                        <div className="text-xs text-gray-600">{protocol.description}</div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Selected Protocols Overview */}
          {safeSelectedProtocols.length > 0 ? (
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-sm">Protocoles sélectionnés</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm">
                  {safeSelectedProtocols.map(p => <li key={p.id}>{p.name}</li>)}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Produit</Label>
                <Input value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Nom du produit" />
              </div>
              <div>
                <Label>Type</Label>
                <Input value={formData.administrationRoute} onChange={e => setFormData(prev => ({ ...prev, administrationRoute: e.target.value }))} placeholder="Type (oral, topical...)" />
              </div>
            </div>
          )}
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date d'administration *</Label>
              <Input type="date" value={formData.dateGiven} onChange={e=>setFormData(prev=>({...prev,dateGiven:e.target.value}))} required />
            </div>
            {!safeSelectedProtocols.length && (
              <div>
                <Label>Date de rappel</Label>
                <Input type="date" value={formData.nextDueDate} onChange={e=>setFormData(prev=>({...prev,nextDueDate:e.target.value}))} />
              </div>
            )}
          </div>
          {/* Interval-specific dates */}
          {safeSelectedProtocols.length > 0 && (
            <div className="space-y-4 mb-4">
              {safeSelectedProtocols.map(protocol => (
                <div key={protocol.id} className="space-y-2">
                  <div className="font-medium text-sm">Étapes pour {protocol.name}</div>
                  {protocol.intervals.map(interval => {
                    const key = `${protocol.id}-${interval.offsetDays}`;
                    return (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <div className="text-sm">{interval.label} (+{interval.offsetDays} jours)</div>
                        <div>
                          <Label>Date exacte</Label>
                          <Input type="date" id={key} value={nextDueDates[key] || ''} onChange={e=>setNextDueDates(prev=>({...prev,[key]:e.target.value}))} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          {/* Other fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Dosage</Label>
              <Input value={formData.dosage} onChange={e=>setFormData(prev=>({...prev,dosage:e.target.value}))} placeholder="Dosage" />
            </div>
            <div>
              <Label>Vétérinaire</Label>
              <Select value={formData.veterinarian} onValueChange={v=>setFormData(prev=>({...prev,veterinarian:v}))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un vétérinaire" /></SelectTrigger>
                <SelectContent>
                  {(() => {
                    const vets = JSON.parse(localStorage.getItem('vetpro-veterinarians') || '[]');
                    return vets.map(vet => (
                      <SelectItem key={vet.id} value={vet.name}>
                        {vet.name}
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Numéro de lot</Label>
              <Input value={formData.batchNumber} onChange={e=>setFormData(prev=>({...prev,batchNumber:e.target.value}))} placeholder="Numéro de lot" />
            </div>
            <div>
              <Label>Fabricant</Label>
              <Input value={formData.manufacturer} onChange={e=>setFormData(prev=>({...prev,manufacturer:e.target.value}))} placeholder="Fabricant" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Poids</Label>
              <Input value={formData.weight} onChange={e=>setFormData(prev=>({...prev,weight:e.target.value}))} placeholder="Poids" />
            </div>
            <div>
              <Label>Coût</Label>
              <Input type="number" step="0.01" value={formData.cost} onChange={e=>setFormData(prev=>({...prev,cost:e.target.value}))} placeholder="0.00" />
            </div>
          </div>
          <div>
            <Label>Effets indésirables</Label>
            <Input value={formData.sideEffects} onChange={e=>setFormData(prev=>({...prev,sideEffects:e.target.value}))} placeholder="Effets indésirables" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={()=>setOpen(false)}>Annuler</Button>
            <Button type="submit">Ajouter</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
