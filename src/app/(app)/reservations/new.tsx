import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RoomStatusBadge } from '@/components/room-status-badge';
import { Colors, Spacing } from '@/constants/theme';
import { reservationService } from '@/services/reservationService';
import { roomService } from '@/services/roomService';
import { Room } from '@/types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function NewReservationScreen() {
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams<{ roomId?: string | string[] }>();
  const roomId = useMemo(
    () => (Array.isArray(params.roomId) ? params.roomId[0] : params.roomId),
    [params.roomId]
  );

  const [room, setRoom] = useState<Room | null>(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchRoom() {
      if (!roomId) {
        setError('Sala nao informada.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await roomService.get(roomId);
        if (mounted) setRoom(data);
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : 'Erro ao carregar sala.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchRoom();
    return () => { mounted = false; };
  }, [roomId]);

  function validateForm() {
    if (!roomId || !date.trim() || !startTime.trim() || !endTime.trim()) {
      return 'Preencha data, inicio e fim.';
    }

    if (!DATE_PATTERN.test(date.trim())) {
      return 'Data deve estar no formato YYYY-MM-DD.';
    }

    if (!TIME_PATTERN.test(startTime.trim()) || !TIME_PATTERN.test(endTime.trim())) {
      return 'Horarios devem estar no formato HH:mm.';
    }

    if (endTime.trim() <= startTime.trim()) {
      return 'Horario final deve ser maior que o inicial.';
    }

    if (room && !room.isAvailable) {
      return 'Esta sala esta ocupada no momento.';
    }

    return null;
  }

  async function handleSubmit() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await reservationService.create({
        roomId: roomId!,
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      });
      router.replace('/(app)/reservations/history' as any);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar reserva.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color="#1976D2" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.roomCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <Text selectable style={[styles.roomName, { color: colors.text }]}>
              {room?.name ?? 'Sala'}
            </Text>
            <Text selectable style={[styles.roomMeta, { color: colors.textSecondary }]}>
              {room ? `Local: ${room.location}` : 'Sala nao encontrada'}
            </Text>
          </View>
          {room && <RoomStatusBadge isAvailable={room.isAvailable} compact />}
        </View>

        {room && (
          <Text selectable style={[styles.roomMeta, { color: colors.textSecondary }]}>
            Capacidade: {room.capacity}
          </Text>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Data</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? colors.backgroundElement : '#F5F7FA',
                borderColor: isDark ? '#333' : '#E0E4EA',
                color: colors.text,
              },
            ]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={date}
            onChangeText={setDate}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.timeRow}>
          <View style={[styles.fieldGroup, styles.timeField]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Inicio</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.backgroundElement : '#F5F7FA',
                  borderColor: isDark ? '#333' : '#E0E4EA',
                  color: colors.text,
                },
              ]}
              placeholder="HH:mm"
              placeholderTextColor={colors.textSecondary}
              value={startTime}
              onChangeText={setStartTime}
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.fieldGroup, styles.timeField]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Fim</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.backgroundElement : '#F5F7FA',
                  borderColor: isDark ? '#333' : '#E0E4EA',
                  color: colors.text,
                },
              ]}
              placeholder="HH:mm"
              placeholderTextColor={colors.textSecondary}
              value={endTime}
              onChangeText={setEndTime}
              autoCapitalize="none"
            />
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text selectable style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, (isSaving || !room?.isAvailable) && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSaving || !room?.isAvailable}>
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Confirmar reserva</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  roomCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  roomHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  roomInfo: {
    flex: 1,
    gap: 2,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
  },
  roomMeta: {
    fontSize: 13,
  },
  form: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  timeField: {
    flex: 1,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: Spacing.two,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#1976D2',
    borderRadius: 10,
    paddingVertical: Spacing.three,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
