// b 행성 미니 글로브 — 관측자 위치 시각화 (M7-2)
// 투영: 관측자의 터미네이터 상공에서 내려다본 정사영 — 좌측 반구 = 주간면(항성 방향),
// 우측 = 야간면, 중앙 세로선 = 터미네이터 대원. 관측자는 항상 중앙선 위(위도만 이동)
import type { CSSProperties } from "react";
import { useSettingsStore } from "../state/settingsStore";

const wrapStyle: CSSProperties = {
  position: "absolute",
  bottom: 96,
  left: 12,
  zIndex: 1,
  width: 150,
  padding: "8px 10px",
  background: "rgba(10, 12, 18, 0.82)",
  border: "1px solid #2a2f3a",
  borderRadius: 10,
  fontFamily: "sans-serif",
  fontSize: "0.68rem",
  color: "#8a8f99",
};

const R = 56;
const CX = 65;
const CY = 64;

export default function MiniGlobe() {
  const observer = useSettingsStore((s) => s.observer);
  const evening = observer.longitudeDeg >= 0;
  const markerY = CY - R * Math.sin((observer.latitudeDeg * Math.PI) / 180);

  return (
    <div style={wrapStyle}>
      <svg viewBox="0 0 130 128" width={130} height={128}>
        {/* 야간면 전구 */}
        <circle cx={CX} cy={CY} r={R} fill="#0d1117" stroke="#2a2f3a" />
        {/* 주간면 (좌측 반구 — 항성 방향) */}
        <path
          d={`M ${CX} ${CY - R} A ${R} ${R} 0 0 0 ${CX} ${CY + R} Z`}
          fill="rgba(255, 186, 112, 0.28)"
        />
        {/* 터미네이터 대원 */}
        <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="#5a6172" strokeDasharray="3 2" />
        {/* 위도선(적도) */}
        <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="#2a2f3a" />
        {/* 관측자 마커 — 터미네이터 위, 위도 반영 */}
        <circle cx={CX} cy={markerY} r={4.5} fill="#FFBA70" stroke="#14181f" strokeWidth={1.5} />
        <circle cx={CX} cy={markerY} r={8} fill="none" stroke="#FFBA70" opacity={0.45} />
        {/* 라벨 */}
        <text x={8} y={CY + 3} fill="#caa06a" fontSize={9}>
          ☀주간면
        </text>
        <text x={92} y={CY + 3} fill="#6a7282" fontSize={9}>
          야간면
        </text>
        <text x={CX} y={12} fill="#8a8f99" fontSize={8} textAnchor="middle">
          N
        </text>
      </svg>
      <div style={{ textAlign: "center" }}>
        내 위치: {evening ? "저녁" : "아침"} 터미네이터 · 위도{" "}
        <span style={{ color: "#FFBA70" }}>{observer.latitudeDeg}°</span>
      </div>
    </div>
  );
}
