"use client";

/** 로우폴리 환경 요소 — 나무·수풀·바위와 그 배치 헬퍼 (두 3D 씬에서 공용) */

const TREE_GREENS = ["#5f9e4d", "#6fae57", "#4f8f46", "#7cb763"];

/* Math.random 대신 인덱스 기반 결정적 난수 (리렌더 간 배치 고정) */
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Tree({
  position,
  scale = 1,
  variant = 0,
}: {
  position: [number, number, number];
  scale?: number;
  variant?: number;
}) {
  const main = TREE_GREENS[variant % TREE_GREENS.length];
  const sub = TREE_GREENS[(variant + 1) % TREE_GREENS.length];
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.13, 0.2, 1.1, 6]} />
        <meshStandardMaterial color="#7a5a3a" flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color={main} flatShading />
      </mesh>
      <mesh castShadow position={[0.38, 1.05, 0.2]}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={sub} flatShading />
      </mesh>
    </group>
  );
}

export function Bush({
  position,
  scale = 1,
  variant = 0,
}: {
  position: [number, number, number];
  scale?: number;
  variant?: number;
}) {
  return (
    <mesh castShadow position={position} scale={scale}>
      <icosahedronGeometry args={[0.45, 0]} />
      <meshStandardMaterial
        color={TREE_GREENS[variant % TREE_GREENS.length]}
        flatShading
      />
    </mesh>
  );
}

export function Rock({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <mesh castShadow position={position} scale={scale}>
      <dodecahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color="#9c9a92" flatShading />
    </mesh>
  );
}

/** 중심을 비우고 그 바깥 도넛 영역에 나무·수풀·바위를 흩뿌린다 */
export function NatureRing({
  count = 12,
  minRadius,
  maxRadius,
  seed = 1,
}: {
  count?: number;
  minRadius: number;
  maxRadius: number;
  seed?: number;
}) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const angle =
      (i / count) * Math.PI * 2 + (rand(i, seed) - 0.5) * ((Math.PI * 2) / count);
    const r = minRadius + (maxRadius - minRadius) * rand(i, seed + 1);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const kind = rand(i, seed + 2);
    const scale = 0.8 + rand(i, seed + 3) * 0.7;
    const variant = Math.floor(rand(i, seed + 4) * 4);
    if (kind < 0.62) {
      items.push(
        <Tree key={i} position={[x, 0, z]} scale={scale} variant={variant} />,
      );
    } else if (kind < 0.85) {
      items.push(
        <Bush
          key={i}
          position={[x, 0.28 * scale, z]}
          scale={scale}
          variant={variant}
        />,
      );
    } else {
      items.push(<Rock key={i} position={[x, 0.18 * scale, z]} scale={scale} />);
    }
  }
  return <>{items}</>;
}
