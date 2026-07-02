import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth';

// T01
// POST /auth/register
// Validar campos (nome, e-mail, senha), fazer hash com bcrypt, salvar no banco.
// Retornar erro 409 para e-mail duplicado.
//ja implementado - hugo
export async function register(req: Request, res: Response) {
  res.status(501).json({ error: 'Não implementado — aguardando T01 (Hugo)' });
    const{name, email, password, role} = req.body;
    if(!name || !email || !password){
      return res.status(400).json({error: 'Nome, email e senha são obrigatorios'});
    }
      try{
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
          data: {name, email, passwordHash, role: role || 'USER'},
          select: {id: true, name: true, email: true, role: true},
        });
          return res.status(201).json(user);
      }catch (error: any){
          if(error.code ===  'P2002'){
            return res.status(409).json({error: 'Email ja foi cadastrado'});
          }
          return res.status(500).json({error: 'Erro no servidor'});
      }
};


// T02
// POST /auth/login
// Validar credenciais, comparar senha com bcrypt, gerar JWT com id e role.
// Definir expiração do token.
//implementado
export async function login(req: Request, res: Response) {
  res.status(501).json({ error: 'Não implementado — aguardando T02 (Hugo)' });
  const {email, password} = req.body;
  const user = await prisma.user.findUnique({where: {email}});
    if(!user || !(await bcrypt.compare(password, user.passwordHash))){
          return res.status(401).json({error: 'Credenciais invalidas'});
    }
    
    const token = jwt.sign(
      {id: user.id, role: user.role},
      process.env.JWT_SECRET as string,// o process ainda da erro,msm eu fazendo certinho e o gemini ajudando
      {expressIn: '7d'}
    );
    return res.json({token, user:{id: user.id, name: user.name, email: user.email, role: user.rule}});
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
