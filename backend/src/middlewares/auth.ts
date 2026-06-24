import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

// T02 
// Verificar o token JWT do header Authorization (Bearer <token>).
// Popular req.user com { id, role } extraídos do token.
// Retornar 401 se token ausente ou inválido.
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  res.status(501).json({ error: 'Middleware não implementado — aguardando T02 (Hugo)' });
}
