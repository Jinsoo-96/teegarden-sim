// Surface View 카메라 상태 공유 — 나침반 바(HTML 오버레이) ↔ Canvas 간 다리 (M7-2)
import { create } from "zustand";

export interface LookAtTarget {
  azimuthRad: number;
  altitudeRad: number;
}

interface ViewState {
  cameraAzimuthDeg: number; // 카메라가 보는 방위 (0=북, 정수 도 단위)
  lookAtTarget: LookAtTarget | null; // "천체 보기" 요청 — CameraSync가 소비
  setCameraAzimuthDeg: (deg: number) => void;
  requestLookAt: (target: LookAtTarget) => void;
  clearLookAt: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  cameraAzimuthDeg: 270, // 시작 시 서쪽(항성 방향) 응시
  lookAtTarget: null,
  setCameraAzimuthDeg: (cameraAzimuthDeg) => set({ cameraAzimuthDeg }),
  requestLookAt: (lookAtTarget) => set({ lookAtTarget }),
  clearLookAt: () => set({ lookAtTarget: null }),
}));
