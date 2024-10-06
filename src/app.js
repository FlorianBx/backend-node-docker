import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/routes.js';
import testRoutes from './routes/tests/testRoutes.js';
import { tokenRefreshMiddleware } from './middlewares/refreshTokenMiddleware.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/', tokenRefreshMiddleware);
app.use('/api/test', testRoutes);

app.use(errorHandler);

export default app;
