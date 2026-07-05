import { StyleSheet, Text, View } from 'react-native';

type RoomStatusBadgeProps = {
  isAvailable: boolean;
  compact?: boolean;
};

export function RoomStatusBadge({ isAvailable, compact = false }: RoomStatusBadgeProps) {
  const palette = isAvailable
    ? { background: '#DCFCE7', border: '#86EFAC', text: '#166534', dot: '#16A34A' }
    : { background: '#FEE2E2', border: '#FCA5A5', text: '#991B1B', dot: '#DC2626' };

  return (
    <View
      accessibilityLabel={isAvailable ? 'Sala disponivel' : 'Sala ocupada'}
      style={[
        styles.badge,
        compact && styles.compact,
        { backgroundColor: palette.background, borderColor: palette.border },
      ]}>
      <View style={[styles.dot, { backgroundColor: palette.dot }]} />
      <Text style={[styles.text, compact && styles.compactText, { color: palette.text }]}>
        {isAvailable ? 'Disponivel' : 'Ocupada'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactText: {
    fontSize: 11,
  },
});
