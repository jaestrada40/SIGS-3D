# SISG · Datos y gestión en 3D

Visualización 3D interactiva del proyecto SISG (Grupo 4): el esquema de base de datos y el ETL por un lado, y la administración del proyecto por el otro. Todo se genera por código (sin modelos externos) y los datos están copiados de la carpeta `SIGS`.

## Cómo correrlo

Requiere Node.js 20 o superior. La carpeta se comparte sin `node_modules`:

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # revisa tipos y compila a dist/
```

## Qué muestra

**Pestaña Datos**
- **Esquema:** las 10 tablas de `sisg_fuente` a la izquierda y las 11 del almacén `sisg_dw` (modelo estrella) a la derecha, con los hechos al centro y las dimensiones en órbita. El alto del bloque es el número de columnas; las líneas son llaves foráneas.
- **Flujo ETL:** partículas que viajan de cada tabla fuente a su destino en el almacén, según `sp_etl_completo`. Se ve que `departamento` y `municipio` se aplanan en `dim_geografia` y que `paciente` solo aporta id y sexo (sin datos personales).
- Clic en una tabla: columnas, llaves, de dónde se carga y a dónde alimenta.

**Pestaña Gestión**
- **EDT:** los 20 paquetes de trabajo como barras (altura = horas, parte sólida = avance), agrupados en 5 ramas bajo la raíz del proyecto. Arriba, un selector con cuatro formas de mostrar los indicadores (tarjetas en palabras, barra comparativa, semáforos o siglas) para elegir la más clara.
- **Riesgos:** matriz probabilidad × impacto; cada riesgo (R2 a R14) es una esfera cuyo tamaño es su reserva en horas.

**Recorrido guiado** (botón amarillo arriba a la derecha): en cada vista (Esquema, Flujo ETL, EDT y Riesgos) la cámara vuela de parte en parte y una tarjeta explica qué se ve. Se avanza con **Siguiente / Anterior** o con las flechas del teclado, o con **Automático**, que avanza solo y se puede pausar. En Flujo ETL incluye un caso de ejemplo (un ultrasonido) que se sigue de la fuente al almacén; ese registro es **inventado** y la pantalla lo avisa. Los textos están en `src/data/tours.ts`.

Controles: arrastrar = rotar, clic derecho o dos dedos = mover, rueda = zoom, "Vista general" = cámara inicial, clic en vacío = deseleccionar, `Esc` = cerrar el recorrido.

## De dónde salen los datos

Son copias escritas a mano en `src/data/`. Si el proyecto cambia, hay que actualizarlas:

| Archivo | Fuente en `SIGS` |
|---|---|
| `src/data/schema.ts` | `dw/sql/01_fuente_esquema.sql`, `04_dw_esquema.sql`, `05_dw_etl.sql` |
| `src/data/proyecto.ts` | `docs/gestion/02_edt_cronograma_costos.md`, `04_riesgos_calidad.md` |

## Limitaciones

- Horas, avances y valoraciones de riesgo son estimaciones del borrador original; el grupo debe validarlas.
- Las filas de `fact_estudio` (12,507) y `fact_estudio_mensual` (1,758) vienen de la medición del 13 nov.; las demás tablas no muestran conteo porque no hay una cifra en los documentos.
- Los textos del recorrido son una redacción propia a partir de los documentos de SIGS; conviene que el grupo los revise antes de exponerlos.
- No cubre el cronograma de actividades A–L (ruta crítica), ni interesados ni costos por paquete.
- No probado en celular ni en navegadores distintos de Chrome.

## Stack

Vite · React 19 · TypeScript · Three.js · `@react-three/fiber` · `@react-three/drei` · zustand. Fuente Inter local (el texto 3D no necesita internet).

Para reproducirlo con Claude Code, ver `PROMPT.md`.
