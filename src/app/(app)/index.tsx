import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { RoomStatusBadge } from '@/components/room-status-badge';
import { Colors, Spacing } from '@/constants/theme';
import { useRooms } from '@/hooks/useRooms';
import { Room } from '@/types';

type AppColors = (typeof Colors)[keyof typeof Colors];

function RoomListSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View style={styles.skeletonList}>
      {[0, 1, 2].map((item) => (
        <View
          key={item}
          style={[
            styles.card,
            styles.skeletonCard,
            { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected },
          ]}>
          <View style={[styles.skeletonLine, { width: '45%' }]} />
          <View style={[styles.skeletonLine, { width: '70%' }]} />
          <View style={[styles.skeletonLine, { width: '35%' }]} />
        </View>
      ))}
    </View>
  );
}

function ErrorState({
  colors,
  message,
  onRetry,
}: {
  colors: AppColors;
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={[styles.errorBox, { borderColor: colors.backgroundSelected }]}>
      <Text selectable style={styles.errorTitle}>Erro ao carregar salas</Text>
      <Text selectable style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RoomsScreen() {
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const router = useRouter();
  const { rooms, isLoading, error, refetch } = useRooms();

  function openReservation(room: Room) {
    if (!room.isAvailable) return;
    router.push(`/(app)/reservations/new?roomId=${room.id}` as any);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Salas cadastradas</Text>
        <Text style={[styles.counter, { color: colors.textSecondary }]}>
          {rooms.length} {rooms.length === 1 ? 'sala' : 'salas'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator color="#1976D2" />
          <RoomListSkeleton colors={colors} />
        </View>
      ) : error ? (
        <ErrorState colors={colors} message={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(room) => room.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={item.isAvailable ? 0.82 : 1}
              disabled={!item.isAvailable}
              onPress={() => openReservation(item)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                },
                !item.isAvailable && styles.cardDisabled,
              ]}>
              <View style={styles.cardHeader}>
                <Text selectable style={[styles.roomName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <RoomStatusBadge isAvailable={item.isAvailable} compact />
              </View>

              <View style={styles.roomMetaRow}>
                <Text selectable style={[styles.roomInfo, { color: colors.textSecondary }]}>
                  Local: {item.location}
                </Text>
                <Text selectable style={[styles.roomInfo, { color: colors.textSecondary }]}>
                  Capacidade: {item.capacity}
                </Text>
              </View>

              <Text selectable style={[styles.roomDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>

              <Text style={[styles.actionText, { color: item.isAvailable ? '#1976D2' : colors.textSecondary }]}>
                {item.isAvailable ? 'Agendar sala' : 'Indisponivel no momento'}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text selectable style={[styles.empty, { color: colors.textSecondary }]}>
              Nenhuma sala cadastrada ainda.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    gap: 4,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  counter: {
    fontSize: 13,
  },
  loadingArea: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  skeletonList: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  skeletonCard: {
    gap: Spacing.two,
  },
  skeletonLine: {
    backgroundColor: 'rgba(25, 118, 210, 0.16)',
    borderRadius: 6,
    height: 12,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: Spacing.three,
  },
  cardDisabled: {
    opacity: 0.72,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  roomName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  roomMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  roomInfo: {
    fontSize: 13,
  },
  roomDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  empty: {
    marginTop: Spacing.five,
    textAlign: 'center',
  },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
    margin: Spacing.four,
    padding: Spacing.three,
  },
  errorTitle: {
    color: '#B91C1C',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#7F1D1D',
    fontSize: 14,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});
