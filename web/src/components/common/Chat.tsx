import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '../../services/api';
import { Send, X } from 'lucide-react';

interface Mensaje {
  id: string;
  contenido: string;
  emisorId: string;
  emisor: {
    id: string;
    nombre: string;
    apellido: string;
  };
  leido: boolean;
  createdAt: string;
}

interface ChatProps {
  servicioId: string;
  usuarioId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Chat({ servicioId, usuarioId, isOpen, onClose }: ChatProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const cargarMensajes = async () => {
      setCargando(true);
      try {
        const { data } = await chatApi.getMensajes(servicioId);
        setMensajes(data);
        await chatApi.marcarLeidos(servicioId);
      } catch (err) {
        console.error('Error al cargar mensajes:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarMensajes();
  }, [servicioId, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, scrollToBottom]);

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io('/chat', {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe:servicio', { servicioId });
    });

    socket.on('chat:recibir', (mensaje: Mensaje) => {
      setMensajes((prev) => [...prev, mensaje]);
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión del chat:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [servicioId, isOpen]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !socketRef.current) return;

    const contenido = nuevoMensaje.trim();
    setNuevoMensaje('');

    try {
      socketRef.current.emit('chat:enviar', {
        servicioId,
        contenido,
      });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      setNuevoMensaje(contenido);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full sm:max-w-md mx-auto h-[80vh] sm:h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cargando ? (
            <div className="text-center text-gray-500 py-8">Cargando mensajes...</div>
          ) : mensajes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay mensajes aún. ¡Inicia la conversación!
            </div>
          ) : (
            mensajes.map((mensaje) => {
              const esPropio = mensaje.emisorId === usuarioId;
              return (
                <div
                  key={mensaje.id}
                  className={`flex ${esPropio ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      esPropio
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {!esPropio && (
                      <p className="text-xs font-medium mb-1 opacity-75">
                        {mensaje.emisor.nombre} {mensaje.emisor.apellido}
                      </p>
                    )}
                    <p className="text-sm break-words">{mensaje.contenido}</p>
                    <p
                      className={`text-xs mt-1 ${
                        esPropio ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(mensaje.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={mensajesEndRef} />
        </div>

        <form
          onSubmit={enviarMensaje}
          className="border-t p-3 flex gap-2 bg-white"
        >
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!nuevoMensaje.trim()}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
