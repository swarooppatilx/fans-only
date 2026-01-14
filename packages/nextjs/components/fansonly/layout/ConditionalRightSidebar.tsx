"use client";

import { usePathname } from "next/navigation";
import RightSidebar from "~~/components/fansonly/layout/RightSidebar";

export default function ConditionalRightSidebar() {
  const pathname = usePathname();

  // Hide right sidebar on messages and earnings pages
  if (pathname.startsWith("/messages") || pathname.startsWith("/earnings")) {
    return null;
  }

  return (
    <aside className="hidden lg:block w-[350px] shrink-0">
      <div className="fixed top-0 w-[350px] h-screen bg-slate-900 z-20">
        <RightSidebar />
      </div>
    </aside>
  );
}
