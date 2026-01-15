"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, DollarSign, Feather, Home, Mail, Search, User, UserPlus } from "lucide-react";
import { CreateProfileModal } from "~~/components/fansonly/CreateProfileModal";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";

const navItems = [
  { id: "home", icon: Home, label: "Home", href: "/feed" },
  { id: "explore", icon: Search, label: "Explore", href: "/explore" },
  { id: "notifications", icon: Bell, label: "Notifications", href: "/notifications" },
  { id: "messages", icon: Mail, label: "Messages", href: "/messages" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCreator, creator } = useCurrentCreator();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Dynamic profile link for creators
  const profileHref = isCreator && creator?.username ? `/creator/${creator.username}` : "/profile";

  return (
    <>
      <div className="h-screen flex flex-col justify-between py-6 px-4 xl:px-6 border-r border-slate-800 bg-slate-900 w-full z-30">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Link href="/" className="px-2 flex items-center">
            <Image src="/textlogo_white.svg" alt="FansOnly" height={40} width={150} className="h-10 w-auto" priority />
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-4 p-3 rounded-full transition-all duration-200 
                    ${
                      isActive
                        ? "bg-slate-800 text-[#00aff0] font-bold"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                    }`}
                >
                  <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="hidden xl:block text-lg">{item.label}</span>
                </Link>
              );
            })}

            {/* Profile Link - Only show for creators */}
            {isCreator && (
              <Link
                href={profileHref}
                className={`flex items-center gap-4 p-3 rounded-full transition-all duration-200 
                  ${
                    pathname.startsWith("/creator/") || pathname === "/profile"
                      ? "bg-slate-800 text-[#00aff0] font-bold"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                  }`}
              >
                <User size={26} strokeWidth={pathname.startsWith("/creator/") ? 2.5 : 2} />
                <span className="hidden xl:block text-lg">Profile</span>
              </Link>
            )}

            {/* Creator Earnings Link - Only show if user is a creator */}
            {isCreator && (
              <Link
                href="/earnings"
                className={`flex items-center gap-4 p-3 rounded-full transition-all duration-200 
                  ${
                    pathname === "/earnings"
                      ? "bg-slate-800 text-[#00aff0] font-bold"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                  }`}
              >
                <DollarSign size={26} strokeWidth={pathname === "/earnings" ? 2.5 : 2} />
                <span className="hidden xl:block text-lg">Earnings</span>
              </Link>
            )}

            {/* Become Creator - Only show for non-creators */}
            {!isCreator && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-4 p-3 rounded-full transition-all duration-200 text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
              >
                <UserPlus size={26} strokeWidth={2} />
                <span className="hidden xl:block text-lg">Become Creator</span>
              </button>
            )}
          </nav>

          {/* Post Button - Only show for creators */}
          {isCreator && (
            <div className="mt-4">
              <Link
                href="/create"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#00aff0] hover:bg-[#009bd6] text-white font-bold rounded-full transition-all duration-200"
              >
                <span className="hidden xl:inline">New Post</span>
                <Feather size={20} className="xl:hidden" />
              </Link>
            </div>
          )}
        </div>

        {/* User / Wallet */}
        <div>
          <RainbowKitCustomConnectButton />
        </div>
      </div>

      {/* Create Profile Modal */}
      <CreateProfileModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  );
}
