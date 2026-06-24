import { Redirect, Slot, usePathname, useRouter } from 'expo-router';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function AppLayout() {
  const { user, isLoading, logout } = useAuth();
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  const isAdmin = user.role === 'ADMIN';

  const tabs = [
    { label: 'Salas', href: '/(app)', icon: '🏢' },
    { label: 'Reservas', href: '/(app)/reservations/history', icon: '📅' },
    ...(isAdmin ? [
      { label: 'Admin', href: '/(app)/admin/rooms', icon: '⚙️' },
    ] : []),
    { label: 'Perfil', href: '/(app)/profile', icon: '👤' },
  ];

  function isActive(href: string) {
    if (href === '/(app)') return pathname === '/' || pathname === '/(app)';
    return pathname.includes(href.replace('/(app)', ''));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Navbar superior */}
      <View style={[styles.navbar, { backgroundColor: '#1565C0' }]}>
        <View style={styles.navbarInner}>
          <View style={styles.navbarBrand}>
            <Text style={styles.navbarIcon}>🏢</Text>
            <Text style={styles.navbarTitle}>Reserva de Salas</Text>
          </View>
          {/* Tabs centralizadas */}
          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <TouchableOpacity
                  key={tab.href}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => router.push(tab.href as any)}>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Conteúdo da tela */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Rodapé */}
      <View style={[styles.footer, { borderTopColor: colors.backgroundElement }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Projeto ADS — Sistema de Reserva de Salas
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: {
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  navbarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.five,
  },
  navbarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 'auto',
  },
  navbarIcon: { fontSize: 18 },
  navbarTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabs: {
    flexDirection: 'row',
    gap: 2,
  },
  tab: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
