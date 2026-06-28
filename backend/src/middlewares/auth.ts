import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from './../../../auth';


//extendo o request pra guardar id e role
export interface AuthRequest extends Request{
    user?: {id: string; role: string};
}

export function authMiddleWare(req: AuthRequest, res: Response, next: NextFunction){
    const token = req.headers.authorization?.split(' ')[1]
    if(!token) return res.status(401).json({error: 'Token nao foi fornecido'});
      try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {id: string; role: string};
            req.user = decoded;
            next();
      } catch{
        res.status(401).json({error: 'Token inválido'});
      }
  }

  // o middle de autorização
  export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction){
      if(req.user?.role!== 'ADMIN'){
        return res.status(400).json({error:'Acesso negado: vc nao é um administrador'})
      }
        next();
  }