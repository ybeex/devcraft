"use client";

import dynamic from "next/dynamic";

export const JourneyMap = dynamic(
  () =>
    import("./JourneyMap").then((m) => m.JourneyMap),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-105 sm:min-h-120 px-6 py-16" style={{ background: "var(--canvas)" }} aria-busy="true" aria-label="Loading journey map">
        <div className="max-w-260 mx-auto animate-pulse">
          <div className="h-4 w-28 rounded-full mb-5" style={{ background: "var(--rim-sub)" }} />
          <div className="h-10 max-w-md rounded-xl mb-4" style={{ background: "var(--raised)" }} />
          <div className="h-5 max-w-xl rounded-lg mb-10" style={{ background: "var(--rim-sub)" }} />
          <div className="grid sm:grid-cols-2 gap-5">
            {[0, 1].map((key) => <div key={key} className="h-32 rounded-2xl" style={{ background: "var(--raised)" }} />)}
          </div>
        </div>
      </div>
    ),
  }
);
