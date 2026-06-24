// T19 — Rayara
// Versão frontend da função de conflito de horários.
// Reutilizar a mesma lógica do backend para validação client-side (T21).

import { Reservation } from '../types';

export function hasConflict(
  newSlot: { date: string; startTime: string; endTime: string },
  existing: Pick<Reservation, 'date' | 'startTime' | 'endTime' | 'status'>[]
): boolean {
  // TODO (T19 — Rayara): implementar lógica de verificação de conflito
  return false;
}
