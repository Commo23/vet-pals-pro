import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Client {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
  pets: Pet[];
  lastVisit: string;
  totalVisits: number;
}

export interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string;
  gender?: 'male' | 'female'; // Sexe de l'animal
  birthDate?: string; // Date de naissance au format YYYY-MM-DD
  weight?: string;
  color?: string;
  microchip?: string;
  medicalNotes?: string;
  photo?: string;
  additionalPhotos?: string[]; // Photos supplémentaires de l'animal
  ownerId: number;
  owner: string;
  status: 'healthy' | 'treatment' | 'urgent';
  lastVisit?: string;
  nextAppointment?: string;
  vaccinations?: string[];
  // Propriétés du pedigree
  hasPedigree?: boolean;
  officialName?: string;
  pedigreeNumber?: string;
  breeder?: string;
  fatherName?: string;
  fatherPedigree?: string;
  fatherBreed?: string;
  fatherTitles?: string;
  motherName?: string;
  motherPedigree?: string;
  motherBreed?: string;
  motherTitles?: string;
  pedigreePhoto?: string;
}

export interface Consultation {
  id: number;
  clientId: number;
  clientName: string;
  petId: number;
  petName: string;
  date: string;
  weight?: string;
  temperature?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  followUp?: string;
  cost?: string;
  notes?: string;
  photos: string[]; // URLs ou DataURI des photos associées à la consultation
  createdAt: string;
}

export interface Appointment {
  id: number;
  clientId: number;
  clientName: string;
  petId: number;
  petName: string;
  date: string;
  time: string;
  type: 'consultation' | 'vaccination' | 'chirurgie' | 'urgence' | 'controle' | 'sterilisation' | 'dentaire';
  duration: number;
  reason?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reminderSent: boolean;
  createdAt: string;
}

export interface Prescription {
  id: number;
  consultationId: number;
  clientId: number;
  clientName: string;
  petId: number;
  petName: string;
  date: string;
  prescribedBy: string;
  diagnosis: string;
  medications: PrescriptionMedication[];
  instructions: string;
  duration: string;
  followUpDate?: string;
  status: 'active' | 'completed' | 'discontinued';
  notes?: string;
  createdAt: string;
}

export interface PrescriptionMedication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  unit: string;
  refills?: number;
  cost?: number;
}

export interface FarmAnimalDetail {
  category: string;
  maleCount: number;
  femaleCount: number;
  breeds: string[];
  ageGroups?: string[];
}

export interface Farm {
  id: number;
  name: string;
  owner: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email: string;
  types: string[]; // Permet plusieurs types d'élevage
  totalAnimals: number;
  animalDetails: FarmAnimalDetail[];
  lastVisit: string;
  status: 'active' | 'attention' | 'urgent';
  veterinarian: string;
  notes?: string;
  registrationNumber?: string; // Numéro d'immatriculation de l'exploitation
  surfaceArea?: number; // Surface en hectares
  buildingDetails?: string; // Détails des bâtiments
  equipmentDetails?: string; // Équipements disponibles
  certifications?: string[]; // Certifications (bio, etc.)
  insuranceDetails?: string; // Détails assurance
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  photos?: {
    id: string;
    url: string;
    description: string;
    category: 'cheptel' | 'batiments' | 'equipements' | 'general';
    uploadedAt: string;
  }[];
  createdAt: string;
}



export interface FarmIntervention {
  id: number;
  date: string;
  farmId: number;
  farmName: string;
  type: 'vaccination' | 'controle' | 'urgence' | 'chirurgie' | 'prevention' | 'consultation';
  animals: string;
  veterinarian: string;
  description: string;
  status: 'completed' | 'ongoing' | 'scheduled' | 'cancelled';
  followUp?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
}

export interface Vaccination {
  id: number;
  petId: number;
  petName: string;
  clientId: number;
  clientName: string;
  vaccineName: string;
  vaccineType: 'core' | 'non-core' | 'rabies' | 'custom';
  dateGiven: string;
  nextDueDate: string;
  batchNumber?: string;
  veterinarian: string;
  notes?: string;
  status: 'completed' | 'overdue' | 'scheduled' | 'missed';
  cost?: string;
  location?: 'left_shoulder' | 'right_shoulder' | 'left_hip' | 'right_hip' | 'subcutaneous';
  adverseReactions?: string;
  manufacturer?: string;
  expirationDate?: string;
  createdAt: string;
}

