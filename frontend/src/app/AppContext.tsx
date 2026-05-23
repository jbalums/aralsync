import { createContext, useContext } from 'react';

interface AppContextValue {
  online: boolean;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
}

const defaultCtx: AppContextValue = {
  online: true,
  selectedClassId: '',
  setSelectedClassId: () => {},
};

export const AppContext = createContext<AppContextValue>(defaultCtx);
export const useAppContext = () => useContext(AppContext);
