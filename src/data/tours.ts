// Textos de los recorridos guiados. Los hechos salen de SIGS/dw/sql y SIGS/docs/gestion.
// El "caso de ejemplo" del ETL (ultrasonido, Q350, fechas) es INVENTADO para explicar; la pantalla lo rotula así.

export type V3 = [number, number, number];
export type Cam = { pos: V3; tgt: V3 };
export type Ejemplo = { titulo: string; filas: [string, string][] };
export type Paso = {
  titulo: string;
  texto: string;
  cam?: Cam;
  sel?: string; // objeto resaltado
  focus?: string[]; // objetos que se quedan visibles; el resto se atenúa
  viaje?: string; // "origen>destino": una partícula grande recorre ese flujo del ETL
  antes?: Ejemplo;
  despues?: Ejemplo;
};

export type TourKey = "esquema" | "etl" | "edt" | "riesgos";

const CATALOGOS = ["departamento", "municipio", "tipo_entidad", "area_campana", "tipo_estudio"];
const DIMS = ["dim_tiempo", "dim_geografia", "dim_entidad", "dim_paciente", "dim_grupo_etario", "dim_tipo_estudio", "dim_area_campana"];

export const TOURS: Record<TourKey, Paso[]> = {
  esquema: [
    {
      titulo: "Dos mundos",
      texto:
        "A la izquierda está la base que usa la aplicación todos los días (sisg_fuente). A la derecha, el almacén de datos (sisg_dw), hecho solo para analizar. Un proceso llamado ETL copia los datos de una a otra. Vamos parte por parte.",
    },
    {
      titulo: "Catálogos: las listas fijas",
      texto:
        "Departamentos, municipios, tipos de entidad, áreas de campaña y tipos de estudio son listas cortas. Existen para no escribir texto libre: en vez de teclear «Alta Verapaz» en cada paciente, se guarda un número que apunta a la lista.",
      focus: CATALOGOS,
      cam: { pos: [-10, 21, 17], tgt: [-10, 0, -3] },
    },
    {
      titulo: "Maestras: quién participa",
      texto:
        "Las entidades (centros de diagnóstico y organismos no lucrativos) y sus pacientes. La tabla paciente guarda nombre, DPI y teléfono: datos sensibles que nunca pasan al almacén.",
      focus: ["entidad", "paciente"],
      cam: { pos: [-11, 18, 18], tgt: [-11, 0, 0] },
    },
    {
      titulo: "Transacciones: lo que ocurre",
      texto:
        "Cada estudio diagnóstico y cada campaña de salud es una fila. Son las dos tablas con más columnas (12 cada una) porque guardan fechas, estados, costos y resultados.",
      focus: ["estudio", "campana"],
      cam: { pos: [-6, 18, 24], tgt: [-6, 0, 6] },
    },
    {
      titulo: "Llaves foráneas: cómo se conectan",
      texto:
        "Un estudio no repite el nombre del paciente ni de la entidad: guarda sus números (llaves foráneas, FK) y apunta a esas filas. Las líneas amarillas muestran a dónde apunta estudio. Así cada dato vive en un solo lugar.",
      sel: "estudio",
      cam: { pos: [-10, 20, 22], tgt: [-10, 0, 1] },
    },
    {
      titulo: "Bitácora: quién cambió qué",
      texto:
        "La bitácora la llenan triggers (disparadores automáticos): cada INSERT, UPDATE o DELETE queda registrado. Es auditoría de la aplicación y no se carga al almacén.",
      focus: ["bitacora"],
      cam: { pos: [-13, 15, 21], tgt: [-15.5, 0, 6] },
    },
    {
      titulo: "Almacén: tablas de hechos",
      texto:
        "En el centro del almacén están las tablas de hechos: lo que se mide. fact_estudio tiene un renglón por estudio (costo, duración, estado) y fact_campana uno por campaña (personas atendidas, presupuesto).",
      focus: ["fact_estudio", "fact_campana"],
      cam: { pos: [13, 25, 26], tgt: [13, 0, 0] },
    },
    {
      titulo: "Almacén: dimensiones",
      texto:
        "Alrededor orbitan las dimensiones, las formas de mirar los hechos: cuándo (tiempo), dónde (geografía), qué entidad, qué tipo de estudio, qué edad. Los hechos apuntan a todas; por eso se llama modelo estrella.",
      focus: [...DIMS, "fact_estudio", "fact_campana"],
      cam: { pos: [13, 24, 26], tgt: [13, 0, 1] },
    },
    {
      titulo: "El resumen mensual",
      texto:
        "fact_estudio_mensual es una tabla resumen ya calculada: 1,758 filas en lugar de las 12,507 de fact_estudio. En la medición del 13 de noviembre, la consulta sobre el resumen fue unas 7 veces más rápida.",
      focus: ["fact_estudio_mensual", "fact_estudio"],
      cam: { pos: [14, 21, 24], tgt: [14, 0, 2] },
    },
    {
      titulo: "Siguiente: cómo viajan los datos",
      texto:
        "Cambia a «Flujo ETL» (arriba) y vuelve a pulsar Recorrido: verás cómo se mueven los datos de un lado al otro, con un caso de ejemplo.",
    },
  ],

  etl: [
    {
      titulo: "Qué hace el ETL",
      texto:
        "ETL significa Extraer, Transformar y Cargar. El procedimiento sp_etl_completo vacía el almacén y lo vuelve a llenar en este orden: primero las dimensiones, luego los hechos y al final el resumen. Las partículas son los datos viajando.",
    },
    {
      titulo: "dim_tiempo se genera sola",
      texto:
        "Esta dimensión no viene de ninguna tabla: se crea un renglón por cada día, del 1 de enero de 2024 al 31 de diciembre de 2027, con año, trimestre, mes y día de la semana.",
      focus: ["dim_tiempo"],
    },
    {
      titulo: "La geografía se aplana",
      texto:
        "Departamento y municipio son dos tablas en la fuente. En el almacén se juntan en una: un renglón por municipio, con el nombre del departamento escrito al lado. Repite texto, pero evita uniones al consultar.",
      focus: ["departamento", "municipio", "dim_geografia"],
    },
    {
      titulo: "Entidad con su tipo y departamento",
      texto: "El nombre del tipo de entidad y el del departamento se copian como texto dentro de dim_entidad, en una sola fila.",
      focus: ["tipo_entidad", "entidad", "dim_entidad"],
    },
    {
      titulo: "Caso de ejemplo: un ultrasonido",
      texto:
        "Sigamos un estudio inventado, solo para explicar: a una paciente se le hizo un ultrasonido el 12 de octubre de 2026. Así se ve en la fuente. Los nombres y valores son de ejemplo.",
      focus: ["estudio", "paciente"],
      antes: {
        titulo: "En la fuente: estudio",
        filas: [["tipo", "Ultrasonido"], ["fecha", "2026-10-12"], ["estado", "REALIZADO"], ["costo_q", "350"], ["duracion_min", "30"], ["resultado", "(texto clínico)"]],
      },
    },
    {
      titulo: "Del paciente solo viaja el id y el sexo",
      texto:
        "Nombre, DPI, teléfono y fecha de nacimiento se quedan en la fuente. El almacén solo recibe el identificador y el sexo. Así se cumple el riesgo R3: sin datos personales en el almacén.",
      focus: ["paciente", "dim_paciente"],
      viaje: "paciente>dim_paciente",
      antes: {
        titulo: "En la fuente: paciente",
        filas: [["nombre_completo", "(dato personal)"], ["dpi", "(dato personal)"], ["fecha_nacimiento", "1990-05-14"], ["sexo", "F"]],
      },
      despues: { titulo: "En el almacén: dim_paciente", filas: [["paciente_id", "(id)"], ["sexo", "F"]] },
    },
    {
      titulo: "El estudio se vuelve un hecho",
      texto:
        "El estudio se convierte en una fila de fact_estudio con su fecha, entidad, tipo, estado, costo y duración. El resultado clínico no pasa. De la paciente se toma su residencia y su edad el día del estudio: 36 años, grupo 30-44.",
      focus: ["estudio", "paciente", "fact_estudio"],
      viaje: "estudio>fact_estudio",
      antes: {
        titulo: "En la fuente",
        filas: [["fecha", "2026-10-12"], ["nacimiento", "1990-05-14"], ["estado", "REALIZADO"], ["costo_q", "350"]],
      },
      despues: {
        titulo: "En el almacén: fact_estudio",
        filas: [["tiempo_key", "20261012"], ["grupo_etario", "30-44"], ["estado", "REALIZADO"], ["cantidad", "1"], ["costo_q", "350"], ["duracion_min", "30"]],
      },
    },
    {
      titulo: "Y se suma al resumen",
      texto:
        "Los estudios REALIZADOS se agrupan por año, mes, entidad y tipo de estudio. Este ultrasonido suma 1 al total y Q350 a los ingresos de octubre de 2026 en fact_estudio_mensual.",
      focus: ["fact_estudio", "fact_estudio_mensual"],
      viaje: "fact_estudio>fact_estudio_mensual",
      despues: {
        titulo: "En el resumen mensual",
        filas: [["anio / mes", "2026 / 10"], ["total_estudios", "+ 1"], ["ingresos_q", "+ 350"]],
      },
    },
    {
      titulo: "Cada corrida deja huella",
      texto:
        "Cada ejecución del ETL queda registrada en etl_log (inicio, fin, filas cargadas y resultado). Después se compara la fuente con el almacén (reconciliación): la diferencia debe ser 0.",
      focus: ["etl_log"],
    },
  ],

  edt: [
    {
      titulo: "La EDT: el proyecto en pedazos",
      texto:
        "EDT significa Estructura de Desglose del Trabajo. El pilar blanco es todo el proyecto: 168 horas. Se parte en áreas y las áreas en tareas medibles, como el índice de un libro. Los 20 paquetes suman exactamente las 168 horas (regla del 100 %).",
    },
    {
      titulo: "Cinco áreas",
      texto:
        "Cada plataforma de color es un área: 1 Gestión del proyecto, 2 Datos (Bases de Datos II), 3 Aplicación web, 4 Calidad y pruebas y 5 Cierre. La etiqueta de cada una dice sus horas.",
      focus: ["g1", "g2", "g3", "g4", "g5"],
    },
    {
      titulo: "Una barra es un paquete de trabajo",
      texto:
        "Esta es 3.1, Backend y autenticación: 25 horas, 100 % de avance. La altura es el esfuerzo y la parte sólida es lo ya hecho. Como está entera sólida, está terminada. Haz clic en cualquiera para ver sus fechas y responsable.",
      sel: "3.1",
      focus: ["3.1"],
      cam: { pos: [-6, 11, 22], tgt: [-1.9, 2.5, 0] },
    },
    {
      titulo: "Altura = horas",
      texto: "3.1 (25 h) es la más alta del proyecto; 1.5, los reportes de estado semanales (3 h), es de las más bajas. A simple vista se ve qué pesa más.",
      focus: ["3.1", "1.5"],
    },
    {
      titulo: "Sólido = hecho, transparente = falta",
      texto:
        "2.3 (ETL) lleva 70 %. 2.5 (documento técnico) lleva 20 %. 5.2 (exposición final) lleva 0 %: solo se ve el contorno. El avance de cada barra es la fracción sólida.",
      focus: ["2.3", "2.5", "5.2"],
    },
    {
      titulo: "Lo hecho y lo que falta",
      texto: "El área 3 (Aplicación web) ya está casi toda sólida: terminada. El área 5 (Cierre) está vacía porque todavía no empieza. Así se ve en qué etapa va el proyecto.",
      focus: ["g3", "g5"],
    },
    {
      titulo: "Los números de arriba",
      texto:
        "Con las horas y los avances salen los indicadores: se han ganado 110.1 de 168 horas (66 %) y se debía ir en 86.6 horas, así que van adelantados. Ojo: horas y porcentajes son estimaciones iniciales que el grupo debe validar. Prueba los estilos A, B, D y E arriba a la izquierda.",
    },
    {
      titulo: "El plazo que importa",
      texto:
        "La entrega de Bases de Datos II vence el 28 de noviembre a las 8:00. La cadena de tareas de esa materia tiene 2 días de holgura, y con el método PERT la probabilidad de cumplir es de alrededor del 74 %.",
    },
  ],

  riesgos: [
    {
      titulo: "La matriz de riesgos",
      texto:
        "Cada esfera es un riesgo del proyecto (R2 a R14). Hacia la derecha es más probable; hacia el fondo, más dañino. Los bloques suben y cambian de color según el nivel: verde bajo, amarillo medio, naranja alto, rojo crítico.",
    },
    {
      titulo: "El único riesgo crítico: R2",
      texto:
        "R2 es probable y de impacto alto: la cadena de Bases de Datos II tiene solo 2 días de holgura y coincide con el examen final. Se mitiga adelantando el ETL con datos reales.",
      sel: "R2",
      focus: ["R2"],
      cam: { pos: [8, 11, 8], tgt: [4, 0.5, -4] },
    },
    {
      titulo: "Tamaño = reserva en horas",
      texto: "Cuanto más grande la esfera, más horas de contingencia se apartaron para ese riesgo. R2 tiene 6 h, R5 tiene 4 h y R3 tiene 0 h porque se evita en vez de reservar tiempo.",
      focus: ["R2", "R5", "R3"],
    },
    {
      titulo: "Riesgos altos",
      texto: "R4 (otros grupos sin formato de datos), R5 (sobrecarga de un integrante), R8 (omitir la declaración de IA o el formato IEEE) y R12 (fuga de datos de salud).",
      focus: ["R4", "R5", "R8", "R12"],
    },
    {
      titulo: "Datos de salud",
      texto:
        "Tres riesgos tocan datos sensibles: R3 (nombres o DPI en el almacén), R12 (descarga masiva con credenciales robadas) y R13 (suplantación para ordenar una exportación). Por eso el almacén solo guarda id y sexo.",
      focus: ["R3", "R12", "R13"],
    },
    {
      titulo: "Riesgos bajos",
      texto: "R7 (conexión entre la aplicación y el almacén) ya está mitigada porque la reconciliación da 0. R10 (datos sintéticos poco reales) se acepta y se declara como límite. R14 (equipos sin parche) se vigila con una revisión mensual.",
      focus: ["R7", "R10", "R14"],
    },
    {
      titulo: "Resumen",
      texto:
        "Las respuestas a los riesgos suman 19 horas de reserva. Las probabilidades y los impactos son valoraciones del borrador que el grupo debe validar.",
    },
  ],
};
