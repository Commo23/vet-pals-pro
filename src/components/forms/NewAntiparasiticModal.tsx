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

export default function NewAntiparasiticModal({ children, selectedClientId, selectedPetId }) {
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
  const [nextDueDates, setNextDueDates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedClientId) setFormData(prev => ({ ...prev, clientId: selectedClientId.toString(), petId: '' }));
    if (selectedPetId) setFormData(prev => ({ ...prev, petId: selectedPetId.toString() }));
  }, [selectedClientId, selectedPetId]);

  // Initialize defaults for each protocol interval
  useEffect(() => {
    if (selectedProtocols.length && formData.dateGiven) {
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
    if (!client || !pet) return;

    if (selectedProtocols.length > 0) {
      selectedProtocols.forEach(protocol => {
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
      selectedProtocols.forEach(protocol => {
        (protocol.intervals || []).forEach(interval => {
          const key = `${protocol.id}-${interval.offsetDays}`;
          const dueDate = nextDueDates[key];
          if (dueDate) {
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
      toast({ title: 'Traitements ajoutés', description: `${selectedProtocols.length} traitements ajoutés et rappels programmés.` });
    } else {
      // Single entry without protocol
      addAntiparasitic({
        clientId: client.id,
        clientName: client.name,
        petId: pet.id,
        petName: pet.name,
        productName: formData.notes, // or productName field if added
        productType: 'external' as any,
        targetParasites: 'flea_tick' as any,
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
      toast({ title: 'Traitement ajouté', description: `Traitement pour ${pet.name} ajouté.` });
    }

    // Reset and close
    setSelectedProtocols([]);
    setFormData({ clientId: formData.clientId, petId: formData.petId, dateGiven: format(new Date(), 'yyyy-MM-dd'), nextDueDate: '', dosage: '', administrationRoute: '', veterinarian: '', notes: '', batchNumber: '', manufacturer: '', weight: '', cost: '', sideEffects: '' });
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
                  {clients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
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
                  const checked = selectedProtocols.some(p => p.id === protocol.id);
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
          {selectedProtocols.length > 0 ? (
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-sm">Protocoles sélectionnés</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm">
                  {selectedProtocols.map(p => <li key={p.id}>{p.name}</li>)}
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
            {!selectedProtocols.length && (
              <div>
                <Label>Date de rappel</Label>
                <Input type="date" value={formData.nextDueDate} onChange={e=>setFormData(prev=>({...prev,nextDueDate:e.target.value}))} />
              </div>
            )}
          </div>
          {/* Interval-specific dates */}
          {selectedProtocols.length > 0 && (
            <div className="space-y-4 mb-4">
              {selectedProtocols.map(protocol => (
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
