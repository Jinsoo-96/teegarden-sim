// 루트 — System View 캔버스 (Surface View 모드 전환은 M3-1에서)
import { Canvas } from "@react-three/fiber";
import { STAR } from "./data/teegarden";
import SystemScene from "./components/SystemScene";
import TimeController from "./components/TimeController";

function App() {
  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <header
        style={{
          position: "absolute",
          zIndex: 1,
          padding: "0.7rem 1rem",
          fontFamily: "sans-serif",
          fontSize: "0.85rem",
          pointerEvents: "none",
        }}
      >
        <strong style={{ color: STAR.colorSRGB }}>Teegarden System</strong>{" "}
        <span style={{ color: "#8a8f99" }}>
          — System View · 거리 실척(AU), 반경 과장 [스펙 §7.3] · 데이터: Dreizler+2024 [관측]
        </span>
      </header>
      <Canvas camera={{ position: [0.07, 0.06, 0.1], fov: 50, near: 1e-4, far: 10 }}>
        <SystemScene />
      </Canvas>
      <TimeController />
    </div>
  );
}

export default App;
