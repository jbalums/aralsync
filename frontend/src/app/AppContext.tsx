import { createContext, useContext } from 'react';

interface AppContextValue {
  online: boolean;
  setOnline: (v: boolean) => void;
  pending: number;
  setPending: (v: number) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
}

const defaultCtx: AppContextValue = {
  online: true,
  setOnline: () => {},
  pending: 0,
  setPending: () => {},
  selectedClassId: '',
  setSelectedClassId: () => {},
};

export const AppContext = createContext<AppContextValue>(defaultCtx);
export const useAppContext = () => useContext(AppContext);
