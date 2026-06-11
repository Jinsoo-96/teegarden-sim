// 뷰 모드 + 관측자 설정 — 스펙 §7.2 zustand 전역상태
import { create } from "zustand";
import type { Observer } from "../sim/skyCoords";

export type ViewMode = "system" | "surface";

interface SettingsState {
  mode: ViewMode;
  observer: Observer;
  showLabels: boolean; // 천체 라벨/교육 오버레이 (M6-2)
  showCandidateE: boolean; // 172d 후보행성 — §9 권장 기본 OFF
  setMode: (mode: ViewMode) => void;
  setObserver: (partial: Partial<Observer>) => void;
  toggleLabels: () => void;
  toggleCandidateE: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  mode: "system",
  observer: { latitudeDeg: 15, longitudeDeg: 90 }, // §9 권장 기본: 저녁 터미네이터, 위도 15°
  showLabels: true,
  showCandidateE: false,
  setMode: (mode) => set({ mode }),
  setObserver: (partial) => set((s) => ({ observer: { ...s.observer, ...partial } })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleCandidateE: () => set((s) => ({ showCandidateE: !s.showCandidateE })),
}));
