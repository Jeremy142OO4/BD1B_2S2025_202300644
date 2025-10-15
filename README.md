# UNIVERSIDAD DE SAN CARLOS DE GUATEMALA  
## FACULTAD DE INGENIERÍA  
### SISTEMAS DE BASES DE DATOS 1 

**CATEDRÁTICO:** Ing. Luis Fernado Espino
**TUTOR ACADÉMICO:** Paulo Argueta

---

**Jeremy Estuado Orellana Aldana**  
**CARNÉ:** 202300644
**SECCIÓN:** B

**Guatemala, 17 de septiembre del 2025**
## Pasos para el despliegue de el contenedor

##### Para desplegar el contenedor con docker necesitaremos un archivo .yml que sera la configuracion:

```
services:
  oracle:
    image: gvenzl/oracle-xe:21-slim
    container_name: oraclexe
    ports:
      - "1521:1521"
    environment:
      ORACLE_PASSWORD: oracle
      APP_USER: app
      APP_USER_PASSWORD: app
      ORACLE_DATABASE: XEPDB1
    volumes:
      - ./db/init:/container-entrypoint-initdb.d:ro
      - oracle_data:/opt/oracle/oradata

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: api
    environment:
      DB_USER: app
      DB_PASSWORD: app
      DB_CONNECT_STRING: host.docker.internal:1521/XEPDB1   
    extra_hosts:
      - "host.docker.internal:host-gateway"                 
    ports:
      - "3000:3000"
    depends_on:
      - oracle
        
    restart: unless-stopped

volumes:
  oracle_data:

```


##### Una vez tenemos el archivo .yml solo necesitaremos usar el siguiente comando:

#### 1. docker compose up -d --build
Este comando nos ayudara a construir las imagenes de nuestros contenedores, crear y levantar nuestros contenedor de nuestro archivo .yml

![alt text](image.png)

## Guia para conectarse a Dbeaver

#### 1. Primero necesitaremos crear una nueva conexion con este boton

![alt text](image-1.png)

#### 2. Despues nos aparece la siguiente interfaz 

![alt text](image-2.png)

#### 3. Seleccionaremos "Oracle" para nuestra nueva conexion y nos mostrara la siguiente interfaz

![alt text](image-3.png)


#### 4. Para lograr pondremos el usuario creado en el .yml

![alt text](image-4.png)


#### 5. Colocamos los datos en su respectivo lugar

![alt text](image-5.png)

#### 6. Presionamos probar conexion para ver si tuvo exito la nueva conexion

![alt text](image-6.png)

#### 7. Aparecera un mensaje de exito de conexion que confirmara que se creo correctamente la nueva conexion

![alt text](image-7.png)

#### 8. Despues podemos verificar que todas las tablas se muestran en la nueva conexion

![alt text](image-8.png)

## Uso de Endpoins

### Se usaron 5 tipos de endpoints para las 12 tablas que son los siguientes

#### 1. Ver todos: 
Este endpoint se utiliza para ver todos los registro de la tabla

ejemplo para la tabla centro:

```
app.get('/centros', async (_, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID_CENTRO, NOMBRE FROM CENTRO ORDER BY ID_CENTRO`);
    res.json(r.rows.map(([ID_CENTRO, NOMBRE]) => ({ ID_CENTRO, NOMBRE })));
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});
```

ejemplo en postman sobre la peticion:
![alt text](image-9.png)

#### 2. Ver por ID: 
Este endpoint se utiliza para ver un registro especifico por medio de su ID

ejemplo para la tabla centro:

```
app.get('/centros/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`SELECT ID_CENTRO, NOMBRE FROM CENTRO WHERE ID_CENTRO = :id`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado' });
    const [ID_CENTRO, NOMBRE] = r.rows[0];
    res.json({ ID_CENTRO, NOMBRE });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});
```

ejemplo en postman sobre la peticion:
![alt text](image-10.png)

#### 3. Creacion: 
Este endpoint se utiliza para crear un nuevo registro en la tabla

ejemplo para la tabla centro:

```
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
```

ejemplo en postman sobre la peticion:
![alt text](image-11.png)

#### 4. Eliminar: 
Este endpoint se utiliza para eliminar un registro de una tabla por medio de su ID

ejemplo para la tabla centro:

```
app.delete('/centros/:id', async (req, res) => {
  let c; try {
    c = await oracledb.getConnection(dbConfig);
    const r = await c.execute(`DELETE FROM CENTRO WHERE ID_CENTRO = :id`, [req.params.id], { autoCommit: true });
    if (r.rowsAffected === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); } finally { if (c) await c.close(); }
});
```

ejemplo en postman sobre la peticion:
![alt text](image-12.png)

#### 5. Actualizar: 
Este endpoint se utiliza para actualizar un registro de una tabla por medio de su ID

ejemplo para la tabla centro:

```
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
```

ejemplo en postman sobre la peticion:
![alt text](image-13.png)

### Endpoints extras

#### Ping
Este endpoint nos ayuda a verificar el estado de la api
```
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
```

si la api funciona correctamente nos devolvera el siguiente mensaje:

![alt text](image-14.png)

### Endpoints de consultas

#### Consulta 1
Presenta promedios de punteos teóricos y prácticos agrupados por centro de evaluación y escuela.

```
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
```

#### Consulta 2
Lista ordenada de evaluados por puntaje total descendente y resultado.

```
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

```

#### Consulta 3
 Identifica la pregunta más difícil del banco (menor porcentaje de aciertos).

```
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
```










