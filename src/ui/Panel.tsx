import { COLOR, ETL, KIND_LABEL, porId } from "../data/schema";
import { NIVEL_COLOR, PAQUETES, RIESGOS, GRUPOS } from "../data/proyecto";
import { useApp } from "../store";

function Tabla({ id }: { id: string }) {
  const t = porId[id];
  const select = useApp((s) => s.select);
  const desde = ETL.filter((e) => e.a === id);
  const hacia = ETL.filter((e) => e.de === id);
  return (
    <>
      <div className="tags">
        <span className="tag" style={{ background: COLOR[t.kind] }}>{KIND_LABEL[t.kind]}</span>
        <span className="tag ghost">{t.side === "fuente" ? "sisg_fuente" : "sisg_dw"}</span>
      </div>
      <h2>{t.id}</h2>
      {t.filas && <p className="muted">{t.filas}</p>}
      {t.nota && <p className="note">{t.nota}</p>}
      <h3>Columnas ({t.cols.length})</h3>
      <ul className="cols">
        {t.cols.map((c) => (
          <li key={c.n}>
            <b>{c.n}</b> <span className="muted">{c.t}</span>
            {c.pk && <span className="pill pk">PK</span>}
            {c.ref && <button className="pill fk" onClick={() => select(c.ref!)}>FK → {c.ref}</button>}
          </li>
        ))}
      </ul>
      {desde.length > 0 && (
        <>
          <h3>Se carga desde</h3>
          <ul className="flow">{desde.map((e) => <li key={e.de + e.txt}><button onClick={() => select(e.de)}>{e.de}</button> {e.txt}</li>)}</ul>
        </>
      )}
      {hacia.length > 0 && (
        <>
          <h3>Alimenta a</h3>
          <ul className="flow">{hacia.map((e) => <li key={e.a + e.txt}><button onClick={() => select(e.a)}>{e.a}</button> {e.txt}</li>)}</ul>
        </>
      )}
    </>
  );
}

function Paquete({ cod }: { cod: string }) {
  const p = PAQUETES.find((x) => x.cod === cod)!;
  const g = GRUPOS.find((x) => cod.startsWith(x.id + "."))!;
  return (
    <>
      <div className="tags"><span className="tag" style={{ background: g.color }}>{g.nombre}</span></div>
      <h2>{p.cod} · {p.nombre}</h2>
      <div className="bar"><i style={{ width: p.avance + "%", background: g.color }} /></div>
      <p className="muted">{p.avance}% de avance</p>
      <dl>
        <dt>Horas planificadas</dt><dd>{p.horas} h</dd>
        <dt>Valor ganado (EV)</dt><dd>{((p.horas * p.avance) / 100).toFixed(1)} h</dd>
        <dt>Fechas</dt><dd>{p.fechas}</dd>
        <dt>Responsable (rol)</dt><dd>{p.resp}</dd>
      </dl>
    </>
  );
}

function Riesgo({ id }: { id: string }) {
  const r = RIESGOS.find((x) => x.id === id)!;
  return (
    <>
      <div className="tags">
        <span className="tag" style={{ background: NIVEL_COLOR[r.nivel] }}>{r.nivel}</span>
        <span className="tag ghost">{r.cat}</span>
      </div>
      <h2>{r.id}</h2>
      <p>{r.titulo}</p>
      <dl>
        <dt>Probabilidad</dt><dd>{r.prob}</dd>
        <dt>Impacto</dt><dd>{r.imp}</dd>
        <dt>Responsable (rol)</dt><dd>{r.resp}</dd>
        <dt>Reserva de contingencia</dt><dd>{r.reserva} h</dd>
      </dl>
      <h3>Respuesta</h3>
      <p>{r.resp_txt}</p>
    </>
  );
}

export function Panel() {
  const sel = useApp((s) => s.sel);
  const tab = useApp((s) => s.tab);
  const gview = useApp((s) => s.gview);
  const select = useApp((s) => s.select);
  const enTour = useApp((s) => !!s.tour);
  if (!sel || enTour) return null;
  return (
    <aside className="panel">
      <button className="x" onClick={() => select(null)} aria-label="Cerrar">×</button>
      {tab === "datos" ? <Tabla id={sel} /> : gview === "edt" ? <Paquete cod={sel} /> : <Riesgo id={sel} />}
    </aside>
  );
}
