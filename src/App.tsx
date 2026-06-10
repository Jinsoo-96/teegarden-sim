// M1-1 스캐폴드 — System View 캔버스는 M1-3에서 구현
import { STAR, PLANETS } from "./data/teegarden";

function App() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Teegarden System Simulation</h1>
      <p>
        {STAR.name} ({STAR.spectralType}) — T<sub>eff</sub> {STAR.teffK} K [관측] · 행성{" "}
        {PLANETS.length}개
      </p>
      <ul>
        {PLANETS.map((p) => (
          <li key={p.name}>
            {p.name}: P = {p.periodDays} d, a = {p.semiMajorAxisAU} AU
          </li>
        ))}
      </ul>
      <p style={{ color: "#888" }}>데이터: Dreizler+2024 · Marfil+2021 (docs/ 스펙 §1–2)</p>
    </main>
  );
}

export default App;
