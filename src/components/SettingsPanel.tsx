// 설정 + Assumptions 패널 — 스펙 §8 목록 그대로 + §6.1/§9 관측자 설정 (M6-2)
import { useState } from "react";
import type { CSSProperties } from "react";
import { useSettingsStore } from "../state/settingsStore";

// 스펙 §8 명시적 가정 목록 (원문 그대로)
const ASSUMPTIONS = [
  "궤도 공면, 관측자 시점 i=90° — RV 관측 한계로 실제 3D 기하 미지",
  "질량 = m·sin i (하한값), 반지름 = 암석질 질량–반지름 관계 추정 (트랜짓 없음 → 실측 불가)",
  "b는 1:1 동주기 자전, 자전축 경사 0°",
  "c·d 이심률 0 (b만 e=0.03 관측)",
  "대기: 기본 시나리오 = 지구형 1bar N₂/O₂ (Boukrouche+2025 GCM 채택 구성) — 실제 대기 존재 여부는 미관측",
  "행성 알베도 0.3 (기하), 위성 없음, 고리 없음",
  "epoch 위상(meanLongitudeAtEpochDeg)은 임의값 — 논문 RV 해의 T_periastron으로 교체 가능하도록 상수화",
];

const panelStyle: CSSProperties = {
  position: "absolute",
  top: 56,
  left: 12,
  zIndex: 1,
  width: 232,
  padding: "8px 12px",
  background: "rgba(10, 12, 18, 0.82)",
  border: "1px solid #2a2f3a",
  borderRadius: 10,
  fontFamily: "sans-serif",
  fontSize: "0.74rem",
  color: "#d8d4cd",
};

export default function SettingsPanel() {
  const observer = useSettingsStore((s) => s.observer);
  const showLabels = useSettingsStore((s) => s.showLabels);
  const showCandidateE = useSettingsStore((s) => s.showCandidateE);
  const { setObserver, toggleLabels, toggleCandidateE } = useSettingsStore.getState();
  const [open, setOpen] = useState(false);

  return (
    <div style={panelStyle}>
      <div style={{ color: "#8a8f99", marginBottom: 6 }}>관측자 설정 (§6.1)</div>

      <label style={{ display: "block", marginBottom: 4 }}>
        위도 <span style={{ color: "#FFBA70" }}>{observer.latitudeDeg}°</span>{" "}
        <input
          type="range"
          min={0}
          max={45}
          step={1}
          value={observer.latitudeDeg}
          onChange={(e) => setObserver({ latitudeDeg: Number(e.target.value) })}
          style={{ width: "100%" }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 6 }}>
        터미네이터{" "}
        <select
          value={observer.longitudeDeg}
          onChange={(e) => setObserver({ longitudeDeg: Number(e.target.value) })}
          style={{ background: "#14181f", color: "#d8d4cd", border: "1px solid #2a2f3a" }}
        >
          <option value={90}>저녁 (+90°)</option>
          <option value={-90}>아침 (−90°)</option>
        </select>
      </label>

      <label style={{ display: "block" }}>
        <input type="checkbox" checked={showLabels} onChange={toggleLabels} /> 천체 라벨
      </label>
      <label style={{ display: "block", marginBottom: 6 }}>
        <input type="checkbox" checked={showCandidateE} onChange={toggleCandidateE} /> 후보행성
        e (172d 신호, 미확정) [관측]
      </label>

      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent",
          border: "1px solid #2a2f3a",
          borderRadius: 4,
          color: "#FFBA70",
          cursor: "pointer",
          fontSize: "0.72rem",
          padding: "2px 8px",
        }}
      >
        Assumptions (§8) {open ? "▲" : "▼"}
      </button>
      {open && (
        <ol style={{ margin: "6px 0 0", paddingLeft: 16, color: "#a9aeb8", lineHeight: 1.5 }}>
          {ASSUMPTIONS.map((a) => (
            <li key={a.slice(0, 12)} style={{ marginBottom: 3 }}>
              {a}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
