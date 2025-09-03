import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClients } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Syringe,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  Download,
  Grid3X3,
  List,
  Bell,
  TrendingUp,
  Shield,
  Heart,
  Users,
  PawPrint,
  FileText,
  Eye,
  Edit
} from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import NewVaccinationModal from '@/components/forms/NewVaccinationModal';
import VaccinationProtocolModal from '@/components/forms/VaccinationProtocolModal';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useReactToPrint } from 'react-to-print';
import CertificateVaccinationPrint from '@/components/CertificateVaccinationPrint';

// Protocoles vaccinaux prédéfinis
const vaccinationProtocols = {
  'Chien': {
    core: [
      { name: 'DHPP', interval: 365, description: 'Distemper, Hépatite, Parvovirus, Parainfluenza' },
      { name: 'Rage', interval: 1095, description: 'Vaccination antirabique obligatoire' }
    ],
    nonCore: [
      { name: 'Bordetella', interval: 365, description: 'Toux de chenil' },
      { name: 'Lyme', interval: 365, description: 'Maladie de Lyme' },
      { name: 'Leptospirose', interval: 365, description: 'Leptospirose canine' }
    ]
  },
  'Chat': {
    core: [
      { name: 'FVRCP', interval: 365, description: 'Rhinotrachéite, Calicivirus, Panleucopénie' },
      { name: 'Rage', interval: 1095, description: 'Vaccination antirabique' }
    ],
    nonCore: [
      { name: 'FeLV', interval: 365, description: 'Leucémie féline' },
      { name: 'FIV', interval: 365, description: 'Immunodéficience féline' }
    ]
  },
  'Furet': {
    core: [
      { name: 'Distemper', interval: 365, description: 'Maladie de Carré' },
      { name: 'Rage', interval: 365, description: 'Vaccination antirabique' }
    ],
    nonCore: []
  },
  'Lapin': {
    core: [
      { name: 'Myxomatose', interval: 180, description: 'Myxomatose' },
      { name: 'VHD', interval: 365, description: 'Maladie hémorragique virale' }
    ],
    nonCore: []
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'missed': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'overdue': return <AlertTriangle className="h-4 w-4" />;
    case 'scheduled': return <Clock className="h-4 w-4" />;
    case 'missed': return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const VaccinationCalendar: React.FC = () => {
  const { vaccinations, pets, clients } = useClients();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Générer les jours du mois
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  while (current <= monthEnd || days.length < 42) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Grouper les vaccinations par date
  const vaccinationsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    vaccinations.forEach(vaccination => {
      const dateKey = vaccination.nextDueDate;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(vaccination);
    });
    return grouped;
  }, [vaccinations]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendrier Vaccinal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              ←
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayVaccinations = vaccinationsByDate[dayKey] || [];
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={index}
                className={`
                  min-h-[80px] p-1 border rounded-lg relative
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isToday ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className={`text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1 mt-1">
                  {dayVaccinations.slice(0, 2).map((vaccination, vIndex) => (
                    <div
                      key={vIndex}
                      className={`
                        text-xs p-1 rounded text-center truncate
                        ${getStatusColor(vaccination.status)}
                      `}
                      title={`${vaccination.petName} - ${vaccination.vaccineName}`}
                    >
                      {vaccination.petName}
                    </div>
                  ))}
                  {dayVaccinations.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayVaccinations.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Vaccinations() {
  const { 
    vaccinations, 
    pets, 
    clients, 
    vaccinationProtocols,
    getVaccinationsByPetId,
    getOverdueVaccinations,
    getUpcomingVaccinations,
    getVaccinationsByStatus,
    getActiveVaccinationProtocols,
    getVaccinationProtocolsBySpecies,
    deleteVaccinationProtocol
  } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState('overview');

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certPetId, setCertPetId] = useState<number | null>(null);
  const [certClientId, setCertClientId] = useState<number | null>(null);
  const printRef = useRef<any>(null);

  // États pour les boutons de vaccination
  const [selectedVaccination, setSelectedVaccination] = useState<any>(null);
  const [showVaccinationDetails, setShowVaccinationDetails] = useState(false);
  const [showVaccinationDocument, setShowVaccinationDocument] = useState(false);

  const handlePrintCert = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => setCertModalOpen(false)
  });

  // Gestionnaires pour les boutons
  const handleShowVaccinationDetails = (vaccination: any) => {
    setSelectedVaccination(vaccination);
    setShowVaccinationDetails(true);
  };

  const handleShowVaccinationDocument = (vaccination: any) => {
    setSelectedVaccination(vaccination);
    setShowVaccinationDocument(true);
  };

  // Calculs des statistiques
  const stats = useMemo(() => {
    const total = vaccinations.length;
    const completed = getVaccinationsByStatus('completed').length;
    const overdue = getOverdueVaccinations().length;
    const upcoming = getUpcomingVaccinations().length;
    const scheduled = getVaccinationsByStatus('scheduled').length;
    
    return { total, completed, overdue, upcoming, scheduled };
  }, [vaccinations, getVaccinationsByStatus, getOverdueVaccinations, getUpcomingVaccinations]);

  // Filtrage des vaccinations
  const filteredVaccinations = useMemo(() => {
    return vaccinations.filter(vaccination => {
      const matchesSearch = 
        vaccination.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccination.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccination.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccination.veterinarian.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || vaccination.status === statusFilter;
      const matchesType = typeFilter === 'all' || vaccination.vaccineType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vaccinations, searchTerm, statusFilter, typeFilter]);

  const exportVaccinationData = () => {
    const dataStr = JSON.stringify(vaccinations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vaccinations-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Syringe className="h-8 w-8 text-blue-600" />
            Gestion Vaccinale
          </h1>
          <p className="text-gray-600 mt-1">
            Suivi et planification des vaccinations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportVaccinationData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <NewVaccinationModal />
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Syringe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">En Retard</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Prochaines 30j</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Planifiées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendrier
          </TabsTrigger>
          <TabsTrigger value="protocols" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Protocoles
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Certificats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher animal, client, vaccin..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous statuts</SelectItem>
                      <SelectItem value="completed">Terminées</SelectItem>
                      <SelectItem value="scheduled">Planifiées</SelectItem>
                      <SelectItem value="overdue">En retard</SelectItem>
                      <SelectItem value="missed">Manquées</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="core">Essentiels</SelectItem>
                      <SelectItem value="non-core">Optionnels</SelectItem>
                      <SelectItem value="rabies">Rage</SelectItem>
                      <SelectItem value="custom">Personnalisés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des vaccinations */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVaccinations.map((vaccination) => {
                const pet = pets.find(p => p.id === vaccination.petId);
                const client = clients.find(c => c.id === vaccination.clientId);
                
                return (
                  <Card key={vaccination.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={pet?.photo} />
                            <AvatarFallback>
                              <PawPrint className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-sm">{vaccination.petName}</h3>
                            <p className="text-xs text-gray-600">{pet?.type} • {client?.name}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(vaccination.status)}>
                          {getStatusIcon(vaccination.status)}
                          <span className="ml-1 capitalize">{vaccination.status}</span>
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Syringe className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">{vaccination.vaccineName}</span>
                          <Badge variant="outline" className="text-xs">
                            {vaccination.vaccineType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Donné: {format(new Date(vaccination.dateGiven), 'dd/MM/yyyy', { locale: fr })}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Rappel: {format(new Date(vaccination.nextDueDate), 'dd/MM/yyyy', { locale: fr })}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{vaccination.veterinarian}</span>
                        </div>

                        {vaccination.cost && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">{vaccination.cost} {settings.currency}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedVaccination(vaccination);
                            setShowVaccinationDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedVaccination(vaccination);
                            setShowVaccinationDocument(true);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Vaccin</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date donnée</TableHead>
                      <TableHead>Rappel</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Vétérinaire</TableHead>
                      <TableHead>Coût</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVaccinations.map((vaccination) => {
                      const pet = pets.find(p => p.id === vaccination.petId);
                      const client = clients.find(c => c.id === vaccination.clientId);
                      
                      return (
                        <TableRow key={vaccination.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={pet?.photo} />
                                <AvatarFallback>
                                  <PawPrint className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{vaccination.petName}</div>
                                <div className="text-xs text-gray-600">{client?.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{vaccination.vaccineName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {vaccination.vaccineType}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(vaccination.dateGiven), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{format(new Date(vaccination.nextDueDate), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(vaccination.status)}>
                              {getStatusIcon(vaccination.status)}
                              <span className="ml-1 capitalize">{vaccination.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>{vaccination.veterinarian}</TableCell>
                          <TableCell>{vaccination.cost} {settings.currency}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedVaccination(vaccination);
                                  setShowVaccinationDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedVaccination(vaccination);
                                  setShowVaccinationDocument(true);
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <VaccinationCalendar />
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Gestion des Protocoles Vaccinaux</h3>
            <VaccinationProtocolModal mode="create" />
          </div>

          {/* Statistiques des protocoles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Protocoles</p>
                    <p className="text-xl font-bold">{vaccinationProtocols.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Actifs</p>
                    <p className="text-xl font-bold">
                      {vaccinationProtocols.filter(p => p.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Heart className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Essentiels</p>
                    <p className="text-xl font-bold">
                      {vaccinationProtocols.filter(p => p.vaccineType === 'core').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Espèces</p>
                    <p className="text-xl font-bold">
                      {new Set(vaccinationProtocols.map(p => p.species)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 items-center">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="core">Essentiels</SelectItem>
                <SelectItem value="non-core">Optionnels</SelectItem>
                <SelectItem value="rabies">Rage</SelectItem>
                <SelectItem value="custom">Personnalisés</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un protocole..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Liste des protocoles groupés par espèce */}
          <div className="space-y-6">
            {Array.from(new Set(vaccinationProtocols.map(p => p.species))).map(species => {
              const speciesProtocols = vaccinationProtocols
                .filter(p => p.species === species)
                .filter(p => {
                  const matchesType = typeFilter === 'all' || p.vaccineType === typeFilter;
                  const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      p.description.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesType && matchesSearch;
                });

              if (speciesProtocols.length === 0) return null;

              return (
                <Card key={species}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PawPrint className="h-5 w-5" />
                        {species} ({speciesProtocols.length} protocoles)
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {speciesProtocols.map(protocol => (
                        <Card key={protocol.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold">{protocol.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={protocol.vaccineType === 'core' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {protocol.vaccineType === 'core' ? 'Essentiel' :
                                     protocol.vaccineType === 'non-core' ? 'Optionnel' :
                                     protocol.vaccineType === 'rabies' ? 'Rage' : 'Personnalisé'}
                                  </Badge>
                                  {!protocol.isActive && (
                                    <Badge variant="outline" className="text-xs">
                                      Inactif
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{protocol.description}</p>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Rappel:</span>
                                <span className="font-medium">
                                  {protocol.intervals && protocol.intervals.length > 0
                                    ? protocol.intervals.map(i => i.label).join(', ')
                                    : 'Non spécifié'}
                                </span>
                              </div>
                              
                              {protocol.manufacturer && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Fabricant:</span>
                                  <span className="font-medium">{protocol.manufacturer}</span>
                                </div>
                              )}

                              {protocol.ageRequirement && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Âge requis:</span>
                                  <span className="font-medium">{protocol.ageRequirement}</span>
                                </div>
                              )}
                            </div>

                            {protocol.notes && (
                              <div className="mt-3 p-2 bg-gray-50 rounded">
                                <p className="text-xs text-gray-600">{protocol.notes}</p>
                              </div>
                            )}

                            <div className="flex gap-2 mt-4">
                              <VaccinationProtocolModal mode="edit" protocol={protocol}>
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Modifier
                                </Button>
                              </VaccinationProtocolModal>
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  if (confirm(`Êtes-vous sûr de vouloir supprimer le protocole "${protocol.name}" ?`)) {
                                    deleteVaccinationProtocol(protocol.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                🗑️
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {vaccinationProtocols.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Aucun protocole vaccinal configuré</p>
                <p className="text-sm mb-4">Commencez par créer votre premier protocole</p>
                <VaccinationProtocolModal mode="create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un protocole
                  </Button>
                </VaccinationProtocolModal>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificats de Vaccination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Générez des certificats officiels de vaccination pour les voyages et compétitions.
              </p>
              <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Générer un Certificat
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Sélectionner l'animal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Sélection du client */}
                    <Select value={certClientId?.toString() || ''} onValueChange={value => { setCertClientId(parseInt(value)); setCertPetId(null); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Sélection de l’animal lié au client */}
                    <Select value={certPetId?.toString() || ''} onValueChange={value => setCertPetId(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un animal" />
                      </SelectTrigger>
                      <SelectContent>
                        {pets.filter(p => certClientId ? p.ownerId === certClientId : false).map(pet => (
                          <SelectItem key={pet.id} value={pet.id.toString()}>
                            {pet.name} ({pet.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {certPetId && (
                      <div className="hidden">
                        <CertificateVaccinationPrint ref={printRef} petId={certPetId} />
                      </div>
                    )}
                    <div className="flex justify-end">
                      {/* Impression PDF via hook */}
                      <Button disabled={!certPetId} onClick={handlePrintCert}>
                        Générer PDF
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modale des détails de vaccination */}
      <Dialog open={showVaccinationDetails} onOpenChange={setShowVaccinationDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la Vaccination</DialogTitle>
          </DialogHeader>
          {selectedVaccination && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Animal:</Label>
                  <p>{selectedVaccination.petName}</p>
                </div>
                <div>
                  <Label className="font-medium">Client:</Label>
                  <p>{clients.find(c => c.id === selectedVaccination.clientId)?.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Vaccin:</Label>
                  <p>{selectedVaccination.vaccineName}</p>
                </div>
                <div>
                  <Label className="font-medium">Type:</Label>
                  <p>{selectedVaccination.vaccineType}</p>
                </div>
                <div>
                  <Label className="font-medium">Date donnée:</Label>
                  <p>{format(new Date(selectedVaccination.dateGiven), 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
                <div>
                  <Label className="font-medium">Rappel:</Label>
                  <p>{format(new Date(selectedVaccination.nextDueDate), 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
                <div>
                  <Label className="font-medium">Vétérinaire:</Label>
                  <p>{selectedVaccination.veterinarian}</p>
                </div>
                <div>
                  <Label className="font-medium">Coût:</Label>
                  <p>{selectedVaccination.cost} {settings.currency}</p>
                </div>
              </div>
              {selectedVaccination.notes && (
                <div>
                  <Label className="font-medium">Notes:</Label>
                  <p className="text-muted-foreground">{selectedVaccination.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale du document de vaccination */}
      <Dialog open={showVaccinationDocument} onOpenChange={setShowVaccinationDocument}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Document de Vaccination</DialogTitle>
          </DialogHeader>
          {selectedVaccination && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Générez un document officiel pour la vaccination de {selectedVaccination.petName}.
              </p>
              <div className="hidden">
                <CertificateVaccinationPrint 
                  ref={printRef} 
                  petId={selectedVaccination.petId} 
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowVaccinationDocument(false)}>
                  Annuler
                </Button>
                <Button onClick={handlePrintCert}>
                  Générer PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
