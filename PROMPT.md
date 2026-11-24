# Prompt para reproducir SISG 3D

Para otra persona que quiera rehacerlo con Claude Code. Necesita tener la carpeta `SIGS` (o los mismos documentos) a mano.

## Instalar

```bash
npm create vite@latest sisg-3d -- --template react-ts
cd sisg-3d
npm install three @react-three/fiber @react-three/drei zustand @fontsource/inter
npm install -D @types/three
```

Skills opcionales (los instala quien lo use; no son necesarios):

```bash
npx -y skills add cloudai-x/threejs-skills --agent claude-code -g
npx skills add zebbern/claude-code-guide --skill "r3f-best-practices" -a claude-code -y
```

## Prompt

> En una carpeta nueva `sisg-3d` (Vite + React + TypeScript + @react-three/fiber + drei + zustand), crea una visualización 3D del proyecto que está en la carpeta `SIGS`. Todo low-poly generado por código, sin modelos externos, interfaz en español.
>
> Lee primero `SIGS/dw/sql/01_fuente_esquema.sql`, `04_dw_esquema.sql`, `05_dw_etl.sql` y `SIGS/docs/gestion/02_edt_cronograma_costos.md` y `04_riesgos_calidad.md`. Copia los datos a `src/data/` (no los inventes).
>
> **Pestaña Datos:** dos plataformas. A la izquierda las tablas de la fuente (un bloque por tabla, alto = número de columnas, color por tipo: catálogo, maestra, transacción, auditoría). A la derecha el modelo estrella como constelación: hechos al centro, dimensiones en órbita. Modo "Esquema" con las llaves foráneas como arcos; modo "Flujo ETL" con partículas animadas (InstancedMesh, sin crear objetos en `useFrame`) de cada tabla fuente a su destino, tal como lo hace el ETL. Clic en un bloque abre un panel con columnas, PK/FK, de dónde se carga y a dónde alimenta.
>
> **Pestaña Gestión:** (1) EDT: raíz del proyecto, 5 ramas y los 20 paquetes como barras, altura = horas, parte sólida = % de avance, con KPI (BAC, EV, SPI, avance, probabilidad PERT). (2) Matriz de riesgos 3×3 probabilidad × impacto con bloques de altura según nivel y una esfera por riesgo (tamaño = reserva en horas, color = nivel).
>
> **Recorrido guiado** en las cuatro vistas: botón «Recorrido» que abre una tarjeta con pasos (título + explicación), botones Anterior/Siguiente, reproducción automática con pausa y flechas del teclado. Cada paso puede mover la cámara, atenuar los objetos que no se explican y, en el ETL, mover una esfera grande por un flujo. En Flujo ETL incluye un caso de ejemplo inventado (un estudio) con tablas «antes/después», rotulado como ejemplo. Los textos salen de los documentos de SIGS.
>
> Usa `CameraControls` (no `MapControls` a la vez), fuente local para el texto 3D, sin Bloom ni Environment de internet. Al terminar: `npm run build`, revisa la consola sin errores, comprueba cada vista en el navegador y dime qué no probaste.

## Notas

- Dejar claro en la interfaz que horas, avances y valoraciones son estimaciones por validar.
- No incluir nunca datos personales de pacientes: el almacén solo guarda id y sexo.
