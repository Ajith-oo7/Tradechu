"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

const SEGMENTS = 32;

export function PokeballModel() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;

    groupRef.current.position.y = Math.sin(t * 0.8) * 0.15 + Math.sin(t * 0.3) * 0.05;
    groupRef.current.rotation.y = t * 0.25;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.08 + 0.15;
    groupRef.current.rotation.z = Math.sin(t * 0.55) * 0.04;

    const breathe = 1 + Math.sin(t * 0.6) * 0.015;
    groupRef.current.scale.setScalar(breathe);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0.1, 0, 0]}>
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[1, SEGMENTS, SEGMENTS, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#FF1A1A"
          emissive="#EE1515"
          emissiveIntensity={0.06}
          metalness={0.15}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.08}
          reflectivity={0.95}
        />
      </mesh>

      <mesh position={[0, -0.06, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[1, SEGMENTS, SEGMENTS, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={0.02}
          metalness={0.08}
          roughness={0.22}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.01, 0.06, 16, SEGMENTS]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.3} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0, 1.01]}>
        <torusGeometry args={[0.18, 0.04, 16, SEGMENTS]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.4} roughness={0.35} />
      </mesh>

      <mesh position={[0, 0, 1.05]}>
        <sphereGeometry args={[0.14, SEGMENTS, SEGMENTS]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={0.04}
          metalness={0.1}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.03}
        />
      </mesh>
    </group>
  );
}
