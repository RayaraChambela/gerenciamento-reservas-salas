export interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  date: string;      // YYYY-MM-DD
}

export function hasConflict(newSlot: TimeSlot, existing: TimeSlot[]): boolean {
  return existing.some(
    (r) =>
      r.date === newSlot.date &&
      newSlot.startTime < r.endTime &&
      newSlot.endTime > r.startTime
  );
}
