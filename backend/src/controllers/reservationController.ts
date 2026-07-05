import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth';
import { sendError } from '../utils/apiError';
import { hasConflict } from '../utils/conflictChecker';
import { isPastSlot, isValidDateString, isValidTimeString } from '../utils/dateTime';

type ReservationInput = {
  roomId?: unknown;
  date?: unknown;
  startTime?: unknown;
  endTime?: unknown;
};

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeQueryValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function createReservation(req: AuthRequest, res: Response) {
  const input = req.body as ReservationInput;
  const roomId = isString(input.roomId) ? input.roomId.trim() : '';
  const date = isString(input.date) ? input.date.trim() : '';
  const startTime = isString(input.startTime) ? input.startTime.trim() : '';
  const endTime = isString(input.endTime) ? input.endTime.trim() : '';

  if (!roomId || !date || !startTime || !endTime) {
    return sendError(
      res,
      400,
      'RESERVATION_REQUIRED_FIELDS',
      'Sala, data, horario inicial e horario final sao obrigatorios',
      { required: ['roomId', 'date', 'startTime', 'endTime'] }
    );
  }

  if (!isValidDateString(date)) {
    return sendError(res, 400, 'RESERVATION_INVALID_DATE', 'Data deve estar no formato YYYY-MM-DD');
  }

  if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
    return sendError(res, 400, 'RESERVATION_INVALID_TIME', 'Horarios devem estar no formato HH:mm');
  }

  if (endTime <= startTime) {
    return sendError(
      res,
      400,
      'RESERVATION_INVALID_INTERVAL',
      'Horario final deve ser maior que o horario inicial'
    );
  }

  if (isPastSlot(date, endTime)) {
    return sendError(res, 400, 'RESERVATION_IN_PAST', 'Nao e possivel reservar horario passado');
  }

  try {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return sendError(res, 404, 'ROOM_NOT_FOUND', 'Sala nao encontrada');
    }

    if (!room.isAvailable) {
      return sendError(res, 409, 'ROOM_UNAVAILABLE', 'Sala indisponivel para reservas');
    }

    const existingReservations = await prisma.reservation.findMany({
      where: {
        roomId,
        date,
        status: 'ACTIVE',
      },
      select: {
        date: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    if (hasConflict({ date, startTime, endTime }, existingReservations)) {
      return sendError(
        res,
        409,
        'RESERVATION_TIME_CONFLICT',
        'Ja existe uma reserva ativa para esta sala neste horario'
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        roomId,
        userId: req.user!.id,
        date,
        startTime,
        endTime,
        status: 'ACTIVE',
      },
      include: {
        room: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return res.status(201).json(reservation);
  } catch {
    return sendError(res, 500, 'RESERVATION_CREATE_FAILED', 'Erro ao criar reserva');
  }
}

export async function listMyReservations(req: AuthRequest, res: Response) {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: req.user!.id },
      include: { room: true },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    });

    return res.json(reservations);
  } catch {
    return sendError(res, 500, 'RESERVATION_LIST_MINE_FAILED', 'Erro ao listar suas reservas');
  }
}

export async function listAllReservations(req: Request, res: Response) {
  const roomId = normalizeQueryValue(req.query.roomId);
  const userId = normalizeQueryValue(req.query.userId);
  const date = normalizeQueryValue(req.query.date);
  const status = normalizeQueryValue(req.query.status);

  if (date && !isValidDateString(date)) {
    return sendError(res, 400, 'RESERVATION_INVALID_DATE', 'Data deve estar no formato YYYY-MM-DD');
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        ...(roomId ? { roomId } : {}),
        ...(userId ? { userId } : {}),
        ...(date ? { date } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        room: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    });

    return res.json(reservations);
  } catch {
    return sendError(res, 500, 'RESERVATION_LIST_ALL_FAILED', 'Erro ao listar reservas');
  }
}

export async function deleteReservation(req: AuthRequest, res: Response) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        room: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!reservation) {
      return sendError(res, 404, 'RESERVATION_NOT_FOUND', 'Reserva nao encontrada');
    }

    const isOwner = reservation.userId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return sendError(
        res,
        403,
        'RESERVATION_DELETE_FORBIDDEN',
        'Apenas o dono da reserva ou um administrador pode cancelar esta reserva'
      );
    }

    const cancelled = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: {
        room: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return res.json({
      message: 'Reserva cancelada com sucesso',
      reservation: cancelled,
    });
  } catch {
    return sendError(res, 500, 'RESERVATION_DELETE_FAILED', 'Erro ao cancelar reserva');
  }
}
