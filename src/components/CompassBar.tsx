// 방위 나침반 바 — 카메라 방위 + 천체(항성/c/d/태양) 방위 마커 + "보기" 점프 (M7-2)
import type { CSSProperties } from "react";
import { PLANETS, SKY_EVENTS } from "../data/teegarden";
import {
  inertialDirToHorizontal,
  planetDirectionFrom,
  raDecToInertialDir,
  starDirectionFromPlanet,
  type Horizontal,
} from "../sim/skyCoords";
import { useSettingsStore } from "../state/settingsStore";
import { useTimeStore } from "../state/timeStore";
import { useViewStore } from "../state/viewStore";

const [b, c, d] = PLANETS;
const RAD2DEG = 180 / Math.PI;

const barStyle: CSSProperties = {
  position: "absolute",
  bottom: 96,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,
  width: "min(560px, 56vw)",
  height: 44,
  background: "rgba(10, 12, 18, 0.82)",
  border: "1px solid #2a2f3a",
  borderRadius: 10,
  fontFamily: "sans-serif",
  fontSize: "0.66rem",
  color: "#8a8f99",
  overflow: "hidden",
};

interface BodyMarker {
  key: string;
  symbol: string;
  color: string;
  h: Horizontal;
}

export default function CompassBar() {
  // 0.005일(≈7분 시뮬) 단위로만 재계산 — 마커 위치는 그 사이 변화가 미미
  const jd = useTimeStore((s) => Math.round(s.simTimeJD * 200) / 200);
  const observer = useSettingsStore((s) => s.observer);
  const camAz = useViewStore((s) => s.cameraAzimuthDeg);
  const fovDeg = useViewStore((s) => s.cameraFovDeg);
  const requestLookAt = useViewStore.getState().requestLookAt;

  const sun = SKY_EVENTS.sunFromTeegarden;
  const bodies: BodyMarker[] = [
    {
      key: "항성",
      symbol: "☀",
      color: "#FFBA70",
      h: inertialDirToHorizontal(starDirectionFromPlanet(b, jd), b, jd, observer),
    },
    {
      key: "c",
      symbol: "c",
      color: "#b98e6f",
      h: inertialDirToHorizontal(planetDirectionFrom(b, c, jd), b, jd, observer),
    },
    {
      key: "d",
      symbol: "d",
      color: "#cdd6dd",
      h: inertialDirToHorizontal(planetDirectionFrom(b, d, jd), b, jd, observer),
    },
    {
      key: "Sol",
      symbol: "☉",
      color: "#fff4d6",
      h: inertialDirToHorizontal(raDecToInertialDir(sun.raHours, sun.decDeg), b, jd, observer),
    },
  ];

  const pct = (azDeg: number) => `${(((azDeg % 360) + 360) % 360) / 3.6}%`;

  return (
    <div style={barStyle}>
      {/* 카메라 시야(FOV) 창 — 휠 줌 연동 */}
      <div
        style={{
          position: "absolute",
          left: pct(camAz - fovDeg / 2),
          width: `${fovDeg / 3.6}%`,
          top: 0,
          bottom: 0,
          background: "rgba(255, 186, 112, 0.10)",
          borderLeft: "1px solid rgba(255,186,112,0.35)",
          borderRight: "1px solid rgba(255,186,112,0.35)",
        }}
      />
      {/* 방위 눈금 */}
      {[
        { a: 0, t: "북" },
        { a: 90, t: "동(야간면)" },
        { a: 180, t: "남" },
        { a: 270, t: "서(항성)" },
      ].map((m) => (
        <div key={m.a} style={{ position: "absolute", left: pct(m.a), bottom: 2, transform: "translateX(-50%)" }}>
          {m.t}
        </div>
      ))}
      {/* 천체 마커 — 클릭 시 해당 방향으로 시점 회전, 지평선 아래는 ▼ */}
      {bodies.map((m) => {
        const below = m.h.altitudeRad < 0;
        return (
          <button
            key={m.key}
            title={`${m.key} 보기 (고도 ${(m.h.altitudeRad * RAD2DEG).toFixed(1)}°)`}
            onClick={() =>
              requestLookAt({
                azimuthRad: m.h.azimuthRad,
                altitudeRad: Math.max(m.h.altitudeRad, -0.12),
              })
            }
            style={{
              position: "absolute",
              left: pct(m.h.azimuthRad * RAD2DEG),
              top: 2,
              transform: "translateX(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: m.color,
              opacity: below ? 0.4 : 1,
              fontSize: "0.8rem",
              lineHeight: 1,
              padding: 0,
            }}
          >
            {m.symbol}
            <span style={{ display: "block", fontSize: "0.55rem" }}>
              {m.key}
              {below ? "▼" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
