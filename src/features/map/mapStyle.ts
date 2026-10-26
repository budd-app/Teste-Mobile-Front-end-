import type { MapStyleElement } from 'react-native-maps';

/** Estilo escuro do Google Maps (Android) alinhado aos neutros do DS. No iOS usamos userInterfaceStyle="dark". */
export const darkMapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#0E100E' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5E655C' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0E100E' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#132016' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1C1F1C' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#262A26' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2A2E2A' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#141E24' }] },
];
