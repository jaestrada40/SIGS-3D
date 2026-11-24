import { create } from "zustand";
import { TOURS, type Cam, type TourKey } from "./data/tours";

export type Tab = "datos" | "gestion";
export type DMode = "esquema" | "etl";
export type GView = "edt" | "riesgos";

type Tour = { key: TourKey; i: number; auto: boolean };

type S = {
  tab: Tab;
  dmode: DMode;
  gview: GView;
  sel: string | null;
  hover: string | null;
  home: number;
  // recorrido guiado
  tour: Tour | null;
  focus: string[] | null;
  cam: Cam | null;
  viaje: string | null;
  goHome: () => void;
  setTab: (t: Tab) => void;
  setDMode: (m: DMode) => void;
  setGView: (v: GView) => void;
  select: (id: string | null) => void;
  setHover: (id: string | null) => void;
  startTour: () => void;
  tourGo: (i: number) => void;
  toggleAuto: () => void;
  endTour: () => void;
};

const SIN_TOUR = { tour: null, focus: null, cam: null, viaje: null } as const;
export const tourKey = (s: Pick<S, "tab" | "dmode" | "gview">): TourKey => (s.tab === "datos" ? s.dmode : s.gview);

export const useApp = create<S>((set, get) => {
  const aplicar = (key: TourKey, i: number, auto: boolean) => {
    const p = TOURS[key][i];
    set({ tour: { key, i, auto }, sel: p.sel ?? null, focus: p.focus ?? null, cam: p.cam ?? null, viaje: p.viaje ?? null });
  };
  return {
    tab: "datos",
    dmode: "esquema",
    gview: "edt",
    sel: null,
    hover: null,
    home: 0,
    ...SIN_TOUR,
    goHome: () => set((s) => ({ home: s.home + 1, sel: null, ...SIN_TOUR })),
    setTab: (tab) => set({ tab, sel: null, hover: null, ...SIN_TOUR }),
    setDMode: (dmode) => set((s) => ({ dmode, sel: null, home: s.home + 1, ...SIN_TOUR })),
    setGView: (gview) => set({ gview, sel: null, hover: null, ...SIN_TOUR }),
    select: (sel) => set({ sel }),
    setHover: (hover) => set({ hover }),
    startTour: () => aplicar(tourKey(get()), 0, false),
    tourGo: (i) => {
      const t = get().tour;
      if (!t) return;
      const n = TOURS[t.key].length;
      aplicar(t.key, Math.min(Math.max(i, 0), n - 1), t.auto);
    },
    toggleAuto: () => {
      const t = get().tour;
      if (t) set({ tour: { ...t, auto: !t.auto } });
    },
    endTour: () => set((s) => ({ home: s.home + 1, sel: null, ...SIN_TOUR })),
  };
});
