import { useEffect } from "react";
import { TOURS, type Ejemplo } from "../data/tours";
import { useApp } from "../store";

function Tabla({ e }: { e: Ejemplo }) {
  return (
    <div className="ej">
      <h4>{e.titulo}</h4>
      <dl>
        {e.filas.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

export function Tour() {
  const tour = useApp((s) => s.tour);
  const { tourGo, toggleAuto, endTour } = useApp.getState();
  const key = tour?.key;
  const i = tour?.i ?? 0;
  const auto = tour?.auto ?? false;
  const n = key ? TOURS[key].length : 0;
  const texto = key ? TOURS[key][i].texto : "";

  // Reproducción automática: avanza según el largo del texto; se detiene en el último paso.
  useEffect(() => {
    if (!key || !auto) return;
    const t = setTimeout(() => (i < n - 1 ? tourGo(i + 1) : toggleAuto()), Math.max(8000, texto.length * 60));
    return () => clearTimeout(t);
  }, [key, auto, i, n, texto, tourGo, toggleAuto]);

  useEffect(() => {
    if (!key) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") tourGo(i + 1);
      else if (e.key === "ArrowLeft") tourGo(i - 1);
      else if (e.key === "Escape") endTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, i, tourGo, endTour]);

  if (!key) return null;
  const p = TOURS[key][i];
  const ejemplo = !!(p.antes || p.despues);
  return (
    <section className="tour" aria-live="polite">
      <div className="tour-top">
        <span className="step">Paso {i + 1} de {n}</span>
        <div className="dots">
          {TOURS[key].map((_, k) => (
            <button key={k} className={k === i ? "on" : k < i ? "done" : ""} onClick={() => tourGo(k)} aria-label={`Ir al paso ${k + 1}`} />
          ))}
        </div>
        <button className="x2" onClick={endTour} aria-label="Cerrar recorrido">×</button>
      </div>
      <h3>{p.titulo}</h3>
      <p>{p.texto}</p>
      {ejemplo && (
        <>
          <div className="ejs">
            {p.antes && <Tabla e={p.antes} />}
            {p.antes && p.despues && <span className="arrow">→</span>}
            {p.despues && <Tabla e={p.despues} />}
          </div>
          <small className="inv">Ejemplo inventado para explicar; no son datos reales.</small>
        </>
      )}
      <div className="tour-ctl">
        <button onClick={() => tourGo(i - 1)} disabled={i === 0}>◀ Anterior</button>
        <button className={auto ? "on" : ""} onClick={toggleAuto}>{auto ? "⏸ Pausar" : "▶ Automático"}</button>
        {i < n - 1 ? <button className="primary" onClick={() => tourGo(i + 1)}>Siguiente ▶</button> : <button className="primary" onClick={endTour}>Terminar</button>}
      </div>
    </section>
  );
}
