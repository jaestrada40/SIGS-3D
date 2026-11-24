// Esquema copiado de SIGS/dw/sql/01_fuente_esquema.sql y 04_dw_esquema.sql, y el ETL de 05_dw_etl.sql.
// Si el esquema cambia allá, hay que actualizar este archivo a mano.

export type Kind = "catalogo" | "maestra" | "transaccion" | "bitacora" | "dim" | "fact" | "aux";
export type Col = { n: string; t: string; pk?: boolean; ref?: string };
export type Tbl = {
  id: string;
  side: "fuente" | "dw";
  kind: Kind;
  cols: Col[];
  pos: [number, number];
  nota?: string;
  filas?: string;
};

// "nombre tipo [pk] [>tabla]"  →  Col
function c(s: string): Col {
  const [n, t, ...rest] = s.split(" ");
  const ref = rest.find((r) => r.startsWith(">"))?.slice(1);
  return { n, t, pk: rest.includes("pk"), ref };
}
const T = (
  id: string,
  side: Tbl["side"],
  kind: Kind,
  pos: [number, number],
  cols: string[],
  extra: Partial<Tbl> = {},
): Tbl => ({ id, side, kind, pos, cols: cols.map(c), ...extra });

// ── Fuente (OLTP) a la izquierda; posiciones [x, z] ──
export const TABLAS: Tbl[] = [
  T("departamento", "fuente", "catalogo", [-17, -7], ["id TINYINT pk", "nombre VARCHAR(40)"]),
  T("municipio", "fuente", "catalogo", [-12.5, -7], ["id SMALLINT pk", "departamento_id TINYINT >departamento", "nombre VARCHAR(60)"]),
  T("tipo_entidad", "fuente", "catalogo", [-8, -7], ["id TINYINT pk", "nombre VARCHAR(40)"]),
  T("area_campana", "fuente", "catalogo", [-3.5, -7], ["id TINYINT pk", "nombre VARCHAR(40)"]),
  T("tipo_estudio", "fuente", "catalogo", [-3.5, 0], ["id TINYINT pk", "nombre VARCHAR(60)", "categoria VARCHAR(30)", "precio_base_q DECIMAL(10,2)", "duracion_base SMALLINT"]),
  T("entidad", "fuente", "maestra", [-14, 0], [
    "id INT pk", "nombre VARCHAR(120)", "tipo_entidad_id TINYINT >tipo_entidad", "departamento_id TINYINT >departamento",
    "telefono VARCHAR(20)", "correo VARCHAR(120)", "creado_en DATETIME",
  ]),
  T("paciente", "fuente", "maestra", [-8.5, 0], [
    "id INT pk", "entidad_id INT >entidad", "nombre_completo VARCHAR(120)", "dpi VARCHAR(20)", "fecha_nacimiento DATE", "sexo ENUM(F,M,NE)",
    "departamento_id TINYINT >departamento", "municipio_id SMALLINT >municipio", "telefono VARCHAR(20)", "estado ENUM(ACTIVO,INACTIVO)",
  ], { nota: "Tiene nombre, DPI y teléfono: nada de esto pasa al almacén de datos." }),
  T("estudio", "fuente", "transaccion", [-9, 7], [
    "id BIGINT pk", "entidad_id INT >entidad", "paciente_id INT >paciente", "tipo_estudio_id TINYINT >tipo_estudio", "fecha DATE", "hora TIME",
    "especialista VARCHAR(80)", "sala_equipo VARCHAR(40)", "estado ENUM(PROGRAMADO,REALIZADO,CANCELADO)", "duracion_min SMALLINT", "costo_q DECIMAL(10,2)", "resultado TEXT",
  ], { nota: "El resultado clínico (texto) tampoco pasa al almacén." }),
  T("campana", "fuente", "transaccion", [-3, 7], [
    "id INT pk", "entidad_id INT >entidad", "area_id TINYINT >area_campana", "nombre VARCHAR(120)", "departamento_id TINYINT >departamento",
    "municipio_id SMALLINT >municipio", "ubicacion VARCHAR(120)", "fecha_inicio DATE", "fecha_fin DATE", "estado ENUM(PROGRAMADA,EN_CURSO,FINALIZADA)",
    "personas_atendidas INT", "presupuesto_q DECIMAL(12,2)",
  ]),
  T("bitacora", "fuente", "bitacora", [-15.5, 7], ["id BIGINT pk", "tabla VARCHAR(30)", "registro_id BIGINT", "accion ENUM(INSERT,UPDATE,DELETE)", "usuario_db VARCHAR(80)", "fecha_hora DATETIME", "detalle JSON"], {
    nota: "La llenan triggers (auditoría). No se carga al almacén.",
  }),

  // ── Almacén (modelo estrella) a la derecha; las posiciones de dims/facts las calcula DW_LAYOUT ──
  T("fact_estudio", "dw", "fact", [0, 0], [
    "estudio_id BIGINT pk", "tiempo_key INT >dim_tiempo", "entidad_key INT >dim_entidad", "geo_key SMALLINT >dim_geografia", "paciente_key INT >dim_paciente",
    "tipo_estudio_key SMALLINT >dim_tipo_estudio", "grupo_etario_key SMALLINT >dim_grupo_etario", "estado ENUM", "cantidad TINYINT", "costo_q DECIMAL(10,2)", "duracion_min SMALLINT",
  ], { filas: "12,507 filas (medición del 13 nov. 2026, datos sintéticos)" }),
  T("fact_campana", "dw", "fact", [0, 0], [
    "campana_id INT pk", "tiempo_inicio_key INT >dim_tiempo", "tiempo_fin_key INT >dim_tiempo", "entidad_key INT >dim_entidad", "geo_key SMALLINT >dim_geografia",
    "area_key SMALLINT >dim_area_campana", "estado ENUM", "personas_atendidas INT", "presupuesto_q DECIMAL(12,2)", "duracion_dias SMALLINT",
  ], { nota: "dim_tiempo participa con dos roles: inicio y fin." }),
  T("fact_estudio_mensual", "dw", "fact", [0, 0], [
    "anio SMALLINT pk", "mes TINYINT pk", "entidad_key INT pk >dim_entidad", "tipo_estudio_key SMALLINT pk >dim_tipo_estudio",
    "total_estudios INT", "ingresos_q DECIMAL(14,2)", "duracion_prom_min DECIMAL(8,2)",
  ], { filas: "1,758 filas (≈7 veces más rápida que consultar fact_estudio)", nota: "Tabla resumen precalculada." }),
  T("dim_tiempo", "dw", "dim", [0, 0], ["tiempo_key INT pk", "fecha DATE", "anio SMALLINT", "trimestre TINYINT", "mes TINYINT", "nombre_mes VARCHAR(12)", "dia TINYINT", "dia_semana VARCHAR(10)", "es_fin_semana BOOLEAN"], {
    nota: "Se genera sola, un renglón por día del 2024-01-01 al 2027-12-31. No viene de ninguna tabla fuente.",
  }),
  T("dim_geografia", "dw", "dim", [0, 0], ["geo_key SMALLINT pk", "departamento_id TINYINT", "municipio_id SMALLINT", "departamento VARCHAR(40)", "municipio VARCHAR(60)"], {
    nota: "Desnormalizada: departamento y municipio en la misma fila. Incluye la fila -1 «Desconocido».",
  }),
  T("dim_entidad", "dw", "dim", [0, 0], ["entidad_key INT pk", "entidad_id INT", "nombre VARCHAR(120)", "tipo_entidad VARCHAR(40)", "departamento VARCHAR(40)"], {
    nota: "El tipo de entidad y el departamento ya vienen escritos como texto, sin joins.",
  }),
  T("dim_paciente", "dw", "dim", [0, 0], ["paciente_key INT pk", "paciente_id INT", "sexo CHAR(2)"], {
    nota: "Solo id y sexo. Sin nombre, DPI ni teléfono (riesgo R3).",
  }),
  T("dim_grupo_etario", "dw", "dim", [0, 0], ["grupo_etario_key SMALLINT pk", "etiqueta VARCHAR(10)", "edad_min TINYINT", "edad_max TINYINT"], {
    nota: "6 filas fijas: Sin dato, 0-14, 15-29, 30-44, 45-59, 60+. La edad se calcula el día del estudio.",
  }),
  T("dim_tipo_estudio", "dw", "dim", [0, 0], ["tipo_estudio_key SMALLINT pk", "tipo_estudio_id TINYINT", "tipo_estudio VARCHAR(60)", "categoria VARCHAR(30)"]),
  T("dim_area_campana", "dw", "dim", [0, 0], ["area_key SMALLINT pk", "area_id TINYINT", "area VARCHAR(40)"]),
  T("etl_log", "dw", "aux", [0, 0], ["id INT pk", "inicio DATETIME", "fin DATETIME", "filas_estudio INT", "filas_campana INT", "filas_resumen INT", "resultado VARCHAR(10)", "mensaje TEXT"], {
    nota: "Bitácora de cada corrida del ETL (sp_etl_completo).",
  }),
];

