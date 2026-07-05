import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useMyReservations } from '@/hooks/useReservations';
import { reservationService } from '@/services/reservationService';
import { Reservation } from '@/types';

function ReservationStatus({ status }: { status: Reservation['status'] }) {
  const active = status === 'ACTIVE';
  return (
    <View style={[styles.statusBadge, { backgroundColor: active ? '#DCFCE7' : '#E5E7EB' }]}>
      <Text style={[styles.statusText, { color: active ? '#166534' : '#374151' }]}>
        {active ? 'Ativa' : 'Cancelada'}
      </Text>
    </View>
  );
}

export default function ReservationHistoryScreen() {
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { reservations, isLoading, error, refetch } = useMyReservations();
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function cancelReservation(id: string) {
    setCancelingId(id);
    setActionError(null);
    try {
      await reservationService.cancel(id);
      await refetch();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Erro ao cancelar reserva.');
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Minhas Reservas</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {reservations.length} {reservations.length === 1 ? 'reserva' : 'reservas'}
        </Text>
      </View>

      {(error || actionError) && (
        <View style={styles.errorBox}>
          <Text selectable style={styles.errorText}>{actionError ?? error}</Text>
          {error && (
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator style={styles.loading} color="#1976D2" size="large" />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(reservation) => reservation.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text selectable style={[styles.roomName, { color: colors.text }]}>
                    {item.room?.name ?? 'Sala'}
                  </Text>
                  <Text selectable style={[styles.meta, { color: colors.textSecondary }]}>
                    {item.date} das {item.startTime} as {item.endTime}
                  </Text>
                </View>
                <ReservationStatus status={item.status} />
              </View>

              {item.status === 'ACTIVE' && (
                <TouchableOpacity
                  style={[styles.cancelButton, cancelingId === item.id && styles.disabledButton]}
                  disabled={cancelingId === item.id}
                  onPress={() => cancelReservation(item.id)}>
                  {cancelingId === item.id ? (
                    <ActivityIndicator color="#DC2626" size="small" />
                  ) : (
                    <Text style={styles.cancelText}>Cancelar reserva</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text selectable style={[styles.empty, { color: colors.textSecondary }]}>
              Nenhuma reserva encontrada.
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
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13 },
  loading: { marginTop: Spacing.six },
  list: { gap: Spacing.two, padding: Spacing.four },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  cardInfo: { flex: 1, gap: 2 },
  roomName: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13 },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  cancelButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  disabledButton: { opacity: 0.6 },
  cancelText: { color: '#DC2626', fontWeight: '700' },
  empty: { marginTop: Spacing.five, textAlign: 'center' },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    padding: Spacing.three,
  },
  errorText: { color: '#B91C1C', fontSize: 14 },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  retryText: { color: '#fff', fontWeight: '700' },
});
