import { renderHook, waitFor, act } from '@testing-library/react';
import { useMyReservations } from './useReservations';
import { reservationService } from '../services/reservationService';

// T26: teste unitário de hook customizado (mockando o serviço)
jest.mock('../services/reservationService', () => ({
  reservationService: {
    listMine: jest.fn(),
    listAll: jest.fn(),
    create: jest.fn(),
    cancel: jest.fn(),
    listByRoom: jest.fn(),
  },
}));

const mockedListMine = reservationService.listMine as jest.Mock;

describe('useMyReservations (hook)', () => {
  afterEach(() => jest.clearAllMocks());

  it('começa carregando e depois traz as reservas do usuário', async () => {
    mockedListMine.mockResolvedValue([
      {
        id: '1',
        roomId: 'r1',
        userId: 'u1',
        date: '2026-07-10',
        startTime: '10:00',
        endTime: '11:00',
        status: 'ACTIVE',
        createdAt: '',
      },
    ]);

    const { result } = renderHook(() => useMyReservations());

    // estado inicial: carregando
    expect(result.current.isLoading).toBe(true);

    // depois do fetch: dados carregados
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reservations).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('define mensagem de erro quando o serviço falha', async () => {
    mockedListMine.mockRejectedValue(new Error('Falha de rede'));

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Falha de rede');
    expect(result.current.reservations).toHaveLength(0);
  });

  it('refetch recarrega as reservas', async () => {
    mockedListMine.mockResolvedValue([]);
    const { result } = renderHook(() => useMyReservations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedListMine).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.refetch();
    });
    expect(mockedListMine).toHaveBeenCalledTimes(2);
  });
});
