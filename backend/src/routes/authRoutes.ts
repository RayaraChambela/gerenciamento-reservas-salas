import { Router } from 'express';
import { login, ME, register } from '../controllers/authController';
import { adminMiddleware, authMiddleWare } from '../middlewares/auth';
///mudei o nome pra nao me confundir
const router = Router();

//rotas publicas e autenticadas
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleWare, ME);

//rota protegida
router.delete('/admin/deletar-reserva/:id', authMiddleWare, adminMiddleware, (req, res) => {
    res.json({ message: "Reserva deletada com sucesso por um ADMIN." });
});

export default router;