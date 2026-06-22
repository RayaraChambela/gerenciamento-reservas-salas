import { useEffect, useState } from 'react';
import { Reservation } from '../types';
import { reservationService } from '../services/reservationService';

export function useMyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchReservations() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reservationService.listMine();
      setReservations(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar reservas');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchReservations(); }, []);

  return { reservations, isLoading, error, refetch: fetchReservations };
}
