import { Request, Response } from 'express';
import prisma from '../config/database';

// T09: listar salas — T10: com disponibilidade por data/horário
export async function listRooms(req: Request, res: Response) {
  const { date, startTime, endTime } = req.query as Record<string, string>;

  const rooms = await prisma.room.findMany({ orderBy: { name: 'asc' } });

  if (!date || !startTime || !endTime) {
    return res.json(rooms);
  }

  // T10: cruzar com reservas para indicar disponibilidade no período consultado
  const roomsWithAvailability = await Promise.all(
    rooms.map(async (room) => {
      const conflict = await prisma.reservation.findFirst({
        where: {
          roomId: room.id,
          date,
          status: 'ACTIVE',
          AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
      });
      return { ...room, isAvailable: !conflict };
    })
  );

  return res.json(roomsWithAvailability);
}

export async function getRoom(req: Request, res: Response) {
  const room = await prisma.room.findUnique({ where: { id: req.params.id } });
  if (!room) return res.status(404).json({ error: 'Sala não encontrada.' });
  return res.json(room);
}

// T09: criação — apenas ADMIN (protegido na rota)
export async function createRoom(req: Request, res: Response) {
  const { name, description, capacity, location } = req.body;

  if (!name || !description || !location || capacity === undefined) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  if (Number(capacity) <= 0) {
    return res.status(400).json({ error: 'Capacidade deve ser maior que zero.' });
  }

  try {
    const room = await prisma.room.create({
      data: { name, description, capacity: Number(capacity), location },
    });
    return res.status(201).json(room);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2002') return res.status(409).json({ error: 'Já existe uma sala com esse nome.' });
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateRoom(req: Request, res: Response) {
  const { name, description, capacity, location, isAvailable } = req.body;

  if (capacity !== undefined && Number(capacity) <= 0) {
    return res.status(400).json({ error: 'Capacidade deve ser maior que zero.' });
  }

  try {
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(location && { location }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });
    return res.json(room);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return res.status(404).json({ error: 'Sala não encontrada.' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'Já existe uma sala com esse nome.' });
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// T13 
// Antes de excluir: verificar se há reservas futuras ativas para esta sala.
// Retornar 409 se houver. Só então executar o delete.
export async function deleteRoom(req: Request, res: Response) {
  try {
    await prisma.room.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return res.status(404).json({ error: 'Sala não encontrada.' });
    return res.status(500).json({ error: 'Erro interno.' });
  }
}
