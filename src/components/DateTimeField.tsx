import { StyleSheet, TextInput } from 'react-native';

// T20: versão nativa (celular). O seletor visual do navegador está em DateTimeField.web.tsx.
// Em um build nativo real, aqui entraria o DateTimePicker do @react-native-community/datetimepicker.
export interface DateTimeFieldProps {
  mode: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  backgroundColor: string;
  borderColor: string;
  color: string;
  placeholderColor: string;
}

export function DateTimeField({
  mode,
  value,
  onChange,
  backgroundColor,
  borderColor,
  color,
  placeholderColor,
}: DateTimeFieldProps) {
  return (
    <TextInput
      style={[styles.input, { backgroundColor, borderColor, color }]}
      value={value}
      onChangeText={onChange}
      placeholder={mode === 'date' ? 'AAAA-MM-DD' : 'HH:mm'}
      placeholderTextColor={placeholderColor}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
