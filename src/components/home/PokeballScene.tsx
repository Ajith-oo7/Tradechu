"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles, SpotLight } from "@react-three/drei";
import { PokeballModel } from "./PokeballModel";

export function PokeballScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} color="#334155" />

        <directionalLight position={[2, 3, 5]} intensity={1.4} color="#FFF5E6" />
        <directionalLight position={[-4, 1, -3]} intensity={0.8} color="#EE1515" />

        <pointLight position={[0, 2, 3]} intensity={0.4} color="#FFCB05" distance={10} />
        <pointLight position={[0, -2, 2]} intensity={0.25} color="#E2E8F0" distance={8} />

        <SpotLight
          position={[2, 4, 4]}
          target-position={[0, 0, 0]}
          angle={0.45}
          penumbra={0.8}
          intensity={1.2}
          color="#FFFFFF"
        />

        <Sparkles count={100} scale={[12, 14, 8]} position={[0, 0, 0]} size={2} speed={0.35} opacity={0.65} color="#FFCB05" />
        <Sparkles count={60} scale={[10, 12, 6]} position={[0, 0, 0]} size={1.5} speed={0.22} opacity={0.4} color="#FFFFFF" />
        <Sparkles count={40} scale={[9, 11, 5]} position={[0, 0, 0]} size={1.5} speed={0.3} opacity={0.35} color="#EE1515" />

        <PokeballModel />
      </Suspense>
    </Canvas>
  );
}
