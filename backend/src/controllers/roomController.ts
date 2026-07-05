import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendError } from '../utils/apiError';
import { getLocalDateTimeParts } from '../utils/dateTime';

type RoomInput = {
  name?: unknown;
  description?: unknown;
  capacity?: unknown;
  location?: unknown;
  isAvailable?: unknown;
};

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseCapacity(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return Number.NaN;
}

async function roomNameExists(name: string, ignoreId?: string) {
  const rooms = await prisma.room.findMany({
    select: { id: true, name: true },
  });

  return rooms.some(
    (room) =>
      room.id !== ignoreId &&
      room.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
}

async function hasCurrentActiveReservation(roomId: string) {
  const now = getLocalDateTimeParts();
  const activeNow = await prisma.reservation.findFirst({
    where: {
      roomId,
      status: 'ACTIVE',
      date: now.date,
      startTime: { lt: now.time },
      endTime: { gt: now.time },
    },
    select: { id: true },
  });

  return Boolean(activeNow);
}

async function withCalculatedAvailability<T extends { id: string; isAvailable: boolean }>(
  room: T
) {
  const occupiedNow = await hasCurrentActiveReservation(room.id);
  return {
    ...room,
    isAvailable: room.isAvailable && !occupiedNow,
  };
}

export async function listRooms(req: Request, res: Response) {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' },
    });

    const roomsWithAvailability = await Promise.all(
      rooms.map((room) => withCalculatedAvailability(room))
    );

    return res.json(roomsWithAvailability);
  } catch {
    return sendError(res, 500, 'ROOM_LIST_FAILED', 'Erro ao listar salas');
  }
}

export async function getRoom(req: Request, res: Response) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
    });

    if (!room) {
      return sendError(res, 404, 'ROOM_NOT_FOUND', 'Sala nao encontrada');
    }

    return res.json(await withCalculatedAvailability(room));
  } catch {
    return sendError(res, 500, 'ROOM_GET_FAILED', 'Erro ao buscar sala');
  }
}

export async function createRoom(req: Request, res: Response) {
  const input = req.body as RoomInput;
  const name = normalizeText(input.name);
  const description = normalizeText(input.description);
  const location = normalizeText(input.location);
  const capacity = parseCapacity(input.capacity);

  if (!name || !description || !location || Number.isNaN(capacity)) {
    return sendError(res, 400, 'ROOM_REQUIRED_FIELDS', 'Preencha todos os campos obrigatorios', {
      required: ['name', 'description', 'capacity', 'location'],
    });
  }

  if (!Number.isInteger(capacity) || capacity <= 0) {
    return sendError(res, 400, 'ROOM_INVALID_CAPACITY', 'Capacidade deve ser maior que zero');
  }

  try {
    if (await roomNameExists(name)) {
      return sendError(res, 409, 'ROOM_NAME_ALREADY_EXISTS', 'Ja existe uma sala com esse nome');
    }

    const room = await prisma.room.create({
      data: {
        name,
        description,
        capacity,
        location,
        isAvailable: typeof input.isAvailable === 'boolean' ? input.isAvailable : true,
      },
    });

    return res.status(201).json(room);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return sendError(res, 409, 'ROOM_NAME_ALREADY_EXISTS', 'Ja existe uma sala com esse nome');
    }

    return sendError(res, 500, 'ROOM_CREATE_FAILED', 'Erro ao criar sala');
  }
}

export async function updateRoom(req: Request, res: Response) {
  const input = req.body as RoomInput;
  const data: Prisma.RoomUpdateInput = {};

  if ('name' in input) {
    const name = normalizeText(input.name);
    if (!name) return sendError(res, 400, 'ROOM_INVALID_NAME', 'Nome da sala e obrigatorio');
    data.name = name;
  }

  if ('description' in input) {
    const description = normalizeText(input.description);
    if (!description) {
      return sendError(res, 400, 'ROOM_INVALID_DESCRIPTION', 'Descricao da sala e obrigatoria');
    }
    data.description = description;
  }

  if ('location' in input) {
    const location = normalizeText(input.location);
    if (!location) {
      return sendError(res, 400, 'ROOM_INVALID_LOCATION', 'Localizacao da sala e obrigatoria');
    }
    data.location = location;
  }

  if ('capacity' in input) {
    const capacity = parseCapacity(input.capacity);
    if (!Number.isInteger(capacity) || capacity <= 0) {
      return sendError(res, 400, 'ROOM_INVALID_CAPACITY', 'Capacidade deve ser maior que zero');
    }
    data.capacity = capacity;
  }

  if ('isAvailable' in input) {
    if (typeof input.isAvailable !== 'boolean') {
      return sendError(res, 400, 'ROOM_INVALID_AVAILABILITY', 'Disponibilidade deve ser booleana');
    }
    data.isAvailable = input.isAvailable;
  }

  if (Object.keys(data).length === 0) {
    return sendError(res, 400, 'ROOM_EMPTY_UPDATE', 'Informe ao menos um campo para atualizar');
  }

  try {
    const existing = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return sendError(res, 404, 'ROOM_NOT_FOUND', 'Sala nao encontrada');
    }

    if (typeof data.name === 'string' && (await roomNameExists(data.name, req.params.id))) {
      return sendError(res, 409, 'ROOM_NAME_ALREADY_EXISTS', 'Ja existe uma sala com esse nome');
    }

    const room = await prisma.room.update({
      where: { id: req.params.id },
      data,
    });

    return res.json(await withCalculatedAvailability(room));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return sendError(res, 409, 'ROOM_NAME_ALREADY_EXISTS', 'Ja existe uma sala com esse nome');
    }

    return sendError(res, 500, 'ROOM_UPDATE_FAILED', 'Erro ao atualizar sala');
  }
}

export async function deleteRoom(req: Request, res: Response) {
  const now = getLocalDateTimeParts();

  try {
    const room = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!room) {
      return sendError(res, 404, 'ROOM_NOT_FOUND', 'Sala nao encontrada');
    }

    const futureActiveReservation = await prisma.reservation.findFirst({
      where: {
        roomId: req.params.id,
        status: 'ACTIVE',
        OR: [
          { date: { gt: now.date } },
          { date: now.date, endTime: { gt: now.time } },
        ],
      },
      select: { id: true },
    });

    if (futureActiveReservation) {
      return sendError(
        res,
        409,
        'ROOM_HAS_FUTURE_RESERVATIONS',
        'Nao e possivel excluir sala com reservas ativas atuais ou futuras'
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const reservations = await tx.reservation.deleteMany({
        where: { roomId: req.params.id },
      });
      await tx.room.delete({ where: { id: req.params.id } });
      return reservations;
    });

    return res.json({
      message: 'Sala excluida com sucesso',
      deletedReservations: result.count,
    });
  } catch {
    return sendError(res, 500, 'ROOM_DELETE_FAILED', 'Erro ao excluir sala');
  }
}
