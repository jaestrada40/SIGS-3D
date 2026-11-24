import { Text } from "@react-three/drei";
import font from "@fontsource/inter/files/inter-latin-600-normal.woff?url";
import { useApp } from "../store";

/** Texto con la fuente local (así no depende de internet). Siempre mira a la cámara si va dentro de <Billboard>. */
export function Label(p: { children: string; size?: number; color?: string; position?: [number, number, number]; maxWidth?: number }) {
  return (
    <Text
      font={font}
      fontSize={p.size ?? 0.5}
      color={p.color ?? "#e8edf3"}
      position={p.position}
      maxWidth={p.maxWidth}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.03}
      outlineColor="#0b1220"
    >
      {p.children}
    </Text>
  );
}

/** Eventos de selección y hover comunes; ignora arrastres de cámara. */
export function usePick(id: string) {
  const select = useApp((s) => s.select);
  const setHover = useApp((s) => s.setHover);
  return {
    onClick: (e: { stopPropagation: () => void; delta: number }) => {
      e.stopPropagation();
      if (e.delta > 6) return;
      select(id);
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHover(id);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      setHover(null);
      document.body.style.cursor = "";
    },
  };
}
