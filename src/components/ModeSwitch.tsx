// 뷰 모드 전환 — 스펙 §7.2 ModeSwitch ('system' | 'surface')
import type { CSSProperties } from "react";
import { useSettingsStore, type ViewMode } from "../state/settingsStore";

const wrapStyle: CSSProperties = {
  position: "absolute",
  top: 12,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,
  display: "flex",
  gap: 2,
  background: "rgba(10, 12, 18, 0.82)",
  border: "1px solid #2a2f3a",
  borderRadius: 8,
  padding: 3,
  fontFamily: "sans-serif",
  fontSize: "0.8rem",
};

const MODES: { value: ViewMode; label: string }[] = [
  { value: "system", label: "System View" },
  { value: "surface", label: "Surface View (터미네이터)" },
];

export default function ModeSwitch() {
  const mode = useSettingsStore((s) => s.mode);
  const setMode = useSettingsStore((s) => s.setMode);
  return (
    <div style={wrapStyle}>
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          style={{
            padding: "4px 12px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: mode === m.value ? "#FFBA70" : "transparent",
            color: mode === m.value ? "#14181f" : "#d8d4cd",
            fontWeight: mode === m.value ? 600 : 400,
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
