import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function ScheduleScreen() {
  const route = useRoute();
  const { salaId, salaNome } = route.params as { salaId: string; salaNome: string };
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const checkConflict = async (selectedDate: Date) => {
    try {
      const response = await fetch(`SUA_URL_DO_BACKEND/reservations/sala/${salaId}`);
      if (!response.ok) return;

      const reservasExistentes = await response.json();

      const conflito = reservasExistentes.some((r: any) => {
        const dataExistente = new Date(r.dataReserva);
        return dataExistente.getTime() === selectedDate.getTime();
      });

      if (conflito) {
        setErrorMessage("Horário já ocupado! Escolha outro.");
      } else {
        setErrorMessage(null);
      }
    } catch (e) {
      console.error("Erro ao verificar conflitos:", e);
    }
  };

  const handleConfirm = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!salaId || !date) {
      Alert.alert("Erro", "Selecione uma sala e uma data válida.");
      return;
    }

    try {
      const response = await fetch('SUA_URL_DO_BACKEND/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          salaId: salaId,
          dataReserva: date.toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Reserva realizada!");
      } else {
        Alert.alert("Erro", "Falha ao reservar sala.");
      }
    } catch (err) {
      Alert.alert("Erro", "Servidor indisponível.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservar: {salaNome}</Text>

      <Button title="Escolher Data e Hora" onPress={() => setShowPicker(true)} />

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          is24Hour={true}
          onChange={async (event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowPicker(false);
            if (selectedDate) {
              setDate(selectedDate);
              await checkConflict(selectedDate);
            }
          }}
        />
      )}

      <Text style={styles.dateText}>Selecionado: {date.toLocaleString()}</Text>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <Button 
        title="Confirmar Reserva" 
        onPress={handleConfirm} 
        disabled={!!errorMessage} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center',
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 20, 
    marginBottom: 20, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  dateText: { 
    marginVertical: 20, 
    textAlign: 'center', 
    fontSize: 16 
  },
  errorText: { 
    color: 'red', 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 10 
  }
});