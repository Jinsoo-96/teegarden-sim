// 루트 — 모드별 캔버스 (스펙 §7.2 트리)
import { Canvas } from "@react-three/fiber";
import { STAR } from "./data/teegarden";
import SystemScene from "./components/SystemScene";
import SurfaceScene from "./components/SurfaceScene";
import ModeSwitch from "./components/ModeSwitch";
import TimeController from "./components/TimeController";
import CivicClock from "./components/CivicClock";
import EventCalendar from "./components/EventCalendar";
import SettingsPanel from "./components/SettingsPanel";
import { useSettingsStore } from "./state/settingsStore";

function App() {
  const mode = useSettingsStore((s) => s.mode);
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
          {mode === "system"
            ? "— System View · 거리 실척(AU), 반경 과장 [스펙 §7.3] · 데이터: Dreizler+2024 [관측]"
            : "— Surface View · 티가든 b 저녁 터미네이터, 위도 15° [가정] · 항성 각지름 2.47° [유도]"}
        </span>
      </header>

      {mode === "system" ? (
        <Canvas camera={{ position: [0.07, 0.06, 0.1], fov: 50, near: 1e-4, far: 10 }}>
          <SystemScene />
        </Canvas>
      ) : (
        // 1인칭: 원점 부근에서 서쪽(−x, 항성 방향)을 보며 시작 (§6.1 FOV 60–75)
        <Canvas camera={{ position: [0.5, 0, 0], fov: 70, near: 0.01, far: 500 }}>
          <SurfaceScene />
        </Canvas>
      )}

      <ModeSwitch />
      <SettingsPanel />
      <CivicClock />
      <EventCalendar />
      <TimeController />
    </div>
  );
}

export default App;
