"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { units } from "@/lib/data";
import { formatKrw } from "@/lib/format";
import type { InquiryPayload, PlacedUnit, UnitType } from "@/lib/types";
import { unitDims } from "@/lib/units";

const ConfiguratorScene = dynamic(() => import("./ConfiguratorScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-stone-400">
      3D 배치 공간 불러오는 중…
    </div>
  ),
});

const BOUND = 10; // 배치 가능 범위: -BOUND ~ +BOUND (m)

function getUnit(id: string): UnitType | undefined {
  return units.find((u) => u.id === id);
}

function rectsOverlap(
  ax: number, az: number, aw: number, ad: number,
  bx: number, bz: number, bw: number, bd: number,
) {
  return ax < bx + bw && bx < ax + aw && az < bz + bd && bz < az + ad;
}

function collides(
  placed: PlacedUnit[],
  x: number,
  z: number,
  w: number,
  d: number,
  ignoreId?: string,
) {
  return placed.some((p) => {
    if (p.id === ignoreId) return false;
    const unit = getUnit(p.unitTypeId);
    if (!unit) return false;
    const [pw, pd] = unitDims(unit, p.rotated);
    return rectsOverlap(x, z, w, d, p.x, p.z, pw, pd);
  });
}

/** 원점에서 가까운 순서로 빈 자리를 찾는다 */
function findFreeSpot(
  placed: PlacedUnit[],
  w: number,
  d: number,
): { x: number; z: number } | null {
  const candidates: { x: number; z: number; dist: number }[] = [];
  for (let x = -BOUND; x <= BOUND - w; x++) {
    for (let z = -BOUND; z <= BOUND - d; z++) {
      candidates.push({ x, z, dist: Math.hypot(x + w / 2, z + d / 2) });
    }
  }
  candidates.sort((a, b) => a.dist - b.dist);
  for (const c of candidates) {
    if (!collides(placed, c.x, c.z, w, d)) return c;
  }
  return null;
}

let nextId = 1;

