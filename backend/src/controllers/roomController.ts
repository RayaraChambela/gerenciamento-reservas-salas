import { Request, Response } from 'express';

export async function listRooms(req: Request, res: Response) {
  // TODO (T09/T10): listar salas com disponibilidade
  res.status(501).json({ message: 'Não implementado' });
}

export async function getRoom(req: Request, res: Response) {
  res.status(501).json({ message: 'Não implementado' });
}

export async function createRoom(req: Request, res: Response) {
  // TODO (T09): ADMIN only
  res.status(501).json({ message: 'Não implementado' });
}

export async function updateRoom(req: Request, res: Response) {
  res.status(501).json({ message: 'Não implementado' });
}

export async function deleteRoom(req: Request, res: Response) {
  // TODO (T13): bloquear se houver reservas futuras
  res.status(501).json({ message: 'Não implementado' });
}
