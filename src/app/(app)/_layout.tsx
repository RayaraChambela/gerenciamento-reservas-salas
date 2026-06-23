import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  // T08: redireciona para login se não autenticado
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const isAdmin = user.role === 'ADMIN';

  // T06: tabs condicionais — admin vê tabs extras
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Salas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reservations/history">
        <NativeTabs.Trigger.Label>Minhas Reservas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* T06: tabs visíveis apenas para ADMIN */}
      {isAdmin && (
        <NativeTabs.Trigger name="admin/rooms">
          <NativeTabs.Trigger.Label>Gerenciar Salas</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}
      {isAdmin && (
        <NativeTabs.Trigger name="admin/reservations">
          <NativeTabs.Trigger.Label>Todas as Reservas</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}
    </NativeTabs>
  );
}
