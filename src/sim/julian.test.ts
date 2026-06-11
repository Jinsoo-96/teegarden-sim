// JD↔표시시간(UTC) 변환 테스트 — M2-1 DoD
import { describe, it, expect } from "vitest";
import { EPOCH_JD } from "../data/teegarden";
import { UNIX_EPOCH_JD, jdToDate, dateToJd, formatJdUtc } from "./julian";

describe("JD ↔ UTC 변환", () => {
  it("JD 2440587.5 = Unix epoch (1970-01-01T00:00:00Z)", () => {
    expect(jdToDate(UNIX_EPOCH_JD).toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });

  it("EPOCH_JD 2460000.0 = 2023-02-24 12:00 UTC (스펙 §2 주석과 일치, JD .0 = 정오)", () => {
    expect(jdToDate(EPOCH_JD).toISOString()).toBe("2023-02-24T12:00:00.000Z");
  });

  it("왕복 변환 오차 < 1ms", () => {
    for (const jd of [EPOCH_JD, EPOCH_JD + 4.90634, EPOCH_JD + 365.123456]) {
      expect(Math.abs(dateToJd(jdToDate(jd)) - jd)).toBeLessThan(1 / 86400000);
    }
  });

  it("formatJdUtc 형식", () => {
    expect(formatJdUtc(EPOCH_JD)).toBe("2023-02-24 12:00:00 UTC");
  });
});
