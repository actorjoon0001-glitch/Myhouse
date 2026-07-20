"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { brands, models } from "@/lib/data";
import ModelCard from "@/components/ModelCard";

const AREA_FILTERS = [
  { label: "전체 평수", min: 0, max: Infinity },
  { label: "20평 미만", min: 0, max: 20 },
  { label: "20~30평", min: 20, max: 30 },
  { label: "30평 이상", min: 30, max: Infinity },
] as const;

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [brandId, setBrandId] = useState("all");
  const [areaIdx, setAreaIdx] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const range = AREA_FILTERS[areaIdx];
    return models.filter((m) => {
      const brand = brands.find((b) => b.id === m.brandId);
      if (brandId !== "all" && m.brandId !== brandId) return false;
      if (m.area < range.min) return false;
      if (range.max !== Infinity && m.area >= range.max) return false;
      if (!q) return true;
      const haystack = `${m.name} ${m.style} ${brand?.name ?? ""} ${m.features.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, brandId, areaIdx]);

  return (
    <div>
      {/* 히어로 */}
      <section className="border-b border-stone-200 bg-gradient-to-b from-emerald-50 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <p className="text-sm font-semibold text-emerald-700">
            제1회 온라인 모듈러주택 박람회
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            발품 없이, 3D로 둘러보는 내 집
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">
            {brands.length}개 브랜드 {models.length}개 모델을 한 곳에서
            비교하고, 규격 유닛을 직접 조합해 나만의 집을 만들어 보세요.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="#models"
              className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              모델 둘러보기
            </a>
            <Link
              href="/configurator"
              className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              유닛 조합해 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* 브랜드 줄 */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-sm font-semibold text-stone-500">참가 브랜드</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setBrandId(brandId === b.id ? "all" : b.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                brandId === b.id
                  ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: b.logoColor }}
              />
              {b.name}
              <span className="text-xs text-stone-400">{b.location}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 검색 + 필터 + 그리드 */}
      <section id="models" className="mx-auto max-w-6xl px-4 pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="모델명·브랜드·특징 검색 (예: 다락, 스테이)"
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-600 sm:max-w-xs"
          />
          <div className="flex gap-1.5">
            {AREA_FILTERS.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setAreaIdx(i)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  areaIdx === i
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-stone-500 sm:ml-auto">
            {filtered.length}개 모델
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
            조건에 맞는 모델이 없습니다. 필터를 조정해 보세요.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => {
              const brand = brands.find((b) => b.id === m.brandId)!;
              return <ModelCard key={m.id} model={m} brand={brand} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
