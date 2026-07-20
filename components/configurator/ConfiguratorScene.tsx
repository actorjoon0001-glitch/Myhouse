"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import type { PlacedUnit, UnitType } from "@/lib/types";
import { unitDims } from "@/lib/units";

const UNIT_HEIGHT = 2.6;

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
  const h = isDeck ? 0.25 : UNIT_HEIGHT;
  return (
    <group position={[placed.x + w / 2, 0, placed.z + d / 2]}>
      <mesh
        position={[0, h / 2, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(placed.id);
        }}
      >
        <boxGeometry args={[w - 0.06, h, d - 0.06]} />
        <meshStandardMaterial
          color={unit.color}
          emissive={selected ? "#065f46" : "#000000"}
          emissiveIntensity={selected ? 0.45 : 0}
        />
      </mesh>
      {/* 지붕 슬래브 (데크 제외) */}
      {!isDeck && (
        <mesh position={[0, h + 0.08, 0]} castShadow>
          <boxGeometry args={[w + 0.15, 0.16, d + 0.15]} />
          <meshStandardMaterial color={selected ? "#047857" : "#78716c"} />
        </mesh>
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
    <Canvas shadows camera={{ position: [12, 11, 12], fov: 45 }}>
      <color attach="background" args={["#eef1ec"]} />
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[12, 16, 8]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* 바닥 (클릭 시 선택 해제) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onClick={() => onSelect(null)}
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#c3d1b4" />
      </mesh>
      <Grid
        position={[0, 0.01, 0]}
        args={[40, 40]}
        cellSize={1}
        cellColor="#9aa88c"
        sectionSize={5}
        sectionColor="#7d8f6d"
        fadeDistance={45}
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
      <OrbitControls
        minDistance={6}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
