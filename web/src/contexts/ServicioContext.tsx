import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ServicioDraft {
  direccionId: string;
  descripcion: string;
  imagenes: string[];
}

interface ServicioContextType {
  draft: ServicioDraft;
  setDraft: (draft: ServicioDraft) => void;
  clearDraft: () => void;
  hasDraft: boolean;
}

const STORAGE_KEY = 'fixentra_servicio_draft';

const initialDraft: ServicioDraft = {
  direccionId: '',
  descripcion: '',
  imagenes: [],
};

const ServicioContext = createContext<ServicioContextType | undefined>(undefined);

export function ServicioProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<ServicioDraft>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return initialDraft;
        }
      }
    }
    return initialDraft;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }
  }, [draft]);

  const setDraft = (newDraft: ServicioDraft) => {
    setDraftState(newDraft);
  };

  const clearDraft = () => {
    setDraftState(initialDraft);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const hasDraft = draft.direccionId !== '' || draft.descripcion !== '' || draft.imagenes.length > 0;

  return (
    <ServicioContext.Provider value={{ draft, setDraft, clearDraft, hasDraft }}>
      {children}
    </ServicioContext.Provider>
  );
}

export function useServicio() {
  const context = useContext(ServicioContext);
  if (!context) {
    throw new Error('useServicio must be used within ServicioProvider');
  }
  return context;
}
