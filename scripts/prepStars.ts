// HYG v3 전처리 — 스펙 §6.4: V ≤ 6.5 필터 → public/stars.json
// 사용법:
//   curl -sL -o /tmp/hyg_v38.csv.gz https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/v3/hyg_v38.csv.gz
//   gunzip -f /tmp/hyg_v38.csv.gz
//   node --experimental-strip-types scripts/prepStars.ts /tmp/hyg_v38.csv
// 출력 형식: [[raHours, decDeg, mag, ciBV], ...] — 원본 CSV는 커밋하지 않음 (CC BY-SA, 산출물만)
import { readFileSync, writeFileSync } from "node:fs";

const src = process.argv[2] ?? "/tmp/hyg_v38.csv";
const MAG_LIMIT = 6.5;

// HYG v3 컬럼 (0-기준): 0 id · 6 proper · 7 ra(h) · 8 dec(°) · 13 mag · 16 ci(B−V)
const lines = readFileSync(src, "utf8").split("\n");
const out: [number, number, number, number][] = [];
for (let i = 1; i < lines.length; i++) {
  const c = lines[i].split(",");
  if (c.length < 17) continue;
  const mag = parseFloat(c[13]);
  if (!(mag <= MAG_LIMIT)) continue;
  // 태양(Sol) 제외 — 티가든 하늘의 태양은 §6.4 별도 마커(천칭자리 V2.75)로 추가
  if (c[0] === "0" || c[6] === "Sol") continue;
  const ra = parseFloat(c[7]);
  const dec = parseFloat(c[8]);
  if (!Number.isFinite(ra) || !Number.isFinite(dec)) continue;
  const ci = parseFloat(c[16]);
  out.push([
    +ra.toFixed(4),
    +dec.toFixed(3),
    +mag.toFixed(2),
    +(Number.isFinite(ci) ? ci : 0).toFixed(2),
  ]);
}
writeFileSync("public/stars.json", JSON.stringify(out));
console.log(`public/stars.json 생성: ${out.length}개 별 (V ≤ ${MAG_LIMIT})`);
