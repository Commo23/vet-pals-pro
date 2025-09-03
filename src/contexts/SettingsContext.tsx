import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';

export interface FarmManagementSettings {
  farmTypes: string[];
  animalCategories: string[];
  breedsByCategory: Record<string, string[]>;
  certificationTypes: string[];
  equipmentTypes: string[];
  defaultSurfaceUnit: string;
  defaultCoordinateFormat: string;
}

export interface ClinicSettings {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  footerText?: string;
  logo?: string;
  currency: string;
  species: string;
  showClinicInfo: boolean;
  showVetsInfo: boolean;
  farmManagement: FarmManagementSettings;
}

const SETTINGS_KEY = 'vetpro-clinicSettings';

interface SettingsContextType {
  settings: ClinicSettings;
  updateSettings: (settings: ClinicSettings) => void;
}

const defaultFarmManagementSettings: FarmManagementSettings = {
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
};

const defaultSettings: ClinicSettings = {
  clinicName: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  footerText: '',
  logo: '/placeholder.svg',
  currency: 'MAD',
  species: '',
  showClinicInfo: true,
  showVetsInfo: true,
  farmManagement: defaultFarmManagementSettings
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        // Fusionner avec les paramètres par défaut pour s'assurer que toutes les propriétés sont présentes
        const mergedSettings = {
          ...defaultSettings,
          ...parsedSettings,
          farmManagement: {
            ...defaultFarmManagementSettings,
            ...parsedSettings.farmManagement
          }
        };
        setSettings(mergedSettings);
        // Sauvegarder la version mise à jour pour éviter les problèmes futurs
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        setSettings(defaultSettings);
      }
    } else {
      // Si aucun paramètre n'existe, sauvegarder les paramètres par défaut
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    }
  }, []);

  const updateSettings = (newSettings: ClinicSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
