"use client";

import dynamic from "next/dynamic";

export const ProjectDemo = dynamic(
  () =>
    import("./ProjectDemo").then((m) => m.ProjectDemo),
  {
    ssr: false,
  }
);