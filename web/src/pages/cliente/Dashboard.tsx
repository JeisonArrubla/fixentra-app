import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader, NavigationButton, ButtonContainer, FormContainer } from '../../components/common';

export function ClienteDashboard() {
  const { user } = useAuth();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user !== null) {
      setCargando(false);
    }
  }, [user]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!user?.esCliente) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">
          Acceso no autorizado. Esta sección es para clientes.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <PageHeader title={`¿Cómo podemos ayudarte hoy?`} />
      <FormContainer>
        {
          <PageHeader title={`¿Necesitas un técnico?`} subtitle={`Crea una nueva solicitud de servicio y técnicos calificados te ayudarán.`} />
        }
        <ButtonContainer>
          <NavigationButton to="/cliente/servicios/nuevo" text="Solicitar servicio" />
        </ButtonContainer>
      </FormContainer>
    </div>
  );
}