// Constelación del almacén: hechos al centro, dimensiones en órbita.
const CX = 13, CZ = 0;
const centro: Record<string, [number, number]> = {
  fact_estudio: [CX - 2.6, CZ], fact_campana: [CX + 2.6, CZ],
};
const orbita: [string, number, number][] = [ // id, ángulo°, radio
  ["dim_area_campana", 0, 8.5], ["dim_geografia", 42, 8], ["dim_tiempo", 90, 7], ["dim_entidad", 138, 8],
  ["dim_paciente", 180, 8.5], ["dim_grupo_etario", 222, 8], ["dim_tipo_estudio", 268, 7.5], ["fact_estudio_mensual", 318, 5.5],
];
for (const [id, a, r] of orbita) {
  const rad = (a * Math.PI) / 180;
  centro[id] = [CX + Math.cos(rad) * r * 1.15, CZ - Math.sin(rad) * r];
}
centro.etl_log = [CX + 9.5, 9.5];
for (const t of TABLAS) if (centro[t.id]) t.pos = centro[t.id];

export const porId = Object.fromEntries(TABLAS.map((t) => [t.id, t])) as Record<string, Tbl>;

/** Llaves foráneas (declaradas en el SQL; en el DW algunas son lógicas). */
export const FKS: { de: string; a: string }[] = TABLAS.flatMap((t) =>
  t.cols.filter((x) => x.ref).map((x) => ({ de: t.id, a: x.ref! })),
).filter((f, i, arr) => arr.findIndex((g) => g.de === f.de && g.a === f.a) === i);

