import Link from "next/link";
import type { Brand, HouseModel } from "@/lib/types";
import { formatArea, formatKrw } from "@/lib/format";

/** 카드 상단의 간이 주택 일러스트 (SVG, 모델 색상 반영) */
function HouseThumb({ model }: { model: HouseModel }) {
  const { bodyColor, roofColor, roof } = model;
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden>
      <rect width="200" height="110" fill="#eef2ec" />
      <rect y="88" width="200" height="22" fill="#dde5da" />
      {roof === "gable" && (
        <>
          <rect x="55" y="52" width="90" height="38" fill={bodyColor} />
          <polygon points="45,55 100,25 155,55" fill={roofColor} />
        </>
      )}
      {roof === "flat" && (
        <>
          <rect x="55" y="42" width="90" height="48" fill={bodyColor} />
          <rect x="50" y="36" width="100" height="8" fill={roofColor} />
        </>
      )}
      {roof === "shed" && (
        <>
          <rect x="55" y="50" width="90" height="40" fill={bodyColor} />
          <polygon points="50,52 150,34 150,46 50,58" fill={roofColor} />
        </>
      )}
      <rect x="70" y="62" width="16" height="20" fill="#fff" opacity="0.85" />
      <rect x="112" y="62" width="22" height="28" fill="#fff" opacity="0.7" />
    </svg>
  );
}

export default function ModelCard({
  model,
  brand,
}: {
  model: HouseModel;
  brand: Brand;
}) {
  return (
    <Link
      href={`/models/${model.id}`}
      className="group overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="h-36 overflow-hidden">
        <HouseThumb model={model} />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: brand.logoColor }}
          />
          <span className="text-stone-500">{brand.name}</span>
          <span className="ml-auto rounded-full bg-stone-100 px-2 py-0.5 text-stone-500">
            {model.style}
          </span>
        </div>
        <h3 className="mt-1.5 font-bold text-stone-900 group-hover:text-emerald-700">
          {model.name}
        </h3>
        <p className="mt-0.5 text-sm text-stone-500">
          {formatArea(model.area)} · 방 {model.rooms} · 욕실 {model.baths}
        </p>
        <p className="mt-2 text-sm font-semibold text-emerald-700">
          {formatKrw(model.priceMin)}부터
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {model.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="rounded bg-stone-50 px-1.5 py-0.5 text-xs text-stone-500"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
