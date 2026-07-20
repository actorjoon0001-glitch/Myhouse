export interface Brand {
  id: string;
  name: string;
  slogan: string;
  location: string;
  logoColor: string;
}

export type RoofType = "gable" | "flat" | "shed";

export interface HouseModel {
  id: string;
  brandId: string;
  name: string;
  /** 평수 */
  area: number;
  rooms: number;
  baths: number;
  priceMin: number;
  priceMax: number;
  style: string;
  features: string[];
  description: string;
  /** [가로, 세로] 미터 단위 외형 크기 (3D 뷰어용) */
  footprint: [number, number];
  roof: RoofType;
  bodyColor: string;
  roofColor: string;
  matterportUrl: string;
}

export interface UnitType {
  id: string;
  name: string;
  shortName: string;
  /** [가로, 세로] 미터 (그리드 셀 = 1m) */
  size: [number, number];
  /** 평수 */
  area: number;
  price: number;
  color: string;
  description: string;
}

/** 컨피규레이터에 배치된 유닛 하나 */
export interface PlacedUnit {
  id: string;
  unitTypeId: string;
  /** 그리드 좌표 (셀 단위, 유닛의 좌하단 모서리) */
  x: number;
  z: number;
  /** true면 90도 회전 (가로/세로 교환) */
  rotated: boolean;
}

/** 견적 문의에 첨부되는 구성 정보 */
export interface InquiryPayload {
  type: "model" | "custom";
  title: string;
  detail: string;
  totalArea: number;
  totalPrice: number;
}
