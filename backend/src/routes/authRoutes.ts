import { Router } from 'express';
import { register, login, me } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
///mudei o nome pra nao me confundir
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);

export default router;
