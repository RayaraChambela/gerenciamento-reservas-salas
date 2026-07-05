import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Token nao foi fornecido',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch {
    return res.status(401).json({
      error: 'Token invalido',
      code: 'AUTH_TOKEN_INVALID',
    });
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Acesso restrito a administradores',
      code: 'FORBIDDEN_ADMIN_ONLY',
    });
  }

  return next();
}

export const authMiddleWare = authenticate;
