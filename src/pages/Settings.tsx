import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useClients } from "@/contexts/ClientContext";
import { useSettings, FarmManagementSettings, ClinicSettings } from '@/contexts/SettingsContext';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Veterinarian {
  id: number;
  name: string;
  title: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

const SETTINGS_KEY = 'vetpro-clinicSettings';
const VETS_KEY = 'vetpro-veterinarians';
// Valeurs par défaut pour Rabat, Maroc
const DEFAULT_SETTINGS: ClinicSettings = {
  clinicName: 'Clinique du Soleil',
  address: '123 Avenue Hassan II, Rabat, Maroc',
  phone: '+212 5 37 00 00 00',
  email: 'contact@cliniquedusoleil.ma',
  website: 'https://www.cliniquedusoleil.ma',
  footerText: 'Clinique du Soleil - Soins vétérinaires à Rabat',
  logo: '/placeholder.svg',
  currency: 'MAD',
  species: 'Chien, Chat, Bovins, Porcins, Volailles',
  showClinicInfo: true,
  showVetsInfo: true,
  farmManagement: {
    farmTypes: [
      'Bovin laitier', 'Bovin viande', 'Porcin', 'Avicole', 'Ovin', 'Caprin', 
      'Équin', 'Apiculture', 'Aquaculture', 'Cuniculture', 'Mixte'
    ],
    animalCategories: [
      'Bovins laitiers', 'Bovins à viande', 'Porcs', 'Poules pondeuses', 
      'Poulets de chair', 'Ovins', 'Caprins', 'Chevaux', 'Lapins', 'Abeilles', 'Poissons'
    ],
    breedsByCategory: {
      'Bovins laitiers': ['Holstein', 'Prim\'Holstein', 'Montbéliarde', 'Normande', 'Simmental'],
      'Bovins à viande': ['Charolaise', 'Limousine', 'Blonde d\'Aquitaine', 'Angus', 'Salers'],
      'Porcs': ['Large White', 'Landrace', 'Piétrain', 'Duroc', 'Hampshire'],
      'Poules pondeuses': ['ISA Brown', 'Lohmann Brown', 'Hy-Line', 'Novogen', 'Dekalb'],
      'Poulets de chair': ['Cobb 500', 'Ross 308', 'Hubbard', 'Arbor Acres'],
      'Ovins': ['Lacaune', 'Brebis laitière', 'Ile-de-France', 'Texel', 'Suffolk'],
      'Caprins': ['Saanen', 'Alpine', 'Poitevine', 'Boer', 'Angora'],
      'Chevaux': ['Pur-sang', 'Trotteur', 'Selle français', 'Arabe', 'Quarter Horse'],
      'Lapins': ['Néo-Zélandais', 'Californien', 'Fauve de Bourgogne', 'Géant des Flandres'],
      'Abeilles': ['Abeille noire', 'Buckfast', 'Carnica', 'Caucasienne'],
      'Poissons': ['Truite arc-en-ciel', 'Saumon', 'Carpe', 'Bar', 'Daurade']
    },
    certificationTypes: [
      'Agriculture Biologique', 'Label Rouge', 'AOC/AOP', 'IGP', 
      'Haute Valeur Environnementale', 'Bien-être animal', 'Global GAP',
      'IFS Food', 'BRC Food', 'Œufs de France'
    ],
    equipmentTypes: [
      'Tracteur', 'Moissonneuse', 'Épandeur', 'Charrue', 'Système de traite',
      'Tank à lait', 'Système d\'alimentation automatique', 'Ventilation',
      'Générateur', 'Système d\'irrigation', 'Matériel de récolte'
    ],
    defaultSurfaceUnit: 'hectares',
    defaultCoordinateFormat: 'decimal'
  }
};

export default function Settings() {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  // Veterinarians state initialisé avec defaults
  const DEFAULT_VETS: Veterinarian[] = [
    { id: 1, name: 'Dr. Jean Dupont', title: 'Dr.', specialty: 'Médecine générale', phone: '+212 5 37 00 00 01', email: 'j.dupont@cliniquedusoleil.ma' },
    { id: 2, name: 'Dr. Marie Martin', title: 'Dr.', specialty: 'Chirurgie', phone: '+212 5 37 00 00 02', email: 'm.martin@cliniquedusoleil.ma' },
    { id: 3, name: 'Pr. Ahmed El Alaoui', title: 'Pr.', specialty: 'Dermatologie', phone: '+212 5 37 00 00 03', email: 'a.alaoui@cliniquedusoleil.ma' }
  ];
  const [vets, setVets] = useState<Veterinarian[]>(() => {
    const sv = localStorage.getItem(VETS_KEY);
    return sv ? JSON.parse(sv) : DEFAULT_VETS;
  });
  const [showVetModal, setShowVetModal] = useState(false);
  const [editVet, setEditVet] = useState<Veterinarian | null>(null);
  const [vetForm, setVetForm] = useState<Omit<Veterinarian, 'id'>>({ name: '', title: '', specialty: '', phone: '', email: '' });
  
  // États pour la gestion des paramètres de ferme
  const [showFarmTypeModal, setShowFarmTypeModal] = useState(false);
  const [newFarmType, setNewFarmType] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [newBreed, setNewBreed] = useState('');
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [newCertification, setNewCertification] = useState('');
  
  // Load from localStorage once
  useEffect(() => {
    if (!localStorage.getItem(VETS_KEY)) {
      localStorage.setItem(VETS_KEY, JSON.stringify(DEFAULT_VETS));
    }
  }, []);

  // Sync species avec listes dynamiques de pets
  const { pets } = useClients();
  useEffect(() => {
    const dynamic = Array.from(new Set([
      ...pets.map(p => p.type)
    ]));
    const merged = Array.from(new Set([...settings.species.split(',').map(s => s.trim()), ...dynamic]));
    updateSettings({ ...settings, species: merged.join(', ') } as ClinicSettings);
  }, [pets]);

  // Handlers for clinic settings via context
  const handleSettingsChange = (field: keyof ClinicSettings, value: string | boolean) => {
    updateSettings({ ...settings, [field]: value } as ClinicSettings);
  };
  const saveSettings = () => {
    // updateSettings already saved to localStorage via context
    toast({ title: 'Paramètres sauvegardés', description: 'Informations de la clinique mises à jour.' });
  };

  // Gestion du logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => handleSettingsChange('logo', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handlers for veterinarians
  const openNewVet = () => {
    setEditVet(null);
    setVetForm({ name: '', title: '', specialty: '', phone: '', email: '' });
    setShowVetModal(true);
  };
  const openEditVet = (vet: Veterinarian) => {
    setEditVet(vet);
    setVetForm({ name: vet.name, title: vet.title, specialty: vet.specialty || '', phone: vet.phone || '', email: vet.email || '' });
    setShowVetModal(true);
  };
  const saveVet = () => {
    if (!vetForm.name || !vetForm.title) {
      toast({ title: 'Erreur', description: 'Nom et titre requis', variant: 'destructive' });
      return;
    }
    let updated: Veterinarian[];
    if (editVet) {
      updated = vets.map(v => v.id === editVet.id ? { ...v, ...vetForm } : v);
    } else {
      const newVet: Veterinarian = { id: Math.max(0, ...vets.map(v => v.id)) + 1, ...vetForm };
      updated = [...vets, newVet];
    }
    setVets(updated);
    localStorage.setItem(VETS_KEY, JSON.stringify(updated));
    toast({ title: 'Vétérinaire enregistré' });
    setShowVetModal(false);
  };
  const deleteVet = (id: number) => {
    if (!confirm('Supprimer ce vétérinaire ?')) return;
    const updated = vets.filter(v => v.id !== id);
    setVets(updated);
    localStorage.setItem(VETS_KEY, JSON.stringify(updated));
    toast({ title: 'Vétérinaire supprimé' });
  };

  // Fonctions de gestion des paramètres de ferme
  const addFarmType = () => {
    if (!newFarmType.trim()) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        farmTypes: [...settings.farmManagement.farmTypes, newFarmType.trim()]
      }
    };
    updateSettings(updated);
    setNewFarmType('');
    setShowFarmTypeModal(false);
    toast({ title: 'Type d\'élevage ajouté' });
  };

  const removeFarmType = (type: string) => {
    if (!confirm(`Supprimer le type "${type}" ?`)) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        farmTypes: settings.farmManagement.farmTypes.filter(t => t !== type)
      }
    };
    updateSettings(updated);
    toast({ title: 'Type d\'élevage supprimé' });
  };

  const addAnimalCategory = () => {
    if (!newCategory.trim()) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        animalCategories: [...settings.farmManagement.animalCategories, newCategory.trim()],
        breedsByCategory: { ...settings.farmManagement.breedsByCategory, [newCategory.trim()]: [] }
      }
    };
    updateSettings(updated);
    setNewCategory('');
    setShowCategoryModal(false);
    toast({ title: 'Catégorie d\'animal ajoutée' });
  };

  const removeAnimalCategory = (category: string) => {
    if (!confirm(`Supprimer la catégorie "${category}" ?`)) return;
    const newBreedsByCategory = { ...settings.farmManagement.breedsByCategory };
    delete newBreedsByCategory[category];
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        animalCategories: settings.farmManagement.animalCategories.filter(c => c !== category),
        breedsByCategory: newBreedsByCategory
      }
    };
    updateSettings(updated);
    toast({ title: 'Catégorie d\'animal supprimée' });
  };

  const addBreed = () => {
    if (!newBreed.trim() || !selectedCategory) return;
    const currentBreeds = settings.farmManagement.breedsByCategory[selectedCategory] || [];
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        breedsByCategory: {
          ...settings.farmManagement.breedsByCategory,
          [selectedCategory]: [...currentBreeds, newBreed.trim()]
        }
      }
    };
    updateSettings(updated);
    setNewBreed('');
    setShowBreedModal(false);
    toast({ title: 'Race ajoutée' });
  };

  const removeBreed = (category: string, breed: string) => {
    if (!confirm(`Supprimer la race "${breed}" ?`)) return;
    const currentBreeds = settings.farmManagement.breedsByCategory[category] || [];
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        breedsByCategory: {
          ...settings.farmManagement.breedsByCategory,
          [category]: currentBreeds.filter(b => b !== breed)
        }
      }
    };
    updateSettings(updated);
    toast({ title: 'Race supprimée' });
  };

  const addCertification = () => {
    if (!newCertification.trim()) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        certificationTypes: [...settings.farmManagement.certificationTypes, newCertification.trim()]
      }
    };
    updateSettings(updated);
    setNewCertification('');
    setShowCertificationModal(false);
    toast({ title: 'Certification ajoutée' });
  };

  const removeCertification = (certification: string) => {
    if (!confirm(`Supprimer la certification "${certification}" ?`)) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        certificationTypes: settings.farmManagement.certificationTypes.filter(c => c !== certification)
      }
    };
    updateSettings(updated);
    toast({ title: 'Certification supprimée' });
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de la Clinique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="logo">Logo de la clinique</Label>
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
              {settings.logo && <img src={settings.logo} alt="Logo" className="h-24 mt-2" />}
            </div>
            <div><Label htmlFor="clinicName">Nom de la clinique</Label><Input id="clinicName" value={settings.clinicName} onChange={e => handleSettingsChange('clinicName', e.target.value)} /></div>
            <div><Label htmlFor="address">Adresse</Label><Input id="address" value={settings.address} onChange={e => handleSettingsChange('address', e.target.value)} /></div>
            <div><Label htmlFor="phone">Téléphone</Label><Input id="phone" value={settings.phone} onChange={e => handleSettingsChange('phone', e.target.value)} /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={settings.email} onChange={e => handleSettingsChange('email', e.target.value)} /></div>
            <div><Label htmlFor="website">Site web</Label><Input id="website" value={settings.website} onChange={e => handleSettingsChange('website', e.target.value)} /></div>
            <div><Label htmlFor="currency">Devise</Label><Input id="currency" value={settings.currency} onChange={e => handleSettingsChange('currency', e.target.value)} /></div>
            <div><Label htmlFor="species">Liste des espèces (virgule séparées)</Label><Input id="species" value={settings.species} onChange={e => handleSettingsChange('species', e.target.value)} /></div>
            <div><Label htmlFor="footerText">Texte de pied de page</Label><Input id="footerText" value={settings.footerText} onChange={e => handleSettingsChange('footerText', e.target.value)} /></div>
            {/* Options d'affichage sur le certificat */}
            <div className="flex items-center gap-2">
              <Switch
                id="showClinicInfo"
                checked={settings.showClinicInfo}
                onCheckedChange={checked => handleSettingsChange('showClinicInfo', checked)}
              />
              <Label htmlFor="showClinicInfo">Afficher coordonnées de la clinique sur le certificat</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="showVetsInfo"
                checked={settings.showVetsInfo}
                onCheckedChange={checked => handleSettingsChange('showVetsInfo', checked)}
              />
              <Label htmlFor="showVetsInfo">Afficher liste des vétérinaires sur le certificat</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveSettings}>Enregistrer</Button>
            <Button variant="outline" onClick={() => {
              updateSettings(DEFAULT_SETTINGS);
              toast({ title: 'Paramètres réinitialisés', description: 'Valeurs par défaut restaurées.' });
            }}>
              Restaurer valeurs par défaut
            </Button>
            <Button variant="outline" onClick={() => {
              const currentSettings = settings;
              const resetFarmSettings = {
                ...currentSettings,
                farmManagement: {
                  farmTypes: [
                    'Bovin laitier', 'Bovin viande', 'Porcin', 'Avicole', 'Ovin', 'Caprin', 
                    'Équin', 'Apiculture', 'Aquaculture', 'Cuniculture', 'Mixte'
                  ],
                  animalCategories: [
                    'Bovins laitiers', 'Bovins à viande', 'Porcs', 'Poules pondeuses', 
                    'Poulets de chair', 'Ovins', 'Caprins', 'Chevaux', 'Lapins', 'Abeilles', 'Poissons'
                  ],
                  breedsByCategory: {
                    'Bovins laitiers': ['Holstein', 'Prim\'Holstein', 'Montbéliarde', 'Normande', 'Simmental'],
                    'Bovins à viande': ['Charolaise', 'Limousine', 'Blonde d\'Aquitaine', 'Angus', 'Salers'],
                    'Porcs': ['Large White', 'Landrace', 'Piétrain', 'Duroc', 'Hampshire'],
                    'Poules pondeuses': ['ISA Brown', 'Lohmann Brown', 'Hy-Line', 'Novogen', 'Dekalb'],
                    'Poulets de chair': ['Cobb 500', 'Ross 308', 'Hubbard', 'Arbor Acres'],
                    'Ovins': ['Lacaune', 'Brebis laitière', 'Ile-de-France', 'Texel', 'Suffolk'],
                    'Caprins': ['Saanen', 'Alpine', 'Poitevine', 'Boer', 'Angora'],
                    'Chevaux': ['Pur-sang', 'Trotteur', 'Selle français', 'Arabe', 'Quarter Horse'],
                    'Lapins': ['Néo-Zélandais', 'Californien', 'Fauve de Bourgogne', 'Géant des Flandres'],
                    'Abeilles': ['Abeille noire', 'Buckfast', 'Carnica', 'Caucasienne'],
                    'Poissons': ['Truite arc-en-ciel', 'Saumon', 'Carpe', 'Bar', 'Daurade']
                  },
                  certificationTypes: [
                    'Agriculture Biologique', 'Label Rouge', 'AOC/AOP', 'IGP', 
                    'Haute Valeur Environnementale', 'Bien-être animal', 'Global GAP',
                    'IFS Food', 'BRC Food', 'Œufs de France'
                  ],
                  equipmentTypes: [
                    'Tracteur', 'Moissonneuse', 'Épandeur', 'Charrue', 'Système de traite',
                    'Tank à lait', 'Système d\'alimentation automatique', 'Ventilation',
                    'Générateur', 'Système d\'irrigation', 'Matériel de récolte'
                  ],
                  defaultSurfaceUnit: 'hectares',
                  defaultCoordinateFormat: 'decimal'
                }
              };
              updateSettings(resetFarmSettings);
              toast({ title: 'Paramètres ferme réinitialisés', description: 'Configuration des fermes restaurée aux valeurs par défaut.' });
            }}>
              Restaurer paramètres ferme
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Vétérinaires</CardTitle>
          <Button onClick={openNewVet} className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {vets.length === 0 ? <p className="text-muted-foreground">Aucun vétérinaire configuré</p> : vets.map(v => (
            <div key={v.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <p className="font-medium">{v.title} {v.name}</p>
                <p className="text-sm text-muted-foreground">{v.specialty}</p>
                <p className="text-xs">{v.phone} | {v.email}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditVet(v)}><Edit className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => deleteVet(v.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section Farm Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Exploitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Types d'élevage */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Types d'élevage</h4>
              <Button size="sm" onClick={() => setShowFarmTypeModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.farmManagement.farmTypes.map(type => (
                <Badge key={type} variant="secondary" className="gap-2">
                  {type}
                  <button onClick={() => removeFarmType(type)} className="hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Catégories d'animaux */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Catégories d'animaux</h4>
              <Button size="sm" onClick={() => setShowCategoryModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>
            <div className="space-y-3">
              {settings.farmManagement.animalCategories.map(category => (
                <div key={category} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium">{category}</h5>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedCategory(category);
                        setShowBreedModal(true);
                      }}>
                        <Plus className="h-3 w-3" /> Race
                      </Button>
                      <button onClick={() => removeAnimalCategory(category)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(settings.farmManagement.breedsByCategory[category] || []).map(breed => (
                      <Badge key={breed} variant="outline" className="text-xs gap-1">
                        {breed}
                        <button onClick={() => removeBreed(category, breed)} className="hover:text-red-500">
                          <Trash2 className="h-2 w-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Types de certifications</h4>
              <Button size="sm" onClick={() => setShowCertificationModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.farmManagement.certificationTypes.map(cert => (
                <Badge key={cert} variant="outline" className="gap-2">
                  {cert}
                  <button onClick={() => removeCertification(cert)} className="hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal vétérinaire */}
      <Dialog open={showVetModal} onOpenChange={setShowVetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editVet ? 'Modifier vétérinaire' : 'Nouveau vétérinaire'}</DialogTitle>
            <DialogDescription>Nom, titre, spécialité, contact</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="vetName">Nom complet *</Label><Input id="vetName" value={vetForm.name} onChange={e => setVetForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label htmlFor="vetTitle">Titre *</Label><Input id="vetTitle" value={vetForm.title} onChange={e => setVetForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label htmlFor="vetSpec">Spécialité</Label><Input id="vetSpec" value={vetForm.specialty} onChange={e => setVetForm(f => ({ ...f, specialty: e.target.value }))} /></div>
            <div><Label htmlFor="vetPhone">Téléphone</Label><Input id="vetPhone" value={vetForm.phone} onChange={e => setVetForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><Label htmlFor="vetEmail">Email</Label><Input id="vetEmail" type="email" value={vetForm.email} onChange={e => setVetForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowVetModal(false)}>Annuler</Button>
              <Button onClick={saveVet}>{editVet ? 'Mettre à jour' : 'Créer'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modales Farm Management */}
      <Dialog open={showFarmTypeModal} onOpenChange={setShowFarmTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau type d'élevage</DialogTitle>
            <DialogDescription>Ajouter un nouveau type d'exploitation agricole</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Ex: Apiculture, Aquaculture..." 
              value={newFarmType}
              onChange={(e) => setNewFarmType(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addFarmType()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFarmTypeModal(false)}>Annuler</Button>
              <Button onClick={addFarmType}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie d'animal</DialogTitle>
            <DialogDescription>Ajouter une nouvelle catégorie d'animaux d'élevage</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Ex: Cochons d'Inde, Autruches..." 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAnimalCategory()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)}>Annuler</Button>
              <Button onClick={addAnimalCategory}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreedModal} onOpenChange={setShowBreedModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle race - {selectedCategory}</DialogTitle>
            <DialogDescription>Ajouter une nouvelle race pour la catégorie {selectedCategory}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Nom de la race..." 
              value={newBreed}
              onChange={(e) => setNewBreed(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBreed()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBreedModal(false)}>Annuler</Button>
              <Button onClick={addBreed}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCertificationModal} onOpenChange={setShowCertificationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle certification</DialogTitle>
            <DialogDescription>Ajouter un nouveau type de certification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Ex: Commerce équitable, Demeter..." 
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCertification()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCertificationModal(false)}>Annuler</Button>
              <Button onClick={addCertification}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
