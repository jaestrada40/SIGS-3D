// Datos copiados de SIGS/docs/gestion (02_edt_cronograma_costos.md y 04_riesgos_calidad.md), corte 24 de octubre de 2026.
// Las horas, los % de avance y las valoraciones son estimaciones iniciales del propio borrador; el grupo debe validarlas.

export type Grupo = { id: string; nombre: string; color: string };
export const GRUPOS: Grupo[] = [
  { id: "1", nombre: "Gestión del proyecto", color: "#6aa7d8" },
  { id: "2", nombre: "Datos · Bases de Datos II", color: "#9b8cf0" },
  { id: "3", nombre: "Aplicación web", color: "#4fc3a1" },
  { id: "4", nombre: "Calidad y pruebas", color: "#f2a65a" },
  { id: "5", nombre: "Cierre", color: "#ef6f8e" },
];

export type Paquete = { cod: string; nombre: string; horas: number; fechas: string; avance: number; resp: string };
const P = (cod: string, nombre: string, horas: number, fechas: string, avance: number, resp: string): Paquete => ({ cod, nombre, horas, fechas, avance, resp });

export const PAQUETES: Paquete[] = [
  P("1.1", "Acta de constitución y alcance", 6, "24 oct – 26 oct", 50, "Líder"),
  P("1.2", "EDT, cronograma y costos", 6, "24 oct – 27 oct", 50, "Líder"),
  P("1.3", "Interesados y comunicaciones", 5, "24 oct – 28 oct", 50, "Líder"),
  P("1.4", "Riesgos y calidad", 6, "24 oct – 30 oct", 50, "Calidad"),
  P("1.5", "Reportes de estado semanales", 3, "1 nov – 20 nov", 0, "Líder"),
  P("2.1", "ER de las fuentes", 8, "15 oct – 25 oct", 100, "Datos"),
  P("2.2", "Modelo estrella", 8, "24 oct – 30 oct", 80, "Datos"),
  P("2.3", "ETL", 10, "24 oct – 10 nov", 70, "Datos"),
  P("2.4", "Consultas analíticas", 6, "24 oct – 14 nov", 60, "Datos"),
  P("2.5", "Documento técnico BD II", 8, "9 nov – 27 nov", 20, "Datos"),
  P("3.1", "Backend y autenticación", 25, "5 oct – 23 oct", 100, "Calidad"),
  P("3.2", "Interfaz y rediseño", 12, "24 oct", 100, "Calidad"),
  P("3.3", "Carga masiva y bitácora", 12, "24 oct", 100, "Calidad"),
  P("3.4", "Seguridad y usuarios", 12, "24 oct", 100, "Calidad"),
  P("4.1", "Pruebas e2e", 8, "5 oct – 24 oct", 100, "Calidad"),
  P("4.2", "Reconciliación fuente–DW", 3, "24 oct", 100, "Calidad"),
  P("4.3", "Revisión por pares y verificación", 6, "9 nov – 20 nov", 0, "Calidad"),
  P("5.1", "Informe de cierre y lecciones", 8, "12 nov – 19 nov", 0, "Todos"),
  P("5.2", "Preparar y dar la exposición final", 10, "16 nov – 21 nov", 0, "Todos"),
  P("5.3", "Ajustes y entrega final BD II", 6, "23 nov – 28 nov", 0, "Datos"),
];

export const KPI = [
  { k: "BAC", v: "168 h", t: "Presupuesto total: suma de las horas de los 20 paquetes" },
  { k: "EV", v: "110.1 h", t: "Valor ganado = horas × % de avance" },
  { k: "SPI", v: "1.27", t: "EV/PV: mayor que 1 = adelantados respecto del plan (depende de estimaciones)" },
  { k: "Avance", v: "66 %", t: "EV/BAC" },
  { k: "Cumplir BD II", v: "≈ 74 %", t: "Probabilidad PERT de entregar antes del 28 nov., 8:00 (2 días de holgura)" },
];

export type Nivel = "Crítico" | "Alto" | "Medio" | "Bajo";
export type Prob = "Baja" | "Media" | "Alta";
export type Imp = "Bajo" | "Medio" | "Alto";
export type Riesgo = {
  id: string; cat: string; titulo: string; prob: Prob; imp: Imp; nivel: Nivel; resp: string; reserva: number; resp_txt: string;
};
const R = (id: string, cat: string, titulo: string, prob: Prob, imp: Imp, nivel: Nivel, resp: string, reserva: number, resp_txt: string): Riesgo =>
  ({ id, cat, titulo, prob, imp, nivel, resp, reserva, resp_txt });

