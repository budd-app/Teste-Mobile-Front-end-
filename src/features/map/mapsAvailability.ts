import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/**
 * No Android, o Google Maps exige chave de API em builds próprios (APK/AAB):
 * sem ela o SDK nativo derruba o app ao montar o MapView. No Expo Go e no
 * iOS (Apple Maps) não há essa exigência.
 */
export const mapsAvailable =
  Platform.OS !== 'android' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Boolean(Constants.expoConfig?.extra?.hasGoogleMapsKey);
