import { Stage } from "../scene/Stage";
import { COLOR, KIND_LABEL, type Kind } from "../data/schema";
import { GRUPOS, NIVEL_COLOR } from "../data/proyecto";
import { useApp } from "../store";
import { Kpis } from "./Kpis";
import { Panel } from "./Panel";
import { Tour } from "./Tour";

function Seg<T extends string>({ v, set, items }: { v: T; set: (x: T) => void; items: [T, string][] }) {
  return (
    <div className="seg">
      {items.map(([k, l]) => (
        <button key={k} className={v === k ? "on" : ""} onClick={() => set(k)}>{l}</button>
      ))}
    </div>
  );
}

const dot = (c: string, l: string) => (
  <span key={l}><i style={{ background: c }} />{l}</span>
);

function Leyenda() {
  const tab = useApp((s) => s.tab);
  const gview = useApp((s) => s.gview);
  const dmode = useApp((s) => s.dmode);
  if (tab === "datos") {
    const kinds: Kind[] = ["catalogo", "maestra", "transaccion", "bitacora", "dim", "fact"];
    return (
      <div className="legend">
        <div className="row">{kinds.map((k) => dot(COLOR[k], KIND_LABEL[k]))}</div>
        <p>
          {dmode === "esquema"
            ? "Alto del bloque = número de columnas. Líneas = llaves foráneas."
            : "Las partículas viajan por el ETL (sp_etl_completo) de la fuente al almacén."}{" "}
          Clic en una tabla.
        </p>
      </div>
    );
  }
  if (gview === "edt")
    return (
      <div className="legend">
        <div className="row">{GRUPOS.map((g) => dot(g.color, `${g.id} ${g.nombre}`))}</div>
        <p>Altura = horas. Parte sólida = avance; transparente = lo que falta.</p>
      </div>
    );
  return (
    <div className="legend">
      <div className="row">{(["Crítico", "Alto", "Medio", "Bajo"] as const).map((n) => dot(NIVEL_COLOR[n], n))}</div>
      <p>Esfera más grande = más horas de reserva. Altura del bloque = nivel de la celda.</p>
    </div>
  );
}

export function App() {
  const { tab, setTab, dmode, setDMode, gview, setGView, goHome, startTour } = useApp();
  const enTour = useApp((s) => !!s.tour);
  return (
    <div className="app">
      <div className="canvas"><Stage /></div>
      <header>
        <div className="brand"><b>SISG</b><span>Datos y gestión en 3D</span></div>
        <Seg v={tab} set={setTab} items={[["datos", "Datos"], ["gestion", "Gestión"]]} />
        {tab === "datos" ? (
          <Seg v={dmode} set={setDMode} items={[["esquema", "Esquema"], ["etl", "Flujo ETL"]]} />
        ) : (
          <Seg v={gview} set={setGView} items={[["edt", "EDT"], ["riesgos", "Riesgos"]]} />
        )}
        <div className="right">
          {!enTour && <button className="tourbtn" onClick={startTour}>▶ Recorrido</button>}
          <button className="home" onClick={goHome}>Vista general</button>
        </div>
      </header>
      {tab === "gestion" && gview === "edt" && <Kpis />}
      {!enTour && <Leyenda />}
      <Panel />
      <Tour />
      <footer>
        {tab === "datos"
          ? "Esquema y ETL copiados de SIGS/dw/sql. Datos sintéticos."
          : "Plan copiado de SIGS/docs/gestion (corte 24 oct. 2026). Horas, avances y valoraciones son estimaciones del borrador, por validar con el grupo."}
      </footer>
    </div>
  );
}
