import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Garage backend listening on port ${port}`);
});
