export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  isAvailable: boolean;
}

export interface Reservation {
  id: string;
  roomId: string;
  room?: Room;
  userId: string;
  user?: User;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  status: 'ACTIVE' | 'CANCELLED';
  createdAt: string;
}
