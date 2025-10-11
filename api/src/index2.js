import express from 'express';
import oracledb from 'oracledb';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const dbConfig = {
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || 'app',
  connectString: process.env.DB_CONNECT_STRING || 'oracle:1521/XEPDB1'
};

// LISTAR centros
app.get('/centros', async (_, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID_CENTRO, NOMBRE FROM CENTRO ORDER BY ID_CENTRO`);
    res.json(r.rows.map(([ID_CENTRO, NOMBRE]) => ({ ID_CENTRO, NOMBRE })));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

// OBTENER uno
app.get('/centros/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID_CENTRO, NOMBRE FROM CENTRO WHERE ID_CENTRO = :id`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_CENTRO, NOMBRE] = r.rows[0];
    res.json({ ID_CENTRO, NOMBRE });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

// CREAR
app.post('/centros', async (req, res) => {
  // defensiva por si el body no llega
  const { ID_CENTRO, NOMBRE } = req.body || {};
  if (ID_CENTRO == null || !NOMBRE) {
    return res.status(400).json({ error: 'ID_CENTRO y NOMBRE son requeridos' });
  }

  let c;
  try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      'INSERT INTO CENTRO (ID_CENTRO, NOMBRE) VALUES (:id, :nombre)',
      { id: ID_CENTRO, nombre: NOMBRE },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    if (c) await c.close();
  }
});
// ACTUALIZAR
app.put('/centros/:id', async (req, res) => {
  const { NOMBRE } = req.body;
  if (!NOMBRE) return res.status(400).json({ error: 'NOMBRE requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`UPDATE CENTRO SET NOMBRE = :nombre WHERE ID_CENTRO = :id`, { nombre: NOMBRE, id: req.params.id }, { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

// ELIMINAR
app.delete('/centros/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM CENTRO WHERE ID_CENTRO = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/ping', async (_req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const r = await conn.execute('SELECT 1 AS ok FROM dual');
    res.json({ ok: r.rows?.[0]?.[0] === 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
