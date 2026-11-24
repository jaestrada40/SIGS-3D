import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Line } from "@react-three/drei";
import * as THREE from "three";
import { COLOR, ETL, FKS, TABLAS, porId, type Tbl } from "../data/schema";
import { useApp } from "../store";
import { Label, usePick } from "./common";

const dims = (t: Tbl): [number, number, number] => {
  const big = t.kind === "fact";
  return [big ? 3.2 : 2.6, 0.5 + t.cols.length * 0.2, big ? 2.1 : 1.7];
};
const top = (id: string): THREE.Vector3 => {
  const t = porId[id];
  return new THREE.Vector3(t.pos[0], dims(t)[1], t.pos[1]);
};
const arc = (a: THREE.Vector3, b: THREE.Vector3, lift: number) => {
  const m = a.clone().lerp(b, 0.5);
  m.y += lift + a.distanceTo(b) * 0.18;
  return new THREE.QuadraticBezierCurve3(a, m, b);
};

/** Tablas relacionadas con la seleccionada, según el modo. */
function relacionadas(sel: string | null, modo: string, focus: string[] | null): Set<string> | null {
  if (focus) return new Set(focus);
  if (!sel) return null;
  const s = new Set([sel]);
  if (modo === "etl") ETL.forEach((e) => (e.de === sel || e.a === sel) && (s.add(e.de), s.add(e.a)));
  else FKS.forEach((f) => (f.de === sel || f.a === sel) && (s.add(f.de), s.add(f.a)));
  return s;
}

function Bloque({ t, rel }: { t: Tbl; rel: Set<string> | null }) {
  const pick = usePick(t.id);
  const sel = useApp((s) => s.sel === t.id);
  const hov = useApp((s) => s.hover === t.id);
  const [w, h, d] = dims(t);
  const dim = rel && !rel.has(t.id);
  const color = COLOR[t.kind];
  return (
    <group position={[t.pos[0], 0, t.pos[1]]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow {...pick}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          roughness={0.55}
          metalness={0.1}
          transparent
          opacity={dim ? 0.18 : 1}
          emissive={color}
          emissiveIntensity={sel ? 0.7 : hov ? 0.4 : 0.06}
        />
      </mesh>
      {sel && (
        <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[Math.max(w, d) * 0.78, Math.max(w, d) * 0.86, 48]} />
          <meshBasicMaterial color="#ffd166" />
        </mesh>
      )}
      <Billboard position={[0, h + 0.55, 0]}>
        <Label size={0.6} color={dim ? "#5b6676" : "#f4f7fb"}>{t.id}</Label>
      </Billboard>
    </group>
  );
}

function Plataforma(p: { cx: number; cz: number; w: number; d: number; titulo: string; color: string }) {
  return (
    <group position={[p.cx, 0, p.cz]}>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[p.w, 0.4, p.d]} />
        <meshStandardMaterial color="#141c2b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[p.w - 0.5, p.d - 0.5]} />
        <meshBasicMaterial color={p.color} transparent opacity={0.06} />
      </mesh>
      <group position={[0, 0.03, p.d / 2 + 0.2]} rotation-x={-Math.PI / 2}>
        <Label size={0.8} color={p.color}>{p.titulo}</Label>
      </group>
    </group>
  );
}

function FkLines({ rel, modo }: { rel: Set<string> | null; modo: string }) {
  const sel = useApp((s) => s.sel);
  const focus = useApp((s) => s.focus);
  const lines = useMemo(
    () => FKS.map((f) => ({ ...f, pts: arc(top(f.de), top(f.a), 0.6).getPoints(24) })),
    [],
  );
  return (
    <>
      {lines.map((l) => {
        const on = focus ? focus.includes(l.de) && focus.includes(l.a) : !!sel && (l.de === sel || l.a === sel);
        if (modo === "etl" && !on) return null;
        return (
          <Line key={l.de + l.a} points={l.pts} color={on ? "#ffd166" : "#5d6b7e"} lineWidth={on ? 2.5 : 1} transparent opacity={rel && !on ? 0.1 : on ? 1 : 0.55} />
        );
      })}
    </>
  );
}

