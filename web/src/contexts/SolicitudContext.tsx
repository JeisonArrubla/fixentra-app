import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SolicitudDraft {
  direccionId: string;
  descripcion: string;
  imagenes: string[];
}

interface SolicitudContextType {
  draft: SolicitudDraft;
  setDraft: (draft: SolicitudDraft) => void;
  clearDraft: () => void;
  hasDraft: boolean;
}

const STORAGE_KEY = 'fixentra_solicitud_draft';

const initialDraft: SolicitudDraft = {
  direccionId: '',
  descripcion: '',
  imagenes: [],
};

const SolicitudContext = createContext<SolicitudContextType | undefined>(undefined);

export function SolicitudProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<SolicitudDraft>(() => {
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

  const setDraft = (newDraft: SolicitudDraft) => {
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
    <SolicitudContext.Provider value={{ draft, setDraft, clearDraft, hasDraft }}>
      {children}
    </SolicitudContext.Provider>
  );
}

export function useSolicitud() {
  const context = useContext(SolicitudContext);
  if (!context) {
    throw new Error('useSolicitud must be used within SolicitudProvider');
  }
  return context;
}