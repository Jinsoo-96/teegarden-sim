// HUD 시간 컨트롤러 — 스펙 §3.2: 시간 표시 3중 병기 ①UTC ②시민시각 ③궤도 위상
import type { CSSProperties } from "react";
import { EPOCH_JD, PLANETS } from "../data/teegarden";
import { formatJdUtc } from "../sim/julian";
import { meanAnomaly } from "../sim/kepler";
import { nextOppositionJd } from "../sim/events";
import { jdToCivic, formatCivic } from "../sim/civicTime";
import { useTimeStore } from "../state/timeStore";

const [b, c, d] = PLANETS;
const SCRUB_DAYS = 365; // 타임라인 스크러버 범위: epoch + 1년

const panelStyle: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.6rem 1.2rem",
  padding: "0.6rem 1rem",
  background: "rgba(10, 12, 18, 0.82)",
  borderTop: "1px solid #2a2f3a",
  fontFamily: "sans-serif",
  fontSize: "0.8rem",
  color: "#d8d4cd",
};

const numStyle: CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontVariantNumeric: "tabular-nums",
  color: "#FFBA70",
};

export default function TimeController() {
  const jd = useTimeStore((s) => s.simTimeJD);
  const timeScale = useTimeStore((s) => s.timeScale);
  const paused = useTimeStore((s) => s.paused);
  const { setJD, setTimeScale, togglePaused } = useTimeStore.getState();

  const phaseDeg = (meanAnomaly(b, jd) * 180) / Math.PI;
  const scrubValue = Math.min(EPOCH_JD + SCRUB_DAYS, Math.max(EPOCH_JD, jd));

  return (
    <div style={panelStyle}>
      <button onClick={togglePaused} style={{ minWidth: "5.5rem" }}>
        {paused ? "▶ 재생" : "⏸ 일시정지"}
      </button>

      <span>
        JD <span style={numStyle}>{jd.toFixed(4)}</span>
      </span>
      <span style={numStyle}>{formatJdUtc(jd)}</span>
      <span>
        시민시각 <span style={numStyle}>{formatCivic(jdToCivic(jd))}</span>
      </span>
      <span>
        b 위상 <span style={numStyle}>{phaseDeg.toFixed(1)}°</span>
      </span>

      <label>
        속도 ×<span style={numStyle}>{Math.round(timeScale).toLocaleString()}</span>{" "}
        <input
          type="range"
          min={0}
          max={6}
          step={0.05}
          value={Math.log10(timeScale)}
          onChange={(e) => setTimeScale(10 ** Number(e.target.value))}
        />
      </label>

      <label>
        타임라인{" "}
        <input
          type="range"
          min={EPOCH_JD}
          max={EPOCH_JD + SCRUB_DAYS}
          step={0.01}
          value={scrubValue}
          onChange={(e) => setJD(Number(e.target.value))}
          style={{ width: "10rem" }}
        />
      </label>

      <button onClick={() => setJD(nextOppositionJd(b, c, jd))}>다음 c 충 →</button>
      <button onClick={() => setJD(nextOppositionJd(b, d, jd))}>다음 d 충 →</button>
    </div>
  );
}
