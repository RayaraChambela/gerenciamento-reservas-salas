import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function ScheduleScreen() {
  const route = useRoute();
  const { salaId, salaNome } = route.params as any;
  
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = async () => {
    const token = await AsyncStorage.getItem('token'); // Recupera o token salvo no login

    if (!salaId || !date) {
      Alert.alert("Erro", "Selecione uma sala e uma data válida.");
      return;
    }

    try {
      const response = await fetch('gerenciamento-reservas-salas-master/backend/src/routes/reservations', {
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
          onChange={(event: any, selectedDate?: Date) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.dateText}>Selecionado: {date.toLocaleString()}</Text>
      
      <Button title="Confirmar Reserva" onPress={handleConfirm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, marginBottom: 20, fontWeight: 'bold' },
  dateText: { marginVertical: 20, textAlign: 'center' }
});