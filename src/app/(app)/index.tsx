import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

// TODO (T12): listar salas com badge de disponibilidade
export default function RoomsScreen() {
  const { user, logout } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Salas disponíveis</Text>
      <Text style={{ color: colors.textSecondary }}>Olá, {user?.name}</Text>
      <Text
        onPress={logout}
        style={{ color: '#E53935', marginTop: Spacing.three }}>
        Sair
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: Spacing.two },
});
