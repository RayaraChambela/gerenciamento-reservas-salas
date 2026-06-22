import { Reservation } from '../types';

export function hasConflict(
  newSlot: { date: string; startTime: string; endTime: string },
  existing: Pick<Reservation, 'date' | 'startTime' | 'endTime' | 'status'>[]
): boolean {
  return existing
    .filter((r) => r.status === 'ACTIVE' && r.date === newSlot.date)
    .some((r) => newSlot.startTime < r.endTime && newSlot.endTime > r.startTime);
}
