import type { UnitType } from "./types";

/** 회전 상태를 반영한 유닛의 [가로, 세로] (m) */
export function unitDims(unit: UnitType, rotated: boolean): [number, number] {
  const [w, d] = unit.size;
  return rotated ? [d, w] : [w, d];
}
