"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { InquiryPayload } from "@/lib/types";
import { formatKrw } from "@/lib/format";

const STORAGE_KEY = "myhouse-inquiries";

export default function InquiryForm({
  initialPayload,
  fromConfig,
}: {
  initialPayload: InquiryPayload | null;
  fromConfig: boolean;
}) {
  const [payload, setPayload] = useState<InquiryPayload | null>(initialPayload);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    region: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // 컨피규레이터에서 넘어온 경우 sessionStorage에서 구성 정보를 복원
  useEffect(() => {
    if (!fromConfig) return;
    try {
      const raw = sessionStorage.getItem("myhouse-config");
      if (raw) setPayload(JSON.parse(raw) as InquiryPayload);
    } catch {
      // 구성 정보가 없어도 일반 문의로 진행 가능
    }
  }, [fromConfig]);

  function update(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setForm({ ...form, [field]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const record = {
      ...form,
      config: payload,
      createdAt: new Date().toISOString(),
    };
    // MVP: 백엔드 대신 콘솔 출력 + 로컬 저장
    console.log("[마이하우스] 견적 문의 접수:", record);
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      list.push(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // 저장 실패해도 접수 화면은 보여준다
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="text-3xl">✓</p>
        <h2 className="mt-2 text-xl font-bold text-emerald-900">
          견적 문의가 접수되었습니다
        </h2>
        <p className="mt-2 text-sm text-emerald-800">
          {form.name}님, 입력하신 연락처로 2영업일 이내에 상담을 도와드리겠습니다.
        </p>
        <div className="mt-6 flex justify-center gap-3 text-sm font-semibold">
          <Link
            href="/"
            className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-emerald-800 hover:bg-emerald-100"
          >
            박람회 홈으로
          </Link>
          <Link
            href="/configurator"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
          >
            다른 구성 만들어 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 문의 대상 구성 요약 */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-bold text-stone-700">문의 대상</h2>
        {payload ? (
          <div className="mt-2">
            <p className="font-semibold text-stone-900">{payload.title}</p>
            <p className="mt-0.5 text-sm text-stone-500">{payload.detail}</p>
            <p className="mt-2 text-sm">
              <span className="text-stone-500">총 면적 </span>
              <span className="font-semibold text-stone-900">
                {payload.totalArea}평
              </span>
              <span className="mx-2 text-stone-300">|</span>
              <span className="text-stone-500">예상 가격 </span>
              <span className="font-semibold text-emerald-700">
                {formatKrw(payload.totalPrice)}
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-400">
            특정 모델/구성 없이 일반 상담으로 접수됩니다.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="이름" required>
          <input
            required
            value={form.name}
            onChange={update("name")}
            placeholder="홍길동"
            className={inputCls}
          />
        </Field>
        <Field label="연락처" required>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="010-0000-0000"
            className={inputCls}
          />
        </Field>
        <Field label="이메일">
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="me@example.com"
            className={inputCls}
          />
        </Field>
        <Field label="건축 예정 지역">
          <input
            value={form.region}
            onChange={update("region")}
            placeholder="예: 경기 양평군"
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="문의 내용">
        <textarea
          rows={4}
          value={form.message}
          onChange={update("message")}
          placeholder="부지 상황, 희망 입주 시기, 예산 등을 알려주시면 상담이 빨라집니다."
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800"
      >
        견적 문의 제출
      </button>
      <p className="text-center text-xs text-stone-400">
        MVP 데모: 제출 내용은 서버로 전송되지 않고 브라우저(콘솔/로컬)에만
        저장됩니다.
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
