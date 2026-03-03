import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import debug from 'debug';

import testRoute from './api/routes/routes.js';

dotenv.config();
debug.enable(process.env.DEBUG);

const startup = debug('startup');
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const publicDir = path.resolve(dirname, '../public');

const app = express();

app.use(morgan('dev'));
app.use(cors());

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/api', testRoute);
app.use(express.static(publicDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => startup(`Server is running on port ${PORT}`));

export default app;
