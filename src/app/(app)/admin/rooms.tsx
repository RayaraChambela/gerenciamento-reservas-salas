import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { RoomStatusBadge } from '@/components/room-status-badge';
import { Colors, Spacing } from '@/constants/theme';
import { roomService } from '@/services/roomService';
import { Room } from '@/types';

type RoomForm = { name: string; description: string; capacity: string; location: string };

const emptyForm: RoomForm = { name: '', description: '', capacity: '', location: '' };

const fields: { key: keyof RoomForm; label: string; placeholder: string; numeric?: boolean }[] = [
  { key: 'name', label: 'Nome da sala', placeholder: 'Ex: Laboratorio 01' },
  { key: 'location', label: 'Localizacao', placeholder: 'Ex: Bloco B, 2 andar' },
  { key: 'capacity', label: 'Capacidade', placeholder: 'Numero de pessoas', numeric: true },
  { key: 'description', label: 'Descricao', placeholder: 'Descreva a sala brevemente' },
];

export default function AdminRoomsScreen() {
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);

  async function fetchRooms() {
    setIsLoading(true);
    setScreenError(null);
    try {
      setRooms(await roomService.list());
    } catch (e: unknown) {
      setScreenError(e instanceof Error ? e.message : 'Erro ao carregar salas.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchRooms(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalVisible(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setForm({
      name: room.name,
      description: room.description,
      capacity: String(room.capacity),
      location: room.location,
    });
    setFormError(null);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.description.trim() || !form.capacity.trim() || !form.location.trim()) {
      setFormError('Preencha todos os campos.');
      return;
    }

    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity <= 0) {
      setFormError('Capacidade deve ser maior que zero.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        capacity,
        location: form.location.trim(),
      };

      if (editing) {
        await roomService.update(editing.id, payload);
      } else {
        await roomService.create(payload);
      }

      setModalVisible(false);
      await fetchRooms();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Erro ao salvar sala.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setScreenError(null);

    try {
      await roomService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchRooms();
    } catch (e: unknown) {
      setScreenError(e instanceof Error ? e.message : 'Nao foi possivel excluir a sala.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.pageHeader, { borderBottomColor: colors.backgroundElement }]}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Gerenciar Salas</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            {rooms.length} {rooms.length === 1 ? 'sala cadastrada' : 'salas cadastradas'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ Nova Sala</Text>
        </TouchableOpacity>
      </View>

      {screenError && (
        <View style={styles.screenErrorBox}>
          <Text selectable style={styles.errorText}>{screenError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color="#1976D2" size="large" />
          {[0, 1, 2].map((item) => (
            <View
              key={item}
              style={[
                styles.card,
                styles.skeletonCard,
                { backgroundColor: isDark ? colors.backgroundElement : '#fff', borderColor: colors.backgroundSelected },
              ]}>
              <View style={[styles.skeletonLine, { width: '40%' }]} />
              <View style={[styles.skeletonLine, { width: '65%' }]} />
              <View style={[styles.skeletonLine, { width: '50%' }]} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(room) => room.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: isDark ? colors.backgroundElement : '#fff', borderColor: colors.backgroundSelected },
              ]}>
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text selectable style={[styles.roomName, { color: colors.text }]}>{item.name}</Text>
                  <Text selectable style={[styles.roomMeta, { color: colors.textSecondary }]}>
                    Local: {item.location}
                  </Text>
                </View>
                <RoomStatusBadge isAvailable={item.isAvailable} compact />
              </View>

              <Text selectable style={[styles.roomDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={[styles.cardFooter, { borderTopColor: colors.backgroundSelected }]}>
                <Text selectable style={[styles.capacityText, { color: colors.textSecondary }]}>
                  Capacidade: {item.capacity}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEdit(item)}>
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => setDeleteTarget(item)}>
                    <Text style={styles.deleteBtnText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma sala cadastrada</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Crie uma sala para disponibilizar reservas.
              </Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editing ? 'Editar Sala' : 'Nova Sala'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={{ color: colors.textSecondary, fontSize: 20 }}>x</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {fields.map((field) => (
                <View key={field.key} style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{field.label}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? colors.backgroundElement : '#F5F7FA',
                        color: colors.text,
                        borderColor: isDark ? '#333' : '#E0E4EA',
                      },
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textSecondary}
                    value={form[field.key]}
                    onChangeText={(value) => setForm((prev) => ({ ...prev, [field.key]: value }))}
                    keyboardType={field.numeric ? 'numeric' : 'default'}
                    multiline={field.key === 'description'}
                    numberOfLines={field.key === 'description' ? 3 : 1}
                  />
                </View>
              ))}

              {formError && (
                <View style={styles.errorBox}>
                  <Text selectable style={styles.errorText}>{formError}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerBtn, { borderColor: colors.backgroundSelected, borderWidth: 1 }]}
                onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerBtn, styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryButtonText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!deleteTarget} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={[styles.confirmModal, { backgroundColor: colors.background }]}>
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Excluir sala?</Text>
            <Text selectable style={[styles.confirmMsg, { color: colors.textSecondary }]}>
              {deleteTarget?.name}
            </Text>
            <Text selectable style={[styles.confirmHelp, { color: colors.textSecondary }]}>
              Salas com reservas ativas atuais ou futuras nao podem ser excluidas.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.footerBtn, { borderColor: colors.backgroundSelected, borderWidth: 1 }]}
                onPress={() => setDeleteTarget(null)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerBtn, styles.deleteBtnModal, deleting && { opacity: 0.6 }]}
                onPress={handleDelete}
                disabled={deleting}>
                {deleting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryButtonText}>Excluir</Text>}
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
  pageHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  pageTitle: { fontSize: 20, fontWeight: '700' },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  screenErrorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    padding: Spacing.three,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  loadingBlock: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  skeletonCard: {
    gap: Spacing.two,
    minHeight: 116,
    padding: Spacing.three,
  },
  skeletonLine: {
    backgroundColor: 'rgba(25, 118, 210, 0.16)',
    borderRadius: 6,
    height: 12,
  },
  list: { gap: Spacing.three, padding: Spacing.four },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } as any }),
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
    padding: Spacing.three,
    paddingBottom: Spacing.two,
  },
  cardInfo: { flex: 1, gap: 2 },
  roomName: { fontSize: 16, fontWeight: '700' },
  roomMeta: { fontSize: 13 },
  roomDesc: {
    fontSize: 13,
    lineHeight: 18,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  cardFooter: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  capacityText: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionBtn: { borderRadius: 6, paddingHorizontal: Spacing.two + 2, paddingVertical: 6 },
  editBtn: { backgroundColor: '#EFF6FF' },
  editBtnText: { color: '#1976D2', fontSize: 13, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  deleteBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  emptyState: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.six },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14 },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modal: {
    borderRadius: 16,
    maxHeight: '90%',
    maxWidth: 520,
    padding: Spacing.four,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeBtn: { padding: 4 },
  fieldGroup: { marginBottom: Spacing.three },
  fieldLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: Spacing.two,
    padding: Spacing.two,
  },
  errorText: { color: '#B91C1C', fontSize: 14 },
  modalFooter: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  footerBtn: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    paddingVertical: Spacing.two + 4,
  },
  saveBtn: { backgroundColor: '#1976D2' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  confirmModal: {
    alignItems: 'center',
    borderRadius: 16,
    gap: Spacing.two,
    maxWidth: 380,
    padding: Spacing.four,
    width: '100%',
  },
  confirmTitle: { fontSize: 20, fontWeight: '700' },
  confirmMsg: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  confirmHelp: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  confirmActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two, width: '100%' },
  deleteBtnModal: { backgroundColor: '#DC2626' },
});
