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

// ====================== CORRELATIVO ======================
app.get('/correlativos', async (_, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID_CORRELATIVO, FECHA, NO_EXAMEN FROM CORRELATIVO ORDER BY ID_CORRELATIVO`);
    res.json((r.rows || []).map(([ID_CORRELATIVO, FECHA, NO_EXAMEN]) => ({ ID_CORRELATIVO, FECHA, NO_EXAMEN })));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/correlativos/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `SELECT ID_CORRELATIVO, FECHA, NO_EXAMEN FROM CORRELATIVO WHERE ID_CORRELATIVO = :id`,
      [req.params.id]
    );
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_CORRELATIVO, FECHA, NO_EXAMEN] = r.rows[0];
    res.json({ ID_CORRELATIVO, FECHA, NO_EXAMEN });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/correlativos', async (req, res) => {
  const { ID_CORRELATIVO, FECHA, NO_EXAMEN } = req.body || {};
  if (ID_CORRELATIVO == null) return res.status(400).json({ error: 'ID_CORRELATIVO requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(`INSERT INTO CORRELATIVO (ID_CORRELATIVO, FECHA, NO_EXAMEN) VALUES (:id, :fecha, :noex)`,
      { id: ID_CORRELATIVO, fecha: FECHA ? new Date(FECHA) : null, noex: NO_EXAMEN ?? null }, { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/correlativos/:id', async (req, res) => {
  const { FECHA, NO_EXAMEN } = req.body || {};
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE CORRELATIVO SET FECHA = :fecha, NO_EXAMEN = :noex WHERE ID_CORRELATIVO = :id`,
      { fecha: FECHA ? new Date(FECHA) : null, noex: NO_EXAMEN ?? null, id: req.params.id },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/correlativos/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM CORRELATIVO WHERE ID_CORRELATIVO = :id`, [req.params.id], { autoCommit: true });
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

// ====================== DEPARTAMENTO ======================
app.get('/departamentos', async (_, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID_DEPARTAMENTO, NOMBRE, CODIGO FROM DEPARTAMENTO ORDER BY ID_DEPARTAMENTO`);
    res.json((r.rows || []).map(([ID_DEPARTAMENTO, NOMBRE, CODIGO]) => ({ ID_DEPARTAMENTO, NOMBRE, CODIGO })));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/departamentos/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `SELECT ID_DEPARTAMENTO, NOMBRE, CODIGO FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id`,
      [req.params.id]
    );
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_DEPARTAMENTO, NOMBRE, CODIGO] = r.rows[0];
    res.json({ ID_DEPARTAMENTO, NOMBRE, CODIGO });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/departamentos', async (req, res) => {
  const { ID_DEPARTAMENTO, NOMBRE, CODIGO } = req.body || {};
  if (ID_DEPARTAMENTO == null || !NOMBRE) return res.status(400).json({ error: 'ID_DEPARTAMENTO y NOMBRE requeridos' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO DEPARTAMENTO (ID_DEPARTAMENTO, NOMBRE, CODIGO) VALUES (:id, :nombre, :codigo)`,
      { id: ID_DEPARTAMENTO, nombre: NOMBRE, codigo: CODIGO ?? null },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/departamentos/:id', async (req, res) => {
  const { NOMBRE, CODIGO } = req.body || {};
  if (!NOMBRE) return res.status(400).json({ error: 'NOMBRE requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE DEPARTAMENTO SET NOMBRE = :nombre, CODIGO = :codigo WHERE ID_DEPARTAMENTO = :id`,
      { nombre: NOMBRE, codigo: CODIGO ?? null, id: req.params.id },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/departamentos/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

// ====================== ESCUELA ======================
app.get('/escuelas', async (_, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO FROM ESCUELA ORDER BY ID_ESCUELA`);
    res.json((r.rows || []).map(([ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO]) => ({ ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO })));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/escuelas/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `SELECT ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO FROM ESCUELA WHERE ID_ESCUELA = :id`,
      [req.params.id]
    );
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO] = r.rows[0];
    res.json({ ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/escuelas', async (req, res) => {
  const { ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO } = req.body || {};
  if (ID_ESCUELA == null || !NOMBRE) return res.status(400).json({ error: 'ID_ESCUELA y NOMBRE requeridos' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO ESCUELA (ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO)
       VALUES (:id, :nombre, :dir, :acuerdo)`,
      { id: ID_ESCUELA, nombre: NOMBRE, dir: DIRECCION ?? null, acuerdo: ACUERDO ?? null },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/escuelas/:id', async (req, res) => {
  const { NOMBRE, DIRECCION, ACUERDO } = req.body || {};
  if (!NOMBRE) return res.status(400).json({ error: 'NOMBRE requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE ESCUELA
       SET NOMBRE = :nombre, DIRECCION = :dir, ACUERDO = :acuerdo
       WHERE ID_ESCUELA = :id`,
      { nombre: NOMBRE, dir: DIRECCION ?? null, acuerdo: ACUERDO ?? null, id: req.params.id },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/escuelas/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM ESCUELA WHERE ID_ESCUELA = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});


// ====================== EXAMEN ======================
app.get('/examenes', async (_, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const sql = `
      SELECT ID_EXAMEN, REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO,
             REGISTRO_MUNICIPIO_ID, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID,
             REGISTRO_ID, CORRELATIVO_ID
      FROM EXAMEN
      ORDER BY ID_EXAMEN`;
    const r = await c.execute(sql);
    res.json((r.rows || []).map(([ID_EXAMEN, REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO, REGISTRO_MUNICIPIO_ID, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID, REGISTRO_ID, CORRELATIVO_ID]) =>
      ({ ID_EXAMEN, REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO, REGISTRO_MUNICIPIO_ID, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID, REGISTRO_ID, CORRELATIVO_ID })
    ));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/examenes/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const sql = `
      SELECT ID_EXAMEN, REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO,
             REGISTRO_MUNICIPIO_ID, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID,
             REGISTRO_ID, CORRELATIVO_ID
      FROM EXAMEN WHERE ID_EXAMEN = :id`;
    const r = await c.execute(sql, [req.params.id]);
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_EXAMEN, REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO, REGISTRO_MUNICIPIO_ID, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID, REGISTRO_ID, CORRELATIVO_ID] = r.rows[0];
    res.json({ ID_EXAMEN, REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO, REGISTRO_MUNICIPIO_ID, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID, REGISTRO_ID, CORRELATIVO_ID });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/examenes', async (req, res) => {
  const {
    ID_EXAMEN, REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO,
    REGISTRO_MUNICIPIO_ID, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID,
    REGISTRO_ID, CORRELATIVO_ID
  } = req.body || {};
  if (ID_EXAMEN == null) return res.status(400).json({ error: 'ID_EXAMEN requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO EXAMEN (ID_EXAMEN, REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO, REGISTRO_MUNICIPIO_ID, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID, REGISTRO_ID, CORRELATIVO_ID)
       VALUES (:id, :re_esc, :re_cen, :re_mun, :re_dep, :re_id, :corr)`,
      {
        id: ID_EXAMEN,
        re_esc: REGISTRO_ID_ESCUELA ?? null,
        re_cen: REGISTRO_ID_CENTRO ?? null,
        re_mun: REGISTRO_MUNICIPIO_ID ?? null,
        re_dep: REGISTRO_MUNICIPIO_DEPARTAMENTO_ID ?? null,
        re_id: REGISTRO_ID ?? null,
        corr: CORRELATIVO_ID ?? null
      },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/examenes/:id', async (req, res) => {
  const {
    REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO,
    REGISTRO_MUNICIPIO_ID, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID,
    REGISTRO_ID, CORRELATIVO_ID
  } = req.body || {};
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE EXAMEN SET
         REGISTRO_ID_ESCUELA = :re_esc,
         REGISTRO_ID_CENTRO = :re_cen,
         REGISTRO_MUNICIPIO_ID = :re_mun,
         REGISTRO_MUNICIPIO_DEPARTAMENTO_ID = :re_dep,
         REGISTRO_ID = :re_id,
         CORRELATIVO_ID = :corr
       WHERE ID_EXAMEN = :id`,
      {
        re_esc: REGISTRO_ID_ESCUELA ?? null,
        re_cen: REGISTRO_ID_CENTRO ?? null,
        re_mun: REGISTRO_MUNICIPIO_ID ?? null,
        re_dep: REGISTRO_MUNICIPIO_DEPARTAMENTO_ID ?? null,
        re_id: REGISTRO_ID ?? null,
        corr: CORRELATIVO_ID ?? null,
        id: req.params.id
      },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/examenes/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM EXAMEN WHERE ID_EXAMEN = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});


// ====================== MUNICIPIO ======================
app.get('/municipios', async (_, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID_MUNICIPIO, DEPARTAMENTO_ID, NOMBRE, CODIGO FROM MUNICIPIO ORDER BY ID_MUNICIPIO`);
    res.json((r.rows || []).map(([ID_MUNICIPIO, DEPARTAMENTO_ID, NOMBRE, CODIGO]) => ({ ID_MUNICIPIO, DEPARTAMENTO_ID, NOMBRE, CODIGO })));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/municipios/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `SELECT ID_MUNICIPIO, DEPARTAMENTO_ID, NOMBRE, CODIGO FROM MUNICIPIO WHERE ID_MUNICIPIO = :id`,
      [req.params.id]
    );
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_MUNICIPIO, DEPARTAMENTO_ID, NOMBRE, CODIGO] = r.rows[0];
    res.json({ ID_MUNICIPIO, DEPARTAMENTO_ID, NOMBRE, CODIGO });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/municipios', async (req, res) => {
  const { ID_MUNICIPIO, DEPARTAMENTO_ID, NOMBRE, CODIGO } = req.body || {};
  if (ID_MUNICIPIO == null || !NOMBRE) return res.status(400).json({ error: 'ID_MUNICIPIO y NOMBRE requeridos' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO MUNICIPIO (ID_MUNICIPIO, DEPARTAMENTO_ID, NOMBRE, CODIGO)
       VALUES (:id, :dep, :nombre, :cod)`,
      { id: ID_MUNICIPIO, dep: DEPARTAMENTO_ID ?? null, nombre: NOMBRE, cod: CODIGO ?? null },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/municipios/:id', async (req, res) => {
  const { DEPARTAMENTO_ID, NOMBRE, CODIGO } = req.body || {};
  if (!NOMBRE) return res.status(400).json({ error: 'NOMBRE requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE MUNICIPIO
       SET DEPARTAMENTO_ID = :dep, NOMBRE = :nombre, CODIGO = :cod
       WHERE ID_MUNICIPIO = :id`,
      { dep: DEPARTAMENTO_ID ?? null, nombre: NOMBRE, cod: CODIGO ?? null, id: req.params.id },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/municipios/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM MUNICIPIO WHERE ID_MUNICIPIO = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});


// ====================== PREGUNTAS ======================
app.get('/preguntas', async (_, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4 FROM PREGUNTAS ORDER BY ID`);
    res.json((r.rows || []).map(([ID, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4]) =>
      ({ ID, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4 })
    ));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/preguntas/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `SELECT ID, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4 FROM PREGUNTAS WHERE ID = :id`,
      [req.params.id]
    );
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4] = r.rows[0];
    res.json({ ID, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4 });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/preguntas', async (req, res) => {
  const { ID, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4 } = req.body || {};
  if (ID == null || !PREGUNTA_TEXTO) return res.status(400).json({ error: 'ID y PREGUNTA_TEXTO requeridos' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO PREGUNTAS (ID, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4)
       VALUES (:id, :texto, :resp, :r1, :r2, :r3, :r4)`,
      { id: ID, texto: PREGUNTA_TEXTO, resp: RESPUESTA ?? null, r1: RES1 ?? null, r2: RES2 ?? null, r3: RES3 ?? null, r4: RES4 ?? null },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/preguntas/:id', async (req, res) => {
  const { PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4 } = req.body || {};
  if (!PREGUNTA_TEXTO) return res.status(400).json({ error: 'PREGUNTA_TEXTO requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE PREGUNTAS
       SET PREGUNTA_TEXTO = :texto, RESPUESTA = :resp, RES1 = :r1, RES2 = :r2, RES3 = :r3, RES4 = :r4
       WHERE ID = :id`,
      { texto: PREGUNTA_TEXTO, resp: RESPUESTA ?? null, r1: RES1 ?? null, r2: RES2 ?? null, r3: RES3 ?? null, r4: RES4 ?? null, id: req.params.id },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/preguntas/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM PREGUNTAS WHERE ID = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});


// ====================== PREGUNTAS_PRACTICO ======================
app.get('/preguntas_practico', async (_, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO FROM PREGUNTAS_PRACTICO ORDER BY ID_PREGUNTA_PRACTICO`);
    res.json((r.rows || []).map(([ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO]) => ({ ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO })));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/preguntas_practico/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `SELECT ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO FROM PREGUNTAS_PRACTICO WHERE ID_PREGUNTA_PRACTICO = :id`,
      [req.params.id]
    );
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO] = r.rows[0];
    res.json({ ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/preguntas_practico', async (req, res) => {
  const { ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO } = req.body || {};
  if (ID_PREGUNTA_PRACTICO == null || !PREGUNTA_TEXTO) return res.status(400).json({ error: 'ID_PREGUNTA_PRACTICO y PREGUNTA_TEXTO requeridos' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO PREGUNTAS_PRACTICO (ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO)
       VALUES (:id, :texto, :punteo)`,
      { id: ID_PREGUNTA_PRACTICO, texto: PREGUNTA_TEXTO, punteo: PUNTEO ?? null },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/preguntas_practico/:id', async (req, res) => {
  const { PREGUNTA_TEXTO, PUNTEO } = req.body || {};
  if (!PREGUNTA_TEXTO) return res.status(400).json({ error: 'PREGUNTA_TEXTO requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE PREGUNTAS_PRACTICO SET PREGUNTA_TEXTO = :texto, PUNTEO = :punteo WHERE ID_PREGUNTA_PRACTICO = :id`,
      { texto: PREGUNTA_TEXTO, punteo: PUNTEO ?? null, id: req.params.id },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/preguntas_practico/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM PREGUNTAS_PRACTICO WHERE ID_PREGUNTA_PRACTICO = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});


// ====================== REGISTRO ======================
app.get('/registros', async (_req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const sql = `
      SELECT ID_REGISTRO, UBICACION_ESCUELA_ID, UBICACION_CENTRO_ID,
             MUNICIPIO_ID, MUNICIPIO_DEPARTAMENTO_ID, FECHA,
             TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO
      FROM REGISTRO
      ORDER BY ID_REGISTRO`;
    const r = await c.execute(sql);
    res.json((r.rows || []).map(([ID_REGISTRO, UBICACION_ESCUELA_ID, UBICACION_CENTRO_ID, MUNICIPIO_ID, MUNICIPIO_DEPARTAMENTO_ID, FECHA, TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO]) =>
      ({ ID_REGISTRO, UBICACION_ESCUELA_ID, UBICACION_CENTRO_ID, MUNICIPIO_ID, MUNICIPIO_DEPARTAMENTO_ID, FECHA, TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO })
    ));
  } catch (e) { res.status(500).json({ error: e.message }); }
  finally { if (c) await c.close(); }
});

app.get('/registros/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const sql = `
      SELECT ID_REGISTRO, UBICACION_ESCUELA_ID, UBICACION_CENTRO_ID,
             MUNICIPIO_ID, MUNICIPIO_DEPARTAMENTO_ID, FECHA,
             TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO
      FROM REGISTRO WHERE ID_REGISTRO = :id`;
    const r = await c.execute(sql, [req.params.id]);
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_REGISTRO, UBICACION_ESCUELA_ID, UBICACION_CENTRO_ID, MUNICIPIO_ID, MUNICIPIO_DEPARTAMENTO_ID, FECHA, TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO] = r.rows[0];
    res.json({ ID_REGISTRO, UBICACION_ESCUELA_ID, UBICACION_CENTRO_ID, MUNICIPIO_ID, MUNICIPIO_DEPARTAMENTO_ID, FECHA, TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO });
  } catch (e) { res.status(500).json({ error: e.message }); }
  finally { if (c) await c.close(); }
});

app.post('/registros', async (req, res) => {
  const {
    ID_REGISTRO, UBICACION_ESCUELA_ID, UBICACION_CENTRO_ID,
    MUNICIPIO_ID, MUNICIPIO_DEPARTAMENTO_ID, FECHA,
    TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO
  } = req.body || {};
  if (ID_REGISTRO == null) return res.status(400).json({ error: 'ID_REGISTRO requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO REGISTRO
       (ID_REGISTRO, UBICACION_ESCUELA_ID, UBICACION_CENTRO_ID, MUNICIPIO_ID, MUNICIPIO_DEPARTAMENTO_ID, FECHA, TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO)
       VALUES (:id, :ue, :uc, :mun, :dep, :fecha, :ttra, :tlic, :nombre, :genero)`,
      {
        id: ID_REGISTRO,
        ue: UBICACION_ESCUELA_ID ?? null,
        uc: UBICACION_CENTRO_ID ?? null,
        mun: MUNICIPIO_ID ?? null,
        dep: MUNICIPIO_DEPARTAMENTO_ID ?? null,
        fecha: FECHA ? new Date(FECHA) : null,
        ttra: TIPO_TRAMITE ?? null,
        tlic: TIPO_LICENCIA ?? null,
        nombre: NOMBRE_COMPLETO ?? null,
        genero: GENERO ?? null
      },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
  finally { if (c) await c.close(); }
});

app.put('/registros/:id', async (req, res) => {
  const {
    UBICACION_ESCUELA_ID, UBICACION_CENTRO_ID,
    MUNICIPIO_ID, MUNICIPIO_DEPARTAMENTO_ID, FECHA,
    TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO
  } = req.body || {};
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE REGISTRO SET
         UBICACION_ESCUELA_ID = :ue,
         UBICACION_CENTRO_ID = :uc,
         MUNICIPIO_ID = :mun,
         MUNICIPIO_DEPARTAMENTO_ID = :dep,
         FECHA = :fecha,
         TIPO_TRAMITE = :ttra,
         TIPO_LICENCIA = :tlic,
         NOMBRE_COMPLETO = :nombre,
         GENERO = :genero
       WHERE ID_REGISTRO = :id`,
      {
        ue: UBICACION_ESCUELA_ID ?? null,
        uc: UBICACION_CENTRO_ID ?? null,
        mun: MUNICIPIO_ID ?? null,
        dep: MUNICIPIO_DEPARTAMENTO_ID ?? null,
        fecha: FECHA ? new Date(FECHA) : null,
        ttra: TIPO_TRAMITE ?? null,
        tlic: TIPO_LICENCIA ?? null,
        nombre: NOMBRE_COMPLETO ?? null,
        genero: GENERO ?? null,
        id: req.params.id
      },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
  finally { if (c) await c.close(); }
});

app.delete('/registros/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM REGISTRO WHERE ID_REGISTRO = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
  finally { if (c) await c.close(); }
});


// ====================== RESPUESTA_PRACTICO_USUARIO ======================
app.get('/respuestas_practico_usuario', async (_req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`
      SELECT ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID, EXAMEN_ID, NOTA
      FROM RESPUESTA_PRACTICO_USUARIO
      ORDER BY ID_RESPUESTA_PRACTICO`);
    res.json((r.rows || []).map(([ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID, EXAMEN_ID, NOTA]) =>
      ({ ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID, EXAMEN_ID, NOTA })
    ));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/respuestas_practico_usuario/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`
      SELECT ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID, EXAMEN_ID, NOTA
      FROM RESPUESTA_PRACTICO_USUARIO
      WHERE ID_RESPUESTA_PRACTICO = :id`, [req.params.id]);
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID, EXAMEN_ID, NOTA] = r.rows[0];
    res.json({ ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID, EXAMEN_ID, NOTA });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/respuestas_practico_usuario', async (req, res) => {
  const { ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID, EXAMEN_ID, NOTA } = req.body || {};
  if (ID_RESPUESTA_PRACTICO == null) return res.status(400).json({ error: 'ID_RESPUESTA_PRACTICO requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO RESPUESTA_PRACTICO_USUARIO (ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID, EXAMEN_ID, NOTA)
       VALUES (:id, :pid, :eid, :nota)`,
      { id: ID_RESPUESTA_PRACTICO, pid: PREGUNTA_PRACTICO_ID ?? null, eid: EXAMEN_ID ?? null, nota: NOTA ?? null },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/respuestas_practico_usuario/:id', async (req, res) => {
  const { PREGUNTA_PRACTICO_ID, EXAMEN_ID, NOTA } = req.body || {};
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE RESPUESTA_PRACTICO_USUARIO
       SET PREGUNTA_PRACTICO_ID = :pid, EXAMEN_ID = :eid, NOTA = :nota
       WHERE ID_RESPUESTA_PRACTICO = :id`,
      { pid: PREGUNTA_PRACTICO_ID ?? null, eid: EXAMEN_ID ?? null, nota: NOTA ?? null, id: req.params.id },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/respuestas_practico_usuario/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM RESPUESTA_PRACTICO_USUARIO WHERE ID_RESPUESTA_PRACTICO = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});


// ====================== RESPUESTA_USUARIO ======================
app.get('/respuestas_usuario', async (_req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`
      SELECT ID_RESPUESTA_USUARIO, PREGUNTA_ID, EXAMEN_ID, RESPUESTA
      FROM RESPUESTA_USUARIO
      ORDER BY ID_RESPUESTA_USUARIO`);
    res.json((r.rows || []).map(([ID_RESPUESTA_USUARIO, PREGUNTA_ID, EXAMEN_ID, RESPUESTA]) =>
      ({ ID_RESPUESTA_USUARIO, PREGUNTA_ID, EXAMEN_ID, RESPUESTA })
    ));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/respuestas_usuario/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`
      SELECT ID_RESPUESTA_USUARIO, PREGUNTA_ID, EXAMEN_ID, RESPUESTA
      FROM RESPUESTA_USUARIO
      WHERE ID_RESPUESTA_USUARIO = :id`, [req.params.id]);
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_RESPUESTA_USUARIO, PREGUNTA_ID, EXAMEN_ID, RESPUESTA] = r.rows[0];
    res.json({ ID_RESPUESTA_USUARIO, PREGUNTA_ID, EXAMEN_ID, RESPUESTA });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/respuestas_usuario', async (req, res) => {
  const { ID_RESPUESTA_USUARIO, PREGUNTA_ID, EXAMEN_ID, RESPUESTA } = req.body || {};
  if (ID_RESPUESTA_USUARIO == null) return res.status(400).json({ error: 'ID_RESPUESTA_USUARIO requerido' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO RESPUESTA_USUARIO (ID_RESPUESTA_USUARIO, PREGUNTA_ID, EXAMEN_ID, RESPUESTA)
       VALUES (:id, :pid, :eid, :resp)`,
      { id: ID_RESPUESTA_USUARIO, pid: PREGUNTA_ID ?? null, eid: EXAMEN_ID ?? null, resp: RESPUESTA ?? null },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/respuestas_usuario/:id', async (req, res) => {
  const { PREGUNTA_ID, EXAMEN_ID, RESPUESTA } = req.body || {};
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `UPDATE RESPUESTA_USUARIO
       SET PREGUNTA_ID = :pid, EXAMEN_ID = :eid, RESPUESTA = :resp
       WHERE ID_RESPUESTA_USUARIO = :id`,
      { pid: PREGUNTA_ID ?? null, eid: EXAMEN_ID ?? null, resp: RESPUESTA ?? null, id: req.params.id },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/respuestas_usuario/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM RESPUESTA_USUARIO WHERE ID_RESPUESTA_USUARIO = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});


// ====================== UBICACION ======================

app.get('/ubicaciones', async (_req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ESCUELA_ID, CENTRO_ID FROM UBICACION ORDER BY ESCUELA_ID, CENTRO_ID`);
    res.json((r.rows || []).map(([ESCUELA_ID, CENTRO_ID]) => ({ ESCUELA_ID, CENTRO_ID })));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.get('/ubicaciones/:ESCUELA_ID/:CENTRO_ID', async (req, res) => {
  const { ESCUELA_ID, CENTRO_ID } = req.params;
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `SELECT ESCUELA_ID, CENTRO_ID FROM UBICACION WHERE ESCUELA_ID = :e AND CENTRO_ID = :c`,
      { e: ESCUELA_ID, c: CENTRO_ID }
    );
    if (!r.rows?.length) return res.status(404).json({ error: 'No encontrado' });
    const [eId, cId] = r.rows[0];
    res.json({ ESCUELA_ID: eId, CENTRO_ID: cId });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.post('/ubicaciones', async (req, res) => {
  const { ESCUELA_ID, CENTRO_ID } = req.body || {};
  if (ESCUELA_ID == null || CENTRO_ID == null) return res.status(400).json({ error: 'ESCUELA_ID y CENTRO_ID requeridos' });
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    await c.execute(
      `INSERT INTO UBICACION (ESCUELA_ID, CENTRO_ID) VALUES (:e, :c)`,
      { e: ESCUELA_ID, c: CENTRO_ID },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.put('/ubicaciones/:ESCUELA_ID/:CENTRO_ID', async (req, res) => {
  const { ESCUELA_ID, CENTRO_ID } = req.body || {};
  if (ESCUELA_ID == null && CENTRO_ID == null) {
    return res.status(400).json({ error: 'Provee ESCUELA_ID y/o CENTRO_ID para actualizar' });
  }
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const sets = [];
    if (ESCUELA_ID != null) sets.push('ESCUELA_ID = :ne');
    if (CENTRO_ID != null) sets.push('CENTRO_ID = :nc');
    const r = await c.execute(
      `UPDATE UBICACION SET ${sets.join(', ')} WHERE ESCUELA_ID = :e AND CENTRO_ID = :c`,
      {
        ne: ESCUELA_ID ?? undefined,
        nc: CENTRO_ID ?? undefined,
        e: req.params.ESCUELA_ID,
        c: req.params.CENTRO_ID
      },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});

app.delete('/ubicaciones/:ESCUELA_ID/:CENTRO_ID', async (req, res) => {
  const { ESCUELA_ID, CENTRO_ID } = req.params;
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(
      `DELETE FROM UBICACION WHERE ESCUELA_ID = :e AND CENTRO_ID = :c`,
      { e: ESCUELA_ID, c: CENTRO_ID },
      { autoCommit: true }
    );
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});


app.get('/consultas/1', async (_req, res) => {
  let c;
  try {
    c = await oracledb.getConnection(dbConfig);
    const sql = `
      SELECT
        c.NOMBRE                              AS "Centro",
        eesc.NOMBRE                           AS "Escuela",
        COUNT(es.ID_EXAMEN)                   AS "Total de exámenes",
        ROUND(AVG(es.TEORICO), 2)             AS "Promedio teórico",
        ROUND(AVG(es.PRACTICO), 2)            AS "Promedio práctico",
        SUM(CASE WHEN es.TEORICO >= 70 AND es.PRACTICO >= 70 THEN 1 ELSE 0 END)
                                              AS "Total aprobados"
      FROM (
        SELECT
          e.ID_EXAMEN,
          r.UBICACION_CENTRO_ID  AS CENTRO_ID,
          r.UBICACION_ESCUELA_ID AS ESCUELA_ID,
          NVL(t.TEORICO, 0)      AS TEORICO,
          NVL(pr.PRACTICO, 0)    AS PRACTICO
        FROM EXAMEN e
        JOIN REGISTRO r
          ON r.ID_REGISTRO = e.REGISTRO_ID
        LEFT JOIN (
          SELECT
            e.ID_EXAMEN,
            LEAST(100, 4 * SUM(CASE WHEN ru.RESPUESTA = p.RESPUESTA THEN 1 ELSE 0 END)) AS TEORICO
          FROM EXAMEN e
          LEFT JOIN RESPUESTA_USUARIO ru ON ru.EXAMEN_ID = e.ID_EXAMEN
          LEFT JOIN PREGUNTAS p          ON p.ID = ru.PREGUNTA_ID
          GROUP BY e.ID_EXAMEN
        ) t ON t.ID_EXAMEN = e.ID_EXAMEN
        LEFT JOIN (
          SELECT
            e.ID_EXAMEN,
            LEAST(100, NVL(SUM(rpu.NOTA), 0)) AS PRACTICO
          FROM EXAMEN e
          LEFT JOIN RESPUESTA_PRACTICO_USUARIO rpu ON rpu.EXAMEN_ID = e.ID_EXAMEN
          GROUP BY e.ID_EXAMEN
        ) pr ON pr.ID_EXAMEN = e.ID_EXAMEN
      ) es
      JOIN CENTRO  c   ON c.ID_CENTRO   = es.CENTRO_ID
      JOIN ESCUELA eesc ON eesc.ID_ESCUELA = es.ESCUELA_ID
      GROUP BY c.NOMBRE, eesc.NOMBRE
      ORDER BY c.NOMBRE, eesc.NOMBRE
    `;
    const r = await c.execute(sql, {}, { outFormat: oracledb.OBJECT });
    res.json(r.rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally { if (c) await c.close(); }
});


// ====================== CONSULTA 2 ======================
// GET /consultas/2  -> Ranking de evaluados
app.get('/consultas/2', async (_req, res) => {
  let c;
  try {
    c = await oracledb.getConnection(dbConfig);
    const sql = `
      SELECT
        r.NOMBRE_COMPLETO                                       AS "Nombre completo",
        r.TIPO_LICENCIA                                         AS "Tipo de licencia",
        r.GENERO                                                AS "Género",
        r.FECHA                                                 AS "Fecha",
        NVL(t.TEORICO, 0)                                       AS "Punteo teórico",
        NVL(pr.PRACTICO, 0)                                     AS "Punteo práctico",
        NVL(t.TEORICO, 0) + NVL(pr.PRACTICO, 0)                 AS "Punteo total",
        CASE
          WHEN NVL(t.TEORICO, 0) >= 70 AND NVL(pr.PRACTICO, 0) >= 70
            THEN 'APROBADO'
          ELSE 'REPROBADO'
        END                                                     AS "Resultado final",
        (c2.NOMBRE || ' - ' || eesc.NOMBRE)                     AS "Ubicación"
      FROM EXAMEN e
      JOIN REGISTRO r
        ON r.ID_REGISTRO = e.REGISTRO_ID
      LEFT JOIN (
        SELECT
          e2.ID_EXAMEN,
          LEAST(100, 4 * SUM(CASE WHEN ru.RESPUESTA = p.RESPUESTA THEN 1 ELSE 0 END)) AS TEORICO
        FROM EXAMEN e2
        LEFT JOIN RESPUESTA_USUARIO ru ON ru.EXAMEN_ID = e2.ID_EXAMEN
        LEFT JOIN PREGUNTAS p          ON p.ID = ru.PREGUNTA_ID
        GROUP BY e2.ID_EXAMEN
      ) t ON t.ID_EXAMEN = e.ID_EXAMEN
      LEFT JOIN (
        SELECT
          e3.ID_EXAMEN,
          LEAST(100, NVL(SUM(rpu.NOTA), 0)) AS PRACTICO
        FROM EXAMEN e3
        LEFT JOIN RESPUESTA_PRACTICO_USUARIO rpu ON rpu.EXAMEN_ID = e3.ID_EXAMEN
        GROUP BY e3.ID_EXAMEN
      ) pr ON pr.ID_EXAMEN = e.ID_EXAMEN
      JOIN CENTRO  c2
        ON c2.ID_CENTRO   = r.UBICACION_CENTRO_ID
      JOIN ESCUELA eesc
        ON eesc.ID_ESCUELA = r.UBICACION_ESCUELA_ID
      ORDER BY
        CASE WHEN NVL(t.TEORICO, 0) >= 70 AND NVL(pr.PRACTICO, 0) >= 70 THEN 0 ELSE 1 END,
        (NVL(t.TEORICO, 0) + NVL(pr.PRACTICO, 0)) DESC,
        r.FECHA
    `;
    const r = await c.execute(sql, {}, { outFormat: oracledb.OBJECT });
    res.json(r.rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally { if (c) await c.close(); }
});


// ====================== CONSULTA 3 ======================
// GET /consultas/3  -> Pregunta(s) con menor % de aciertos
app.get('/consultas/3', async (_req, res) => {
  let c;
  try {
    c = await oracledb.getConnection(dbConfig);
    const sql = `
      WITH stats AS (
        SELECT
          p.ID                                  AS ID_PREGUNTA,
          p.RES1, p.RES2, p.RES3, p.RES4,
          p.RESPUESTA                           AS RESP_CORRECTA,
          COUNT(ru.ID_RESPUESTA_USUARIO)        AS TOTAL_RESP,
          SUM(CASE WHEN ru.RESPUESTA = p.RESPUESTA THEN 1 ELSE 0 END) AS CORRECTAS,
          SUM(CASE WHEN ru.RESPUESTA = 1 THEN 1 ELSE 0 END) AS RESP_A,
          SUM(CASE WHEN ru.RESPUESTA = 2 THEN 1 ELSE 0 END) AS RESP_B,
          SUM(CASE WHEN ru.RESPUESTA = 3 THEN 1 ELSE 0 END) AS RESP_C,
          SUM(CASE WHEN ru.RESPUESTA = 4 THEN 1 ELSE 0 END) AS RESP_D
        FROM PREGUNTAS p
        LEFT JOIN RESPUESTA_USUARIO ru
          ON ru.PREGUNTA_ID = p.ID
        GROUP BY p.ID, p.RES1, p.RES2, p.RES3, p.RES4, p.RESPUESTA
      ),
      scored AS (
        SELECT
          s.*,
          CASE
            WHEN s.TOTAL_RESP = 0 THEN 0
            ELSE ROUND(100 * s.CORRECTAS / s.TOTAL_RESP, 2)
          END AS PORC_ACIERTOS
        FROM stats s
      ),
      ranked AS (
        SELECT
          s.*,
          DENSE_RANK() OVER (ORDER BY s.PORC_ACIERTOS ASC) AS RK
        FROM scored s
      )
      SELECT
        ID_PREGUNTA                             AS "ID pregunta",
        RES1                                    AS "Opción A",
        RES2                                    AS "Opción B",
        RES3                                    AS "Opción C",
        RES4                                    AS "Opción D",
        RESP_CORRECTA                           AS "Respuesta correcta (índice)",
        RESP_A                                  AS "Respuestas A",
        RESP_B                                  AS "Respuestas B",
        RESP_C                                  AS "Respuestas C",
        RESP_D                                  AS "Respuestas D",
        TOTAL_RESP                              AS "Total respuestas",
        CORRECTAS                               AS "Total aciertos",
        PORC_ACIERTOS                           AS "Porcentaje de aciertos",
        CASE
          WHEN PORC_ACIERTOS < 40 THEN 'REVISIÓN URGENTE'
          WHEN PORC_ACIERTOS < 60 THEN 'REVISAR'
          ELSE 'OK'
        END                                      AS "Estado de recomendación"
      FROM ranked
      WHERE RK = 1
      ORDER BY PORC_ACIERTOS ASC, ID_PREGUNTA
    `;
    const r = await c.execute(sql, {}, { outFormat: oracledb.OBJECT });
    res.json(r.rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally { if (c) await c.close(); }
});

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
