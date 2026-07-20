"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { HouseModel } from "@/lib/types";

const WALL_HEIGHT = 2.8;

/** 지붕: 모델의 roof 타입에 따라 박공/평/외쪽 지붕 생성 */
function Roof({ model }: { model: HouseModel }) {
  const [w, d] = model.footprint;

  const gableGeom = useMemo(() => {
    if (model.roof !== "gable") return null;
    const shape = new THREE.Shape();
    const half = d / 2 + 0.3;
    shape.moveTo(-half, 0);
    shape.lineTo(half, 0);
    shape.lineTo(0, Math.min(2, d * 0.35));
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: w + 0.6,
      bevelEnabled: false,
    });
    geom.rotateY(Math.PI / 2);
    geom.translate(-(w + 0.6) / 2, 0, 0);
    return geom;
  }, [model.roof, w, d]);

  const shedGeom = useMemo(() => {
    if (model.roof !== "shed") return null;
    const shape = new THREE.Shape();
    const half = d / 2 + 0.3;
    shape.moveTo(-half, 0.9);
    shape.lineTo(-half, 0);
    shape.lineTo(half, 0);
    shape.lineTo(half, 0.25);
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: w + 0.6,
      bevelEnabled: false,
    });
    geom.rotateY(Math.PI / 2);
    geom.translate(-(w + 0.6) / 2, 0, 0);
    return geom;
  }, [model.roof, w, d]);

  if (model.roof === "flat") {
    return (
      <mesh position={[0, WALL_HEIGHT + 0.1, 0]} castShadow>
        <boxGeometry args={[w + 0.4, 0.2, d + 0.4]} />
        <meshStandardMaterial color={model.roofColor} />
      </mesh>
    );
  }
  return (
    <mesh
      position={[0, WALL_HEIGHT, 0]}
      geometry={(gableGeom ?? shedGeom)!}
      castShadow
    >
      <meshStandardMaterial color={model.roofColor} />
    </mesh>
  );
}

function House({ model }: { model: HouseModel }) {
  const [w, d] = model.footprint;
  return (
    <group>
      {/* 본체 */}
      <mesh position={[0, WALL_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, WALL_HEIGHT, d]} />
        <meshStandardMaterial color={model.bodyColor} />
      </mesh>
      <Roof model={model} />
      {/* 현관문 */}
      <mesh position={[-w / 4, 1.05, d / 2 + 0.02]}>
        <boxGeometry args={[1, 2.1, 0.06]} />
        <meshStandardMaterial color="#3e3a35" />
      </mesh>
      {/* 전면 통창 */}
      <mesh position={[w / 5, 1.4, d / 2 + 0.02]}>
        <boxGeometry args={[w * 0.4, 1.7, 0.05]} />
        <meshStandardMaterial
          color="#a8cfe0"
          metalness={0.4}
          roughness={0.1}
        />
      </mesh>
      {/* 측면 창 */}
      <mesh position={[w / 2 + 0.02, 1.5, 0]}>
        <boxGeometry args={[0.05, 1.2, d * 0.35]} />
        <meshStandardMaterial
          color="#a8cfe0"
          metalness={0.4}
          roughness={0.1}
        />
      </mesh>
      {/* 데크 */}
      <mesh position={[0, 0.08, d / 2 + 1]} receiveShadow>
        <boxGeometry args={[w * 0.8, 0.16, 1.8]} />
        <meshStandardMaterial color="#9c8465" />
      </mesh>
    </group>
  );
}

export default function ModelViewerCanvas({ model }: { model: HouseModel }) {
  const [w, d] = model.footprint;
  const radius = Math.max(w, d);
  return (
    <Canvas
      shadows
      camera={{ position: [radius * 1.3, radius * 0.9, radius * 1.5], fov: 45 }}
    >
      <color attach="background" args={["#eef1ec"]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[10, 14, 8]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <House model={model} />
      {/* 잔디 지면 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[radius * 2.2, 48]} />
        <meshStandardMaterial color="#b7c9a8" />
      </mesh>
      <OrbitControls
        enablePan={false}
        minDistance={radius * 0.8}
        maxDistance={radius * 3.5}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1.2, 0]}
      />
    </Canvas>
  );
}
