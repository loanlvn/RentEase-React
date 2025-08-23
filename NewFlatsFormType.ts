export interface StepProps {
      onNext: () => void;
      onBack: () => void;
};

export interface FlatData {
  ownerId: string;
  userId: string;
  mode: 'sell' | 'rent' | undefined;
  type: 'house' | 'apartment' | undefined;
  city: string;
  address: string;
  surface: number;
  rooms: number;
  furnished: boolean | undefined;
  airConditioned: boolean | undefined;
  constructionYear: number;
  notSubjectToDpe: boolean | undefined,
  consumption: number,
  emission: number,
  dpe: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | undefined;
  emissionConsumption: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | undefined;
  images: Array<File | string>;
  title: string;
  description: string;
  price: number | undefined;
  charges: number | undefined;
};

  
export interface WizardContextType {
    data: FlatData;
    setField: <K extends keyof FlatData>(key: K, value: FlatData[K]) => void;
    resetWizard: () => void;
  };