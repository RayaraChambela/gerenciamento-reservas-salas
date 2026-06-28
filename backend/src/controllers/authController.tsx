import {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';
import {AuthRequest} from '../middl'ewares/auth';

//registrando o usuario
export async function register(req: Request, res: Response){
  const {name, email, password} = req.body;
    if(!name || !email || !password){
      return res.status(400).json({message: 'Nome, email e senha são campos obrigatorios'});
    }
    try{
      //hash pra senha
      const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: role || 'USER'
          },
          select: {id: true, name: true, email: true, role: true, createdAt: true}
        });

        //token
        const token = jwt.sign({ id: user.id, role: user.role},
          process.env.JWT_SECRET as string, {expiresIn: process.env.JWT_EXPIRES_IN ?? '3h'}
        );

        return res.status(201).json({token, user});
    }catch(error: any){
      if(error.code === 'P2--2000'){
        return res.status(409).json({ error: 'E-mail ja cadastrado...'});
      }
        return res.status(500).json({error: 'Erro interno ao criar usuario'});
    }
}

//login 
  export async function login(req: Request, res: Response){
    const {email, password} = req.body;

      if(!email || !password){
        return res.status(400).json({ error: 'Email e senha são obrigatorios aqui'});
      }
      const user = await prisma.user.findUnique({where: {email}});
        if(!user || !(await bcrypt.compare(password, user.passwordHash))){
          return res.status(401).json({error: 'E-mail ou senha incorretos,tente de novo'});
        }

        const token = jwt.sign(
          {id: user.id, role: user.role}, process.env.JWT_SECRET as string,
          { expiresIn: process.env.JWT_EXPIRES_IN ?? '3h'}
        );
        return res.json({
          token, user: {id: user.id, name: user.name, email: user.email, role: user.role}        
        });
  }

    //retornando o usuario autenticado ja
    export async function ME(req: AuthRequest, res:Response){
        const user = await prisma.user.findUnique({
          where: {id: req.user!.id},
          select: {id: true, name: true, email: true, role: true},
        });

          if(!user){
            return res.status(404).json({error: 'Usuario não encontrado...'});
          }

          return res.json(user);
    }