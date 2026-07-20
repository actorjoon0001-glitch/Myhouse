/** 156000000 → "1억 5,600만원" */
export function formatKrw(price: number): string {
  const eok = Math.floor(price / 100_000_000);
  const man = Math.round((price % 100_000_000) / 10_000);
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) parts.push(`${man.toLocaleString()}만원`);
  if (parts.length === 0) return "0원";
  if (eok > 0 && man === 0) parts[0] += "원";
  return parts.join(" ");
}

export function formatPriceRange(min: number, max: number): string {
  return `${formatKrw(min)} ~ ${formatKrw(max)}`;
}

/** 평 → ㎡ 병기 문자열 */
export function formatArea(pyeong: number): string {
  const m2 = Math.round(pyeong * 3.3058 * 10) / 10;
  return `${pyeong}평 (${m2}㎡)`;
}
