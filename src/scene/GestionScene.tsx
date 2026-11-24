import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Line } from "@react-three/drei";
import * as THREE from "three";
import { GRUPOS, IMPS, NIVEL_COLOR, NIVEL_MATRIZ, PAQUETES, PROBS, RIESGOS, type Paquete, type Riesgo } from "../data/proyecto";
import { useApp } from "../store";
import { Label, usePick } from "./common";

const COLS = 3, GAP = 1.9, SPAN = 8.2, K = 0.28; // columnas por grupo, separación, distancia entre grupos, alto por hora

function Barra({ p, x, z, color }: { p: Paquete; x: number; z: number; color: string }) {
  const pick = usePick(p.cod);
  const sel = useApp((s) => s.sel === p.cod);
  const hov = useApp((s) => s.hover === p.cod);
  const dim = useApp((s) => !!s.focus && !s.focus.includes(p.cod) && !s.focus.includes("g" + p.cod[0]));
  const H = p.horas * K;
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.3, H, 1.3)), [H]);
  const hf = Math.max(H * (p.avance / 100), 0.05);
  return (
    <group position={[x, 0, z]}>
      {/* parte hecha */}
      <mesh position={[0, hf / 2, 0]} castShadow>
        <boxGeometry args={[1.3, hf, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.5} transparent opacity={dim ? 0.15 : 1} emissive={color} emissiveIntensity={sel ? 0.7 : hov ? 0.4 : 0.08} />
      </mesh>
      {/* lo que falta: caja translúcida de la altura total (también recibe el clic) */}
      <mesh position={[0, H / 2, 0]} {...pick}>
        <boxGeometry args={[1.3, H, 1.3]} />
        <meshStandardMaterial color={color} transparent opacity={dim ? 0.04 : sel ? 0.4 : 0.2} depthWrite={false} />
      </mesh>
      <lineSegments position={[0, H / 2, 0]} geometry={edges}>
        <lineBasicMaterial color={sel ? "#ffd166" : color} transparent opacity={dim ? 0.12 : 0.8} />
      </lineSegments>
      <Billboard position={[0, H + 0.55, 0]}>
        <Label size={0.45} color={dim ? "#4a5566" : undefined}>{p.cod}</Label>
      </Billboard>
    </group>
  );
}

function Edt() {
  const root = new THREE.Vector3(0, 5.4, -14);
  return (
    <group>
      {/* raíz */}
      <mesh position={[0, 2.7, -14]} castShadow>
        <cylinderGeometry args={[0.7, 1.1, 5.4, 6]} />
        <meshStandardMaterial color="#e8edf3" roughness={0.4} />
      </mesh>
      <Billboard position={[0, 6.6, -14]}>
        <Label size={0.6}>SISG · Módulo Grupo 4</Label>
        <Label size={0.42} position={[0, -0.75, 0]} color="#9db0c7">168 h · 20 paquetes</Label>
      </Billboard>
      {GRUPOS.map((g, i) => {
        const items = PAQUETES.filter((p) => p.cod.startsWith(g.id + "."));
        const rows = Math.ceil(items.length / COLS);
        const x0 = (i - 2) * SPAN;
        const depth = rows * GAP + 0.8;
        const horas = items.reduce((a, p) => a + p.horas, 0);
        const zc = depth / 2 - GAP / 2; // la primera fila queda en z=0
        const ptsEnd = new THREE.Vector3(x0, 0.3, zc - depth / 2);
        return (
          <group key={g.id}>
            <mesh position={[x0, -0.15, zc]} receiveShadow>
              <boxGeometry args={[COLS * GAP + 0.4, 0.3, depth]} />
              <meshStandardMaterial color="#141c2b" roughness={0.9} />
            </mesh>
            <mesh position={[x0, 0.01, zc]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[COLS * GAP, depth - 0.4]} />
              <meshBasicMaterial color={g.color} transparent opacity={0.1} />
            </mesh>
            <Line points={new THREE.QuadraticBezierCurve3(root.clone().setY(0.3), new THREE.Vector3(x0 / 2, 1.5, -8), ptsEnd).getPoints(20)} color={g.color} lineWidth={1.5} transparent opacity={0.6} />
            <group position={[x0, 0.03, zc + depth / 2 + 0.7]} rotation-x={-Math.PI / 2}>
              <Label size={0.46} color={g.color} maxWidth={COLS * GAP}>{`${g.id} · ${g.nombre}`}</Label>
              <Label size={0.4} color="#9db0c7" position={[0, -0.7, 0]}>{`${horas} h`}</Label>
            </group>
            {items.map((p, k) => (
              <Barra key={p.cod} p={p} color={g.color} x={x0 + ((k % COLS) - 1) * GAP} z={Math.floor(k / COLS) * GAP} />
            ))}
          </group>
        );
      })}
    </group>
  );
}

