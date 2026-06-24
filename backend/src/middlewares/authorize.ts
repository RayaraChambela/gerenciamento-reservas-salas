import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

// T03 
// Verificar se req.user.role === 'ADMIN'.
// Retornar 403 se o usuário não for administrador.
export function authorizeAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  res.status(501).json({ error: 'Middleware não implementado — aguardando T03 (Hugo)' });
}
