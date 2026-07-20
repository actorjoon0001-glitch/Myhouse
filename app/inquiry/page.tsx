import type { Metadata } from "next";
import { getBrand, getModel } from "@/lib/data";
import type { InquiryPayload } from "@/lib/types";
import { formatArea } from "@/lib/format";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "견적 문의 — 마이하우스",
};

export default async function InquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; from?: string }>;
}) {
  const { model: modelId, from } = await searchParams;

  let initialPayload: InquiryPayload | null = null;
  if (modelId) {
    const model = getModel(modelId);
    if (model) {
      const brand = getBrand(model.brandId);
      initialPayload = {
        type: "model",
        title: `${brand?.name ?? ""} ${model.name}`.trim(),
        detail: `${formatArea(model.area)} · 방 ${model.rooms} · 욕실 ${model.baths} · ${model.style}`,
        totalArea: model.area,
        totalPrice: model.priceMin,
      };
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-stone-900">견적 문의</h1>
      <p className="mt-1 text-sm text-stone-500">
        구성하신 집 정보와 연락처를 남겨주시면 시공 견적 상담을 도와드립니다.
      </p>
      <div className="mt-6">
        <InquiryForm
          initialPayload={initialPayload}
          fromConfig={from === "config"}
        />
      </div>
    </div>
  );
}
