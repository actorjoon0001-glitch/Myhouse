import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrand, getModel, models } from "@/lib/data";
import { formatArea, formatPriceRange } from "@/lib/format";
import ModelViewer from "@/components/viewer/ModelViewer";

export function generateStaticParams() {
  return models.map((m) => ({ id: m.id }));
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) notFound();
  const brand = getBrand(model.brandId)!;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          박람회 홈
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-stone-800">{model.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* 좌: 뷰어 + 설명 */}
        <div>
          <ModelViewer model={model} />
          <section className="mt-6">
            <h2 className="font-bold text-stone-900">모델 소개</h2>
            <p className="mt-2 leading-relaxed text-stone-600">
              {model.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {model.features.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600"
                >
                  {f}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* 우: 정보 패널 */}
        <aside className="h-fit rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-20">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: brand.logoColor }}
            />
            {brand.name} · {brand.location}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-stone-900">
            {model.name}
          </h1>
          <p className="mt-1 text-sm text-stone-500">{brand.slogan}</p>

          <dl className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">전용 면적</dt>
              <dd className="font-semibold text-stone-900">
                {formatArea(model.area)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">방 / 욕실</dt>
              <dd className="font-semibold text-stone-900">
                {model.rooms}개 / {model.baths}개
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">구조</dt>
              <dd className="font-semibold text-stone-900">{model.style}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">시공 가격대</dt>
              <dd className="text-right font-semibold text-emerald-700">
                {formatPriceRange(model.priceMin, model.priceMax)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-stone-400">
            * 기초·인허가·운송비 별도, 부지 조건에 따라 달라질 수 있습니다.
          </p>

          <Link
            href={`/inquiry?model=${model.id}`}
            className="mt-5 block rounded-lg bg-emerald-700 py-3 text-center font-semibold text-white hover:bg-emerald-800"
          >
            이 모델 견적 문의하기
          </Link>
          <Link
            href="/configurator"
            className="mt-2 block rounded-lg border border-stone-300 py-3 text-center text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            유닛 조합으로 직접 구성해 보기
          </Link>
        </aside>
      </div>
    </div>
  );
}