const PART = 6;
const tmpV = new THREE.Vector3();
const tmpO = new THREE.Object3D();

function Etl() {
  const sel = useApp((s) => s.sel);
  const focus = useApp((s) => s.focus);
  const viaje = useApp((s) => s.viaje);
  const viajero = useRef<THREE.Mesh>(null!);
  const curves = useMemo(
    () => ETL.map((e) => {
      const a = top(e.de), b = top(e.a);
      return { ...e, curve: arc(a, b, e.de === "fact_estudio" ? 1.2 : 3.5), color: COLOR[porId[e.de].kind] };
    }),
    [],
  );
  const mesh = useRef<THREE.InstancedMesh>(null!);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t0 = clock.elapsedTime * 0.16;
    const { sel: s, focus: f, viaje: v } = useApp.getState();
    curves.forEach((c, i) => {
      const on = f ? f.includes(c.de) && f.includes(c.a) : !s || c.de === s || c.a === s;
      for (let k = 0; k < PART; k++) {
        const t = (t0 + k / PART + i * 0.13) % 1;
        c.curve.getPoint(t, tmpV);
        tmpO.position.copy(tmpV);
        tmpO.scale.setScalar(on ? 1 : 0);
        tmpO.updateMatrix();
        m.setMatrixAt(i * PART + k, tmpO.matrix);
      }
    });
    m.instanceMatrix.needsUpdate = true;
    const vm = viajero.current;
    const vc = v ? curves.find((c) => c.de + ">" + c.a === v) : null;
    if (vm) {
      vm.visible = !!vc;
      if (vc) {
        vc.curve.getPoint((clock.elapsedTime * 0.22) % 1, tmpV);
        vm.position.copy(tmpV);
        vm.scale.setScalar(1 + Math.sin(clock.elapsedTime * 8) * 0.15);
      }
    }
  });
  const colors = useMemo(() => {
    const a = new Float32Array(curves.length * PART * 3);
    const c = new THREE.Color();
    curves.forEach((x, i) => {
      c.set(x.color);
      for (let k = 0; k < PART; k++) c.toArray(a, (i * PART + k) * 3);
    });
    return a;
  }, [curves]);

  return (
    <>
      {curves.map((c) => {
        const on = focus ? focus.includes(c.de) && focus.includes(c.a) : !sel || c.de === sel || c.a === sel;
        return <Line key={c.de + c.a} points={c.curve.getPoints(32)} color={on ? c.color : "#3a4556"} lineWidth={on ? 1.6 : 0.6} transparent opacity={on ? 0.7 : 0.15} />;
      })}
      <mesh ref={viajero} visible={false}>
        <sphereGeometry args={[0.45, 16, 12]} />
        <meshBasicMaterial color="#ffd166" />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, curves.length * PART]} frustumCulled={false}>
        <sphereGeometry args={[0.17, 10, 8]} />
        <meshBasicMaterial />
        <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
      </instancedMesh>
    </>
  );
}

export function DataScene() {
  const modo = useApp((s) => s.dmode);
  const sel = useApp((s) => s.sel);
  const focus = useApp((s) => s.focus);
  const rel = relacionadas(sel, modo, focus);
  return (
    <group>
      <Plataforma cx={-10.5} cz={0} w={19} d={20} titulo="FUENTE OPERATIVA · sisg_fuente" color="#f2a65a" />
      <Plataforma cx={13.2} cz={1} w={25} d={23} titulo="ALMACÉN DE DATOS · sisg_dw (modelo estrella)" color="#9b8cf0" />
      {TABLAS.map((t) => <Bloque key={t.id} t={t} rel={rel} />)}
      <FkLines rel={rel} modo={modo} />
      {modo === "etl" && <Etl />}
    </group>
  );
}
