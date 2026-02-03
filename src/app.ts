import express from 'express';
import cors from 'cors';
import routes from './routes';
import { notFound } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/health', (_, res) => {
  res.json({ status: 'OK', service: 'Crime Report API' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
