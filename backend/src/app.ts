import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/rooms';
import reservationRoutes from './routes/reservations';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/reservations', reservationRoutes);

export default app;
