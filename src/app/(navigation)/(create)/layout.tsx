"use client";

import React from "react";
import CodeLayoutClient from "./layout.client";

export default function CodeLayout({ children }: { children: React.ReactNode }) {
  return (
    <CodeLayoutClient>
      <div className="relative layout-fill bg-accent dark:bg-black">{children}</div>
    </CodeLayoutClient>
  );
}
