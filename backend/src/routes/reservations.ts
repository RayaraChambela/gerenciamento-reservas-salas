import { Router } from 'express';
import {
  createReservation,
  listMyReservations,
  listAllReservations,
  deleteReservation,
} from '../controllers/reservationController';
import { authenticate } from '../middlewares/auth';
import { authorizeAdmin } from '../middlewares/authorize';

const router = Router();

router.post('/', authenticate, createReservation);
router.get('/me', authenticate, listMyReservations);
router.get('/', authenticate, authorizeAdmin, listAllReservations);
router.delete('/:id', authenticate, deleteReservation);

export default router;
