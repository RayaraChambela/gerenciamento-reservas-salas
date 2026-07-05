import { Reservation } from '../types';

export type ReservationSlot = Pick<Reservation, 'date' | 'startTime' | 'endTime' | 'status'>;

export function hasConflict(
  newSlot: { date: string; startTime: string; endTime: string },
  existing: ReservationSlot[]
): boolean {
  return existing.some(
    (reservation) =>
      reservation.status === 'ACTIVE' &&
      reservation.date === newSlot.date &&
      newSlot.startTime < reservation.endTime &&
      newSlot.endTime > reservation.startTime
  );
}
