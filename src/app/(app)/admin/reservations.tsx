import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { reservationService } from '@/services/reservationService';
import { Reservation } from '@/types';
import { Colors, Spacing } from '@/constants/theme';

// T24: listagem consolidada de reservas (ADMIN) com exclusão
// T25: filtros por sala, data e usuário
export default function AdminReservationsScreen() {
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);
  const [deleting, setDeleting] = useState(false);

  // T25: filtros
  const [fRoom, setFRoom] = useState('');
  const [fDate, setFDate] = useState('');
  const [fUser, setFUser] = useState('');

  async function fetchAll() {
    setIsLoading(true);
    setError(null);
    try {
      setReservations(await reservationService.listAll());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar reservas.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const roomOk = !fRoom || (r.room?.name ?? '').toLowerCase().includes(fRoom.toLowerCase());
      const dateOk = !fDate || r.date.includes(fDate.trim());
      const userOk =
        !fUser ||
        (r.user?.name ?? '').toLowerCase().includes(fUser.toLowerCase()) ||
        (r.user?.email ?? '').toLowerCase().includes(fUser.toLowerCase());
      return roomOk && dateOk && userOk;
    });
  }, [reservations, fRoom, fDate, fUser]);

  const hasFilter = !!(fRoom || fDate || fUser);

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleting(true);
    try {
      await reservationService.cancel(id);
      setDeleteTarget(null);
      await fetchAll();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir reserva.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? colors.backgroundElement : '#F5F7FA',
      borderColor: isDark ? '#333' : '#E0E4EA',
      color: colors.text,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Todas as Reservas</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filtered.length} de {reservations.length} {reservations.length === 1 ? 'reserva' : 'reservas'}
        </Text>
      </View>

      {/* T25: filtros */}
      <View style={styles.filters}>
        <TextInput
          style={[...inputStyle, styles.filterInput]}
          placeholder="Sala"
          placeholderTextColor={colors.textSecondary}
          value={fRoom}
          onChangeText={setFRoom}
        />
        <TextInput
          style={[...inputStyle, styles.filterInput]}
          placeholder="Data (AAAA-MM-DD)"
          placeholderTextColor={colors.textSecondary}
          value={fDate}
          onChangeText={setFDate}
          autoCapitalize="none"
        />
        <TextInput
          style={[...inputStyle, styles.filterInput]}
          placeholder="Usuário (nome/e-mail)"
          placeholderTextColor={colors.textSecondary}
          value={fUser}
          onChangeText={setFUser}
          autoCapitalize="none"
        />
        {hasFilter && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setFRoom('');
              setFDate('');
              setFUser('');
            }}>
            <Text style={styles.clearText}>Limpar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text selectable style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.six }} color="#1976D2" size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
              <View style={styles.cardTop}>
                <Text selectable style={[styles.roomName, { color: colors.text }]}>
                  {item.room?.name ?? 'Sala'}
                </Text>
                <View style={[styles.badge, { backgroundColor: item.status === 'ACTIVE' ? '#DCFCE7' : '#E5E7EB' }]}>
                  <Text style={[styles.badgeText, { color: item.status === 'ACTIVE' ? '#166534' : '#374151' }]}>
                    {item.status === 'ACTIVE' ? 'Ativa' : 'Cancelada'}
                  </Text>
                </View>
              </View>

              <Text selectable style={[styles.meta, { color: colors.textSecondary }]}>
                👤 {item.user?.name ?? '—'} ({item.user?.email ?? '—'})
              </Text>
              <Text selectable style={[styles.meta, { color: colors.textSecondary }]}>
                📅 {item.date} · {item.startTime}–{item.endTime}
              </Text>

              {item.status === 'ACTIVE' && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)}>
                  <Text style={styles.deleteText}>Excluir reserva</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text selectable style={[styles.empty, { color: colors.textSecondary }]}>
              {hasFilter ? 'Nenhuma reserva com esses filtros.' : 'Nenhuma reserva cadastrada.'}
            </Text>
          }
        />
      )}

      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Excluir reserva?</Text>
            <Text style={[styles.modalMsg, { color: colors.textSecondary }]}>
              Excluir a reserva de{' '}
              <Text style={{ fontWeight: '700', color: colors.text }}>{deleteTarget?.user?.name ?? 'usuário'}</Text> na
              sala <Text style={{ fontWeight: '700', color: colors.text }}>{deleteTarget?.room?.name ?? ''}</Text>?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost, { borderColor: colors.backgroundSelected }]}
                onPress={() => setDeleteTarget(null)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDanger, deleting && { opacity: 0.6 }]}
                onPress={confirmDelete}
                disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Excluir</Text>
                )}
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
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    alignItems: 'center',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.two,
  },
  filterInput: { flexGrow: 1, minWidth: 120 },
  clearBtn: { paddingHorizontal: Spacing.two, paddingVertical: 6 },
  clearText: { color: '#1976D2', fontWeight: '700', fontSize: 13 },
  list: { gap: Spacing.two, padding: Spacing.four, paddingTop: Spacing.two },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: Spacing.three,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: { fontSize: 16, fontWeight: '700', flex: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  meta: { fontSize: 13 },
  deleteBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: 4,
  },
  deleteText: { color: '#DC2626', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: Spacing.five },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    padding: Spacing.three,
  },
  errorText: { color: '#B91C1C', fontSize: 14 },
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
