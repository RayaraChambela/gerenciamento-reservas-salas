import { hasConflict, TimeSlot } from './conflictChecker';

// T26: testes unitários da função de validação de conflito de horários (T19)
describe('hasConflict', () => {
  const base: TimeSlot = {
    date: '2026-07-10',
    startTime: '10:00',
    endTime: '11:00',
    status: 'ACTIVE',
  };

  it('não acusa conflito quando não há reservas', () => {
    expect(hasConflict({ date: '2026-07-10', startTime: '10:00', endTime: '11:00' }, [])).toBe(false);
  });

  it('acusa conflito em sobreposição total (mesmo horário)', () => {
    expect(hasConflict({ date: '2026-07-10', startTime: '10:00', endTime: '11:00' }, [base])).toBe(true);
  });

  it('acusa conflito em sobreposição parcial', () => {
    // começa no meio da reserva existente
    expect(hasConflict({ date: '2026-07-10', startTime: '10:30', endTime: '11:30' }, [base])).toBe(true);
    // termina no meio da reserva existente
    expect(hasConflict({ date: '2026-07-10', startTime: '09:30', endTime: '10:30' }, [base])).toBe(true);
    // engloba totalmente a reserva existente
    expect(hasConflict({ date: '2026-07-10', startTime: '09:00', endTime: '12:00' }, [base])).toBe(true);
  });

  it('NÃO acusa conflito em horários adjacentes (fim = início)', () => {
    // nova reserva começa exatamente quando a existente termina
    expect(hasConflict({ date: '2026-07-10', startTime: '11:00', endTime: '12:00' }, [base])).toBe(false);
    // nova reserva termina exatamente quando a existente começa
    expect(hasConflict({ date: '2026-07-10', startTime: '09:00', endTime: '10:00' }, [base])).toBe(false);
  });

  it('NÃO acusa conflito em datas diferentes', () => {
    expect(hasConflict({ date: '2026-07-11', startTime: '10:00', endTime: '11:00' }, [base])).toBe(false);
  });

  it('ignora reservas canceladas', () => {
    const cancelada: TimeSlot = { ...base, status: 'CANCELLED' };
    expect(hasConflict({ date: '2026-07-10', startTime: '10:00', endTime: '11:00' }, [cancelada])).toBe(false);
  });

  it('detecta conflito quando uma entre várias reservas sobrepõe', () => {
    const existentes: TimeSlot[] = [
      { date: '2026-07-10', startTime: '08:00', endTime: '09:00', status: 'ACTIVE' },
      { date: '2026-07-10', startTime: '10:30', endTime: '11:30', status: 'ACTIVE' },
    ];
    expect(hasConflict({ date: '2026-07-10', startTime: '11:00', endTime: '12:00' }, existentes)).toBe(true);
  });
});
