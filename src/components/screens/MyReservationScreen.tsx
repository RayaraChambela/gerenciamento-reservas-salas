import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface Reservation {
  id: string;
  sala: { nome: string };
  dataReserva: string;
  status: string;
}

export default function MyReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch('SUA_URL_DO_BACKEND/reservations/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Reservation }) => {
    const dataReserva = new Date(item.dataReserva);
    const ehFutura = dataReserva > new Date();

    return (
      <View style={[styles.card, ehFutura ? styles.cardFutura : styles.cardPassada]}>
        <Text style={styles.sala}>{item.sala.nome}</Text>
        <Text>{dataReserva.toLocaleDateString()} - {dataReserva.toLocaleTimeString()}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
        <Text style={styles.tag}>{ehFutura ? "FUTURA" : "PASSADA"}</Text>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Reservas</Text>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: { padding: 15, borderRadius: 10, marginBottom: 10, backgroundColor: '#fff' },
  cardFutura: { borderLeftWidth: 5, borderLeftColor: '#4CAF50' },
  cardPassada: { borderLeftWidth: 5, borderLeftColor: '#9E9E9E' },
  sala: { fontSize: 18, fontWeight: 'bold' },
  status: { fontStyle: 'italic', marginTop: 5 },
  tag: { fontWeight: 'bold', alignSelf: 'flex-end' }
});