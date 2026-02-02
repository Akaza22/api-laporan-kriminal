import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/health', (_, res) => {
  res.json({ status: 'OK', service: 'Crime Report API' });
});

export default app;
