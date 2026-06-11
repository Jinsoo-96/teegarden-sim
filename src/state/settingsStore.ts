// 뷰 모드 + 관측자 설정 — 스펙 §7.2 zustand 전역상태
import { create } from "zustand";
import type { Observer } from "../sim/skyCoords";

export type ViewMode = "system" | "surface";

interface SettingsState {
  mode: ViewMode;
  observer: Observer;
  setMode: (mode: ViewMode) => void;
  setObserver: (partial: Partial<Observer>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  mode: "system",
  observer: { latitudeDeg: 15, longitudeDeg: 90 }, // §9 권장 기본: 저녁 터미네이터, 위도 15°
  setMode: (mode) => set({ mode }),
  setObserver: (partial) => set((s) => ({ observer: { ...s.observer, ...partial } })),
}));
