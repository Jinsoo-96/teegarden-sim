// 행성 표시 색 팔레트 [가정] — 세 행성 모두 트랜짓이 없어 색·반사 스펙트럼 미관측 (스펙 §1.2)
// 평형온도(teqK_A03)와 거주가능영역 위치 기반 추정 (DECISIONS 기록):
//  b 260K 온대 암석(낙관적 HZ 안쪽, 물 존재 가능) → 청회
//  c 196K 화성급 한랭 사막 → 한랭 적갈
//  d 149K 빙결 세계 → 옅은 빙백
export const PLANET_COLORS: Record<string, string> = {
  "Teegarden b": "#8fa3a8",
  "Teegarden c": "#b98e6f",
  "Teegarden d": "#cdd6dd",
};

export const PLANET_COLOR_FALLBACK = "#9aa3b0";

export function planetColor(name: string): string {
  return PLANET_COLORS[name] ?? PLANET_COLOR_FALLBACK;
}
