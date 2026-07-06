import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useMyReservations } from '@/hooks/useReservations';
import { reservationService } from '@/services/reservationService';
import { Reservation } from '@/types';

// Data e hora de "agora" no mesmo formato do banco (YYYY-MM-DD / HH:mm)
function nowParts() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

// T22: uma reserva é futura se ainda não terminou (fim >= agora)
function isFuture(r: Reservation, now: { date: string; time: string }) {
  if (r.date !== now.date) return r.date > now.date;
  return r.endTime > now.time;
}

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
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null); // T23
  const [actionError, setActionError] = useState<string | null>(null);
  const [fRoom, setFRoom] = useState(''); // T25
  const [fDate, setFDate] = useState(''); // T25

  // T25: filtra por sala/data
  const visiveis = reservations.filter((r) => {
    const roomOk = !fRoom || (r.room?.name ?? '').toLowerCase().includes(fRoom.toLowerCase());
    const dateOk = !fDate || r.date.includes(fDate.trim());
    return roomOk && dateOk;
  });

  // T22: separa futuras e passadas
  const now = nowParts();
  const futuras = visiveis.filter((r) => isFuture(r, now));
  const passadas = visiveis.filter((r) => !isFuture(r, now));
  const sections = [
    { title: 'Futuras', data: futuras },
    { title: 'Passadas', data: passadas },
  ].filter((s) => s.data.length > 0);

  // T23: só cancela depois de confirmar no modal
  async function confirmCancel() {
    if (!cancelTarget) return;
    const id = cancelTarget.id;
    setCancelTarget(null);
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
          {futuras.length} {futuras.length === 1 ? 'futura' : 'futuras'} · {passadas.length}{' '}
          {passadas.length === 1 ? 'passada' : 'passadas'}
        </Text>
      </View>

      {/* T25: filtros por sala e data */}
      <View style={styles.filters}>
        <TextInput
          style={[styles.filterInput, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected, color: colors.text }]}
          placeholder="Filtrar por sala"
          placeholderTextColor={colors.textSecondary}
          value={fRoom}
          onChangeText={setFRoom}
        />
        <TextInput
          style={[styles.filterInput, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected, color: colors.text }]}
          placeholder="Data (AAAA-MM-DD)"
          placeholderTextColor={colors.textSecondary}
          value={fDate}
          onChangeText={setFDate}
          autoCapitalize="none"
        />
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
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
              {section.title === 'Futuras' ? '🟢 Futuras' : '🕓 Passadas'}
            </Text>
          )}
          renderItem={({ item, section }) => {
            const future = section.title === 'Futuras';
            return (
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

                {/* T23: cancelar (só futuras e ativas) abre o modal de confirmação */}
                {future && item.status === 'ACTIVE' && (
                  <TouchableOpacity
                    style={[styles.cancelButton, cancelingId === item.id && styles.disabledButton]}
                    disabled={cancelingId === item.id}
                    onPress={() => setCancelTarget(item)}>
                    {cancelingId === item.id ? (
                      <ActivityIndicator color="#DC2626" size="small" />
                    ) : (
                      <Text style={styles.cancelText}>Cancelar reserva</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text selectable style={[styles.empty, { color: colors.textSecondary }]}>
              Nenhuma reserva encontrada.
            </Text>
          }
        />
      )}

      {/* T23: modal de confirmação de cancelamento */}
      <Modal visible={!!cancelTarget} transparent animationType="fade" onRequestClose={() => setCancelTarget(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Cancelar reserva?</Text>
            <Text style={[styles.modalMsg, { color: colors.textSecondary }]}>
              Tem certeza que deseja cancelar a reserva de{'\n'}
              <Text style={{ fontWeight: '700', color: colors.text }}>{cancelTarget?.room?.name ?? 'sala'}</Text>
              {'\n'}em {cancelTarget?.date} ({cancelTarget?.startTime}–{cancelTarget?.endTime})?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost, { borderColor: colors.backgroundSelected }]}
                onPress={() => setCancelTarget(null)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDanger]} onPress={confirmCancel}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Sim, cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  filters: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  filterInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.two,
  },
  loading: { marginTop: Spacing.six },
  list: { gap: Spacing.two, padding: Spacing.four },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.two,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modal: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  modalMsg: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  modalActions: { flexDirection: 'row', gap: Spacing.two },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: Spacing.two + 4,
  },
  modalBtnGhost: { borderWidth: 1 },
  modalBtnDanger: { backgroundColor: '#DC2626' },
});
