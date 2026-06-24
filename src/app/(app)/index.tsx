import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { roomService } from '@/services/roomService';
import { Room } from '@/types';
import { Colors, Spacing } from '@/constants/theme';

export default function RoomsScreen() {
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    roomService.list()
      .then(setRooms)
      .catch(() => setError('Não foi possível carregar as salas.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Salas Disponíveis</Text>

      {/* T16 — Igor: adicionar loading spinner e tratamento de erro de rede aqui */}

      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.roomName, { color: colors.text }]}>{item.name}</Text>
              {/* T14 — Igor: substituir por componente StatusBadge reutilizável */}
              <Text style={{ color: colors.textSecondary }}>
                {item.isAvailable ? 'Disponível' : 'Ocupada'}
              </Text>
            </View>
            <Text style={[styles.roomInfo, { color: colors.textSecondary }]}>
              📍 {item.location} · 👥 {item.capacity} pessoas
            </Text>
            <Text style={[styles.roomDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => router.push(`/(app)/reservations/new?roomId=${item.id}`)}>
              <Text style={styles.detailBtnText}>Ver Detalhes</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            Nenhuma sala cadastrada ainda.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.four },
  card: {
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { fontSize: 16, fontWeight: '700', flex: 1 },
  roomInfo: { fontSize: 13 },
  roomDesc: { fontSize: 13 },
  detailBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  detailBtnText: { color: '#1976D2', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: Spacing.five },
});
