import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/database';

// T01
// POST /auth/register
// Validar campos (nome, e-mail, senha), fazer hash com bcrypt, salvar no banco.
// Retornar erro 409 para e-mail duplicado.
export async function register(req: Request, res: Response) {
  res.status(501).json({ error: 'Não implementado — aguardando T01 (Hugo)' });
}

// T02
// POST /auth/login
// Validar credenciais, comparar senha com bcrypt, gerar JWT com id e role.
// Definir expiração do token.
export async function login(req: Request, res: Response) {
  res.status(501).json({ error: 'Não implementado — aguardando T02 (Hugo)' });
}

// T07
// GET /auth/me
// Retornar dados do usuário autenticado a partir do token JWT.
export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  return res.json(user);
}
