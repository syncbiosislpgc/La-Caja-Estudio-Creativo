"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/sanity.config";

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] font-sans text-[#F4F2EE]">
      <NextStudio config={config} />
    </div>
  );
}