export interface VaccinationProtocol {
  id: number;
  name: string;
  species: string;
  vaccineType: 'core' | 'non-core' | 'rabies' | 'custom';
  description: string;
  manufacturer?: string;
  intervals: Array<{ offsetDays: number; label: string }>;
  ageRequirement?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Antiparasitic {
  id: number;
  petId: number;
  petName: string;
  clientId: number;
  clientName: string;
  productName: string;
  productType: 'external' | 'internal' | 'combined' | 'heartworm' | 'flea_tick' | 'worming';
  targetParasites: string; // ex: "Puces, Tiques, Poux"
  dateGiven: string;
  nextDueDate: string;
  dosage: string;
  administrationRoute: 'oral' | 'topical' | 'injection' | 'collar';
  veterinarian: string;
  notes?: string;
  batchNumber?: string;
  manufacturer?: string;
  weight?: string; // poids de l'animal au moment du traitement
  status: 'completed' | 'overdue' | 'scheduled' | 'missed';
  cost?: string;
  sideEffects?: string;
  createdAt: string;
}

export interface AntiparasiticProtocol {
  id: number;
  name: string;
  species: string;
  productType: 'external' | 'internal' | 'combined' | 'heartworm' | 'flea_tick' | 'worming';
  targetParasites: string;
  description: string;
  manufacturer?: string;
  intervals: Array<{ offsetDays: number; label: string }>;
  weightRange?: string; // ex: "2-8kg"
  ageRequirement?: string;
  seasonalTreatment?: boolean; // pour certains traitements saisonniers
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClientContextType {
  clients: Client[];
  pets: Pet[];
  consultations: Consultation[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  farms: Farm[];

  farmInterventions: FarmIntervention[];
  vaccinations: Vaccination[];
  vaccinationProtocols: VaccinationProtocol[];
  antiparasitics: Antiparasitic[];
  antiparasiticProtocols: AntiparasiticProtocol[];
  addClient: (clientData: Omit<Client, 'id' | 'pets' | 'lastVisit' | 'totalVisits'>) => void;
  addPet: (petData: Omit<Pet, 'id'>) => void;
  addConsultation: (consultationData: Omit<Consultation, 'id' | 'createdAt'>) => void;
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => void;
  addPrescription: (prescriptionData: Omit<Prescription, 'id' | 'createdAt'>) => void;
  addFarm: (farmData: Omit<Farm, 'id' | 'createdAt'>) => void;

  addFarmIntervention: (interventionData: Omit<FarmIntervention, 'id' | 'createdAt'>) => void;
  addVaccination: (vaccinationData: Omit<Vaccination, 'id' | 'createdAt'>) => void;
  addVaccinationProtocol: (protocolData: Omit<VaccinationProtocol, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addAntiparasitic: (antiparasiticData: Omit<Antiparasitic, 'id' | 'createdAt'>) => void;
  addAntiparasiticProtocol: (protocolData: Omit<AntiparasiticProtocol, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: number, clientData: Partial<Client>) => void;
  updatePet: (id: number, petData: Partial<Pet>) => void;
  updateConsultation: (id: number, consultationData: Partial<Consultation>) => void;
  updateAppointment: (id: number, appointmentData: Partial<Appointment>) => void;
  updatePrescription: (id: number, prescriptionData: Partial<Prescription>) => void;
  updateFarm: (id: number, farmData: Partial<Farm>) => void;

  updateFarmIntervention: (id: number, interventionData: Partial<FarmIntervention>) => void;
  updateVaccination: (id: number, vaccinationData: Partial<Vaccination>) => void;
  updateVaccinationProtocol: (id: number, protocolData: Partial<VaccinationProtocol>) => void;
  updateAntiparasitic: (id: number, antiparasiticData: Partial<Antiparasitic>) => void;
  updateAntiparasiticProtocol: (id: number, protocolData: Partial<AntiparasiticProtocol>) => void;
  deletePet: (id: number) => void;
  deleteConsultation: (id: number) => void;
  deleteAppointment: (id: number) => void;
  deletePrescription: (id: number) => void;
  deleteFarm: (id: number) => void;

  deleteFarmIntervention: (id: number) => void;
  deleteVaccination: (id: number) => void;
  deleteVaccinationProtocol: (id: number) => void;
  deleteAntiparasitic: (id: number) => void;
  deleteAntiparasiticProtocol: (id: number) => void;
  resetData: () => void;
  exportData: () => void;
  importData: (data: { clients: Client[], pets: Pet[], consultations: Consultation[], appointments: Appointment[], prescriptions: Prescription[], farms: Farm[], farmInterventions: FarmIntervention[] }) => void;
  getClientById: (id: number) => Client | undefined;
  getPetById: (id: number) => Pet | undefined;
  getConsultationById: (id: number) => Consultation | undefined;
  getAppointmentById: (id: number) => Appointment | undefined;
  getPrescriptionById: (id: number) => Prescription | undefined;
  getFarmById: (id: number) => Farm | undefined;

  getFarmInterventionById: (id: number) => FarmIntervention | undefined;
  getVaccinationById: (id: number) => Vaccination | undefined;
  getVaccinationProtocolById: (id: number) => VaccinationProtocol | undefined;
  getVaccinationProtocolsBySpecies: (species: string) => VaccinationProtocol[];
  getActiveVaccinationProtocols: () => VaccinationProtocol[];
  getAntiparasiticById: (id: number) => Antiparasitic | undefined;
  getAntiparasiticsByPetId: (petId: number) => Antiparasitic[];
  getAntiparasiticsByClientId: (clientId: number) => Antiparasitic[];
  getOverdueAntiparasitics: () => Antiparasitic[];
  getUpcomingAntiparasitics: (days?: number) => Antiparasitic[];
  getAntiparasiticsByStatus: (status: string) => Antiparasitic[];
  getAntiparasiticProtocolById: (id: number) => AntiparasiticProtocol | undefined;
  getAntiparasiticProtocolsBySpecies: (species: string) => AntiparasiticProtocol[];
  getActiveAntiparasiticProtocols: () => AntiparasiticProtocol[];
  getPetsByOwnerId: (ownerId: number) => Pet[];
  getConsultationsByPetId: (petId: number) => Consultation[];
  getConsultationsByClientId: (clientId: number) => Consultation[];
  getAppointmentsByClientId: (clientId: number) => Appointment[];
  getAppointmentsByPetId: (petId: number) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getUpcomingAppointments: () => Appointment[];
  getOverdueAppointments: () => Appointment[];
  getPrescriptionsByPetId: (petId: number) => Prescription[];
  getPrescriptionsByConsultationId: (consultationId: number) => Prescription[];
  getActivePrescriptions: () => Prescription[];

  getFarmInterventionsByFarmId: (farmId: number) => FarmIntervention[];
  getUpcomingFarmInterventions: () => FarmIntervention[];
  getFarmsByStatus: (status: Farm['status']) => Farm[];
  getVaccinationsByPetId: (petId: number) => Vaccination[];
  getVaccinationsByClientId: (clientId: number) => Vaccination[];
  getOverdueVaccinations: () => Vaccination[];
  getUpcomingVaccinations: () => Vaccination[];
  getVaccinationsByStatus: (status: Vaccination['status']) => Vaccination[];
  updateClientStats: (clientId: number) => { totalVisits: number; lastVisit: string } | undefined;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const initialClients: Client[] = [
  {
    id: 1,
    name: "Marie Dubois",
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@email.com",
    phone: "06 12 34 56 78",
    address: "123 Rue de la Paix",
    city: "Paris",
    postalCode: "75001",
    pets: [
      {
        id: 1,
        name: "Bella",
        type: "Chien",
        breed: "Golden Retriever",
        gender: "female",
        birthDate: "2021-03-15",
        weight: "28 kg",
        color: "Doré",
        ownerId: 1,
        owner: "Marie Dubois",
        status: "healthy",
        lastVisit: "2024-01-15",
        nextAppointment: "2024-01-25",
        microchip: "982000123456789",
        vaccinations: ["Rage", "DHPP", "Lyme"]
      },
      {
        id: 4,
        name: "Luna",
        type: "Chat",
        breed: "Siamois",
        gender: "female",
        birthDate: "2022-05-12",
        weight: "3.8 kg",
        color: "Crème et marron",
        ownerId: 1,
        owner: "Marie Dubois",
        status: "healthy",
        lastVisit: "2024-01-08",
        nextAppointment: "2024-02-08",
        microchip: "982000111222333",
        vaccinations: ["Rage", "FVRCP", "FeLV"]
      }
    ],
    lastVisit: "2024-01-15",
    totalVisits: 12
  },
  {
    id: 2,
    name: "Jean Martin",
    firstName: "Jean",
    lastName: "Martin",
    email: "jean.martin@email.com",
    phone: "06 98 76 54 32",
    address: "45 Avenue des Roses",
    city: "Lyon",
    postalCode: "69000",
    pets: [
      {
        id: 2,
        name: "Whiskers",
        type: "Chat",
        breed: "Persan",
        gender: "male",
        birthDate: "2019-08-22",
        weight: "4.5 kg",
        color: "Blanc",
        ownerId: 2,
        owner: "Jean Martin",
        status: "treatment",
        lastVisit: "2024-01-10",
        nextAppointment: "2024-01-22",
        microchip: "982000987654321",
        vaccinations: ["Rage", "FVRCP"]
      }
    ],
    lastVisit: "2024-01-10",
    totalVisits: 8
  },
  {
    id: 3,
    name: "Sophie Leroux",
    firstName: "Sophie",
    lastName: "Leroux",
    email: "sophie.leroux@email.com",
    phone: "06 45 67 89 12",
    address: "78 Boulevard Maritime",
    city: "Marseille",
    postalCode: "13000",
    pets: [
      {
        id: 3,
        name: "Rex",
        type: "Chien",
        breed: "Berger Allemand",
        gender: "male",
        birthDate: "2017-11-10",
        weight: "32 kg",
        color: "Noir et feu",
        ownerId: 3,
        owner: "Sophie Leroux",
        status: "healthy",
        lastVisit: "2024-01-18",
        nextAppointment: "2024-02-01",
        microchip: "982000555444333",
        vaccinations: ["Rage", "DHPP", "Bordetella"]
      },
      {
        id: 5,
        name: "Max",
        type: "Chien",
        breed: "Labrador",
        gender: "male",
        birthDate: "2020-09-03",
        weight: "30 kg",
        color: "Noir",
        ownerId: 3,
        owner: "Sophie Leroux",
        status: "healthy",
        lastVisit: "2024-01-22",
        nextAppointment: "2024-02-22",
        microchip: "982000444555666",
        vaccinations: ["Rage", "DHPP", "Lyme", "Bordetella"]
      }
    ],
    lastVisit: "2024-01-18",
    totalVisits: 15
  }
];

const initialPets: Pet[] = [
  {
    id: 1,
    name: "Bella",
    type: "Chien",
    breed: "Golden Retriever",
    birthDate: "2021-03-15",
    weight: "28 kg",
    color: "Doré",
    ownerId: 1,
    owner: "Marie Dubois",
    status: "healthy",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-01-25",
    microchip: "982000123456789",
    vaccinations: ["Rage", "DHPP", "Lyme"]
  },
  {
    id: 2,
    name: "Whiskers",
    type: "Chat", 
    breed: "Persan",
    birthDate: "2019-08-22",
    weight: "4.5 kg",
    color: "Blanc",
    ownerId: 2,
    owner: "Jean Martin",
    status: "treatment",
    lastVisit: "2024-01-10",
    nextAppointment: "2024-01-22",
    microchip: "982000987654321",
    vaccinations: ["Rage", "FVRCP"]
  },
  {
    id: 3,
    name: "Rex",
    type: "Chien",
    breed: "Berger Allemand", 
    birthDate: "2017-11-10",
    weight: "32 kg",
    color: "Noir et feu",
    ownerId: 3,
    owner: "Sophie Leroux",
    status: "healthy",
    lastVisit: "2024-01-18",
    nextAppointment: "2024-02-01",
    microchip: "982000555444333",
    vaccinations: ["Rage", "DHPP", "Bordetella"]
  }
];

const initialConsultations: Consultation[] = [
  {
    id: 1,
    clientId: 1,
    clientName: "Marie Dubois",
    petId: 1,
    petName: "Bella",
    date: "2024-01-15",
    weight: "28.2 kg",
    temperature: "38.5",
    symptoms: "Contrôle annuel, bonne santé générale",
    diagnosis: "Aucun problème détecté",
    treatment: "Vaccination annuelle",
    medications: "Rappel vaccin DHPP",
    followUp: "Contrôle dans 1 an",
    cost: "85.00",
    notes: "Animal en excellente santé",
    photos: [],
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    clientId: 2,
    clientName: "Jean Martin",
    petId: 2,
    petName: "Whiskers",
    date: "2024-01-10",
    weight: "4.3 kg",
    temperature: "39.2",
    symptoms: "Perte d'appétit, léthargie",
    diagnosis: "Infection urinaire",
    treatment: "Antibiotiques",
    medications: "Amoxicilline 50mg 2x/jour pendant 7 jours",
    followUp: "Contrôle dans 1 semaine",
    cost: "120.00",
    notes: "Surveiller la consommation d'eau",
    photos: [],
    createdAt: "2024-01-10T14:15:00Z"
  }
];

const initialAppointments: Appointment[] = [
  {
    id: 1,
    clientId: 1,
    clientName: "Marie Dubois",
    petId: 1,
    petName: "Bella",
    date: "2024-01-25",
    time: "14:30",
    type: "vaccination",
    duration: 30,
    reason: "Vaccination annuelle",
    notes: "Rappel vaccinal complet",
    status: "scheduled",
    reminderSent: false,
    createdAt: "2024-01-20T09:00:00Z"
  },
  {
    id: 2,
    clientId: 2,
    clientName: "Jean Martin",
    petId: 2,
    petName: "Whiskers",
    date: "2024-01-22",
    time: "10:00",
    type: "controle",
    duration: 45,
    reason: "Contrôle post-traitement",
    notes: "Vérifier l'amélioration de l'appétit",
    status: "confirmed",
    reminderSent: true,
    createdAt: "2024-01-18T16:30:00Z"
  },
  {
    id: 3,
    clientId: 3,
    clientName: "Sophie Leroux",
    petId: 3,
    petName: "Rex",
    date: "2024-01-26",
    time: "16:00",
    type: "sterilisation",
    duration: 60,
    reason: "Stérilisation",
    notes: "Jeûne 12h avant l'intervention",
    status: "scheduled",
    reminderSent: false,
    createdAt: "2024-01-19T11:15:00Z"
  }
];

const initialPrescriptions: Prescription[] = [
  {
    id: 1,
    consultationId: 1,
    clientId: 1,
    clientName: "Marie Dubois",
    petId: 1,
    petName: "Bella",
    date: "2024-01-15",
    prescribedBy: "Dr. Martin",
    diagnosis: "Trachéobronchite",
    medications: [
      {
        id: 1,
        name: "Doxycycline",
        dosage: "100mg",
        frequency: "2x/jour",
        duration: "7 jours",
        instructions: "Donner avec de la nourriture",
        quantity: 14,
        unit: "comprimés",
        refills: 0,
        cost: 25.50
      },
      {
        id: 2,
        name: "Sirop antitussif",
        dosage: "5ml",
        frequency: "3x/jour",
        duration: "5 jours",
        instructions: "Donner 30 minutes avant les repas",
        quantity: 75,
        unit: "ml",
        refills: 1,
        cost: 15.00
      }
    ],
    instructions: "Surveiller la température et l'appétit. Retour en cas d'aggravation.",
    duration: "7 jours",
    followUpDate: "2024-01-22",
    status: "active",
    notes: "Patient calme, bon appétit maintenu",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    consultationId: 2,
    clientId: 2,
    clientName: "Jean Martin",
    petId: 2,
    petName: "Whiskers",
    date: "2024-01-10",
    prescribedBy: "Dr. Martin",
    diagnosis: "Infection urinaire",
    medications: [
      {
        id: 3,
        name: "Amoxicilline",
        dosage: "50mg",
        frequency: "2x/jour",
        duration: "7 jours",
        instructions: "Donner avec de la nourriture",
        quantity: 14,
        unit: "comprimés",
        refills: 0,
        cost: 18.00
      }
    ],
    instructions: "Augmenter la consommation d'eau. Surveiller les urines.",
    duration: "7 jours",
    followUpDate: "2024-01-17",
    status: "completed",
    notes: "Amélioration progressive",
    createdAt: "2024-01-10T14:15:00Z"
  }
];

const initialFarms: Farm[] = [
  {
    id: 1,
    name: "Ferme des Prairies",
    owner: "Pierre Durand",
    address: "123 Route de la Campagne, 45000 Orléans",
    coordinates: {
      latitude: 47.9056,
      longitude: 1.9190
    },
    phone: "02 38 45 67 89",
    email: "p.durand@fermedespra.fr",
    types: ["Bovin laitier"],
    totalAnimals: 85,
    animalDetails: [
      {
        category: "Bovins laitiers",
        maleCount: 3,
        femaleCount: 82,
        breeds: ["Holstein", "Prim'Holstein"],
        ageGroups: ["Veaux (0-6 mois)", "Génisses (6-24 mois)", "Vaches adultes"]
      }
    ],
    lastVisit: "2024-01-15",
    status: "active",
    veterinarian: "Dr. Dupont",
    notes: "Exploitation bien gérée, animaux en bonne santé",
    registrationNumber: "FR45123456789",
    surfaceArea: 45.5,
    buildingDetails: "Étable moderne 850m², stabulation libre, salle de traite 2x8",
    equipmentDetails: "Tracteur John Deere, Tank à lait 2000L, Système de ventilation automatique",
    certifications: ["Agriculture Biologique", "Haute Valeur Environnementale"],
    insuranceDetails: "Groupama - Police n°123456789",
    emergencyContact: {
      name: "Marie Durand",
      phone: "06 12 34 56 78",
      relation: "Épouse"
    },
    photos: [
      {
        id: "photo_1",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QaG90byBDaGVwdGVsPC90ZXh0Pgo8L3N2Zz4K",
        description: "Vaches Holstein dans le pré",
        category: "cheptel",
        uploadedAt: "2024-01-15T10:00:00Z"
      },
      {
        id: "photo_2",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QaG90byBCw6J0aW1lbnRzPC90ZXh0Pgo8L3N2Zz4K",
        description: "Étable moderne avec salle de traite",
        category: "batiments",
        uploadedAt: "2024-01-15T10:00:00Z"
      }
    ],
    createdAt: "2024-01-01T09:00:00Z"
  },
  {
    id: 2,
    name: "Élevage Martin",
    owner: "Jean-Luc Martin",
    address: "456 Chemin des Champs, 41000 Blois",
    coordinates: {
      latitude: 47.5886,
      longitude: 1.3340
    },
    phone: "02 54 78 90 12",
    email: "jl.martin@elevagemartin.fr",
    types: ["Porcin"],
    totalAnimals: 150,
    animalDetails: [
      {
        category: "Porcs",
        maleCount: 75,
        femaleCount: 75,
        breeds: ["Large White", "Landrace"],
        ageGroups: ["Porcelets (0-2 mois)", "Porcs en croissance (2-6 mois)"]
      }
    ],
    lastVisit: "2024-01-10",
    status: "active",
    veterinarian: "Dr. Martin",
    notes: "Nouveau système de ventilation installé",
    registrationNumber: "FR41987654321",
    surfaceArea: 28.3,
    buildingDetails: "Porcherie 600m², nurserie 200m², système de ventilation automatique",
    equipmentDetails: "Système d'alimentation automatique, Pompe à lisier, Générateur de secours",
    certifications: ["Label Rouge"],
    insuranceDetails: "Crédit Agricole Assurances - Police n°987654321",
    emergencyContact: {
      name: "Sophie Martin",
      phone: "06 98 76 54 32",
      relation: "Sœur"
    },
    createdAt: "2024-01-02T10:30:00Z"
  },
  {
    id: 3,
    name: "Ferme Avicole Leroux",
    owner: "Marie Leroux",
    address: "789 Avenue des Volailles, 37000 Tours",
    coordinates: {
      latitude: 47.3936,
      longitude: 0.6848
    },
    phone: "02 47 12 34 56",
    email: "m.leroux@avicole-leroux.fr",
    types: ["Avicole"],
    totalAnimals: 2500,
    animalDetails: [
      {
        category: "Poules pondeuses",
        maleCount: 50,
        femaleCount: 2000,
        breeds: ["ISA Brown", "Lohmann Brown"],
        ageGroups: ["Poussins (0-18 semaines)", "Pondeuses (18+ semaines)"]
      },
      {
        category: "Poulets de chair",
        maleCount: 225,
        femaleCount: 225,
        breeds: ["Cobb 500", "Ross 308"],
        ageGroups: ["0-6 semaines"]
      }
    ],
    lastVisit: "2024-01-18",
    status: "attention",
    veterinarian: "Dr. Dupont",
    notes: "Problème de ventilation détecté, surveillance renforcée",
    registrationNumber: "FR37555666777",
    surfaceArea: 12.8,
    buildingDetails: "Poulailler automatisé 1200m², aire de parcours 5000m²",
    equipmentDetails: "Système de ramassage automatique des œufs, Ventilation programmable, Éclairage LED",
    certifications: ["Œufs de France", "Bien-être animal"],
    insuranceDetails: "MMA - Police n°555666777",
    emergencyContact: {
      name: "Paul Leroux",
      phone: "06 47 12 34 56",
      relation: "Fils"
    },
    createdAt: "2024-01-03T14:15:00Z"
  },
  {
    id: 4,
    name: "Ferme Équine du Val",
    owner: "Sophie Moreau",
    address: "12 Chemin des Écuries, 78000 Versailles",
    coordinates: {
      latitude: 48.8044,
      longitude: 2.1232
    },
    phone: "01 39 50 12 34",
    email: "s.moreau@fermeequine.fr",
    types: ["Équin"],
    totalAnimals: 25,
    animalDetails: [
      {
        category: "Chevaux",
        maleCount: 8,
        femaleCount: 17,
        breeds: ["Pur-sang", "Selle français", "Arabe"],
        ageGroups: ["Poulains (0-3 ans)", "Jeunes chevaux (3-7 ans)", "Chevaux adultes (7+ ans)"]
      }
    ],
    lastVisit: "2024-01-20",
    status: "active",
    veterinarian: "Dr. Martin",
    notes: "Écurie de prestige, chevaux de compétition",
    registrationNumber: "FR78123456789",
    surfaceArea: 15.2,
    buildingDetails: "Écuries 800m², manège couvert 1200m², carrière extérieure 2000m²",
    equipmentDetails: "Tracteur, Système d'arrosage automatique, Éclairage LED, Système de sécurité",
    certifications: ["Bien-être animal", "Équitation de tradition française"],
    insuranceDetails: "Allianz - Police n°781234567",
    emergencyContact: {
      name: "Marc Moreau",
      phone: "06 12 34 56 78",
      relation: "Époux"
    },
    createdAt: "2024-01-04T08:30:00Z"
  },
  {
    id: 5,
    name: "Rucher des Fleurs",
    owner: "Jean Dupuis",
    address: "45 Route des Champs, 13000 Marseille",
    coordinates: {
      latitude: 43.2965,
      longitude: 5.3698
    },
    phone: "04 91 23 45 67",
    email: "j.dupuis@rucherdesfleurs.fr",
    types: ["Apiculture"],
    totalAnimals: 120,
    animalDetails: [
      {
        category: "Abeilles",
        maleCount: 0,
        femaleCount: 120,
        breeds: ["Abeille noire", "Buckfast"],
        ageGroups: ["Reines (1-3 ans)", "Ouvrières (6 semaines)", "Faux-bourdons (3 mois)"]
      }
    ],
    lastVisit: "2024-01-12",
    status: "active",
    veterinarian: "Dr. Dupont",
    notes: "Production de miel de qualité, apiculture biologique",
    registrationNumber: "FR13123456789",
    surfaceArea: 8.5,
    buildingDetails: "Miellerie 200m², entrepôt 150m², zone de conditionnement 100m²",
    equipmentDetails: "Extracteur de miel, Centrifugeuse, Filtres, Matériel de conditionnement",
    certifications: ["Agriculture Biologique", "Miel de France"],
    insuranceDetails: "MAIF - Police n°131234567",
    emergencyContact: {
      name: "Marie Dupuis",
      phone: "06 91 23 45 67",
      relation: "Épouse"
    },
    createdAt: "2024-01-05T11:15:00Z"
  }
];



const initialFarmInterventions: FarmIntervention[] = [
  {
    id: 1,
    date: "2024-01-20",
    farmId: 1,
    farmName: "Ferme des Prairies",
    type: "vaccination",
    animals: "15 bovins",
    veterinarian: "Dr. Dupont",
    description: "Vaccination contre la fièvre aphteuse",
    status: "completed",
    followUp: "Contrôle dans 6 mois",
    cost: 450.00,
    notes: "Intervention réussie, aucun effet secondaire",
    createdAt: "2024-01-20T08:00:00Z"
  },
  {
    id: 2,
    date: "2024-01-18",
    farmId: 3,
    farmName: "Ferme Avicole Leroux",
    type: "urgence",
    animals: "50 poules",
    veterinarian: "Dr. Dupont",
    description: "Traitement infection respiratoire",
    status: "ongoing",
    followUp: "Suivi hebdomadaire",
    cost: 320.00,
    notes: "Traitement antibiotique en cours",
    createdAt: "2024-01-18T14:30:00Z"
  },
  {
    id: 3,
    date: "2024-01-15",
    farmId: 2,
    farmName: "Élevage Martin",
    type: "controle",
    animals: "Tous les porcins",
    veterinarian: "Dr. Martin",
    description: "Contrôle sanitaire trimestriel",
    status: "completed",
    followUp: "Prochain contrôle en avril",
    cost: 280.00,
    notes: "Tous les paramètres dans les normes",
    createdAt: "2024-01-15T10:00:00Z"
  }
];

const initialVaccinations: Vaccination[] = [
  {
    id: 1,
    petId: 1,
    petName: "Bella",
    clientId: 1,
    clientName: "Marie Dubois",
    vaccineName: "DHPP",
    vaccineType: "core",
    dateGiven: "2024-01-15",
    nextDueDate: "2025-01-15",
    batchNumber: "VAC2024-001",
    veterinarian: "Dr. Martin",
    notes: "Première vaccination annuelle",
    status: "completed",
    cost: "45.00",
    location: "left_shoulder",
    manufacturer: "Zoetis",
    expirationDate: "2025-12-31",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    petId: 1,
    petName: "Bella",
    clientId: 1,
    clientName: "Marie Dubois",
    vaccineName: "Rage",
    vaccineType: "rabies",
    dateGiven: "2024-01-15",
    nextDueDate: "2027-01-15",
    batchNumber: "RAB2024-005",
    veterinarian: "Dr. Martin",
    notes: "Vaccination antirabique obligatoire",
    status: "completed",
    cost: "35.00",
    location: "right_shoulder",
    manufacturer: "Merial",
    expirationDate: "2026-08-15",
    createdAt: "2024-01-15T10:45:00Z"
  },
  {
    id: 3,
    petId: 2,
    petName: "Whiskers",
    clientId: 2,
    clientName: "Jean Martin",
    vaccineName: "FVRCP",
    vaccineType: "core",
    dateGiven: "2023-08-22",
    nextDueDate: "2024-08-22",
    batchNumber: "CAT2023-012",
    veterinarian: "Dr. Dupont",
    notes: "Vaccination de base pour chat",
    status: "overdue",
    cost: "40.00",
    location: "subcutaneous",
    manufacturer: "Virbac",
    expirationDate: "2025-06-30",
    createdAt: "2023-08-22T14:20:00Z"
  },
  {
    id: 4,
    petId: 3,
    petName: "Rex",
    clientId: 3,
    clientName: "Sophie Leroux",
    vaccineName: "Bordetella",
    vaccineType: "non-core",
    dateGiven: "2024-01-18",
    nextDueDate: "2025-01-18",
    batchNumber: "BOR2024-008",
    veterinarian: "Dr. Martin",
    notes: "Vaccination contre la toux de chenil",
    status: "completed",
    cost: "30.00",
    location: "left_shoulder",
    manufacturer: "Zoetis",
    expirationDate: "2025-09-30",
    createdAt: "2024-01-18T16:15:00Z"
  },
  {
    id: 5,
    petId: 1,
    petName: "Bella",
    clientId: 1,
    clientName: "Marie Dubois",
    vaccineName: "Lyme",
    vaccineType: "non-core",
    dateGiven: "2024-01-25",
    nextDueDate: "2024-04-25",
    batchNumber: "LYM2024-003",
    veterinarian: "Dr. Martin",
    notes: "Vaccination contre la maladie de Lyme",
    status: "scheduled",
    cost: "50.00",
    location: "left_hip",
    manufacturer: "Boehringer Ingelheim",
    expirationDate: "2025-11-20",
    createdAt: "2024-01-25T09:00:00Z"
  }
];

// Données initiales des antiparasites (vides pour commencer)
const initialAntiparasitics: Antiparasitic[] = [];

// Protocoles antiparasitaires réalistes basés sur la pratique vétérinaire
const initialAntiparasiticProtocols: AntiparasiticProtocol[] = [
  // CHIENS - Parasites externes
  {
    id: 1,
    name: 'Frontline Combo Spot-On',
    species: 'Chien',
    productType: 'flea_tick',
    targetParasites: 'Puces, Tiques, Poux broyeurs',
    description: 'Protection complète contre puces et tiques pendant 8 semaines',
    manufacturer: 'Boehringer Ingelheim',
    intervals: [{ offsetDays: 0, label: 'Application initiale' }, { offsetDays: 28, label: 'Rappel mensuel' }],
    weightRange: '2-60kg',
    ageRequirement: 'Dès 8 semaines',
    seasonalTreatment: true,
    notes: 'Éviter le bain 48h avant et après application',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'NexGard Spectra',
    species: 'Chien',
    productType: 'combined',
    targetParasites: 'Puces, Tiques, Vers du cœur, Vers ronds, Vers plats',
    description: 'Protection combinée externe et interne mensuelle',
    manufacturer: 'Boehringer Ingelheim',
    intervals: [{ offsetDays: 0, label: 'Première dose' }, { offsetDays: 30, label: 'Dose mensuelle' }],
    weightRange: '2-60kg',
    ageRequirement: 'Dès 8 semaines',
    seasonalTreatment: false,
    notes: 'Donner avec la nourriture pour une meilleure absorption',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // CHIENS - Parasites internes
  {
    id: 3,
    name: 'Drontal Plus',
    species: 'Chien',
    productType: 'worming',
    targetParasites: 'Vers ronds, Vers plats, Ankylostomes, Trichures',
    description: 'Vermifugation large spectre',
    manufacturer: 'Bayer',
    intervals: [
      { offsetDays: 0, label: 'Première vermifugation' },
      { offsetDays: 90, label: 'Rappel trimestriel' },
      { offsetDays: 180, label: 'Rappel semestriel' }
    ],
    weightRange: '2-35kg',
    ageRequirement: 'Dès 2 semaines',
    seasonalTreatment: false,
    notes: 'Administrer le matin à jeun, répéter selon exposition aux parasites',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Advocate Spot-On',
    species: 'Chien',
    productType: 'combined',
    targetParasites: 'Puces, Vers du cœur, Vers ronds, Ankylostomes, Gale sarcoptique',
    description: 'Protection topique combinée mensuelle',
    manufacturer: 'Bayer',
    intervals: [{ offsetDays: 0, label: 'Application initiale' }, { offsetDays: 30, label: 'Application mensuelle' }],
    weightRange: '1-40kg',
    ageRequirement: 'Dès 7 semaines',
    seasonalTreatment: false,
    notes: 'Appliquer sur peau sèche entre les omoplates',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // CHATS - Parasites externes
  {
    id: 5,
    name: 'Frontline Combo Chat',
    species: 'Chat',
    productType: 'flea_tick',
    targetParasites: 'Puces, Tiques',
    description: 'Protection mensuelle contre puces et tiques chez le chat',
    manufacturer: 'Boehringer Ingelheim',
    intervals: [{ offsetDays: 0, label: 'Application initiale' }, { offsetDays: 28, label: 'Rappel mensuel' }],
    weightRange: '1-8kg',
    ageRequirement: 'Dès 8 semaines',
    seasonalTreatment: true,
    notes: 'Attention aux réactions cutanées, surveiller 24h après application',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Stronghold Plus',
    species: 'Chat',
    productType: 'combined',
    targetParasites: 'Puces, Vers du cœur, Vers ronds, Ankylostomes, Gale des oreilles',
    description: 'Protection combinée mensuelle pour chats',
    manufacturer: 'Zoetis',
    intervals: [{ offsetDays: 0, label: 'Application initiale' }, { offsetDays: 30, label: 'Application mensuelle' }],
    weightRange: '0.5-8kg',
    ageRequirement: 'Dès 6 semaines',
    seasonalTreatment: false,
    notes: 'Efficace contre gale des oreilles en 1 application',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // CHATS - Parasites internes
  {
    id: 7,
    name: 'Milbemax Chat',
    species: 'Chat',
    productType: 'worming',
    targetParasites: 'Vers ronds, Vers plats, Vers du cœur',
    description: 'Vermifugation complète pour chats',
    manufacturer: 'Novartis',
    intervals: [
      { offsetDays: 0, label: 'Première vermifugation' },
      { offsetDays: 90, label: 'Rappel trimestriel' }
    ],
    weightRange: '0.5-8kg',
    ageRequirement: 'Dès 6 semaines',
    seasonalTreatment: false,
    notes: 'Comprimés appétents, peut être donné avec ou sans nourriture',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // BOVINS
  {
    id: 8,
    name: 'Eprinex Pour-On',
    species: 'Bovins',
    productType: 'external',
    targetParasites: 'Mouches, Poux, Gales, Vers gastro-intestinaux',
    description: 'Traitement pour-on systémique pour bovins',
    manufacturer: 'Boehringer Ingelheim',
    intervals: [{ offsetDays: 0, label: 'Application unique' }, { offsetDays: 84, label: 'Rappel saisonnier' }],
    weightRange: '50-800kg',
    ageRequirement: 'Tous âges',
    seasonalTreatment: true,
    notes: 'Temps d\'attente viande: 15 jours, lait: 0 jour',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 9,
    name: 'Panacur 100',
    species: 'Bovins',
    productType: 'worming',
    targetParasites: 'Vers gastro-intestinaux, Vers pulmonaires',
    description: 'Vermifuge oral pour bovins',
    manufacturer: 'MSD',
    intervals: [
      { offsetDays: 0, label: 'Traitement initial' },
      { offsetDays: 120, label: 'Rappel saisonnier' }
    ],
    weightRange: '50-800kg',
    ageRequirement: 'Dès 2 semaines',
    seasonalTreatment: false,
    notes: 'Temps d\'attente viande: 14 jours, lait: 3 jours',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // OVINS/CAPRINS
  {
    id: 10,
    name: 'Cydectin 0.1%',
    species: 'Ovins',
    productType: 'combined',
    targetParasites: 'Vers gastro-intestinaux, Vers pulmonaires, Gales',
    description: 'Traitement injectable pour ovins et caprins',
    manufacturer: 'Boehringer Ingelheim',
    intervals: [{ offsetDays: 0, label: 'Injection unique' }, { offsetDays: 90, label: 'Rappel saisonnier' }],
    weightRange: '10-100kg',
    ageRequirement: 'Dès 4 semaines',
    seasonalTreatment: true,
    notes: 'Temps d\'attente viande: 35 jours',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialVaccinationProtocols: VaccinationProtocol[] = [
  // Protocoles pour Chiens
  {
    id: 1,
    name: 'DAPP (DHPP)',
    species: 'Chien',
    vaccineType: 'core',
    description: 'Distemper, Adénovirus, Parvovirus, Parainfluenza - Vaccination essentielle',
    manufacturer: 'Zoetis',
    intervals: [
      { offsetDays: 0, label: 'J0 (première injection)' },
      { offsetDays: 21, label: '21 jours (2e injection)' },
      { offsetDays: 42, label: '42 jours (3e injection)' },
      { offsetDays: 365, label: '1 an (rappel)' }
    ],
    ageRequirement: '6-8 semaines (renforcer jusqu\'à 16 semaines)',
    notes: 'Protocole d\'initiation à 6-8-12-16 semaines puis rappel à 1 an, puis triennal',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Rage (Rabies)',
    species: 'Chien',
    vaccineType: 'rabies',
    description: 'Vaccination antirabique obligatoire selon la législation locale',
    manufacturer: 'Merial',
    intervals: [
      { offsetDays: 0, label: 'À l\'âge de 12 semaines minimum' },
      { offsetDays: 365, label: '1 an (rappel)' }
    ],
    ageRequirement: '12 semaines minimum',
    notes: 'Rappel annuel ou biennal selon réglementation',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Bordetella bronchiseptica',
    species: 'Chien',
    vaccineType: 'non-core',
    description: 'Protection contre la toux de chenil',
    manufacturer: 'Zoetis',
    intervals: [
      { offsetDays: 8, label: '8 semaines' }
    ],
    ageRequirement: '8 semaines',
    notes: 'Vaccination intracellulaire recommandée pour chiens en collectivité',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Leptospirose',
    species: 'Chien',
    vaccineType: 'non-core',
    description: 'Protection contre les sérovars pathogènes de Leptospira',
    manufacturer: 'Virbac',
    intervals: [
      { offsetDays: 12, label: '12 semaines' }
    ],
    ageRequirement: '12 semaines',
    notes: 'Double sérovariels recommandé',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z'
  },

  // Protocoles pour Chats
  {
    id: 5,
    name: 'RCP (FVRCP)',
    species: 'Chat',
    vaccineType: 'core',
    description: 'Calicivirose, Panleucopénie, Rhinotrachéite virale féline',
    manufacturer: 'Virbac',
    intervals: [
      { offsetDays: 0, label: '6 semaines' },
      { offsetDays: 21, label: '12 semaines' },
      { offsetDays: 28, label: '1 an' }
    ],
    ageRequirement: '6-8-12 semaines',
    notes: 'Renforcement à 1 an puis rappel triennal ou annuel selon protocole',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z'
  },
  {
    id: 6,
    name: 'Rage (Rabies)',
    species: 'Chat',
    vaccineType: 'rabies',
    description: 'Vaccination antirabique selon réglementation voyage',
    manufacturer: 'Merial',
    intervals: [
      { offsetDays: 365, label: '1 an' },
      { offsetDays: 730, label: '2 ans' }
    ],
    ageRequirement: '12 semaines',
    notes: 'Rappel annuel ou biennal selon réglementation',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z'
  },

  // Protocoles pour Furets
  {
    id: 7,
    name: 'Distemper furet (Maladie de Carré)',
    species: 'Furet',
    vaccineType: 'core',
    description: 'Protection contre le morbillivirus (Carré)',
    manufacturer: 'Merial',
    intervals: [
      { offsetDays: 6, label: '6 semaines' },
      { offsetDays: 12, label: '8 semaines' }
    ],
    ageRequirement: '6-8 semaines',
    notes: 'Protocole similaire à celui des chiens',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z'
  },

  // Protocoles pour Lapins
  {
    id: 8,
    name: 'Myxomatose',
    species: 'Lapin',
    vaccineType: 'core',
    description: 'Protection contre la myxomatose',
    manufacturer: 'Virbac',
    intervals: [
      { offsetDays: 180, label: '180 jours' }
    ],
    ageRequirement: '5-6 semaines',
    notes: 'Vaccination semestrielle',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z'
  },
  {
    id: 9,
    name: 'VHD (Maladie hémorragique virale)',
    species: 'Lapin',
    vaccineType: 'core',
    description: 'Protection contre VHD de type 1 et 2',
    manufacturer: 'Virbac',
    intervals: [
      { offsetDays: 6, label: '6 semaines' }
    ],
    ageRequirement: '6 semaines',
    notes: 'Rappel annuel',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z'
  }
];

export function ClientProvider({ children }: { children: ReactNode }) {
  // Fonction pour charger les données depuis localStorage
  const loadDataFromStorage = () => {
    try {
      const savedClients = localStorage.getItem('vetpro-clients');
      const savedPets = localStorage.getItem('vetpro-pets');
      const savedConsultations = localStorage.getItem('vetpro-consultations');
      const savedAppointments = localStorage.getItem('vetpro-appointments');
      const savedPrescriptions = localStorage.getItem('vetpro-prescriptions');
      const savedFarms = localStorage.getItem('vetpro-farms');
      // savedLivestock removed
      const savedFarmInterventions = localStorage.getItem('vetpro-farmInterventions');
      const savedVaccinations = localStorage.getItem('vetpro-vaccinations');
      const savedVaccinationProtocols = localStorage.getItem('vetpro-vaccinationProtocols');
      
      if (savedClients && savedPets) {
        const parsedClients = JSON.parse(savedClients);
        const parsedPets = JSON.parse(savedPets);
        const parsedConsultations = savedConsultations ? JSON.parse(savedConsultations) : initialConsultations;
        const parsedAppointments = savedAppointments ? JSON.parse(savedAppointments) : initialAppointments;
        const parsedPrescriptions = savedPrescriptions ? JSON.parse(savedPrescriptions) : initialPrescriptions;
        const parsedFarms = savedFarms ? JSON.parse(savedFarms) : initialFarms;
        // parsedLivestock removed
        const parsedFarmInterventions = savedFarmInterventions ? JSON.parse(savedFarmInterventions) : initialFarmInterventions;
        const parsedVaccinations = savedVaccinations ? JSON.parse(savedVaccinations) : initialVaccinations;
        const parsedVaccinationProtocols = savedVaccinationProtocols ? JSON.parse(savedVaccinationProtocols) : initialVaccinationProtocols;
        
        // Synchroniser les clients avec leurs animaux
        const synchronizedClients = parsedClients.map((client: Client) => ({
          ...client,
          pets: parsedPets.filter((pet: Pet) => pet.ownerId === client.id)
        }));
        
        return { 
          clients: synchronizedClients, 
          pets: parsedPets, 
          consultations: parsedConsultations,
          appointments: parsedAppointments,
          prescriptions: parsedPrescriptions,
          farms: parsedFarms,

          farmInterventions: parsedFarmInterventions,
          vaccinations: parsedVaccinations,
          vaccinationProtocols: parsedVaccinationProtocols
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
    
    // Retourner les données initiales si pas de données sauvegardées
    const synchronizedClients = initialClients.map(client => ({
      ...client,
      pets: initialPets.filter(pet => pet.ownerId === client.id)
    }));
    
    return { 
      clients: synchronizedClients,
      pets: initialPets,
      consultations: initialConsultations,
      appointments: initialAppointments,
      prescriptions: initialPrescriptions,
      farms: initialFarms,

      farmInterventions: initialFarmInterventions,
      vaccinations: initialVaccinations,
      vaccinationProtocols: initialVaccinationProtocols
    };
  };

  // Fonction pour sauvegarder les données dans localStorage
  const saveDataToStorage = (
    clientsData: Client[], 
    petsData: Pet[], 
    consultationsData: Consultation[], 
    appointmentsData: Appointment[] = appointments, 
    prescriptionsData: Prescription[] = prescriptions,
    farmsData: Farm[] = farms,

    farmInterventionsData: FarmIntervention[] = farmInterventions,
    vaccinationsData: Vaccination[] = vaccinations,
    vaccinationProtocolsData: VaccinationProtocol[] = vaccinationProtocols
  ) => {
    try {
      localStorage.setItem('vetpro-clients', JSON.stringify(clientsData));
      localStorage.setItem('vetpro-pets', JSON.stringify(petsData));
      localStorage.setItem('vetpro-consultations', JSON.stringify(consultationsData));
      localStorage.setItem('vetpro-appointments', JSON.stringify(appointmentsData));
      localStorage.setItem('vetpro-prescriptions', JSON.stringify(prescriptionsData));
      localStorage.setItem('vetpro-farms', JSON.stringify(farmsData));

      localStorage.setItem('vetpro-farmInterventions', JSON.stringify(farmInterventionsData));
      localStorage.setItem('vetpro-vaccinations', JSON.stringify(vaccinationsData));
      localStorage.setItem('vetpro-vaccinationProtocols', JSON.stringify(vaccinationProtocolsData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  };

  const initialData = loadDataFromStorage();
  const [clients, setClients] = useState<Client[]>(initialData.clients);
  const [pets, setPets] = useState<Pet[]>(initialData.pets);
  const [consultations, setConsultations] = useState<Consultation[]>(initialData.consultations);
  const [appointments, setAppointments] = useState<Appointment[]>(initialData.appointments);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialData.prescriptions);
  const [farms, setFarms] = useState<Farm[]>(initialData.farms);

  const [farmInterventions, setFarmInterventions] = useState<FarmIntervention[]>(initialData.farmInterventions);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(initialData.vaccinations);
  const [vaccinationProtocols, setVaccinationProtocols] = useState<VaccinationProtocol[]>(initialData.vaccinationProtocols);
  const [antiparasitics, setAntiparasitics] = useState<Antiparasitic[]>(initialAntiparasitics);
  const [antiparasiticProtocols, setAntiparasiticProtocols] = useState<AntiparasiticProtocol[]>(initialAntiparasiticProtocols);

  // Charger les données antiparasitaires depuis localStorage
  useEffect(() => {
    const savedAntiparasitics = localStorage.getItem('vetpro-antiparasitics');
    const savedAntiparasiticProtocols = localStorage.getItem('vetpro-antiparasiticProtocols');
    
    if (savedAntiparasitics) {
      setAntiparasitics(JSON.parse(savedAntiparasitics));
    }
    
    if (savedAntiparasiticProtocols) {
      setAntiparasiticProtocols(JSON.parse(savedAntiparasiticProtocols));
    } else {
      // Sauvegarder les protocoles par défaut s'ils n'existent pas
      localStorage.setItem('vetpro-antiparasiticProtocols', JSON.stringify(initialAntiparasiticProtocols));
    }
  }, []);

  // Initialiser les statistiques de tous les clients existants
  useEffect(() => {
    if (clients.length > 0 && consultations.length >= 0 && vaccinations.length >= 0 && antiparasitics.length >= 0 && appointments.length >= 0) {
      clients.forEach(client => {
        updateClientStats(client.id);
      });
    }
  }, [clients.length, consultations.length, vaccinations.length, antiparasitics.length, appointments.length]);

  const addClient = (clientData: Omit<Client, 'id' | 'pets' | 'lastVisit' | 'totalVisits'>) => {
    const newClient: Client = {
      ...clientData,
      name: `${clientData.firstName} ${clientData.lastName}`,
      id: Math.max(...clients.map(c => c.id), 0) + 1,
      pets: [],
      lastVisit: new Date().toISOString().split('T')[0],
      totalVisits: 0
    };
    
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    saveDataToStorage(updatedClients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations);
  };

  const addPet = (petData: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...petData,
      id: Math.max(...pets.map(p => p.id), 0) + 1,
      status: petData.status || 'healthy',
      lastVisit: new Date().toISOString().split('T')[0]
    };
    
    // Add to pets array
    const updatedPets = [...pets, newPet];
    setPets(updatedPets);
    
    // Update client's pets array with the complete pet object
    const updatedClients = clients.map(client => 
      client.id === petData.ownerId 
        ? { 
            ...client, 
            pets: [...client.pets, {
              id: newPet.id,
              name: newPet.name,
              type: newPet.type,
              breed: newPet.breed,
              birthDate: newPet.birthDate,
              weight: newPet.weight,
              color: newPet.color,
              microchip: newPet.microchip,
              medicalNotes: newPet.medicalNotes,
              photo: newPet.photo,
              ownerId: newPet.ownerId,
              owner: newPet.owner,
              status: newPet.status,
              lastVisit: newPet.lastVisit,
              nextAppointment: newPet.nextAppointment,
              vaccinations: newPet.vaccinations
            }]
          }
        : client
    );
    
    setClients(updatedClients);
    saveDataToStorage(updatedClients, updatedPets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations);
  };

  const updateClient = (id: number, clientData: Partial<Client>) => {
    const updatedClients = clients.map(client => 
      client.id === id 
        ? { ...client, ...clientData, name: clientData.firstName && clientData.lastName ? `${clientData.firstName} ${clientData.lastName}` : client.name }
        : client
    );
    setClients(updatedClients);
    saveDataToStorage(updatedClients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations);
  };

  const updatePet = (id: number, petData: Partial<Pet>) => {
    const updatedPet = { ...pets.find(p => p.id === id), ...petData };
    
    // Update pets array
    const updatedPets = pets.map(pet => 
      pet.id === id ? { ...pet, ...petData } : pet
    );
    setPets(updatedPets);
    
    // Update pet in client's pets array
    const updatedClients = clients.map(client => ({
      ...client,
      pets: client.pets.map(pet => 
        pet.id === id ? { ...pet, ...petData } : pet
      )
    }));
    setClients(updatedClients);
    
    saveDataToStorage(updatedClients, updatedPets, consultations);
  };

  // Fonction utilitaire pour mettre à jour les statistiques du client
  const updateClientStats = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    // Récupérer toutes les activités médicales du client
    const clientConsultations = consultations.filter(c => c.clientId === clientId);
    const clientVaccinations = vaccinations.filter(v => v.clientId === clientId);
    const clientAntiparasitics = antiparasitics.filter(a => a.clientId === clientId);
    const clientAppointments = appointments.filter(a => a.clientId === clientId && a.status === 'completed');

    // Calculer le total des visites (consultations + vaccinations + antiparasites + rendez-vous complétés)
    const totalVisits = clientConsultations.length + clientVaccinations.length + clientAntiparasitics.length + clientAppointments.length;

    // Trouver la date de la dernière activité
    const allActivities = [
      ...clientConsultations.map(c => ({ date: c.date, type: 'consultation' })),
      ...clientVaccinations.map(v => ({ date: v.dateGiven, type: 'vaccination' })),
      ...clientAntiparasitics.map(a => ({ date: a.dateGiven, type: 'antiparasitic' })),
      ...clientAppointments.map(a => ({ date: a.date, type: 'appointment' }))
    ];

    const lastVisit = allActivities.length > 0 
      ? allActivities.reduce((latest, current) => 
          new Date(current.date) > new Date(latest.date) ? current : latest
        ).date
      : client.lastVisit;

    // Mettre à jour le client
    const updatedClients = clients.map(c => 
      c.id === clientId 
        ? { ...c, totalVisits, lastVisit }
        : c
    );
    setClients(updatedClients);
    
    return { totalVisits, lastVisit };
  };

  const addConsultation = (consultationData: Omit<Consultation, 'id' | 'createdAt'>) => {
    const newConsultation: Consultation = {
      ...consultationData,
      id: Math.max(...consultations.map(c => c.id), 0) + 1,
      createdAt: new Date().toISOString(),
      photos: consultationData.photos || []
    };
    
    const updatedConsultations = [...consultations, newConsultation];
    setConsultations(updatedConsultations);
    
    // Mettre à jour la dernière visite de l'animal
    const updatedPets = pets.map(pet => 
      pet.id === consultationData.petId 
        ? { ...pet, lastVisit: consultationData.date }
        : pet
    );
    setPets(updatedPets);
    
    // Mettre à jour les clients avec les nouveaux animaux
    const updatedClients = clients.map(client => ({
      ...client,
      pets: client.pets.map(pet => 
        pet.id === consultationData.petId 
          ? { ...pet, lastVisit: consultationData.date }
          : pet
      )
    }));
    setClients(updatedClients);
    
    // Mettre à jour les statistiques du client
    updateClientStats(consultationData.clientId);
    
    saveDataToStorage(updatedClients, updatedPets, updatedConsultations);
  };

  const deletePet = (id: number) => {
    const petToDelete = pets.find(p => p.id === id);
    if (!petToDelete) return;
    
    // Remove from pets array
    const updatedPets = pets.filter(pet => pet.id !== id);
    setPets(updatedPets);
    
    // Remove from client's pets array
    const updatedClients = clients.map(client => ({
      ...client,
      pets: client.pets.filter(pet => pet.id !== id)
    }));
    setClients(updatedClients);
    
    saveDataToStorage(updatedClients, updatedPets, consultations);
  };

  const resetData = () => {
    const synchronizedClients = initialClients.map(client => ({
      ...client,
      pets: initialPets.filter(pet => pet.ownerId === client.id)
    }));
    
    setClients(synchronizedClients);
    setPets(initialPets);
    setConsultations(initialConsultations);
    setAppointments(initialAppointments);
    setPrescriptions(initialPrescriptions);
    setFarms(initialFarms);
    // setLivestock removed
    setFarmInterventions(initialFarmInterventions);
    saveDataToStorage(synchronizedClients, initialPets, initialConsultations, initialAppointments, initialPrescriptions, initialFarms, initialFarmInterventions);
  };

  const exportData = () => {
    const data = { clients, pets, consultations, appointments, prescriptions, farms, farmInterventions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vetpro-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (data: { clients: Client[], pets: Pet[], consultations: Consultation[], appointments?: Appointment[], prescriptions?: Prescription[], farms?: Farm[], farmInterventions?: FarmIntervention[] }) => {
    const synchronizedClients = data.clients.map(client => ({
      ...client,
      pets: data.pets.filter(pet => pet.ownerId === client.id)
    }));
    
    setClients(synchronizedClients);
    setPets(data.pets);
    setConsultations(data.consultations || []);
    setAppointments(data.appointments || []);
    setPrescriptions(data.prescriptions || []);
    setFarms(data.farms || []);
    // setLivestock removed
    setFarmInterventions(data.farmInterventions || []);
    saveDataToStorage(synchronizedClients, data.pets, data.consultations || [], data.appointments || [], data.prescriptions || [], data.farms || [], data.farmInterventions || []);
  };

  const updateConsultation = (id: number, consultationData: Partial<Consultation>) => {
    const updatedConsultations = consultations.map(consultation => 
      consultation.id === id ? { ...consultation, ...consultationData } : consultation
    );
    setConsultations(updatedConsultations);
    saveDataToStorage(clients, pets, updatedConsultations);
  };

  const deleteConsultation = (id: number) => {
    const updatedConsultations = consultations.filter(consultation => consultation.id !== id);
    setConsultations(updatedConsultations);
    saveDataToStorage(clients, pets, updatedConsultations);
  };

  // CRUD Antiparasites
  const addAntiparasitic = (antiparasiticData: Omit<Antiparasitic, 'id' | 'createdAt'>) => {
    const newAntiparasitic: Antiparasitic = {
      ...antiparasiticData,
      id: Math.max(0, ...antiparasitics.map(a => a.id)) + 1,
      createdAt: new Date().toISOString()
    };
    const updatedAntiparasitics = [...antiparasitics, newAntiparasitic];
    setAntiparasitics(updatedAntiparasitics);
    
    // Mettre à jour les statistiques du client
    updateClientStats(antiparasiticData.clientId);
    
    localStorage.setItem('vetpro-antiparasitics', JSON.stringify(updatedAntiparasitics));
  };

  const updateAntiparasitic = (id: number, antiparasiticData: Partial<Antiparasitic>) => {
    const updatedAntiparasitics = antiparasitics.map(antiparasitic => 
      antiparasitic.id === id ? { ...antiparasitic, ...antiparasiticData } : antiparasitic
    );
    setAntiparasitics(updatedAntiparasitics);
    localStorage.setItem('vetpro-antiparasitics', JSON.stringify(updatedAntiparasitics));
  };

  const deleteAntiparasitic = (id: number) => {
    const updatedAntiparasitics = antiparasitics.filter(antiparasitic => antiparasitic.id !== id);
    setAntiparasitics(updatedAntiparasitics);
    localStorage.setItem('vetpro-antiparasitics', JSON.stringify(updatedAntiparasitics));
  };

  // CRUD Protocoles Antiparasitaires
  const addAntiparasiticProtocol = (protocolData: Omit<AntiparasiticProtocol, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProtocol: AntiparasiticProtocol = {
      ...protocolData,
      id: Math.max(0, ...antiparasiticProtocols.map(p => p.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedProtocols = [...antiparasiticProtocols, newProtocol];
    setAntiparasiticProtocols(updatedProtocols);
    localStorage.setItem('vetpro-antiparasiticProtocols', JSON.stringify(updatedProtocols));
  };

  const updateAntiparasiticProtocol = (id: number, protocolData: Partial<AntiparasiticProtocol>) => {
    const updatedProtocols = antiparasiticProtocols.map(protocol => 
      protocol.id === id ? { ...protocol, ...protocolData, updatedAt: new Date().toISOString() } : protocol
    );
    setAntiparasiticProtocols(updatedProtocols);
    localStorage.setItem('vetpro-antiparasiticProtocols', JSON.stringify(updatedProtocols));
  };

  const deleteAntiparasiticProtocol = (id: number) => {
    const updatedProtocols = antiparasiticProtocols.filter(protocol => protocol.id !== id);
    setAntiparasiticProtocols(updatedProtocols);
    localStorage.setItem('vetpro-antiparasiticProtocols', JSON.stringify(updatedProtocols));
  };

  // Getters Antiparasites
  const getAntiparasiticById = (id: number) => antiparasitics.find(a => a.id === id);
  const getAntiparasiticsByPetId = (petId: number) => antiparasitics.filter(a => a.petId === petId);
  const getAntiparasiticsByClientId = (clientId: number) => antiparasitics.filter(a => a.clientId === clientId);
  const getOverdueAntiparasitics = () => {
    const today = new Date().toISOString().split('T')[0];
    return antiparasitics.filter(a => a.nextDueDate && a.nextDueDate < today && a.status !== 'completed');
  };
  const getUpcomingAntiparasitics = (days: number = 7) => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return antiparasitics.filter(a => {
      if (!a.nextDueDate) return false;
      const dueDate = new Date(a.nextDueDate);
      return dueDate >= today && dueDate <= futureDate;
    });
  };
  const getAntiparasiticsByStatus = (status: string) => antiparasitics.filter(a => a.status === status);

  // Getters Protocoles Antiparasitaires
  const getAntiparasiticProtocolById = (id: number) => antiparasiticProtocols.find(p => p.id === id);
  const getAntiparasiticProtocolsBySpecies = (species: string) => antiparasiticProtocols.filter(p => p.species === species && p.isActive);
  const getActiveAntiparasiticProtocols = () => antiparasiticProtocols.filter(p => p.isActive);

  const getClientById = (id: number) => clients.find(c => c.id === id);
  const getPetById = (id: number) => pets.find(p => p.id === id);
  const getConsultationById = (id: number) => consultations.find(c => c.id === id);
  const getPetsByOwnerId = (ownerId: number) => pets.filter(p => p.ownerId === ownerId);
  const getConsultationsByPetId = (petId: number) => consultations.filter(c => c.petId === petId);
  const getConsultationsByClientId = (clientId: number) => consultations.filter(c => c.clientId === clientId);

  // Fonctions de gestion des rendez-vous
  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Math.max(...appointments.map(a => a.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    
    // Mettre à jour les statistiques du client
    updateClientStats(appointmentData.clientId);
    
    saveDataToStorage(clients, pets, consultations, updatedAppointments, prescriptions);
  };

  const updateAppointment = (id: number, appointmentData: Partial<Appointment>) => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === id ? { ...appointment, ...appointmentData } : appointment
    );
    setAppointments(updatedAppointments);
    saveDataToStorage(clients, pets, consultations, updatedAppointments, prescriptions);
  };

  const deleteAppointment = (id: number) => {
    const updatedAppointments = appointments.filter(appointment => appointment.id !== id);
    setAppointments(updatedAppointments);
    saveDataToStorage(clients, pets, consultations, updatedAppointments, prescriptions);
  };

  const getAppointmentById = (id: number) => appointments.find(a => a.id === id);
  const getAppointmentsByClientId = (clientId: number) => appointments.filter(a => a.clientId === clientId);
  const getAppointmentsByPetId = (petId: number) => appointments.filter(a => a.petId === petId);
  const getAppointmentsByDate = (date: string) => appointments.filter(a => a.date === date);
  
  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed')
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  };

  const getOverdueAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => a.date < today && a.status === 'scheduled')
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  };

  // Fonctions de gestion des prescriptions
  const addPrescription = (prescriptionData: Omit<Prescription, 'id' | 'createdAt'>) => {
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: Math.max(...prescriptions.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedPrescriptions = [...prescriptions, newPrescription];
    setPrescriptions(updatedPrescriptions);
    saveDataToStorage(clients, pets, consultations, appointments, updatedPrescriptions);
  };

  const updatePrescription = (id: number, prescriptionData: Partial<Prescription>) => {
    const updatedPrescriptions = prescriptions.map(prescription => 
      prescription.id === id ? { ...prescription, ...prescriptionData } : prescription
    );
    setPrescriptions(updatedPrescriptions);
    saveDataToStorage(clients, pets, consultations, appointments, updatedPrescriptions);
  };

  const deletePrescription = (id: number) => {
    const updatedPrescriptions = prescriptions.filter(prescription => prescription.id !== id);
    setPrescriptions(updatedPrescriptions);
    saveDataToStorage(clients, pets, consultations, appointments, updatedPrescriptions);
  };

  const getPrescriptionById = (id: number) => prescriptions.find(p => p.id === id);
  const getPrescriptionsByPetId = (petId: number) => prescriptions.filter(p => p.petId === petId);
  const getPrescriptionsByConsultationId = (consultationId: number) => prescriptions.filter(p => p.consultationId === consultationId);
  
  const getActivePrescriptions = () => {
    return prescriptions
      .filter(p => p.status === 'active')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Fonctions de gestion des exploitations
  const addFarm = (farmData: Omit<Farm, 'id' | 'createdAt'>) => {
    const newFarm: Farm = {
      ...farmData,
      id: Math.max(...farms.map(f => f.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedFarms = [...farms, newFarm];
    setFarms(updatedFarms);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, updatedFarms, farmInterventions);
  };

  const updateFarm = (id: number, farmData: Partial<Farm>) => {
    const updatedFarms = farms.map(farm => 
      farm.id === id ? { ...farm, ...farmData } : farm
    );
    setFarms(updatedFarms);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, updatedFarms, farmInterventions);
  };

  const deleteFarm = (id: number) => {
    const updatedFarms = farms.filter(farm => farm.id !== id);
    setFarms(updatedFarms);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, updatedFarms, farmInterventions);
  };



  const addFarmIntervention = (interventionData: Omit<FarmIntervention, 'id' | 'createdAt'>) => {
    const newIntervention: FarmIntervention = {
      ...interventionData,
      id: Math.max(...farmInterventions.map(i => i.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedInterventions = [...farmInterventions, newIntervention];
    setFarmInterventions(updatedInterventions);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, updatedInterventions);
  };

  const updateFarmIntervention = (id: number, interventionData: Partial<FarmIntervention>) => {
    const updatedInterventions = farmInterventions.map(intervention => 
      intervention.id === id ? { ...intervention, ...interventionData } : intervention
    );
    setFarmInterventions(updatedInterventions);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, updatedInterventions);
  };

  const deleteFarmIntervention = (id: number) => {
    const updatedInterventions = farmInterventions.filter(intervention => intervention.id !== id);
    setFarmInterventions(updatedInterventions);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, updatedInterventions);
  };

  const getFarmById = (id: number) => farms.find(f => f.id === id);
  const getFarmInterventionById = (id: number) => farmInterventions.find(i => i.id === id);
  const getFarmInterventionsByFarmId = (farmId: number) => farmInterventions.filter(i => i.farmId === farmId);
  
  const getUpcomingFarmInterventions = () => {
    const today = new Date().toISOString().split('T')[0];
    return farmInterventions
      .filter(i => i.date >= today && i.status !== 'cancelled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getFarmsByStatus = (status: Farm['status']) => {
    return farms.filter(f => f.status === status);
  };

  // Fonctions de gestion des vaccinations
  const addVaccination = (vaccinationData: Omit<Vaccination, 'id' | 'createdAt'>) => {
    const newVaccination: Vaccination = {
      ...vaccinationData,
      id: Math.max(...vaccinations.map(v => v.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedVaccinations = [...vaccinations, newVaccination];
    setVaccinations(updatedVaccinations);
    
    // Mettre à jour les statistiques du client
    updateClientStats(vaccinationData.clientId);
    
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, updatedVaccinations);
  };

  const updateVaccination = (id: number, vaccinationData: Partial<Vaccination>) => {
    const updatedVaccinations = vaccinations.map(vaccination => 
      vaccination.id === id ? { ...vaccination, ...vaccinationData } : vaccination
    );
    setVaccinations(updatedVaccinations);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, updatedVaccinations);
  };

  const deleteVaccination = (id: number) => {
    const updatedVaccinations = vaccinations.filter(vaccination => vaccination.id !== id);
    setVaccinations(updatedVaccinations);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, updatedVaccinations);
  };

  const getVaccinationById = (id: number) => vaccinations.find(v => v.id === id);
  const getVaccinationsByPetId = (petId: number) => vaccinations.filter(v => v.petId === petId);
  const getVaccinationsByClientId = (clientId: number) => vaccinations.filter(v => v.clientId === clientId);
  
  const getOverdueVaccinations = () => {
    const today = new Date().toISOString().split('T')[0];
    return vaccinations
      .filter(v => v.nextDueDate < today && v.status !== 'completed')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  };

  const getUpcomingVaccinations = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    
    return vaccinations
      .filter(v => v.nextDueDate >= todayStr && v.nextDueDate <= thirtyDaysFromNow && v.status !== 'completed')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  };

  const getVaccinationsByStatus = (status: Vaccination['status']) => {
    return vaccinations.filter(v => v.status === status);
  };

  // Fonctions de gestion des protocoles de vaccination
  const addVaccinationProtocol = (protocolData: Omit<VaccinationProtocol, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProtocol: VaccinationProtocol = {
      ...protocolData,
      id: Math.max(...vaccinationProtocols.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedProtocols = [...vaccinationProtocols, newProtocol];
    setVaccinationProtocols(updatedProtocols);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, updatedProtocols);
  };

  const updateVaccinationProtocol = (id: number, protocolData: Partial<VaccinationProtocol>) => {
    const updatedProtocols = vaccinationProtocols.map(protocol => 
      protocol.id === id ? { ...protocol, ...protocolData, updatedAt: new Date().toISOString() } : protocol
    );
    setVaccinationProtocols(updatedProtocols);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, updatedProtocols);
  };

  const deleteVaccinationProtocol = (id: number) => {
    const updatedProtocols = vaccinationProtocols.filter(protocol => protocol.id !== id);
    setVaccinationProtocols(updatedProtocols);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, updatedProtocols);
  };

  const getVaccinationProtocolById = (id: number) => vaccinationProtocols.find(p => p.id === id);
  
  const getVaccinationProtocolsBySpecies = (species: string) => {
    return vaccinationProtocols.filter(p => p.species === species && p.isActive);
  };

  const getActiveVaccinationProtocols = () => {
    return vaccinationProtocols.filter(p => p.isActive);
  };

  return (
    <ClientContext.Provider value={{
      clients,
      pets,
      consultations,
      appointments,
      prescriptions,
      farms,
      farmInterventions,
      vaccinations,
      vaccinationProtocols,
      antiparasitics,
      antiparasiticProtocols,
      addClient,
      addPet,
      addConsultation,
      addAppointment,
      addPrescription,
      addFarm,
      addFarmIntervention,
      addVaccination,
      addVaccinationProtocol,
      addAntiparasitic,
      addAntiparasiticProtocol,
      updateClient,
      updatePet,
      updateConsultation,
      updateAppointment,
      updatePrescription,
      updateFarm,
      updateFarmIntervention,
      updateVaccination,
      updateVaccinationProtocol,
      updateAntiparasitic,
      updateAntiparasiticProtocol,
      deletePet,
      deleteConsultation,
      deleteAppointment,
      deletePrescription,
      deleteFarm,
      deleteFarmIntervention,
      deleteVaccination,
      deleteVaccinationProtocol,
      deleteAntiparasitic,
      deleteAntiparasiticProtocol,
      resetData,
      exportData,
      importData,
      getClientById,
      getPetById,
      getConsultationById,
      getAppointmentById,
      getPrescriptionById,
      getFarmById,
      getFarmInterventionById,
      getVaccinationById,
      getVaccinationProtocolById,
      getVaccinationProtocolsBySpecies,
      getActiveVaccinationProtocols,
      getAntiparasiticById,
      getAntiparasiticsByPetId,
      getAntiparasiticsByClientId,
      getOverdueAntiparasitics,
      getUpcomingAntiparasitics,
      getAntiparasiticsByStatus,
      getAntiparasiticProtocolById,
      getAntiparasiticProtocolsBySpecies,
      getActiveAntiparasiticProtocols,
      getPetsByOwnerId,
      getConsultationsByPetId,
      getConsultationsByClientId,
      getAppointmentsByClientId,
      getAppointmentsByPetId,
      getAppointmentsByDate,
      getUpcomingAppointments,
      getOverdueAppointments,
      getPrescriptionsByPetId,
      getPrescriptionsByConsultationId,
      getActivePrescriptions,
      getFarmInterventionsByFarmId,
      getUpcomingFarmInterventions,
      getFarmsByStatus,
      getVaccinationsByPetId,
      getVaccinationsByClientId,
      getOverdueVaccinations,
      getUpcomingVaccinations,
      getVaccinationsByStatus,
      updateClientStats
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};