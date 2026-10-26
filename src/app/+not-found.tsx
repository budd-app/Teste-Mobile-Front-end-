import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StateView } from '@/components/ui/StateView';
import { colors } from '@/theme/tokens';

export default function NotFound() {
  return (
    <View style={styles.root}>
      <StateView
        kind="empty"
        icon="map"
        title="Rolê errado"
        message="Essa página não existe. Bora voltar para o início?"
        actionLabel="Ir para o início"
        onAction={() => router.replace('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
});
