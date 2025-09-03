import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Heart, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Grid, List } from "lucide-react";
import { NewAppointmentModal } from "@/components/forms/NewAppointmentModal";
import { useClients, Appointment } from "@/contexts/ClientContext";
import { useToast } from "@/hooks/use-toast";
import React from "react";

const statusStyles = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-orange-100 text-orange-800"
};

const statusLabels = {
  scheduled: "Planifié",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
  "no-show": "Absent"
};

const typeLabels = {
  consultation: "Consultation générale",
  vaccination: "Vaccination",
  chirurgie: "Chirurgie",
  urgence: "Urgence",
  controle: "Contrôle post-opératoire",
  sterilisation: "Stérilisation",
  dentaire: "Soins dentaires"
};

export default function Appointments() {
  const { 
    appointments, 
    deleteAppointment, 
    updateAppointment, 
    getUpcomingAppointments, 
    getOverdueAppointments 
  } = useClients();
  const { toast } = useToast();
  
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');
  // Date affichée pour la vue calendrier
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const prevMonth = () => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() + 1, 1));

  const upcomingAppointments = getUpcomingAppointments();
  const overdueAppointments = getOverdueAppointments();

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.reason && appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    const matchesType = filterType === "all" || appointment.type === filterType;
    
    let matchesDate = true;
    if (filterDate === "today") {
      matchesDate = appointment.date === new Date().toISOString().split('T')[0];
    } else if (filterDate === "week") {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow;
    } else if (filterDate === "specific") {
      matchesDate = appointment.date === selectedDate;
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const handleStatusChange = (appointmentId: number, newStatus: Appointment['status']) => {
    updateAppointment(appointmentId, { status: newStatus });
    toast({
      title: "Statut mis à jour",
      description: `Le rendez-vous est maintenant ${statusLabels[newStatus].toLowerCase()}.`,
    });
  };

  const handleDelete = (appointment: Appointment) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous pour ${appointment.petName} ?`)) {
      deleteAppointment(appointment.id);
      toast({
        title: "Rendez-vous supprimé",
        description: `Le rendez-vous pour ${appointment.petName} a été supprimé.`,
      });
    }
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(a => a.date === date);
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return getAppointmentsForDate(today);
  };

  const todayAppointments = getTodayAppointments();

  // Calendar data based on currentDate
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const weeks: number[][] = [];
  let dayCounter = 1 - firstDay;
  while (dayCounter <= daysInMonth) {
    const week: number[] = [];
    for (let i=0;i<7;i++) {
      if (dayCounter>0 && dayCounter<=daysInMonth) week.push(dayCounter);
      else week.push(0);
      dayCounter++;
    }
    weeks.push(week);
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Rendez-vous</h1>
          <p className="text-muted-foreground">
            Planifiez et gérez tous vos rendez-vous vétérinaires
          </p>
        </div>
        <Button onClick={() => setShowNewAppointment(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Rendez-vous
        </Button>
      </div>

      {/* Toggle List / Calendrier */}
      <div className="flex items-center gap-4">
        <Button variant={viewMode==='list'?'default':'outline'} onClick={()=>setViewMode('list')}>Liste</Button>
        <Button variant={viewMode==='calendar'?'default':'outline'} onClick={()=>setViewMode('calendar')}>Calendrier</Button>
        
        {viewMode === 'list' && (
          <div className="flex gap-2 ml-4">
            <Button 
              size="sm" 
              variant={displayMode === 'cards' ? 'default' : 'outline'} 
              onClick={() => setDisplayMode('cards')}
              className="gap-2"
            >
              <Grid className="h-4 w-4" />
              Cartes
            </Button>
            <Button 
              size="sm" 
              variant={displayMode === 'table' ? 'default' : 'outline'} 
              onClick={() => setDisplayMode('table')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Tableau
            </Button>
          </div>
        )}
      </div>
      {viewMode==='calendar' ? (
        <>
          {/* En-tête mois/année */}
          <div className="flex items-center justify-between mb-2">
            <Button size="sm" onClick={prevMonth}>&lt;</Button>
            <div className="text-lg font-semibold">{currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</div>
            <Button size="sm" onClick={nextMonth}>&gt;</Button>
          </div>
          <div className="grid grid-cols-7 gap-1 mt-2">
            {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'].map(d=><div key={d} className="text-center font-medium">{d}</div>)}
            {weeks.map((week,i)=><React.Fragment key={i}>
              {week.map((d,j)=><div key={j} className="h-24 p-1 border">
                {d>0 && <div className="text-sm font-medium">{d}</div>}
                {d>0 && getAppointmentsForDate(`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`).map(app=><div key={app.id} className="text-xs mt-1 bg-blue-100 rounded px-1 truncate" title={`${app.time} ${app.clientName}`}>{app.time}</div>)}
              </div>)}
            </React.Fragment>)}
          </div>
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                  <p className="text-2xl font-bold">{todayAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">À venir</p>
                  <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">En retard</p>
                  <p className="text-2xl font-bold">{overdueAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Client, animal, motif..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="scheduled">Planifié</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="no-show">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="chirurgie">Chirurgie</SelectItem>
                  <SelectItem value="urgence">Urgence</SelectItem>
                  <SelectItem value="controle">Contrôle</SelectItem>
                  <SelectItem value="sterilisation">Stérilisation</SelectItem>
                  <SelectItem value="dentaire">Dentaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="specific">Date spécifique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filterDate === "specific" && (
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des rendez-vous */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Rendez-vous ({filteredAppointments.length})
          </h2>
        </div>
        
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Aucun rendez-vous trouvé</p>
              <p className="text-sm">Commencez par créer votre premier rendez-vous</p>
            </CardContent>
          </Card>
        ) : displayMode === 'cards' ? (
          <div className="space-y-4">
            {filteredAppointments
              .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
              .map((appointment) => (
                <Card key={appointment.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.clientName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.petName}</span>
                          </div>
                          <Badge className={statusStyles[appointment.status]}>
                            {statusLabels[appointment.status]}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(appointment.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.time}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-1">{typeLabels[appointment.type]}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Durée:</span>
                            <span className="ml-1">{appointment.duration} min</span>
                          </div>
                        </div>
                        
                        {appointment.reason && (
                          <div>
                            <span className="text-sm text-muted-foreground">Motif:</span>
                            <p className="text-sm mt-1">{appointment.reason}</p>
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div>
                            <span className="text-sm text-muted-foreground">Notes:</span>
                            <p className="text-sm mt-1 text-muted-foreground">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                              className="gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Confirmer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              className="gap-1 text-red-600"
                            >
                              <XCircle className="h-3 w-3" />
                              Annuler
                            </Button>
                          </>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Terminer
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(appointment)}
                          className="gap-1 text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Client / Animal</th>
                      <th className="p-4 font-medium">Date & Heure</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium">Statut</th>
                      <th className="p-4 font-medium">Motif</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments
                      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
                      .map((appointment) => (
                        <tr key={appointment.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{appointment.clientName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{appointment.petName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(appointment.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{appointment.time}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{typeLabels[appointment.type]}</div>
                              <div className="text-sm text-muted-foreground">{appointment.duration} min</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={statusStyles[appointment.status]}>
                              {statusLabels[appointment.status]}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="max-w-xs">
                              {appointment.reason && (
                                <div className="text-sm">{appointment.reason}</div>
                              )}
                              {appointment.notes && (
                                <div className="text-xs text-muted-foreground mt-1">{appointment.notes}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              {appointment.status === 'scheduled' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              
                              {appointment.status === 'confirmed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusChange(appointment.id, 'completed')}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDelete(appointment)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <NewAppointmentModal 
        open={showNewAppointment} 
        onOpenChange={setShowNewAppointment} 
      />
    </div>
  );
}

// Composant Label pour éviter l'erreur
const Label = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <label className="text-sm font-medium" {...props}>{children}</label>
);