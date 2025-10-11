import express from 'express';

import { crudRouter } from './crud_generico.js';
import { TABLES } from './tablas.js';

const app = express();
app.use(express.json());

// Salud
app.get('/ping', (_req, res) => res.json({ ok: true }));

// Montar CRUD genérico por tabla
TABLES.forEach(cfg => app.use(`/api/${cfg.name}`, crudRouter(cfg)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));

