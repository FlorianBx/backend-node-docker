import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/tests/testRoutes.js';
import { tokenRefreshMiddleware } from './middlewares/refreshToken.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api', tokenRefreshMiddleware);
app.use('/api/test', testRoutes);

export default app;
