import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth';
import { sendError } from '../utils/apiError';

function getJwtSecret() {
  return process.env.JWT_SECRET ?? 'dev-secret';
}

function signToken(user: { id: string; role: string }) {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  };

  return jwt.sign(
    { id: user.id, role: user.role },
    getJwtSecret(),
    options
  );
}

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return sendError(res, 400, 'AUTH_REQUIRED_FIELDS', 'Nome, email e senha sao obrigatorios');
  }

  if (role && !['USER', 'ADMIN'].includes(role)) {
    return sendError(res, 400, 'AUTH_INVALID_ROLE', 'Perfil deve ser USER ou ADMIN');
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: role ?? 'USER',
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json({ token: signToken(user), user });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return sendError(res, 409, 'AUTH_EMAIL_ALREADY_EXISTS', 'Email ja cadastrado');
    }
    return sendError(res, 500, 'AUTH_REGISTER_FAILED', 'Erro ao cadastrar usuario');
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password?.trim()) {
    return sendError(res, 400, 'AUTH_REQUIRED_FIELDS', 'Email e senha sao obrigatorios');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return sendError(res, 401, 'AUTH_INVALID_CREDENTIALS', 'Credenciais invalidas');
    }

    return res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    return sendError(res, 500, 'AUTH_LOGIN_FAILED', 'Erro ao fazer login');
  }
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return sendError(res, 404, 'AUTH_USER_NOT_FOUND', 'Usuario nao encontrado');
  }

  return res.json(user);
}

export const ME = me;
