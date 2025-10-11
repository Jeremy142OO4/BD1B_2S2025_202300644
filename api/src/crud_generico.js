import { Router } from 'express';
import { getConnection } from './db.js';

const pathPK  = (pk) => Array.isArray(pk) ? '/' + pk.map(k => ':' + k).join('/') : '/:' + pk;
const wherePK = (pk) => Array.isArray(pk) ? pk.map(k => `${k} = :${k}`).join(' AND ') : `${pk} = :${pk}`;
const bindPK  = (pk, params) => Array.isArray(pk) ? Object.fromEntries(pk.map(k => [k, params[k]])) : { [pk]: params[pk] };

export function crudRouter({ table, pk, columns }) {
  const r = Router();
  const nonPK = Array.isArray(pk) ? columns.filter(c => !pk.includes(c)) : columns.filter(c => c !== pk);

  // LISTAR
  r.get('/', async (_req, res) => {
    let c;
    try {
      c = await getConnection();
      const orderCol = Array.isArray(pk) ? pk[0] : pk;
      const sql = `SELECT ${columns.join(', ')} FROM ${table} ORDER BY ${orderCol}`;
      const out = await c.execute(sql);
      res.json(out.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
    finally { if (c) await c.close(); }
  });

  // OBTENER
  r.get(pathPK(pk), async (req, res) => {
    let c;
    try {
      c = await getConnection();
      const sql = `SELECT ${columns.join(', ')} FROM ${table} WHERE ${wherePK(pk)}`;
      const out = await c.execute(sql, bindPK(pk, req.params));
      if (!out.rows.length) return res.status(404).json({ error: 'No encontrado' });
      res.json(out.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
    finally { if (c) await c.close(); }
  });

  // CREAR (espera TODAS las columnas en body)
  r.post('/', async (req, res) => {
    let c;
    try {
      c = await getConnection();
      const binds = Object.fromEntries(columns.map(col => [col, req.body[col]]));
      const values = columns.map(col => `:${col}`).join(', ');
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values})`;
      await c.execute(sql, binds, { autoCommit: true });
      res.status(201).json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
    finally { if (c) await c.close(); }
  });

  // ACTUALIZAR (PK en ruta, body con columnas no-PK)
  r.put(pathPK(pk), async (req, res) => {
    if (!nonPK.length) return res.status(400).json({ error: 'No hay columnas actualizables' });
    let c;
    try {
      c = await getConnection();
      const setList = nonPK.map(col => `${col} = :${col}`).join(', ');
      const sql = `UPDATE ${table} SET ${setList} WHERE ${wherePK(pk)}`;
      const binds = { ...bindPK(pk, req.params) };
      nonPK.forEach(col => binds[col] = req.body[col]);
      const out = await c.execute(sql, binds, { autoCommit: true });
      if (out.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
    finally { if (c) await c.close(); }
  });

  // ELIMINAR
  r.delete(pathPK(pk), async (req, res) => {
    let c;
    try {
      c = await getConnection();
      const sql = `DELETE FROM ${table} WHERE ${wherePK(pk)}`;
      const out = await c.execute(sql, bindPK(pk, req.params), { autoCommit: true });
      if (out.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
    finally { if (c) await c.close(); }
  });

  return r;
}
