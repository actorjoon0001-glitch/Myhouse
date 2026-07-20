"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, Sky, SoftShadows } from "@react-three/drei";
import * as THREE from "three";
import type { PlacedUnit, UnitType } from "@/lib/types";
import { unitDims } from "@/lib/units";
import { NatureRing } from "@/components/three/Scenery";

const UNIT_HEIGHT = 2.6;

function shade(hex: string, factor: number) {
  return `#${new THREE.Color(hex).multiplyScalar(factor).getHexString()}`;
}

/** 배치된 유닛 한 동 — 바닥판·외벽·창·지붕 슬래브 (데크는 판재로) */
function PlacedUnitMesh({
  placed,
  unit,
  selected,
  onSelect,
}: {
  placed: PlacedUnit;
  unit: UnitType;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const [w, d] = unitDims(unit, placed.rotated);
  const isDeck = unit.id === "deck";
  const h = isDeck ? 0.22 : UNIT_HEIGHT;
  const longSideZ = w >= d; // 창을 긴 면에 낸다

  return (
    <group
      position={[placed.x + w / 2, 0, placed.z + d / 2]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(placed.id);
      }}
    >
      {isDeck ? (
        /* 데크: 판재 나열 */
        <group>
          {Array.from({ length: Math.max(2, Math.floor(d / 0.3)) }, (_, i) => (
            <mesh
              key={i}
              position={[0, 0.14, -d / 2 + 0.18 + i * 0.3]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[w - 0.12, 0.07, 0.24]} />
              <meshStandardMaterial
                color={i % 2 ? shade(unit.color, 1.05) : shade(unit.color, 0.9)}
                emissive={selected ? "#065f46" : "#000000"}
                emissiveIntensity={selected ? 0.4 : 0}
              />
            </mesh>
          ))}
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[w - 0.1, 0.1, d - 0.1]} />
            <meshStandardMaterial color={shade(unit.color, 0.65)} />
          </mesh>
        </group>
      ) : (
        <group>
          {/* 기초판 */}
          <mesh position={[0, 0.07, 0]} receiveShadow>
            <boxGeometry args={[w + 0.08, 0.14, d + 0.08]} />
            <meshStandardMaterial color="#77746c" />
          </mesh>
          {/* 외벽 */}
          <mesh position={[0, 0.14 + h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w - 0.06, h, d - 0.06]} />
            <meshStandardMaterial
              color={unit.color}
              emissive={selected ? "#065f46" : "#000000"}
              emissiveIntensity={selected ? 0.35 : 0}
            />
          </mesh>
          {/* 창 (긴 면) */}
          <group
            position={
              longSideZ
                ? [0, 0.14 + h * 0.52, d / 2 - 0.005]
                : [w / 2 - 0.005, 0.14 + h * 0.52, 0]
            }
            rotation={longSideZ ? [0, 0, 0] : [0, Math.PI / 2, 0]}
          >
            <mesh castShadow>
              <boxGeometry args={[(longSideZ ? w : d) * 0.5 + 0.12, 1.15, 0.1]} />
              <meshStandardMaterial color="#2e2a26" />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[(longSideZ ? w : d) * 0.5, 1.0, 0.08]} />
              <meshStandardMaterial
                color="#b8d8e8"
                metalness={0.5}
                roughness={0.08}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
          {/* 거실동에는 현관문 */}
          {unit.id === "living" && (
            <group
              position={
                longSideZ
                  ? [-w / 2 + 0.8, 0.14, d / 2 - 0.005]
                  : [w / 2 - 0.005, 0.14, -d / 2 + 0.8]
              }
              rotation={longSideZ ? [0, 0, 0] : [0, Math.PI / 2, 0]}
            >
              <mesh position={[0, 1.02, 0.02]} castShadow>
                <boxGeometry args={[0.95, 2.04, 0.1]} />
                <meshStandardMaterial color="#2e2a26" />
              </mesh>
              <mesh position={[0, 1.0, 0.06]}>
                <boxGeometry args={[0.78, 1.9, 0.08]} />
                <meshStandardMaterial color="#4a4038" />
              </mesh>
            </group>
          )}
          {/* 지붕 슬래브 */}
          <mesh position={[0, 0.14 + h + 0.1, 0]} castShadow>
            <boxGeometry args={[w + 0.24, 0.2, d + 0.24]} />
            <meshStandardMaterial
              color={selected ? "#047857" : "#57534e"}
              flatShading
            />
          </mesh>
          <mesh position={[0, 0.14 + h + 0.23, 0]}>
            <boxGeometry args={[w + 0.28, 0.06, d + 0.28]} />
            <meshStandardMaterial color={selected ? "#065f46" : "#6b675f"} />
          </mesh>
        </group>
      )}

      {/* 선택 표시 링 */}
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.62, Math.max(w, d) * 0.7, 40]} />
          <meshBasicMaterial color="#059669" />
        </mesh>
      )}
    </group>
  );
}

export default function ConfiguratorScene({
  placed,
  getUnit,
  selectedId,
  onSelect,
}: {
  placed: PlacedUnit[];
  getUnit: (id: string) => UnitType | undefined;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <Canvas shadows camera={{ position: [13, 11, 13], fov: 45 }}>
      <SoftShadows size={22} samples={12} focus={0.6} />
      <Sky sunPosition={[80, 45, 60]} turbidity={5} rayleigh={0.6} />
      <fog attach="fog" args={["#dfe9d5", 45, 100]} />
      <hemisphereLight args={["#eaf3ff", "#9db38a", 0.55]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[14, 18, 10]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />

      {/* 잔디 (클릭 시 선택 해제) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.03, 0]}
        receiveShadow
        onClick={() => onSelect(null)}
      >
        <circleGeometry args={[45, 64]} />
        <meshStandardMaterial color="#8fbb6e" />
      </mesh>
      {/* 대지(플라자) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onClick={() => onSelect(null)}
      >
        <circleGeometry args={[14.5, 56]} />
        <meshStandardMaterial color="#d8d1bf" />
      </mesh>
      <Grid
        position={[0, 0.01, 0]}
        args={[22, 22]}
        cellSize={1}
        cellColor="#bfb6a0"
        sectionSize={5}
        sectionColor="#a89e85"
        fadeDistance={38}
      />

      {placed.map((p) => {
        const unit = getUnit(p.unitTypeId);
        if (!unit) return null;
        return (
          <PlacedUnitMesh
            key={p.id}
            placed={p}
            unit={unit}
            selected={p.id === selectedId}
            onSelect={(id) => onSelect(id)}
          />
        );
      })}

      {/* 대지 바깥 조경 */}
      <NatureRing count={18} minRadius={16.5} maxRadius={26} seed={7} />

      <OrbitControls
        minDistance={6}
        maxDistance={38}
        maxPolarAngle={Math.PI / 2.12}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