export const RIESGOS: Riesgo[] = [
  R("R2", "Cronograma", "La cadena de Bases de Datos II tiene 2 días de holgura y coincide con el examen final", "Alta", "Alto", "Crítico", "Líder", 6, "Mitigar: adelantar el ETL con datos reales y mantener el solape de la revisión con la redacción"),
  R("R3", "Técnico", "Datos de salud sensibles (nombres, DPI) en el almacén de datos o en las entregas", "Baja", "Alto", "Medio", "Calidad", 0, "Evitar: el DW no guarda datos personales; solo datos sintéticos en las entregas"),
  R("R4", "Cliente", "Otros grupos no definen sus formatos de datos a tiempo", "Alta", "Medio", "Alto", "Datos", 2, "Mitigar: publicar un contrato de datos propio (plantilla CSV y catálogos) y dejar la integración real como exclusión"),
  R("R5", "Personas", "Sobrecarga de un integrante (equipo de 3 personas)", "Media", "Alto", "Alto", "Líder", 4, "Mitigar: reparto de roles y revisión semanal de horas reales"),
  R("R6", "Contractual", "Crecimiento del alcance hacia funciones de la aplicación que no se evalúan", "Media", "Medio", "Medio", "Líder", 0, "Evitar: control de cambios aprobado por el líder y registrado"),
  R("R7", "Técnico", "La aplicación (Postgres) y el DW (MySQL) no se conectan", "Baja", "Medio", "Bajo", "Datos", 0, "Mitigar: el puente existe y la reconciliación da 0; repetirlo tras cada cambio de esquema"),
  R("R8", "Contractual", "Omitir la declaración de uso de IA o el formato IEEE (nota máxima 60 %)", "Media", "Alto", "Alto", "Calidad", 1, "Mitigar: apéndice de declaración preparado y lista de verificación antes de cada entrega"),
  R("R9", "Técnico", "Falla del equipo o de Docker durante la demostración", "Baja", "Alto", "Medio", "Calidad", 1, "Mitigar: capturas, video y copia de los scripts"),
  R("R10", "Técnico", "Los datos sintéticos no reflejan casos reales", "Media", "Bajo", "Bajo", "Datos", 0, "Aceptar: declararlo como límite en la sustentación"),
  R("R11", "Contractual", "No se leyeron los lineamientos de los entregables 2 y 3 del curso", "Media", "Medio", "Medio", "Líder", 1, "Mitigar: leer las instrucciones de las tareas y ajustar los documentos antes de entregar"),
  R("R12", "Técnico", "Fuga de datos de salud de la aplicación (acceso o descarga masiva con credenciales robadas)", "Media", "Alto", "Alto", "Calidad", 2, "Mitigar: MFA obligatorio, roles, bloqueo por intentos y auditoría. Pendiente antes de publicar: HTTPS y cookie HttpOnly"),
  R("R13", "Personas", "Suplantación (phishing o deepfake) para ordenar la exportación de la base de pacientes", "Baja", "Alto", "Medio", "Calidad", 1, "Mitigar: colgar y llamar al número oficial antes de exportar; exportaciones auditadas"),
  R("R14", "Técnico", "Equipos del grupo con sistemas sin parche (vulnerabilidades conocidas)", "Baja", "Medio", "Bajo", "Líder", 1, "Mitigar: mantener las actualizaciones al día y revisar el inventario cada mes"),
];

export const NIVEL_COLOR: Record<Nivel, string> = { Crítico: "#e5484d", Alto: "#f2994a", Medio: "#f5d90a", Bajo: "#46a758" };
export const NIVEL_MATRIZ: Record<Imp, Record<Prob, Nivel>> = {
  Alto: { Baja: "Medio", Media: "Alto", Alta: "Crítico" },
  Medio: { Baja: "Bajo", Media: "Medio", Alta: "Alto" },
  Bajo: { Baja: "Bajo", Media: "Bajo", Alta: "Medio" },
};
export const PROBS: Prob[] = ["Baja", "Media", "Alta"];
export const IMPS: Imp[] = ["Bajo", "Medio", "Alto"];

// Del documento 02_edt_cronograma_costos.md, TABLA IV y sección 3 (al 24 oct. 2026).
export const PV = 86.6; // valor planificado en horas
export const PROB_PLAZO = 74; // % de cumplir la entrega de BD II (PERT)
