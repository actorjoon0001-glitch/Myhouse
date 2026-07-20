import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "마이하우스 — 온라인 3D 모듈러주택 박람회",
  description:
    "모듈러 주택을 3D로 둘러보고, 유닛을 조합해 내 집을 구성하고, 바로 견적을 문의하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-sm text-white">
                집
              </span>
              <span className="text-lg tracking-tight">마이하우스</span>
              <span className="ml-1 hidden rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500 sm:inline">
                온라인 모듈러주택 박람회
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                박람회 홈
              </Link>
              <Link
                href="/configurator"
                className="rounded-md bg-emerald-700 px-3 py-1.5 text-white hover:bg-emerald-800"
              >
                내 집 조합하기
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-stone-500">
            <p className="font-semibold text-stone-700">마이하우스</p>
            <p className="mt-1">
              온라인 3D 모듈러주택 박람회 — 여러 브랜드의 모듈러 주택을 한
              곳에서 비교하고 견적까지.
            </p>
            <p className="mt-3 text-xs text-stone-400">
              본 사이트의 가격·모델 정보는 MVP 데모용 예시 데이터입니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
