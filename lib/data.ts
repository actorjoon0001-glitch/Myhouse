import brandsJson from "@/data/brands.json";
import modelsJson from "@/data/models.json";
import unitsJson from "@/data/units.json";
import type { Brand, HouseModel, UnitType } from "./types";

export const brands = brandsJson as Brand[];
export const models = modelsJson as HouseModel[];
export const units = unitsJson as UnitType[];

export function getBrand(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}

export function getModel(id: string): HouseModel | undefined {
  return models.find((m) => m.id === id);
}

export function getUnit(id: string): UnitType | undefined {
  return units.find((u) => u.id === id);
}
