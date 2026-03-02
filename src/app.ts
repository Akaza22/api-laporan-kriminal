import express from 'express';
import cors from 'cors';
import routes from './routes';
import { notFound } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { globalLimiter } from './middlewares/rateLimiter';
import { maintenanceGuard } from './middlewares/maintenance.middleware';
import { authMiddleware } from './middlewares/auth.middleware';


const app = express();

app.use(cors());
app.use(express.json());
app.use(globalLimiter);
app.use(authMiddleware);
app.use(maintenanceGuard);

app.use('/api', routes);

app.get('/health', (_, res) => {
  res.json({ status: 'OK', service: 'Crime Report API' });
});

app.use(notFound);
app.use(errorHandler);
app.set('trust proxy', 1);

export default app;
