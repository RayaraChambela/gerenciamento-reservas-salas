import { Router } from 'express';
import { listRooms, getRoom, createRoom, updateRoom, deleteRoom } from '../controllers/roomController';
import { authenticate } from '../middlewares/auth';
import { authorizeAdmin } from '../middlewares/authorize';

const router = Router();

router.get('/', authenticate, listRooms);
router.get('/:id', authenticate, getRoom);
router.post('/', authenticate, authorizeAdmin, createRoom);
router.put('/:id', authenticate, authorizeAdmin, updateRoom);
router.delete('/:id', authenticate, authorizeAdmin, deleteRoom);

export default router;
