// 플레어 시스템 테스트 — M5-2: 엔벨로프·파라미터 범위·푸아송 동작
import { describe, it, expect, beforeEach } from "vitest";
import { EPOCH_JD, STAR } from "../data/teegarden";
import { flareIntensity, useFlareStore } from "./flareStore";

beforeEach(() => {
  useFlareStore.setState({ active: null, log: [] });
});

describe("플레어 발생 (trigger/spawn)", () => {
  it("지속시간 130–600초, 에너지 10³¹–1.3×10³² erg, 핫스팟 가시면(z>0)", () => {
    for (let i = 0; i < 20; i++) {
      useFlareStore.getState().trigger(EPOCH_JD + i);
      const f = useFlareStore.getState().active!;
      expect(f.durationSec).toBeGreaterThanOrEqual(STAR.flare.durationSec[0]);
      expect(f.durationSec).toBeLessThanOrEqual(STAR.flare.durationSec[1]);
      expect(f.energyErg).toBeGreaterThanOrEqual(STAR.flare.energyRangeErg[0]);
      expect(f.energyErg).toBeLessThanOrEqual(STAR.flare.energyRangeErg[1]);
      expect(f.dirView[2]).toBeGreaterThan(0);
    }
    expect(useFlareStore.getState().log.length).toBe(20);
  });
});

describe("강도 엔벨로프 (§6.2 라이프사이클)", () => {
  it("시작 0 → 10% 지점 피크 1 → 지수 감쇠 → 종료 후 0", () => {
    useFlareStore.getState().trigger(EPOCH_JD);
    const f = useFlareStore.getState().active!;
    const at = (frac: number) => flareIntensity(f, EPOCH_JD + (frac * f.durationSec) / 86400);
    expect(at(0)).toBe(0);
    expect(at(0.1)).toBeCloseTo(1, 6);
    expect(at(0.5)).toBeLessThan(at(0.2));
    expect(at(1.01)).toBe(0);
    expect(flareIntensity(null, EPOCH_JD)).toBe(0);
  });
});

describe("푸아송 step", () => {
  it("활성 플레어는 지속시간 경과 후 소멸", () => {
    const s = useFlareStore.getState();
    s.trigger(EPOCH_JD);
    const f = useFlareStore.getState().active!;
    useFlareStore.getState().step(EPOCH_JD + (f.durationSec * 1.1) / 86400, 0.001);
    expect(useFlareStore.getState().active).toBeNull();
  });

  it("λ=0.026/일 — 1000일 시뮬레이션에서 발생 수가 푸아송 기대 범위(5–60회)", () => {
    let count = 0;
    let lastLog = 0;
    for (let day = 0; day < 1000; day++) {
      useFlareStore.getState().step(EPOCH_JD + day, 1);
      const log = useFlareStore.getState().log.length;
      if (log !== lastLog || useFlareStore.getState().active) {
        // trigger 시 active가 잡힘 — 즉시 해제해 다음 날 새 발생 가능하게
        if (useFlareStore.getState().active) count++;
        useFlareStore.setState({ active: null });
        lastLog = log;
      }
    }
    // 기대값 26회 — 4σ 여유 (랜덤 테스트 플레이크 방지)
    expect(count).toBeGreaterThan(5);
    expect(count).toBeLessThan(60);
  });
});
