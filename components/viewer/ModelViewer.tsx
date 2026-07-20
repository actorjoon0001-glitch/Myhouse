"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { HouseModel } from "@/lib/types";

const ModelViewerCanvas = dynamic(() => import("./ModelViewerCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-stone-400">
      3D 모델 불러오는 중…
    </div>
  ),
});

/** 3D 외관 뷰 / 실내 투어(Matterport 임베드 슬롯) 탭 전환 뷰어 */
export default function ModelViewer({ model }: { model: HouseModel }) {
  const [tab, setTab] = useState<"3d" | "tour">("3d");

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="flex border-b border-stone-200 text-sm font-medium">
        <button
          onClick={() => setTab("3d")}
          className={`px-4 py-2.5 ${
            tab === "3d"
              ? "border-b-2 border-emerald-700 text-emerald-700"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          3D 외관 보기
        </button>
        <button
          onClick={() => setTab("tour")}
          className={`px-4 py-2.5 ${
            tab === "tour"
              ? "border-b-2 border-emerald-700 text-emerald-700"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          실내 투어
        </button>
        {tab === "3d" && (
          <span className="ml-auto self-center pr-4 text-xs text-stone-400">
            드래그: 회전 · 휠: 확대
          </span>
        )}
      </div>
      <div className="aspect-[16/10] w-full bg-[#eef1ec]">
        {tab === "3d" ? (
          <ModelViewerCanvas model={model} />
        ) : (
          <div className="relative h-full w-full bg-stone-900">
            {/* 실제 쇼룸 촬영본(Matterport 등) 연동 전까지 자리만 유지하는 임베드 슬롯 */}
            <iframe
              src={model.matterportUrl}
              title={`${model.name} 실내 투어`}
              className="h-full w-full opacity-40"
              allow="fullscreen; xr-spatial-tracking"
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-stone-700">
                실내 360° 투어 준비 중
              </span>
              <span className="text-xs text-stone-300">
                실제 쇼룸 촬영본(Matterport)이 이 자리에 연동됩니다
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
