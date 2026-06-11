// 가시성 캘린더 — 스펙 §6.3/M4-2: 다음 충·합(엄폐)·칭동일출 목록 + 점프
import { useRef } from "react";
import type { CSSProperties } from "react";
import { PLANETS } from "../data/teegarden";
import { findLibrationSunrise, formatCivic, jdToCivic } from "../sim/civicTime";
import { nextOccultation, nextOppositionJd } from "../sim/events";
import { useTimeStore } from "../state/timeStore";

const [b, c, d] = PLANETS;

interface CalEvent {
  jd: number;
  label: string;
  note?: string;
}

interface Cache {
  computedAt: number;
  validUntil: number;
  events: CalEvent[];
}

function computeEvents(jd: number): CalEvent[] {
  const sunrise = findLibrationSunrise(jd);
  const cOpp = nextOppositionJd(b, c, jd);
  const dOpp = nextOppositionJd(b, d, jd);
  const cOcc = nextOccultation(b, c, jd);
  const dOcc = nextOccultation(b, d, jd);
  return [
    { jd: sunrise, label: "칭동 일출", note: "주 시작 (D1)" },
    { jd: cOpp, label: "c 충", note: "보름 c · 15.2′ · V−6.5" },
    { jd: cOcc.startJd, label: "c 엄폐 시작", note: `항성 뒤 ${cOcc.durationHours.toFixed(1)}h` },
    { jd: dOpp, label: "d 충", note: "5.2′ · V−3.0" },
    { jd: dOcc.startJd, label: "d 엄폐 시작", note: `항성 뒤 ${dOcc.durationHours.toFixed(1)}h` },
  ].sort((a, x) => a.jd - x.jd);
}

const panelStyle: CSSProperties = {
  position: "absolute",
  top: 420,
  right: 12,
  zIndex: 1,
  width: 216,
  padding: "8px 12px",
  background: "rgba(10, 12, 18, 0.82)",
  border: "1px solid #2a2f3a",
  borderRadius: 10,
  fontFamily: "sans-serif",
  fontSize: "0.72rem",
  color: "#d8d4cd",
};

const numStyle: CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontVariantNumeric: "tabular-nums",
  color: "#FFBA70",
};

export default function EventCalendar() {
  const jd = useTimeStore((s) => s.simTimeJD);
  const cache = useRef<Cache | null>(null);
  if (!cache.current || jd < cache.current.computedAt || jd >= cache.current.validUntil) {
    const events = computeEvents(jd);
    cache.current = { computedAt: jd, validUntil: events[0].jd, events };
  }
  const setJD = useTimeStore.getState().setJD;

  return (
    <div style={panelStyle}>
      <div style={{ color: "#8a8f99", marginBottom: 6 }}>가시성 캘린더 — 다음 이벤트 [유도]</div>
      {cache.current.events.map((e) => (
        <div
          key={e.label}
          style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}
        >
          <button
            onClick={() => setJD(e.jd)}
            title={`${e.label}로 점프`}
            style={{
              background: "transparent",
              border: "1px solid #2a2f3a",
              borderRadius: 4,
              color: "#d8d4cd",
              cursor: "pointer",
              fontSize: "0.72rem",
              padding: "1px 6px",
              whiteSpace: "nowrap",
            }}
          >
            {e.label}
          </button>
          <span style={numStyle}>T−{(e.jd - jd).toFixed(2)}일</span>
          <span style={{ color: "#8a8f99", whiteSpace: "nowrap", overflow: "hidden" }}>
            {formatCivic(jdToCivic(e.jd)).slice(0, 9)}
          </span>
        </div>
      ))}
      <div style={{ color: "#5a6172", fontSize: "0.65rem", marginTop: 4 }}>
        충·합은 달력과 비동기 — "움직이는 명절" (§5.2)
      </div>
    </div>
  );
}
