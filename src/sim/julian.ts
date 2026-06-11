// JD(율리우스일) ↔ UTC 변환 — 스펙 §3.2 "시간 표시 3중 병기"의 ① UTC 환산
// 기준: JD 2440587.5 = 1970-01-01T00:00:00Z (Unix epoch). JD 정수부 경계는 정오(UT 12:00)
export const UNIX_EPOCH_JD = 2440587.5;
export const MS_PER_DAY = 86_400_000;

export function jdToDate(jd: number): Date {
  return new Date((jd - UNIX_EPOCH_JD) * MS_PER_DAY);
}

export function dateToJd(date: Date): number {
  return UNIX_EPOCH_JD + date.getTime() / MS_PER_DAY;
}

export function formatJdUtc(jd: number): string {
  return jdToDate(jd).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}
