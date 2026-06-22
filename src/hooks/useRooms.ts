import { useEffect, useState } from 'react';
import { Room } from '../types';
import { roomService } from '../services/roomService';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchRooms() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roomService.list();
      setRooms(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar salas');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchRooms(); }, []);

  return { rooms, isLoading, error, refetch: fetchRooms };
}
