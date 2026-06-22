import { Request, Response } from 'express';

export async function createReservation(req: Request, res: Response) {
  // TODO (T17): validar conflito de horário antes de criar
  res.status(501).json({ message: 'Não implementado' });
}

export async function listMyReservations(req: Request, res: Response) {
  // TODO (T18): reservas do usuário autenticado
  res.status(501).json({ message: 'Não implementado' });
}

export async function listAllReservations(req: Request, res: Response) {
  // TODO (T18): ADMIN only, com filtros por sala/data/usuário
  res.status(501).json({ message: 'Não implementado' });
}

export async function deleteReservation(req: Request, res: Response) {
  // TODO (T18): dono cancela própria, ADMIN cancela qualquer
  res.status(501).json({ message: 'Não implementado' });
}
