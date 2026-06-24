import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: user?.role === 'ADMIN' ? '#DBEAFE' : '#F3F4F6' }]}>
          <Text style={[styles.roleText, { color: user?.role === 'ADMIN' ? '#1D4ED8' : '#6B7280' }]}>
            {user?.role === 'ADMIN' ? '⚙️ Administrador' : '👤 Usuário'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four },
  card: {
    borderRadius: 16,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700' },
  email: { fontSize: 14 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  roleText: { fontSize: 13, fontWeight: '600' },
  logoutBtn: {
    marginTop: Spacing.four,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  logoutText: { color: '#B91C1C', fontWeight: '600', fontSize: 15 },
});
