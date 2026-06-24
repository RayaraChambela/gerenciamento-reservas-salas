// T19 — Rayara
// Implementar função pura hasConflict(newSlot, existingSlots) que verifica
// sobreposição de horários. Deve cobrir: sobreposição total, parcial e
// horários adjacentes (sem conflito). Será usada no backend (criação de reserva)
// e reutilizada no frontend (validação client-side).

export interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  date: string;      // YYYY-MM-DD
}

export function hasConflict(newSlot: TimeSlot, existing: TimeSlot[]): boolean {
  // TODO (T19 — Rayara): implementar lógica de verificação de conflito
  return false;
}
