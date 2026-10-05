"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const GlobeScene = dynamic(
  () => import("@/components/globe/GlobeScene").then((m) => m.GlobeScene),
  {
    ssr: false,
    loading: () => null,
  }
);

export const AuthBackgroundGlobe: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25 filter blur-[1px]">
      <Suspense fallback={null}>
        <GlobeScene />
      </Suspense>
      {/* Dark overlay gradient to ensure high form contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/70 to-space-950/40" />
    </div>
  );
};
