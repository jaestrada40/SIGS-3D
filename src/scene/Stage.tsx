import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import type { CameraControls as CC } from "@react-three/drei";
import { useApp } from "../store";
import { DataScene } from "./DataScene";
import { GestionScene } from "./GestionScene";

type V = { pos: [number, number, number]; tgt: [number, number, number] };
const VISTAS: Record<string, V> = {
  datos: { pos: [3, 26, 33], tgt: [3, 0, 1] },
  edt: { pos: [0, 20, 28], tgt: [0, 1, -5] },
  riesgos: { pos: [0, 17, 19], tgt: [0, 0, 1] },
};
function Rig() {
  const ref = useRef<CC>(null);
  const tab = useApp((s) => s.tab);
  const gview = useApp((s) => s.gview);
  const home = useApp((s) => s.home);
  const cam = useApp((s) => s.cam);
  useEffect(() => {
    const v = cam ?? VISTAS[tab === "datos" ? "datos" : gview];
    ref.current?.setLookAt(...v.pos, ...v.tgt, true);
  }, [tab, gview, home, cam]);
  return <CameraControls ref={ref} makeDefault minDistance={8} maxDistance={75} maxPolarAngle={1.45} smoothTime={0.35} />;
}

export function Stage() {
  const tab = useApp((s) => s.tab);
  const select = useApp((s) => s.select);
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ position: VISTAS.datos.pos, fov: 40, near: 0.5, far: 300 }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={["#0b1220"]} />
      <fog attach="fog" args={["#0b1220", 60, 130]} />
      <hemisphereLight args={["#bcd0ff", "#1a2233", 0.9]} />
      <directionalLight
        position={[14, 30, 18]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
        shadow-camera-far={90}
        shadow-bias={-0.0004}
      />
      {tab === "datos" ? <DataScene /> : <GestionScene />}
      <Rig />
    </Canvas>
  );
}
