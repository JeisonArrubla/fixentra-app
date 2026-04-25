import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair } from 'lucide-react';

interface LocationPickerProps {
  latitud: number;
  longitud: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export const LocationPicker = forwardRef<{ goToCurrentLocation: () => void }, LocationPickerProps>(({ latitud, longitud, onLocationChange }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useImperativeHandle(ref, () => ({
    goToCurrentLocation: () => getCurrentLocation(),
  }));

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!mapContainer.current) return;

    setLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLoadingLocation(false);

        if (map.current && marker.current) {
          map.current.setView([latitude, longitude], 14);
          marker.current.setLatLng([latitude, longitude]);
          onLocationChange(latitude, longitude);
        } else {
          initializeMap(latitude, longitude);
        }
      },
      (err) => {
        console.log('Geolocation error:', err.message);
        setLocationError('No se pudo obtener tu ubicación');
        setLoadingLocation(false);
        if (!map.current) {
          initializeMap(latitud, longitud);
        }
      }
    );
  };

  const initializeMap = (lat: number, lng: number) => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.current);

    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    marker.current = L.marker([lat, lng], { icon: customIcon, draggable: true })
      .addTo(map.current)
      .on('dragend', () => {
        if (!marker.current) return;
        const pos = marker.current.getLatLng();
        onLocationChange(pos.lat, pos.lng);
      });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Selecciona la ubicación en el mapa
        </label>
        {loadingLocation ? (
          <span className="text-sm text-gray-500">Obteniendo ubicación...</span>
        ) : userLocation ? (
          <span className="text-xs text-green-600 flex items-center">
            <MapPin className="h-3 w-3 mr-1" /> Ubicación actual
          </span>
        ) : null}
      </div>
      
      {locationError && (
        <div className="bg-yellow-50 text-yellow-700 p-2 rounded-md text-sm">
          {locationError}
        </div>
      )}
      
      <div className="relative">
        <div ref={mapContainer} className="h-64 w-full rounded-md overflow-hidden border" />
        <button
          type="button"
          onClick={getCurrentLocation}
          className="absolute top-2 right-2 z-[400] bg-white p-2 rounded-md shadow-md hover:bg-gray-100 flex items-center text-sm text-gray-700"
          title="Usar mi ubicación actual"
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Arrastra el pin para ajustar la ubicación exacta
      </p>
    </div>
  );
});