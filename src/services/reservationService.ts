import { api } from './api';
import { Reservation } from '../types';

export interface CreateReservationData {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const reservationService = {
  create: (data: CreateReservationData) => api.post<Reservation>('/reservations', data),
  listMine: () => api.get<Reservation[]>('/reservations/me'),
  listAll: (params?: { roomId?: string; date?: string; userId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<Reservation[]>(`/reservations${query ? `?${query}` : ''}`);
  },
  cancel: (id: string) => api.delete<void>(`/reservations/${id}`),
};
