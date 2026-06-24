import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Modal, ScrollView, useColorScheme, Platform,
} from 'react-native';
import { roomService } from '@/services/roomService';
import { Room } from '@/types';
import { Colors, Spacing } from '@/constants/theme';

type RoomForm = { name: string; description: string; capacity: string; location: string };
const emptyForm: RoomForm = { name: '', description: '', capacity: '', location: '' };

const fields: { key: keyof RoomForm; label: string; placeholder: string; numeric?: boolean }[] = [
  { key: 'name',        label: 'Nome da sala',   placeholder: 'Ex: Laboratório 01' },
  { key: 'location',    label: 'Localização',    placeholder: 'Ex: Bloco B, 2º andar' },
  { key: 'capacity',    label: 'Capacidade',     placeholder: 'Nº de pessoas', numeric: true },
  { key: 'description', label: 'Descrição',      placeholder: 'Descreva a sala brevemente' },
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
  const [error, setError] = useState<string | null>(null);

  async function fetchRooms() {
    setIsLoading(true);
    try { setRooms(await roomService.list()); }
    catch { setError('Erro ao carregar salas.'); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { fetchRooms(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalVisible(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setForm({ name: room.name, description: room.description, capacity: String(room.capacity), location: room.location });
    setError(null);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!form.name || !form.description || !form.capacity || !form.location) {
      setError('Preencha todos os campos.');
      return;
    }
    if (Number(form.capacity) <= 0) {
      setError('Capacidade deve ser maior que zero.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await roomService.update(editing.id, { ...form, capacity: Number(form.capacity) });
      } else {
        await roomService.create({ ...form, capacity: Number(form.capacity) });
      }
      setModalVisible(false);
      fetchRooms();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await roomService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchRooms();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Não foi possível excluir.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Cabeçalho da página */}
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

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.six }} color="#1976D2" size="large" />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: isDark ? colors.backgroundElement : '#fff', borderColor: colors.backgroundSelected }]}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardIconBox}>
                    <Text style={styles.cardIcon}>🏢</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.roomName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.roomMeta, { color: colors.textSecondary }]}>
                      📍 {item.location}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.isAvailable ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={[styles.statusText, { color: item.isAvailable ? '#065F46' : '#991B1B' }]}>
                    {item.isAvailable ? 'Disponível' : 'Ocupada'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.roomDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={[styles.cardFooter, { borderTopColor: colors.backgroundSelected }]}>
                <View style={styles.capacityTag}>
                  <Text style={[styles.capacityText, { color: colors.textSecondary }]}>
                    👥 {item.capacity} pessoas
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEdit(item)}>
                    <Text style={styles.editBtnText}>✏ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => setDeleteTarget(item)}>
                    <Text style={styles.deleteBtnText}>🗑 Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma sala cadastrada</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Clique em "Nova Sala" para começar
              </Text>
            </View>
          }
        />
      )}

      {/* Modal criar/editar */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editing ? 'Editar Sala' : 'Nova Sala'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={{ color: colors.textSecondary, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {fields.map((f) => (
                <View key={f.key} style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{f.label}</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: isDark ? colors.backgroundElement : '#F5F7FA',
                      color: colors.text,
                      borderColor: isDark ? '#333' : '#E0E4EA',
                    }]}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.textSecondary}
                    value={form[f.key]}
                    onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                    keyboardType={f.numeric ? 'numeric' : 'default'}
                    multiline={f.key === 'description'}
                    numberOfLines={f.key === 'description' ? 3 : 1}
                  />
                </View>
              ))}

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠ {error}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.footerBtn, { borderColor: colors.backgroundSelected, borderWidth: 1 }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.footerBtn, styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal confirmação de exclusão */}
      <Modal visible={!!deleteTarget} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={[styles.confirmModal, { backgroundColor: colors.background }]}>
            <Text style={styles.confirmIcon}>🗑</Text>
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Excluir sala?</Text>
            <Text style={[styles.confirmMsg, { color: colors.textSecondary }]}>
              Tem certeza que deseja excluir{'\n'}
              <Text style={{ fontWeight: '700', color: colors.text }}>"{deleteTarget?.name}"</Text>?{'\n'}
              Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={[styles.footerBtn, { borderColor: colors.backgroundSelected, borderWidth: 1 }]} onPress={() => setDeleteTarget(null)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.footerBtn, styles.deleteBtnModal, deleting && { opacity: 0.6 }]} onPress={handleDelete} disabled={deleting}>
                {deleting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Excluir</Text>}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 20, fontWeight: '700' },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  list: { padding: Spacing.four, gap: Spacing.three },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } as any }),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    paddingBottom: Spacing.two,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: { fontSize: 20 },
  cardInfo: { flex: 1 },
  roomName: { fontSize: 16, fontWeight: '700' },
  roomMeta: { fontSize: 13, marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  roomDesc: {
    fontSize: 13,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  capacityTag: {},
  capacityText: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionBtn: { paddingHorizontal: Spacing.two + 2, paddingVertical: 6, borderRadius: 6 },
  editBtn: { backgroundColor: '#EFF6FF' },
  editBtnText: { color: '#1976D2', fontSize: 13, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  deleteBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: Spacing.six, gap: Spacing.two },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeBtn: { padding: 4 },
  fieldGroup: { marginBottom: Spacing.three },
  fieldLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 15,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  errorText: { color: '#B91C1C', fontSize: 14 },
  modalFooter: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  footerBtn: {
    flex: 1,
    paddingVertical: Spacing.two + 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtn: { backgroundColor: '#1976D2' },
  confirmModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  confirmIcon: { fontSize: 40, marginBottom: 4 },
  confirmTitle: { fontSize: 20, fontWeight: '700' },
  confirmMsg: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  confirmActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two, width: '100%' },
  deleteBtnModal: { backgroundColor: '#DC2626' },
});
