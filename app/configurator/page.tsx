import type { Metadata } from "next";
import ConfiguratorApp from "@/components/configurator/ConfiguratorApp";

export const metadata: Metadata = {
  title: "모듈러 컨피규레이터 — 마이하우스",
};

export default function ConfiguratorPage() {
  return <ConfiguratorApp />;
}
