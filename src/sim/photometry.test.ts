// 등급→HDR 변환 테스트 — M5-3 (포그슨 법칙 검증)
import { describe, it, expect } from "vitest";
import { VIS } from "../data/teegarden";
import { magRatio, magToIntensity } from "./photometry";

describe("magToIntensity (기준 항성 V−22.3 → 1.0)", () => {
  it("기준 등급 = 1.0", () => {
    expect(magToIntensity(VIS.starVmagFromB)).toBeCloseTo(1, 12);
  });

  it("Δm = −5 → ×100, Δm = +2.5 → ×0.1", () => {
    expect(magToIntensity(VIS.starVmagFromB - 5)).toBeCloseTo(100, 9);
    expect(magToIntensity(VIS.starVmagFromB + 2.5)).toBeCloseTo(0.1, 9);
  });

  it("c 충(V−6.5)은 항성 대비 ~4.8×10⁻⁷ (§6.3 정합)", () => {
    expect(magRatio(-6.5, VIS.starVmagFromB)).toBeCloseTo(4.79e-7, 9);
  });
});
