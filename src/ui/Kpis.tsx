import { useState } from "react";
import { KPI, PAQUETES, PV, PROB_PLAZO } from "../data/proyecto";

type Estilo = "tarjetas" | "barra" | "semaforos" | "siglas";
const ESTILOS: [Estilo, string][] = [
  ["tarjetas", "A · Tarjetas"],
  ["barra", "B · Barra"],
  ["semaforos", "D · Semáforos"],
  ["siglas", "E · Siglas"],
];

const BAC = PAQUETES.reduce((a, p) => a + p.horas, 0);
const EV = PAQUETES.reduce((a, p) => a + (p.horas * p.avance) / 100, 0);
const SPI = EV / PV;
const f = (n: number) => n.toFixed(1);

type Luz = "ok" | "mid" | "bad" | "nd";
// shortcut: umbrales de ejemplo (guía de Visual Paradigm, no norma PMI); el grupo debe fijarlos. Para el plazo no hay referencia, se propuso 90/70.
const luzSpi = (v: number): Luz => (v >= 0.95 ? "ok" : v >= 0.9 ? "mid" : "bad");
const luzPlazo = (v: number): Luz => (v >= 90 ? "ok" : v >= 70 ? "mid" : "bad");

function Tarjetas() {
  return (
    <div className="kcards">
      <div>
        <span>Avance</span>
        <b>{Math.round((EV / BAC) * 100)} %</b>
        <p>Llevamos {f(EV)} de {BAC} h de trabajo terminado.</p>
        <small>EV / BAC</small>
      </div>
      <div>
        <span>Ritmo</span>
        <b>{SPI >= 1 ? "Adelantados" : "Atrasados"}</b>
        <p>Debíamos llevar {f(PV)} h a hoy y llevamos {f(EV)} h.</p>
        <small>SPI {SPI.toFixed(2)}</small>
      </div>
      <div>
        <span>Plazo BD II</span>
        <b>{PROB_PLAZO} %</b>
        <p>Probabilidad de entregar antes del 28 nov., 8:00 (2 días de holgura).</p>
        <small>Método PERT</small>
      </div>
      <div className="nd">
        <span>Costo</span>
        <b>Sin dato</b>
        <p>El grupo aún no registró sus horas reales.</p>
        <small>CPI no medible</small>
      </div>
    </div>
  );
}

function Barra() {
  const pct = (h: number) => (h / BAC) * 100 + "%";
  return (
    <div className="kbar">
      <div className="track">
        <i className="fill" style={{ width: pct(EV) }} />
        <u className="mark" style={{ left: pct(PV) }} />
      </div>
      <div className="scale"><span>0 h</span><span>{BAC} h</span></div>
      <p>
        <b className="c1">■</b> Hecho: {f(EV)} h ({Math.round((EV / BAC) * 100)} %) · <b>|</b> Debíamos ir en: {f(PV)} h ·{" "}
        {SPI >= 1 ? `adelantados por ${f(EV - PV)} h` : `atrasados por ${f(PV - EV)} h`}
      </p>
      <p className="muted">Foto del 24 oct. Con los reportes semanales se podría dibujar la curva S.</p>
    </div>
  );
}

function Semaforos() {
  const filas: { t: string; v: string; luz: Luz; d: string }[] = [
    { t: "Calendario (SPI)", v: SPI.toFixed(2), luz: luzSpi(SPI), d: "Verde ≥ 0.95 · amarillo 0.90–0.95 · rojo < 0.90" },
    { t: "Plazo BD II", v: PROB_PLAZO + " %", luz: luzPlazo(PROB_PLAZO), d: "Verde ≥ 90 % · amarillo 70–90 % · rojo < 70 %" },
    { t: "Costo (CPI)", v: "Sin dato", luz: "nd", d: "Faltan las horas reales" },
  ];
  return (
    <div className="ksem">
      {filas.map((x) => (
        <div key={x.t}><i className={"luz " + x.luz} /><span>{x.t}</span><b>{x.v}</b><small>{x.d}</small></div>
      ))}
      <p className="muted">Umbrales de ejemplo, por acordar con el grupo.</p>
    </div>
  );
}

function Siglas() {
  return (
    <div className="kpis">
      {KPI.map((k) => (
        <div key={k.k} title={k.t}><span>{k.k}</span><b>{k.v}</b></div>
      ))}
    </div>
  );
}

export function Kpis() {
  const [e, setE] = useState<Estilo>("tarjetas");
  return (
    <div className="kwrap">
      <div className="seg small">
        {ESTILOS.map(([k, l]) => (
          <button key={k} className={e === k ? "on" : ""} onClick={() => setE(k)}>{l}</button>
        ))}
      </div>
      {e === "tarjetas" && <Tarjetas />}
      {e === "barra" && <Barra />}
      {e === "semaforos" && <Semaforos />}
      {e === "siglas" && <Siglas />}
    </div>
  );
}
