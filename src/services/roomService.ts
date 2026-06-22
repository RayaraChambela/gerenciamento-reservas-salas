import { api } from './api';
import { Room } from '../types';

export const roomService = {
  list: () => api.get<Room[]>('/rooms'),
  get: (id: string) => api.get<Room>(`/rooms/${id}`),
  create: (data: Omit<Room, 'id' | 'isAvailable'>) => api.post<Room>('/rooms', data),
  update: (id: string, data: Partial<Room>) => api.put<Room>(`/rooms/${id}`, data),
  delete: (id: string) => api.delete<void>(`/rooms/${id}`),
};
