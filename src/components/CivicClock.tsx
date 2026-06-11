// 시민 시계 위젯 — 스펙 §5.3 + §7.6 시그니처 디자인
// 원형 24시민시 다이얼 + 외곽 칭동 고도 게이지 + 주간 5칸 진행 바 + 이벤트 카운트다운
import { useRef } from "react";
import type { CSSProperties } from "react";
import { PLANETS } from "../data/teegarden";
import {
  findLibrationSunrise,
  jdToCivic,
  librationAltitudeRad,
  starAngularRadiusRad,
} from "../sim/civicTime";
import { nextOppositionJd } from "../sim/events";
import { useFlareStore } from "../state/flareStore";
import { useTimeStore } from "../state/timeStore";

const [b, c, d] = PLANETS;
const RAD2DEG = 180 / Math.PI;
const MAX_ALT_RAD = 2 * b.eccentricity; // 칭동 진폭 ≈ ±2e rad ≈ ±3.44° (§4)
const GAUGE_HALF_RAD = 70 / RAD2DEG; // 게이지 호의 절반각 (±70°)
const AMBER = "#FFBA70"; // 항성색 — §7.6 포인트 컬러

const widgetStyle: CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  zIndex: 1,
  width: 216,
  padding: "10px 12px",
  background: "rgba(10, 12, 18, 0.82)",
  border: "1px solid #2a2f3a",
  borderRadius: 10,
  fontFamily: "sans-serif",
  fontSize: "0.75rem",
  color: "#d8d4cd",
};

const numStyle: CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontVariantNumeric: "tabular-nums",
  color: AMBER,
};

const pad2 = (n: number) => n.toString().padStart(2, "0");

// 극좌표 (θ: +x축 기준, 위가 양수) — 게이지용
const polar = (r: number, theta: number): [number, number] => [
  100 + r * Math.cos(theta),
  100 - r * Math.sin(theta),
];

// 시계 좌표 (a: 12시 방향 기준 시계방향) — 다이얼용
const clockXY = (r: number, a: number): [number, number] => [
  100 + r * Math.sin(a),
  100 - r * Math.cos(a),
];

interface EventCache {
  computedAt: number;
  sunrise: number;
  cOpp: number;
  dOpp: number;
}

// 다음 이벤트 캐시 — 이벤트를 지나치거나 시간을 되감을 때만 재계산
function useNextEvents(jd: number): EventCache {
  const cache = useRef<EventCache | null>(null);
  const cur = cache.current;
  if (!cur || jd < cur.computedAt || jd >= cur.sunrise || jd >= cur.cOpp || jd >= cur.dOpp) {
    cache.current = {
      computedAt: jd,
      sunrise: findLibrationSunrise(jd),
      cOpp: nextOppositionJd(b, c, jd),
      dOpp: nextOppositionJd(b, d, jd),
    };
  }
  return cache.current as EventCache;
}

function FlareAlert() {
  const active = useFlareStore((s) => s.active);
  if (!active) return null;
  return (
    <div style={{ color: "#9fc4ff", fontWeight: 600 }}>
      ⚡ 플레어 경보 — {active.energyErg.toExponential(1)} erg
    </div>
  );
}

function CountRow({ label, days }: { label: string; days: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#8a8f99" }}>{label}</span>
      <span style={numStyle}>T−{days.toFixed(2)}일</span>
    </div>
  );
}

export default function CivicClock() {
  const jd = useTimeStore((s) => s.simTimeJD);
  const civic = jdToCivic(jd);
  const altRad = librationAltitudeRad(jd);
  const angR = starAngularRadiusRad(jd);
  const ev = useNextEvents(jd);

  // 바늘: 시민일 1바퀴 (00:00 = 12시 방향)
  const hand = clockXY(58, civic.dayFraction * 2 * Math.PI);

  // 칭동 고도 게이지 (오른쪽 호): 고도 ±MAX → θ ±70°
  const gaugeTheta = (altRad / MAX_ALT_RAD) * GAUGE_HALF_RAD;
  const risenTheta = (angR / MAX_ALT_RAD) * GAUGE_HALF_RAD;
  const marker = polar(91, gaugeTheta);
  const fullyRisen = altRad >= angR;
  const arcPts = Array.from({ length: 41 }, (_, i) =>
    polar(91, ((i / 40) * 2 - 1) * GAUGE_HALF_RAD).join(","),
  ).join(" ");

  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * 2 * Math.PI;
    const major = i % 6 === 0;
    const [x1, y1] = clockXY(major ? 66 : 71, a);
    const [x2, y2] = clockXY(76, a);
    return { x1, y1, x2, y2, major, key: i };
  });

  return (
    <div style={widgetStyle}>
      <svg viewBox="0 0 200 200" width={192} height={192}>
        {/* 다이얼 (24 시민시) */}
        <circle cx={100} cy={100} r={78} fill="rgba(20,24,32,0.9)" stroke="#2a2f3a" />
        {ticks.map((t) => (
          <line
            key={t.key}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? "#8a8f99" : "#3a4150"}
            strokeWidth={t.major ? 1.6 : 1}
          />
        ))}
        <line x1={100} y1={100} x2={hand[0]} y2={hand[1]} stroke={AMBER} strokeWidth={2} />
        <circle cx={100} cy={100} r={3} fill={AMBER} />
        <text
          x={100}
          y={136}
          textAnchor="middle"
          fill="#d8d4cd"
          fontSize={13}
          fontFamily="ui-monospace, monospace"
        >
          D{civic.civicDay} {pad2(civic.hour)}:{pad2(civic.minute)}
        </text>
        <text x={100} y={150} textAnchor="middle" fill="#8a8f99" fontSize={9}>
          W{civic.week}
        </text>

        {/* 칭동 고도 게이지 — 수평선(가운데)·완전일출(+R★) 눈금·항성 마커 */}
        <polyline points={arcPts} fill="none" stroke="#2a2f3a" strokeWidth={3.5} />
        <line x1={195} y1={100} x2={187} y2={100} stroke="#8a8f99" strokeWidth={1.4} />
        {[risenTheta, -risenTheta].map((th, i) => {
          const [x1, y1] = polar(94.5, th);
          const [x2, y2] = polar(87.5, th);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5a6172" strokeWidth={1} />;
        })}
        <circle
          cx={marker[0]}
          cy={marker[1]}
          r={4.5}
          fill={fullyRisen ? AMBER : "#7a3b2e"}
          stroke="#14181f"
        />
      </svg>

      {/* 주간 진행 바 — 5칸 (1일차 = 칭동 일출) */}
      <div style={{ display: "flex", gap: 3, margin: "6px 0 8px" }}>
        {[1, 2, 3, 4, 5].map((day) => (
          <div
            key={day}
            title={`D${day}`}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 2,
              background: day === civic.civicDay ? AMBER : "#2a2f3a",
            }}
          />
        ))}
      </div>

      {/* 다음 이벤트 카운트다운 (§5.3) — 플레어는 푸아송 랜덤이라 발생 시에만 경보 */}
      <CountRow label="칭동 일출" days={ev.sunrise - jd} />
      <CountRow label="c 충 (보름)" days={ev.cOpp - jd} />
      <CountRow label="d 충" days={ev.dOpp - jd} />
      <FlareAlert />
      <div style={{ color: "#8a8f99", marginTop: 6 }}>
        칭동 고도 <span style={numStyle}>{(altRad * RAD2DEG).toFixed(2)}°</span>{" "}
        <span style={{ fontSize: "0.65rem" }}>[유도]</span>
      </div>
    </div>
  );
}
