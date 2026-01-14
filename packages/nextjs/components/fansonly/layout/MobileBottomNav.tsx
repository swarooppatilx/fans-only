"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Home, Plus, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: Plus, label: "Create", href: "/create" },
  { icon: Bell, label: "Alerts", href: "/notifications" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 xl:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          const isCreate = href === "/create";

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isCreate
                  ? "bg-[#00aff0] text-white shadow-lg shadow-[#00aff0]/30 -mt-4 px-5"
                  : isActive
                    ? "text-[#00aff0]"
                    : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className={`w-6 h-6 ${isCreate ? "w-7 h-7" : ""}`} />
              {!isCreate && <span className="text-xs mt-1 font-medium">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