export default function ConfiguratorApp() {
  const router = useRouter();
  const [placed, setPlaced] = useState<PlacedUnit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selected = placed.find((p) => p.id === selectedId) ?? null;
  const selectedUnit = selected ? getUnit(selected.unitTypeId) : null;

  const { totalArea, totalPrice, counts } = useMemo(() => {
    let area = 0;
    let price = 0;
    const counts = new Map<string, number>();
    for (const p of placed) {
      const u = getUnit(p.unitTypeId);
      if (!u) continue;
      area += u.area;
      price += u.price;
      counts.set(u.id, (counts.get(u.id) ?? 0) + 1);
    }
    return { totalArea: Math.round(area * 10) / 10, totalPrice: price, counts };
  }, [placed]);

  function addUnit(unit: UnitType) {
    const [w, d] = unit.size;
    const spot = findFreeSpot(placed, w, d);
    if (!spot) {
      setMessage("배치 공간이 가득 찼습니다. 유닛을 정리해 주세요.");
      return;
    }
    const id = `u${nextId++}`;
    setPlaced([...placed, { id, unitTypeId: unit.id, x: spot.x, z: spot.z, rotated: false }]);
    setSelectedId(id);
    setMessage(null);
  }

  function moveSelected(dx: number, dz: number) {
    if (!selected || !selectedUnit) return;
    const [w, d] = unitDims(selectedUnit, selected.rotated);
    const nx = selected.x + dx;
    const nz = selected.z + dz;
    if (nx < -BOUND || nz < -BOUND || nx + w > BOUND || nz + d > BOUND) return;
    if (collides(placed, nx, nz, w, d, selected.id)) {
      setMessage("다른 유닛과 겹칠 수 없습니다.");
      return;
    }
    setMessage(null);
    setPlaced(placed.map((p) => (p.id === selected.id ? { ...p, x: nx, z: nz } : p)));
  }

  function rotateSelected() {
    if (!selected || !selectedUnit) return;
    const [w, d] = unitDims(selectedUnit, !selected.rotated);
    if (
      selected.x + w > BOUND ||
      selected.z + d > BOUND ||
      collides(placed, selected.x, selected.z, w, d, selected.id)
    ) {
      setMessage("회전할 공간이 없습니다. 먼저 이동해 주세요.");
      return;
    }
    setMessage(null);
    setPlaced(
      placed.map((p) =>
        p.id === selected.id ? { ...p, rotated: !p.rotated } : p,
      ),
    );
  }

  function removeSelected() {
    if (!selected) return;
    setPlaced(placed.filter((p) => p.id !== selected.id));
    setSelectedId(null);
    setMessage(null);
  }

  function goToInquiry() {
    const detail = [...counts.entries()]
      .map(([unitId, n]) => `${getUnit(unitId)?.name ?? unitId} × ${n}`)
      .join(", ");
    const payload: InquiryPayload = {
      type: "custom",
      title: "직접 조합한 모듈러 구성",
      detail,
      totalArea,
      totalPrice,
    };
    sessionStorage.setItem("myhouse-config", JSON.stringify(payload));
    router.push("/inquiry?from=config");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            모듈러 컨피규레이터
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            유닛을 추가하고, 3D 화면에서 유닛을 클릭해 이동·회전하며 내 집을
            구성해 보세요. 면적과 예상 가격이 실시간으로 계산됩니다.
          </p>
        </div>
        {message && (
          <p className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
            {message}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr_280px]">
        {/* 유닛 팔레트 */}
        <aside className="order-2 lg:order-1">
          <h2 className="text-sm font-bold text-stone-700">규격 유닛</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => addUnit(u)}
                className="rounded-lg border border-stone-200 bg-white p-3 text-left transition hover:border-emerald-600 hover:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded"
                    style={{ backgroundColor: u.color }}
                  />
                  <span className="font-semibold text-stone-800">{u.name}</span>
                  <span className="ml-auto text-xs font-bold text-emerald-700">
                    + 추가
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  {u.size[0]}×{u.size[1]}m · {u.area}평 · {formatKrw(u.price)}
                </p>
              </button>
            ))}
          </div>
        </aside>

        {/* 3D 배치 화면 */}
        <div className="order-1 aspect-square overflow-hidden rounded-xl border border-stone-200 bg-[#eef1ec] sm:aspect-[4/3] lg:order-2 lg:aspect-auto lg:min-h-[560px]">
          <ConfiguratorScene
            placed={placed}
            getUnit={getUnit}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* 구성 요약 + 선택 유닛 컨트롤 */}
        <aside className="order-3 space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <h2 className="text-sm font-bold text-stone-700">선택한 유닛</h2>
            {selected && selectedUnit ? (
              <div className="mt-2">
                <p className="font-semibold text-stone-900">
                  {selectedUnit.name}
                  <span className="ml-1 text-xs font-normal text-stone-500">
                    {unitDims(selectedUnit, selected.rotated).join("×")}m
                  </span>
                </p>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-sm">
                  <div />
                  <ControlButton label="↑" onClick={() => moveSelected(0, -1)} />
                  <div />
                  <ControlButton label="←" onClick={() => moveSelected(-1, 0)} />
                  <ControlButton label="↓" onClick={() => moveSelected(0, 1)} />
                  <ControlButton label="→" onClick={() => moveSelected(1, 0)} />
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button
                    onClick={rotateSelected}
                    className="flex-1 rounded-md border border-stone-300 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                  >
                    ⟳ 회전
                  </button>
                  <button
                    onClick={removeSelected}
                    className="flex-1 rounded-md border border-red-200 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-stone-400">
                3D 화면에서 유닛을 클릭하면 이동·회전할 수 있습니다.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <h2 className="text-sm font-bold text-stone-700">내 구성</h2>
            {placed.length === 0 ? (
              <p className="mt-2 text-sm text-stone-400">
                왼쪽에서 유닛을 추가해 시작하세요. 거실동부터 시작하는 것을
                추천합니다.
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-stone-600">
                {[...counts.entries()].map(([unitId, n]) => {
                  const u = getUnit(unitId)!;
                  return (
                    <li key={unitId} className="flex justify-between">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded"
                          style={{ backgroundColor: u.color }}
                        />
                        {u.name} × {n}
                      </span>
                      <span>{formatKrw(u.price * n)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">총 면적</span>
                <span className="font-bold text-stone-900">
                  {totalArea}평 ({Math.round(totalArea * 3.3058 * 10) / 10}㎡)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">예상 가격</span>
                <span className="font-bold text-emerald-700">
                  {formatKrw(totalPrice)}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                * 기초공사·운송·설치비 별도 (문의 시 안내)
              </p>
            </div>
            <button
              onClick={goToInquiry}
              disabled={placed.length === 0}
              className="mt-3 w-full rounded-lg bg-emerald-700 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              이 구성으로 견적 문의
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-stone-300 py-1.5 font-medium text-stone-700 hover:bg-stone-50"
    >
      {label}
    </button>
  );
}
