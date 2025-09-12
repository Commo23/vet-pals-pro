import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useClients, AccountingEntry, RecurringCharge, GeneratedEntry } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Edit,
  Trash2,
  FileText,
  PieChart,
  BarChart3,
  Cog,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Accounting: React.FC = () => {
  const { 
    accountingEntries, 
    addAccountingEntry, 
    updateAccountingEntry, 
    deleteAccountingEntry,
    generateAccountingSummary,
    recurringCharges,
    generatedEntries,
    addRecurringCharge,
    updateRecurringCharge,
    deleteRecurringCharge,
    generateRecurringEntries,
    confirmGeneratedEntry,
    cancelGeneratedEntry,
    resetRecurringChargesToDefault,
    updateGeneratedEntryPaymentStatus,
    consultations,
    vaccinations,
    antiparasitics,
    prescriptions,
    stockMovements,
    stockItems
  } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AccountingEntry | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [isRecurringSetupModalOpen, setIsRecurringSetupModalOpen] = useState(false);
  const [editingRecurringCharge, setEditingRecurringCharge] = useState<RecurringCharge | null>(null);
  const [pendingEntries, setPendingEntries] = useState<GeneratedEntry[]>([]);
  const [showConfigurationHistory, setShowConfigurationHistory] = useState(false);
  const [editingHistoryCharge, setEditingHistoryCharge] = useState<RecurringCharge | null>(null);

  // Formulaire pour ajouter/modifier une entrée
  const [formData, setFormData] = useState({
    type: 'revenue' as 'revenue' | 'expense',
    frequency: 'occasional' as 'monthly' | 'annual' | 'occasional',
    description: '',
    amount: '',
    date: '',
    source: 'other' as any,
    notes: ''
  });

  // Formulaire pour les charges récurrentes
  const [recurringFormData, setRecurringFormData] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: 'monthly' as 'monthly' | 'annual' | 'quarterly',
    type: 'expense' as 'revenue' | 'expense',
    source: 'other' as any,
    dayOfMonth: '',
    monthOfYear: '',
    quarter: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  // Initialiser les dates
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(format(startOfMonth, 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth, 'yyyy-MM-dd'));
  }, []);

  // Pré-remplir le formulaire quand on édite une charge de l'historique
  useEffect(() => {
    if (editingHistoryCharge) {
      setRecurringFormData({
        name: editingHistoryCharge.name,
        description: editingHistoryCharge.description,
        amount: editingHistoryCharge.amount.toString(),
        frequency: editingHistoryCharge.frequency,
        type: editingHistoryCharge.type,
        source: editingHistoryCharge.source,
        dayOfMonth: editingHistoryCharge.dayOfMonth?.toString() || '',
        monthOfYear: editingHistoryCharge.monthOfYear?.toString() || '',
        quarter: editingHistoryCharge.quarter?.toString() || '',
        startDate: editingHistoryCharge.startDate,
        endDate: editingHistoryCharge.endDate || '',
        notes: editingHistoryCharge.notes || ''
      });
      setEditingRecurringCharge(editingHistoryCharge);
    }
  }, [editingHistoryCharge]);

  // Calculer le résumé quand les dates changent
  useEffect(() => {
    if (startDate && endDate) {
      const period = selectedPeriod === 'month' 
        ? format(new Date(startDate), 'yyyy-MM', { locale: fr })
        : selectedPeriod === 'year'
        ? format(new Date(startDate), 'yyyy', { locale: fr })
        : `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`;
      
      const calculatedSummary = generateAccountingSummary(period, startDate, endDate);
      setSummary(calculatedSummary);

      // Générer les entrées récurrentes pour la période
      const newGeneratedEntries = generateRecurringEntries(startDate, endDate);
      
      // Filtrer les entrées en attente pour la période
      const pendingForPeriod = generatedEntries.filter(entry => {
        const entryDate = new Date(entry.period + '-01');
        const start = new Date(startDate);
        const end = new Date(endDate);
        return entryDate >= start && entryDate <= end && entry.status === 'pending';
      });
      setPendingEntries(pendingForPeriod);
    }
  }, [startDate, endDate, selectedPeriod, accountingEntries, consultations, vaccinations, antiparasitics, prescriptions, stockMovements, generateAccountingSummary, generateRecurringEntries, generatedEntries]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    
    switch (period) {
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(format(startOfMonth, 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth, 'yyyy-MM-dd'));
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        setStartDate(format(startOfQuarter, 'yyyy-MM-dd'));
        setEndDate(format(endOfQuarter, 'yyyy-MM-dd'));
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        setStartDate(format(startOfYear, 'yyyy-MM-dd'));
        setEndDate(format(endOfYear, 'yyyy-MM-dd'));
        break;
    }
  };

  const handleAddEntry = () => {
    if (!formData.description || !formData.amount || !formData.date) return;

    const entryData = {
      type: formData.type,
      category: 'manual' as const,
      frequency: formData.frequency,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      source: formData.source,
      notes: formData.notes
    };

    if (editingEntry) {
      updateAccountingEntry(editingEntry.id, entryData);
      setEditingEntry(null);
    } else {
      addAccountingEntry(entryData);
    }

    // Reset form
    setFormData({
      type: 'revenue',
      frequency: 'occasional',
      description: '',
      amount: '',
      date: '',
      source: 'other',
      notes: ''
    });
    setIsAddEntryModalOpen(false);
  };

  const handleEditEntry = (entry: AccountingEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      frequency: entry.frequency,
      description: entry.description,
      amount: entry.amount.toString(),
      date: entry.date,
      source: entry.source || 'other',
      notes: entry.notes || ''
    });
    setIsAddEntryModalOpen(true);
  };

  const handleDeleteEntry = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      deleteAccountingEntry(id);
    }
  };

  // Fonctions pour les charges récurrentes
  const handleAddRecurringCharge = () => {
    if (!recurringFormData.name || !recurringFormData.amount || !recurringFormData.startDate) return;

    const chargeData = {
      name: recurringFormData.name,
      description: recurringFormData.description,
      amount: parseFloat(recurringFormData.amount),
      frequency: recurringFormData.frequency,
      type: recurringFormData.type,
      source: recurringFormData.source,
      isActive: true,
      dayOfMonth: recurringFormData.frequency === 'monthly' ? parseInt(recurringFormData.dayOfMonth) : undefined,
      monthOfYear: recurringFormData.frequency === 'annual' ? parseInt(recurringFormData.monthOfYear) : undefined,
      quarter: recurringFormData.frequency === 'quarterly' ? parseInt(recurringFormData.quarter) : undefined,
      startDate: recurringFormData.startDate,
      endDate: recurringFormData.endDate || undefined,
      notes: recurringFormData.notes
    };

    if (editingRecurringCharge) {
      updateRecurringCharge(editingRecurringCharge.id, chargeData);
      setEditingRecurringCharge(null);
      setEditingHistoryCharge(null);
    } else {
      addRecurringCharge(chargeData);
    }

    // Reset form
    setRecurringFormData({
      name: '',
      description: '',
      amount: '',
      frequency: 'monthly',
      type: 'expense',
      source: 'other',
      dayOfMonth: '',
      monthOfYear: '',
      quarter: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setIsRecurringSetupModalOpen(false);
  };

  const handleEditRecurringCharge = (charge: RecurringCharge) => {
    setEditingRecurringCharge(charge);
    setRecurringFormData({
      name: charge.name,
      description: charge.description,
      amount: charge.amount.toString(),
      frequency: charge.frequency,
      type: charge.type,
      source: charge.source,
      dayOfMonth: charge.dayOfMonth?.toString() || '',
      monthOfYear: charge.monthOfYear?.toString() || '',
      quarter: charge.quarter?.toString() || '',
      startDate: charge.startDate,
      endDate: charge.endDate || '',
      notes: charge.notes || ''
    });
    setIsRecurringSetupModalOpen(true);
  };

  const handleDeleteRecurringCharge = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette charge récurrente ?')) {
      deleteRecurringCharge(id);
    }
  };

  const handleConfirmPendingEntry = (entryId: number, modifiedAmount?: number) => {
    confirmGeneratedEntry(entryId, modifiedAmount);
    toast({
      title: "Entrée confirmée",
      description: "L'entrée a été confirmée avec succès.",
    });
  };

  const handleCancelPendingEntry = (entryId: number) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette entrée ? Cette action est irréversible.')) {
      cancelGeneratedEntry(entryId);
      toast({
        title: "Entrée annulée",
        description: "L'entrée a été annulée avec succès.",
      });
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les charges récurrentes aux valeurs par défaut ? Cette action supprimera toutes les charges récurrentes actuelles.')) {
      resetRecurringChargesToDefault();
      toast({
        title: "Charges récurrentes réinitialisées",
        description: "Les charges récurrentes ont été réinitialisées aux valeurs par défaut.",
      });
    }
  };

  const handleEditHistoryCharge = (charge: RecurringCharge) => {
    setEditingHistoryCharge(charge);
    setIsRecurringSetupModalOpen(true);
  };

  const handleDeleteHistoryCharge = (chargeId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette charge récurrente ?')) {
      deleteRecurringCharge(chargeId);
      toast({
        title: "Charge récurrente supprimée",
        description: "La charge récurrente a été supprimée avec succès.",
      });
    }
  };

  const handleGeneratedEntryPaymentStatusChange = (entryId: number, status: 'paid' | 'unpaid' | 'pending') => {
    updateGeneratedEntryPaymentStatus(entryId, status);
    const statusText = status === 'paid' ? 'payée' : status === 'unpaid' ? 'non payée' : 'en attente';
    toast({
      title: "Statut de paiement mis à jour",
      description: `L'entrée a été marquée comme ${statusText}.`,
    });
  };

  // Générer automatiquement les entrées récurrentes pour la période sélectionnée
  useEffect(() => {
    if (startDate && endDate) {
      generateRecurringEntries(startDate, endDate);
    }
  }, [startDate, endDate, generateRecurringEntries]);

  const filteredEntries = accountingEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entryDate >= start && entryDate <= end;
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${settings.currency}`;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'consultation': return '🩺';
      case 'vaccination': return '💉';
      case 'antiparasitic': return '💊';
      case 'prescription': return '📋';
      case 'stock_purchase': return '📦';
      case 'salary': return '👥';
      case 'rent': return '🏢';
      case 'tax': return '📊';
      case 'insurance': return '🛡️';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Gestion Comptable
          </h1>
          <p className="text-muted-foreground">
            Suivi des recettes et charges de votre clinique vétérinaire
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddEntryModalOpen} onOpenChange={setIsAddEntryModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEntry(null); setFormData({ type: 'revenue', frequency: 'occasional', description: '', amount: '', date: '', source: 'other', notes: '' }); }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Modifier l\'entrée comptable' : 'Ajouter une entrée comptable'}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry ? 'Modifiez les informations de cette entrée.' : 'Ajoutez une nouvelle recette ou charge manuelle.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'revenue' | 'expense') => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Recette</SelectItem>
                        <SelectItem value="expense">Charge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="frequency">Fréquence</Label>
                    <Select value={formData.frequency} onValueChange={(value: 'monthly' | 'annual' | 'occasional') => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="annual">Annuel</SelectItem>
                        <SelectItem value="occasional">Occasionnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Salaire employé, Loyer, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant ({settings.currency})</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salaire</SelectItem>
                      <SelectItem value="rent">Loyer</SelectItem>
                      <SelectItem value="tax">Impôts</SelectItem>
                      <SelectItem value="insurance">Assurance</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Informations supplémentaires..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddEntryModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddEntry}>
                    {editingEntry ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isRecurringSetupModalOpen} onOpenChange={setIsRecurringSetupModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => { setEditingRecurringCharge(null); setRecurringFormData({ name: '', description: '', amount: '', frequency: 'monthly', type: 'expense', source: 'other', dayOfMonth: '', monthOfYear: '', quarter: '', startDate: '', endDate: '', notes: '' }); }}>
                <Plus className="h-4 w-4 mr-2" />
                Configuration récurrente
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Modal pour les charges récurrentes */}
        <Dialog open={isRecurringSetupModalOpen} onOpenChange={(open) => {
          setIsRecurringSetupModalOpen(open);
          if (!open) {
            setEditingRecurringCharge(null);
            setEditingHistoryCharge(null);
            setRecurringFormData({
              name: '',
              description: '',
              amount: '',
              frequency: 'monthly',
              type: 'expense',
              source: 'other',
              dayOfMonth: '',
              monthOfYear: '',
              quarter: '',
              startDate: '',
              endDate: '',
              notes: ''
            });
          }
        }}>
          <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecurringCharge ? 'Modifier la charge récurrente' : 'Ajouter une charge récurrente'}
            </DialogTitle>
            <DialogDescription>
              {editingRecurringCharge ? 'Modifiez les informations de cette charge récurrente.' : 'Configurez une charge qui se répète automatiquement selon la période choisie.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recurring-name">Nom</Label>
                <Input
                  id="recurring-name"
                  value={recurringFormData.name}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, name: e.target.value })}
                  placeholder="Ex: Salaire employé"
                />
              </div>
              
              <div>
                <Label htmlFor="recurring-type">Type</Label>
                <Select value={recurringFormData.type} onValueChange={(value: 'revenue' | 'expense') => setRecurringFormData({ ...recurringFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Recette</SelectItem>
                    <SelectItem value="expense">Charge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="recurring-description">Description</Label>
              <Input
                id="recurring-description"
                value={recurringFormData.description}
                onChange={(e) => setRecurringFormData({ ...recurringFormData, description: e.target.value })}
                placeholder="Description détaillée"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recurring-amount">Montant ({settings.currency})</Label>
                <Input
                  id="recurring-amount"
                  type="number"
                  step="0.01"
                  value={recurringFormData.amount}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="recurring-frequency">Fréquence</Label>
                <Select value={recurringFormData.frequency} onValueChange={(value: 'monthly' | 'annual' | 'quarterly') => setRecurringFormData({ ...recurringFormData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="quarterly">Trimestriel</SelectItem>
                    <SelectItem value="annual">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Champs conditionnels selon la fréquence */}
            {recurringFormData.frequency === 'monthly' && (
              <div>
                <Label htmlFor="dayOfMonth">Jour du mois (1-31)</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  value={recurringFormData.dayOfMonth}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, dayOfMonth: e.target.value })}
                  placeholder="1"
                />
              </div>
            )}

            {recurringFormData.frequency === 'annual' && (
              <div>
                <Label htmlFor="monthOfYear">Mois de l'année (1-12)</Label>
                <Input
                  id="monthOfYear"
                  type="number"
                  min="1"
                  max="12"
                  value={recurringFormData.monthOfYear}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, monthOfYear: e.target.value })}
                  placeholder="1"
                />
              </div>
            )}

            {recurringFormData.frequency === 'quarterly' && (
              <div>
                <Label htmlFor="quarter">Trimestre (1-4)</Label>
                <Input
                  id="quarter"
                  type="number"
                  min="1"
                  max="4"
                  value={recurringFormData.quarter}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, quarter: e.target.value })}
                  placeholder="1"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recurring-startDate">Date de début</Label>
                <Input
                  id="recurring-startDate"
                  type="date"
                  value={recurringFormData.startDate}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, startDate: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="recurring-endDate">Date de fin (optionnel)</Label>
                <Input
                  id="recurring-endDate"
                  type="date"
                  value={recurringFormData.endDate}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="recurring-source">Source</Label>
              <Select value={recurringFormData.source} onValueChange={(value) => setRecurringFormData({ ...recurringFormData, source: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salaire</SelectItem>
                  <SelectItem value="rent">Loyer</SelectItem>
                  <SelectItem value="tax">Impôts</SelectItem>
                  <SelectItem value="insurance">Assurance</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recurring-notes">Notes (optionnel)</Label>
              <Textarea
                id="recurring-notes"
                value={recurringFormData.notes}
                onChange={(e) => setRecurringFormData({ ...recurringFormData, notes: e.target.value })}
                placeholder="Informations supplémentaires..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRecurringSetupModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddRecurringCharge}>
                {editingRecurringCharge ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      </div>

      {/* Sélecteur de période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Période d'analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('month')}
                size="sm"
              >
                Ce mois
              </Button>
              <Button
                variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('quarter')}
                size="sm"
              >
                Ce trimestre
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('year')}
                size="sm"
              >
                Cette année
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <Label htmlFor="startDate">Du</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <Label htmlFor="endDate">Au</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé financier */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recettes</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <div>Consultations: {formatCurrency(summary.revenueBreakdown.consultations)}</div>
                <div>Vaccinations: {formatCurrency(summary.revenueBreakdown.vaccinations)}</div>
                <div>Antiparasitaires: {formatCurrency(summary.revenueBreakdown.antiparasitics)}</div>
                <div>Prescriptions: {formatCurrency(summary.revenueBreakdown.prescriptions)}</div>
                <div>Manuelles: {formatCurrency(summary.revenueBreakdown.manualEntries)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <div>Achats stock: {formatCurrency(summary.expenseBreakdown.stockPurchases)}</div>
                <div>Salaires: {formatCurrency(summary.expenseBreakdown.salaries)}</div>
                <div>Loyer: {formatCurrency(summary.expenseBreakdown.rent)}</div>
                <div>Impôts: {formatCurrency(summary.expenseBreakdown.taxes)}</div>
                <div>Autres: {formatCurrency(summary.expenseBreakdown.other)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résultat Net</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netIncome)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {summary.netIncome >= 0 ? 'Bénéfice' : 'Perte'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets pour les différentes vues */}
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entries">Entrées comptables</TabsTrigger>
          <TabsTrigger value="pending">Entrées générées</TabsTrigger>
          <TabsTrigger value="recurring">Configuration récurrentes</TabsTrigger>
          <TabsTrigger value="setup">Paramètres</TabsTrigger>
        </TabsList>

        {/* Onglet Entrées */}
        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Entrées comptables automatiques et manuelles
              </CardTitle>
              <CardDescription>
                Entrées générées automatiquement (consultations, vaccinations, etc.) et entrées manuelles ajoutées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Fréquence</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                      <TableCell>
                        <Badge variant={entry.type === 'revenue' ? 'default' : 'destructive'}>
                          {entry.type === 'revenue' ? 'Recette' : 'Charge'}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getSourceIcon(entry.source || 'other')}</span>
                          <span className="text-sm">
                            {entry.category === 'automatic' ? 'Automatique' : 'Manuel'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.frequency === 'monthly' ? 'Mensuel' : 
                           entry.frequency === 'annual' ? 'Annuel' : 'Occasionnel'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${entry.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.type === 'revenue' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell>
                        {entry.category === 'manual' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredEntries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune entrée comptable pour cette période
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Configuration récurrentes */}
        <TabsContent value="recurring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Configuration des charges récurrentes
              </CardTitle>
              <CardDescription>
                Configurez les charges qui se répètent automatiquement (loyer, salaires, impôts, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Fréquence</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringCharges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{charge.name}</div>
                          <div className="text-sm text-muted-foreground">{charge.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={charge.type === 'revenue' ? 'default' : 'destructive'}>
                          {charge.type === 'revenue' ? 'Recette' : 'Charge'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {charge.frequency === 'monthly' ? 'Mensuel' : 
                           charge.frequency === 'quarterly' ? 'Trimestriel' : 'Annuel'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(charge.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={charge.isActive ? 'default' : 'secondary'}>
                          {charge.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRecurringCharge(charge)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRecurringCharge(charge.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {recurringCharges.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune charge récurrente configurée
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Entrées en attente */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Entrées générées - Gestion des paiements
              </CardTitle>
              <CardDescription>
                Entrées générées automatiquement selon les charges récurrentes configurées - Confirmez et gérez le statut de paiement
              </CardDescription>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (startDate && endDate) {
                      const newEntries = generateRecurringEntries(startDate, endDate);
                      if (newEntries.length > 0) {
                        toast({
                          title: "Entrées générées",
                          description: `${newEntries.length} nouvelle(s) entrée(s) générée(s) pour la période sélectionnée.`,
                        });
                      } else {
                        toast({
                          title: "Aucune nouvelle entrée",
                          description: "Toutes les entrées récurrentes sont déjà générées pour cette période.",
                        });
                      }
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Générer les entrées
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                // Filtrer les entrées générées selon la période sélectionnée (exclure les annulées)
                const filteredGeneratedEntries = generatedEntries.filter(entry => {
                  const entryDate = new Date(entry.period);
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  return entryDate >= start && entryDate <= end && entry.status !== 'cancelled';
                });

                return filteredGeneratedEntries.length > 0 ? (
                  <div className="space-y-4">
                    {filteredGeneratedEntries.map((entry) => {
                    const charge = recurringCharges.find(c => c.id === entry.recurringChargeId);
                    if (!charge) return null;
                    
                    return (
                      <Card key={entry.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{charge.name}</div>
                              <Badge 
                                variant={entry.status === 'pending' ? 'secondary' : entry.status === 'confirmed' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {entry.status === 'pending' ? 'En attente' : entry.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                              </Badge>
                              <Badge 
                                variant={entry.paymentStatus === 'paid' ? 'default' : entry.paymentStatus === 'pending' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {entry.paymentStatus === 'paid' ? 'Payé' : entry.paymentStatus === 'pending' ? 'En attente' : 'Non payé'}
                              </Badge>
                              <Badge variant={charge.type === 'revenue' ? 'default' : 'destructive'}>
                                {charge.type === 'revenue' ? 'Recette' : 'Charge'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {charge.description} - Période: {entry.period}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                {formatCurrency(charge.amount)}
                              </span>
                              {entry.paidDate && (
                                <span className="ml-2 text-green-600">
                                  Payé le: {format(new Date(entry.paidDate), 'dd/MM/yyyy', { locale: fr })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {entry.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmPendingEntry(entry.id)}
                              >
                                Confirmer
                              </Button>
                            )}
                            {entry.status === 'confirmed' && entry.paymentStatus === 'unpaid' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleGeneratedEntryPaymentStatusChange(entry.id, 'paid')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmer le paiement
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4 mr-2" />
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleGeneratedEntryPaymentStatusChange(entry.id, 'paid')}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Marquer comme payé
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleGeneratedEntryPaymentStatusChange(entry.id, 'pending')}>
                                  <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                                  Marquer en attente
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleGeneratedEntryPaymentStatusChange(entry.id, 'unpaid')}>
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Marquer non payé
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelPendingEntry(entry.id)}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune entrée générée pour cette période
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="setup">
          <div className="space-y-4">
            {/* Configuration actuelle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="h-5 w-5" />
                  Paramètres et historique des charges récurrentes
                </CardTitle>
                <CardDescription>
                  Historique des configurations et paramètres des charges récurrentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Configuration des charges récurrentes</h3>
                    <p className="text-muted-foreground mb-4">
                      Configurez des charges qui se répètent automatiquement selon la période choisie.
                      Les entrées seront générées et vous pourrez les confirmer ou les modifier.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setIsRecurringSetupModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une charge récurrente
                      </Button>
                      <Button variant="outline" onClick={handleResetToDefault}>
                        <Cog className="h-4 w-4 mr-2" />
                        Réinitialiser aux valeurs par défaut
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historique de configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Historique de configuration
                </CardTitle>
                <CardDescription>
                  Charges récurrentes configurées (modifiables et supprimables)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recurringCharges.length > 0 ? (
                    <div className="space-y-4">
                      {/* Charges mensuelles */}
                      {recurringCharges.filter(charge => charge.frequency === 'monthly').length > 0 && (
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <h4 className="font-medium mb-3">Charges mensuelles</h4>
                          <div className="space-y-2">
                            {recurringCharges
                              .filter(charge => charge.frequency === 'monthly')
                              .map((charge) => (
                                <div key={charge.id} className="flex items-center justify-between p-3 bg-background rounded border">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{charge.name}</span>
                                      {!charge.isActive && (
                                        <Badge variant="secondary" className="text-xs">Inactif</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">{charge.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{charge.amount.toLocaleString()} {settings.currency}</span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditHistoryCharge(charge)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteHistoryCharge(charge.id)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Charges annuelles */}
                      {recurringCharges.filter(charge => charge.frequency === 'annual').length > 0 && (
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <h4 className="font-medium mb-3">Charges annuelles</h4>
                          <div className="space-y-2">
                            {recurringCharges
                              .filter(charge => charge.frequency === 'annual')
                              .map((charge) => (
                                <div key={charge.id} className="flex items-center justify-between p-3 bg-background rounded border">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{charge.name}</span>
                                      {!charge.isActive && (
                                        <Badge variant="secondary" className="text-xs">Inactif</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">{charge.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{charge.amount.toLocaleString()} {settings.currency}</span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditHistoryCharge(charge)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteHistoryCharge(charge.id)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Charges trimestrielles */}
                      {recurringCharges.filter(charge => charge.frequency === 'quarterly').length > 0 && (
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <h4 className="font-medium mb-3">Charges trimestrielles</h4>
                          <div className="space-y-2">
                            {recurringCharges
                              .filter(charge => charge.frequency === 'quarterly')
                              .map((charge) => (
                                <div key={charge.id} className="flex items-center justify-between p-3 bg-background rounded border">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{charge.name}</span>
                                      {!charge.isActive && (
                                        <Badge variant="secondary" className="text-xs">Inactif</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">{charge.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{charge.amount.toLocaleString()} {settings.currency}</span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditHistoryCharge(charge)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteHistoryCharge(charge.id)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucune charge récurrente</h3>
                      <p className="text-muted-foreground mb-4">
                        Aucune charge récurrente n'est configurée. Ajoutez-en une ou utilisez les exemples par défaut.
                      </p>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <Button variant="outline" onClick={handleResetToDefault}>
                      <Cog className="h-4 w-4 mr-2" />
                      Appliquer les exemples par défaut
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Accounting;