// ── Matriz de riesgos ──
const CELL = 4.8, TILE = 4.4, ALTO_NIVEL = { Crítico: 1.3, Alto: 0.95, Medio: 0.6, Bajo: 0.3 } as const;
const SLOTS: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

function Esfera({ r, x, z, y0 }: { r: Riesgo; x: number; z: number; y0: number }) {
  const pick = usePick(r.id);
  const sel = useApp((s) => s.sel === r.id);
  const hov = useApp((s) => s.hover === r.id);
  const dim = useApp((s) => !!s.focus && !s.focus.includes(r.id));
  const g = useRef<THREE.Group>(null!);
  const rad = 0.38 + r.reserva * 0.06;
  const color = NIVEL_COLOR[r.nivel];
  useFrame(({ clock }) => {
    if (g.current) g.current.position.y = y0 + rad + 0.1 + Math.sin(clock.elapsedTime * 1.6 + x) * 0.07 * (r.nivel === "Crítico" ? 2 : 1);
  });
  return (
    <group ref={g} position={[x, y0 + rad, z]}>
      <mesh castShadow {...pick}>
        <sphereGeometry args={[rad, 24, 18]} />
        <meshStandardMaterial color={color} roughness={0.35} transparent opacity={dim ? 0.15 : 1} emissive={color} emissiveIntensity={sel ? 0.8 : hov ? 0.5 : 0.12} />
      </mesh>
      {sel && (
        <mesh rotation-x={-Math.PI / 2} position={[0, -rad + 0.02, 0]}>
          <ringGeometry args={[rad * 1.25, rad * 1.5, 32]} />
          <meshBasicMaterial color="#ffd166" />
        </mesh>
      )}
      <Billboard position={[0, rad + 0.5, 0]}>
        <Label size={0.45} color={dim ? "#4a5566" : undefined}>{r.id}</Label>
      </Billboard>
    </group>
  );
}

function Riesgos() {
  const slots = useMemo(() => {
    const m = new Map<string, Riesgo[]>();
    RIESGOS.forEach((r) => m.set(r.prob + r.imp, [...(m.get(r.prob + r.imp) ?? []), r]));
    return m;
  }, []);
  return (
    <group>
      {PROBS.map((p, pi) =>
        IMPS.map((im, ii) => {
          const nivel = NIVEL_MATRIZ[im][p];
          const h = ALTO_NIVEL[nivel];
          const x = (pi - 1) * CELL, z = (1 - ii) * CELL;
          return (
            <group key={p + im} position={[x, 0, z]}>
              <mesh position={[0, h / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[TILE, h, TILE]} />
                <meshStandardMaterial color={NIVEL_COLOR[nivel]} roughness={0.7} transparent opacity={0.55} />
              </mesh>
              {(slots.get(p + im) ?? []).map((r, k) => (
                <Esfera key={r.id} r={r} y0={h} x={SLOTS[k][0] * 0.95} z={SLOTS[k][1] * 0.95} />
              ))}
            </group>
          );
        }),
      )}
      {/* ejes */}
      {PROBS.map((p, pi) => (
        <group key={p} position={[(pi - 1) * CELL, 0.03, CELL + 3.4]} rotation-x={-Math.PI / 2}>
          <Label size={0.6} color="#9db0c7">{p}</Label>
        </group>
      ))}
      <group position={[0, 0.03, CELL + 4.9]} rotation-x={-Math.PI / 2}><Label size={0.7}>PROBABILIDAD →</Label></group>
      {IMPS.map((im, ii) => (
        <group key={im} position={[-CELL - 3.6, 0.03, (1 - ii) * CELL]} rotation-x={-Math.PI / 2}>
          <Label size={0.6} color="#9db0c7">{im}</Label>
        </group>
      ))}
      <group position={[-CELL - 6.1, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}><Label size={0.7}>IMPACTO →</Label></group>
    </group>
  );
}

export function GestionScene() {
  const v = useApp((s) => s.gview);
  return v === "edt" ? <Edt /> : <Riesgos />;
}
