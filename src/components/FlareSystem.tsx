// 플레어 시스템 — 스펙 §6.2/§7.2: 푸아송 자동 발생 + 디버그 트리거 (M5-2)
// 효과는 GiantStar(핫스팟·증광)·SkyDome(10,000K 가산)이 flareStore를 읽어 반영
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useFlareStore } from "../state/flareStore";
import { useTimeStore } from "../state/timeStore";

export default function FlareSystem() {
  const lastJd = useRef<number | null>(null);
  useControls("플레어 (§6.2)", {
    "지금 발생 (디버그)": button(() => {
      useFlareStore.getState().trigger(useTimeStore.getState().simTimeJD);
    }),
  });
  useFrame(() => {
    const jd = useTimeStore.getState().simTimeJD;
    const dt = lastJd.current === null ? 0 : jd - lastJd.current;
    lastJd.current = jd;
    if (dt > 0) useFlareStore.getState().step(jd, dt);
  });
  return null;
}
