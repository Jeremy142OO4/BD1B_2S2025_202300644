// Config simple: nombre de tabla, PK (string o array), y columnas (en orden)
export const TABLES = [
  { name: 'centros', table: 'CENTRO', pk: 'ID_CENTRO', columns: ['ID_CENTRO','NOMBRE'] },
  { name: 'correlativos', table: 'CORRELATIVO', pk: 'ID_CORRELATIVO', columns: ['ID_CORRELATIVO','FECHA','NO_EXAMEN'] },
  { name: 'departamentos', table: 'DEPARTAMENTO', pk: 'ID_DEPARTAMENTO', columns: ['ID_DEPARTAMENTO','NOMBRE','CODIGO'] },
  { name: 'escuelas', table: 'ESCUELA', pk: 'ID_ESCUELA', columns: ['ID_ESCUELA','NOMBRE','DIRECCION','ACUERDO'] },
  { name: 'examenes', table: 'EXAMEN', pk: 'ID_EXAMEN', columns: ['ID_EXAMEN','REGISTRO_ID_ESCUELA','REGISTRO_ID_CENTRO','REGISTRO_MUNICIPIO_ID','REGISTRO_MUNICIPIO_DEPARTAMENTO_ID','REGISTRO_ID','CORRELATIVO_ID']},
  { name: 'municipios', table: 'MUNICIPIO', pk: 'ID_MUNICIPIO', columns: ['ID_MUNICIPIO','DEPARTAMENTO_ID','NOMBRE','CODIGO'] },
  { name: 'preguntas', table: 'PREGUNTAS', pk: 'ID', columns: ['ID','PREGUNTA_TEXTO','RESPUESTA','RES1','RES2','RES3','RES4'] },
  { name: 'preguntas-practico', table: 'PREGUNTAS_PRACTICO', pk: 'ID_PREGUNTA_PRACTICO', columns: ['ID_PREGUNTA_PRACTICO','PREGUNTA_TEXTO','PUNTEO'] },
  { name: 'registros', table: 'REGISTRO', pk: 'ID_REGISTRO', columns: ['ID_REGISTRO','UBICACION_ESCUELA_ID','UBICACION_CENTRO_ID','MUNICIPIO_ID','MUNICIPIO_DEPARTAMENTO_ID','FECHA','TIPO_TRAMITE','TIPO_LICENCIA','NOMBRE_COMPLETO','GENERO']},
  { name: 'resp-practico', table: 'RESPUESTA_PRACTICO_USUARIO', pk: 'ID_RESPUESTA_PRACTICO', columns: ['ID_RESPUESTA_PRACTICO','PREGUNTA_PRACTICO_ID','EXAMEN_ID','NOTA'] },
  { name: 'resp-usuario', table: 'RESPUESTA_USUARIO', pk: 'ID_RESPUESTA_USUARIO', columns: ['ID_RESPUESTA_USUARIO','PREGUNTA_ID','EXAMEN_ID','RESPUESTA'] },
  { name: 'ubicaciones', table: 'UBICACION', pk: ['ESCUELA_ID','CENTRO_ID'], columns: ['ESCUELA_ID','CENTRO_ID'] },
];
