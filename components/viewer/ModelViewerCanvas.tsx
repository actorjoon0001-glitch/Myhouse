"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, SoftShadows } from "@react-three/drei";
import * as THREE from "three";
import type { HouseModel } from "@/lib/types";
import { NatureRing, Tree } from "@/components/three/Scenery";

const WALL_HEIGHT = 2.8;
const FOUNDATION_H = 0.22;

function shade(hex: string, factor: number) {
  return `#${new THREE.Color(hex).multiplyScalar(factor).getHexString()}`;
}

const glassMaterial = (
  <meshStandardMaterial
    color="#b8d8e8"
    metalness={0.5}
    roughness={0.08}
    transparent
    opacity={0.85}
  />
);

/** 프레임 + 유리 + 세로 멀리언이 있는 창 (z+ 방향을 바라봄) */
function Window({
  position,
  rotation = [0, 0, 0],
  width,
  height,
  mullions = 2,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  mullions?: number;
}) {
  const bars = [];
  for (let i = 1; i <= mullions; i++) {
    bars.push(
      <mesh key={i} position={[-width / 2 + (width / (mullions + 1)) * i, 0, 0.05]}>
        <boxGeometry args={[0.05, height, 0.04]} />
        <meshStandardMaterial color="#2e2a26" />
      </mesh>,
    );
  }
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.14]} />
        <meshStandardMaterial color="#2e2a26" />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[width, height, 0.1]} />
        {glassMaterial}
      </mesh>
      {bars}
    </group>
  );
}

/** 외벽의 세로 우드슬랫(배튼) — 목재 사이딩 질감 */
function Battens({ model }: { model: HouseModel }) {
  const [w, d] = model.footprint;
  const color = shade(model.bodyColor, 0.82);
  const battens: React.ReactNode[] = [];
  const step = 0.45;
  const geomArgs: [number, number, number] = [0.06, WALL_HEIGHT - 0.1, 0.05];
  for (let x = -w / 2 + step; x < w / 2 - 0.1; x += step) {
    battens.push(
      <mesh key={`f${x}`} position={[x, WALL_HEIGHT / 2, d / 2 + 0.02]}>
        <boxGeometry args={geomArgs} />
        <meshStandardMaterial color={color} />
      </mesh>,
      <mesh key={`b${x}`} position={[x, WALL_HEIGHT / 2, -d / 2 - 0.02]}>
        <boxGeometry args={geomArgs} />
        <meshStandardMaterial color={color} />
      </mesh>,
    );
  }
  for (let z = -d / 2 + step; z < d / 2 - 0.1; z += step) {
    battens.push(
      <mesh
        key={`l${z}`}
        position={[-w / 2 - 0.02, WALL_HEIGHT / 2, z]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={geomArgs} />
        <meshStandardMaterial color={color} />
      </mesh>,
      <mesh
        key={`r${z}`}
        position={[w / 2 + 0.02, WALL_HEIGHT / 2, z]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={geomArgs} />
        <meshStandardMaterial color={color} />
      </mesh>,
    );
  }
  return <>{battens}</>;
}

function Roof({ model }: { model: HouseModel }) {
  const [w, d] = model.footprint;

  const gableGeom = useMemo(() => {
    if (model.roof !== "gable") return null;
    const shape = new THREE.Shape();
    const half = d / 2 + 0.45;
    shape.moveTo(-half, 0);
    shape.lineTo(half, 0);
    shape.lineTo(0, Math.min(2, d * 0.35));
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: w + 0.9,
      bevelEnabled: false,
    });
    geom.rotateY(Math.PI / 2);
    geom.translate(-(w + 0.9) / 2, 0, 0);
    return geom;
  }, [model.roof, w, d]);

  const shedGeom = useMemo(() => {
    if (model.roof !== "shed") return null;
    const shape = new THREE.Shape();
    const half = d / 2 + 0.45;
    shape.moveTo(-half, 0.95);
    shape.lineTo(-half, 0);
    shape.lineTo(half, 0);
    shape.lineTo(half, 0.25);
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: w + 0.9,
      bevelEnabled: false,
    });
    geom.rotateY(Math.PI / 2);
    geom.translate(-(w + 0.9) / 2, 0, 0);
    return geom;
  }, [model.roof, w, d]);

  if (model.roof === "flat") {
    return (
      <group position={[0, WALL_HEIGHT, 0]}>
        {/* 파라펫 슬래브 */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[w + 0.7, 0.28, d + 0.7]} />
          <meshStandardMaterial color={model.roofColor} flatShading />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[w + 0.75, 0.08, d + 0.75]} />
          <meshStandardMaterial color={shade(model.roofColor, 1.25)} />
        </mesh>
      </group>
    );
  }

  const ridgeH = model.roof === "gable" ? Math.min(2, d * 0.35) : 0;
  return (
    <group position={[0, WALL_HEIGHT, 0]}>
      <mesh geometry={(gableGeom ?? shedGeom)!} castShadow>
        <meshStandardMaterial color={model.roofColor} flatShading />
      </mesh>
      {model.roof === "gable" && (
        <>
          {/* 용마루 캡 */}
          <mesh position={[0, ridgeH + 0.03, 0]} castShadow>
            <boxGeometry args={[w + 0.95, 0.12, 0.3]} />
            <meshStandardMaterial color={shade(model.roofColor, 0.8)} />
          </mesh>
          {/* 굴뚝 */}
          <mesh position={[w / 4, ridgeH * 0.75 + 0.5, -d / 6]} castShadow>
            <boxGeometry args={[0.55, 1.3, 0.55]} />
            <meshStandardMaterial color={shade(model.roofColor, 1.15)} flatShading />
          </mesh>
        </>
      )}
    </group>
  );
}