/** Cómo viaja cada dato de la fuente al almacén (05_dw_etl.sql). */
export const ETL: { de: string; a: string; txt: string }[] = [
  { de: "departamento", a: "dim_geografia", txt: "Un renglón por municipio y otro por departamento (se aplana)" },
  { de: "municipio", a: "dim_geografia", txt: "Un renglón por municipio, con el nombre del departamento" },
  { de: "tipo_entidad", a: "dim_entidad", txt: "El nombre del tipo se copia como texto" },
  { de: "entidad", a: "dim_entidad", txt: "Nombre, tipo y departamento en una sola fila" },
  { de: "paciente", a: "dim_paciente", txt: "Solo id y sexo; se descartan nombre, DPI, teléfono y fecha de nacimiento" },
  { de: "tipo_estudio", a: "dim_tipo_estudio", txt: "Nombre y categoría (sin precios)" },
  { de: "area_campana", a: "dim_area_campana", txt: "Catálogo copiado tal cual" },
  { de: "estudio", a: "fact_estudio", txt: "Un hecho por estudio: fecha, entidad, tipo, estado, costo y duración" },
  { de: "paciente", a: "fact_estudio", txt: "Aporta la residencia (geo_key) y la edad el día del estudio (grupo etario)" },
  { de: "campana", a: "fact_campana", txt: "Un hecho por campaña, con duración en días calculada" },
  { de: "fact_estudio", a: "fact_estudio_mensual", txt: "Solo REALIZADO, agrupado por año, mes, entidad y tipo de estudio" },
];

export const COLOR: Record<Kind, string> = {
  catalogo: "#6aa7d8",
  maestra: "#4fc3a1",
  transaccion: "#f2a65a",
  bitacora: "#9aa5b1",
  dim: "#9b8cf0",
  fact: "#ef6f8e",
  aux: "#9aa5b1",
};
export const KIND_LABEL: Record<Kind, string> = {
  catalogo: "Catálogo", maestra: "Maestra", transaccion: "Transacción", bitacora: "Auditoría",
  dim: "Dimensión", fact: "Hechos", aux: "Control del ETL",
};
