"use client";

import dynamic from "next/dynamic";

export const ReadingMode = dynamic(
  () =>
    import("./ReadingMode").then((m) => m.ReadingMode),
  {
    ssr: false,
  }
);