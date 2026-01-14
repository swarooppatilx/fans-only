"use client";

import { usePathname } from "next/navigation";

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Expand main content on messages and earnings pages to fill right sidebar space
  const isExpandedPage = pathname.startsWith("/messages") || pathname.startsWith("/earnings");

  return (
    <main
      className={`flex-1 min-h-screen w-full border-x border-slate-800 bg-slate-900 ${
        isExpandedPage ? "max-w-[950px]" : "max-w-[600px]"
      }`}
    >
      {children}
    </main>
  );
}
