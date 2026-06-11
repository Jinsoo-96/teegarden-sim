// 후처리 — 스펙 §7.4-7.5: Bloom(휘도 임계 1.0 = HDR 천체만) + ACES 톤매핑
// 항성 디스크·플레어(HDR>1)만 블룸 — 하늘·별필드·UI는 <1이라 제외 (selective)
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export default function PostFX() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.2} mipmapBlur intensity={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
