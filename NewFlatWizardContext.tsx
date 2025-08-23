/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { FlatData, WizardContextType } from '../../../../types/NewFlatsFormType';

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const initialFlatData: FlatData = {
  mode: undefined, 
  type: undefined, 
  city: '',
  address: '',
  surface: 0,
  rooms: 0,
  furnished: false,
  airConditioned: false,
  constructionYear: 0,
  notSubjectToDpe: false,
  consumption: 0,
  emission: 0,
  dpe: undefined,
  emissionConsumption: undefined,
  images: [],
  title: '',
  description: '',
  price: 0,
  charges: 0,
  userId: '',
  ownerId: ''
};

export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FlatData>(initialFlatData);

  const setField = <K extends keyof FlatData>(key: K, value: FlatData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const resetWizard = () => {
    setData(initialFlatData);
  };

  return (
    <WizardContext.Provider value={{ data, setField, resetWizard }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