function House({ model }: { model: HouseModel }) {
  const [w, d] = model.footprint;
  const doorX = -w / 4;
  return (
    <group>
      {/* 기초 */}
      <mesh position={[0, FOUNDATION_H / 2, 0]} receiveShadow>
        <boxGeometry args={[w + 0.2, FOUNDATION_H, d + 0.2]} />
        <meshStandardMaterial color="#77746c" />
      </mesh>

      <group position={[0, FOUNDATION_H, 0]}>
        {/* 본체 */}
        <mesh position={[0, WALL_HEIGHT / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, WALL_HEIGHT, d]} />
          <meshStandardMaterial color={model.bodyColor} />
        </mesh>
        <Battens model={model} />
        {/* 코너 보드 */}
        {[
          [-w / 2, -d / 2],
          [-w / 2, d / 2],
          [w / 2, -d / 2],
          [w / 2, d / 2],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, WALL_HEIGHT / 2, z]}>
            <boxGeometry args={[0.14, WALL_HEIGHT, 0.14]} />
            <meshStandardMaterial color={shade(model.bodyColor, 0.7)} />
          </mesh>
        ))}
        <Roof model={model} />

        {/* 현관문 + 캐노피 */}
        <group position={[doorX, 0, d / 2 + 0.05]}>
          <mesh position={[0, 1.08, 0]} castShadow>
            <boxGeometry args={[1.12, 2.16, 0.14]} />
            <meshStandardMaterial color="#2e2a26" />
          </mesh>
          <mesh position={[0, 1.05, 0.04]}>
            <boxGeometry args={[0.92, 2.0, 0.1]} />
            <meshStandardMaterial color="#4a4038" />
          </mesh>
          <mesh position={[0.3, 1.05, 0.11]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color="#c9b98a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 2.35, 0.25]} castShadow>
            <boxGeometry args={[1.5, 0.08, 0.75]} />
            <meshStandardMaterial color={shade(model.roofColor, 1.1)} />
          </mesh>
        </group>

        {/* 전면 통창 / 측면 창 */}
        <Window
          position={[w / 5, 1.45, d / 2 + 0.04]}
          width={w * 0.4}
          height={1.75}
          mullions={3}
        />
        <Window
          position={[w / 2 + 0.04, 1.5, 0]}
          rotation={[0, Math.PI / 2, 0]}
          width={d * 0.35}
          height={1.2}
          mullions={1}
        />
        <Window
          position={[-w / 2 - 0.04, 1.5, d / 6]}
          rotation={[0, -Math.PI / 2, 0]}
          width={d * 0.3}
          height={1.2}
          mullions={1}
        />
      </group>

      {/* 판재 데크 */}
      <group position={[0, 0, d / 2 + 1.05]}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh
            key={i}
            position={[0, 0.14, -0.85 + i * 0.28]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[w * 0.82, 0.07, 0.24]} />
            <meshStandardMaterial color={i % 2 ? "#a08a68" : "#96805f"} />
          </mesh>
        ))}
        {[-w * 0.38, w * 0.38].map((x) => (
          <mesh key={x} position={[x, 0.07, 0]}>
            <boxGeometry args={[0.12, 0.14, 1.9]} />
            <meshStandardMaterial color="#7c6a4f" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function ModelViewerCanvas({ model }: { model: HouseModel }) {
  const [w, d] = model.footprint;
  const radius = Math.max(w, d);
  return (
    <Canvas
      shadows
      camera={{ position: [radius * 1.3, radius * 0.85, radius * 1.55], fov: 45 }}
    >
      <SoftShadows size={22} samples={14} focus={0.6} />
      <Sky sunPosition={[80, 45, 60]} turbidity={5} rayleigh={0.6} />
      <fog attach="fog" args={["#dfe9d5", radius * 4, radius * 10]} />
      <hemisphereLight args={["#eaf3ff", "#9db38a", 0.55]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[14, 18, 10]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-radius * 2}
        shadow-camera-right={radius * 2}
        shadow-camera-top={radius * 2}
        shadow-camera-bottom={-radius * 2}
      />

      <House model={model} />

      {/* 잔디 + 진입로 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[radius * 3.2, 56]} />
        <meshStandardMaterial color="#8fbb6e" />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-w / 4, 0.005, d / 2 + radius * 0.85]}
        receiveShadow
      >
        <planeGeometry args={[1.7, radius * 1.4]} />
        <meshStandardMaterial color="#d8d1bf" />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-w / 4, 0.004, d / 2 + radius * 1.5]}
        receiveShadow
      >
        <circleGeometry args={[radius * 0.55, 40]} />
        <meshStandardMaterial color="#d8d1bf" />
      </mesh>

      {/* 마당 조경 */}
      <Tree position={[w / 2 + 2.2, 0, d / 2 + 1.6]} scale={1.15} variant={1} />
      <Tree position={[-w / 2 - 2.4, 0, d / 2 + 0.6]} scale={0.95} variant={2} />
      <NatureRing count={14} minRadius={radius * 1.7} maxRadius={radius * 2.9} seed={3} />

      <OrbitControls
        enablePan={false}
        minDistance={radius * 0.8}
        maxDistance={radius * 3}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 1.3, 0]}
      />
    </Canvas>
  );
}
