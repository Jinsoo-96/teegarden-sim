// 시간 스토어 테스트 — 스펙 §3.2 적분 공식 simTimeJD += (dtMs/86400000)·timeScale
import { describe, it, expect, beforeEach } from "vitest";
import { EPOCH_JD } from "../data/teegarden";
import { useTimeStore, TIME_SCALE_MAX, TIME_SCALE_MIN } from "./timeStore";

beforeEach(() => {
  useTimeStore.setState({ simTimeJD: EPOCH_JD, timeScale: 1e5, paused: false });
});

describe("timeStore (§3.2)", () => {
  it("advance: timeScale=86400×에서 1000ms → 정확히 +1일", () => {
    const s = useTimeStore.getState();
    s.setTimeScale(86400);
    s.advance(1000);
    expect(useTimeStore.getState().simTimeJD).toBeCloseTo(EPOCH_JD + 1, 12);
  });

  it("advance: timeScale=1×(실시간)에서 86400000ms → +1일", () => {
    const s = useTimeStore.getState();
    s.setTimeScale(1);
    s.advance(86_400_000);
    expect(useTimeStore.getState().simTimeJD).toBeCloseTo(EPOCH_JD + 1, 12);
  });

  it("paused 동안 advance 무시", () => {
    const s = useTimeStore.getState();
    s.togglePaused();
    s.advance(5000);
    expect(useTimeStore.getState().simTimeJD).toBe(EPOCH_JD);
  });

  it("timeScale 1×~1e6× 클램프", () => {
    const s = useTimeStore.getState();
    s.setTimeScale(1e9);
    expect(useTimeStore.getState().timeScale).toBe(TIME_SCALE_MAX);
    s.setTimeScale(0.001);
    expect(useTimeStore.getState().timeScale).toBe(TIME_SCALE_MIN);
  });

  it("setJD 스크럽/점프", () => {
    useTimeStore.getState().setJD(EPOCH_JD + 42.5);
    expect(useTimeStore.getState().simTimeJD).toBe(EPOCH_JD + 42.5);
  });
});
