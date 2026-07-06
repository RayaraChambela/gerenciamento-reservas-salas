// T20: seletor visual de data/hora no NAVEGADOR (usa o input nativo do browser)
export interface DateTimeFieldProps {
  mode: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  backgroundColor: string;
  borderColor: string;
  color: string;
  placeholderColor: string;
}

export function DateTimeField({ mode, value, onChange, backgroundColor, borderColor, color }: DateTimeFieldProps) {
  return (
    <input
      type={mode === 'date' ? 'date' : 'time'}
      value={value}
      onChange={(e) => onChange((e.target as HTMLInputElement).value)}
      style={{
        backgroundColor,
        color,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        fontSize: 16,
        padding: 12,
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    />
  );
}
