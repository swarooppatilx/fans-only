"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import {
  Bars3Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserCircleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, UserCircleIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { getIpfsUrl, useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

/**
 * Navigation links based on user state:
 * - Not connected: Explore only
 * - Connected viewer: Feed, Explore, Become Creator, Settings
 * - Connected creator: Feed, Explore, Earnings, Profile, Settings
 */
export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { isCreator, creator, isLoading } = useCurrentCreator();

  // Build links based on user state
  type NavLink = {
    label: string;
    href: string;
    icon: React.ReactNode;
    iconActive?: React.ReactNode;
  };

  const links: NavLink[] = [];

  // Explore - always visible to everyone
  links.push({
    label: "Explore",
    href: "/explore",
    icon: <MagnifyingGlassIcon className="h-5 w-5" />,
  });

  // Feed - requires connection (shows subscribed content for viewers, all for creators)
  if (isConnected) {
    links.push({
      label: "Feed",
      href: "/feed",
      icon: <HomeIcon className="h-5 w-5" />,
      iconActive: <HomeIconSolid className="h-5 w-5" />,
    });
  }

  // Earnings - creators only
  if (isConnected && isCreator) {
    links.push({
      label: "Earnings",
      href: "/earnings",
      icon: <ChartBarIcon className="h-5 w-5" />,
    });
  }

  // Profile link - different for creators vs viewers
  if (isConnected && !isLoading) {
    if (isCreator && creator?.username) {
      links.push({
        label: "Profile",
        href: `/creator/${creator.username}`,
        icon: <UserCircleIcon className="h-5 w-5" />,
        iconActive: <UserIconSolid className="h-5 w-5" />,
      });
    } else {
      // Show "Become Creator" for connected non-creators
      links.push({
        label: "Become Creator",
        href: "/profile/create",
        icon: <UserPlusIcon className="h-5 w-5" />,
      });
    }

    // Settings - requires connection
    links.push({
      label: "Settings",
      href: "/settings",
      icon: <Cog6ToothIcon className="h-5 w-5" />,
    });
  }

  return (
    <>
      {links.map(({ label, href, icon, iconActive }) => {
        const isActive =
          pathname === href ||
          (label === "Profile" && pathname.startsWith("/creator/") && href.startsWith("/creator/"));

        // Show creator avatar for Profile if available
        const showAvatar = label === "Profile" && isCreator && creator?.profileImageCID;

        return (
          <li key={href}>
            <Link href={href} className={`fo-nav-link ${isActive ? "active" : ""}`}>
              {showAvatar ? (
                <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-fo-primary">
                  <Image
                    src={getIpfsUrl(creator.profileImageCID)}
                    alt={creator.displayName || "Profile"}
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : isActive && iconActive ? (
                iconActive
              ) : (
                icon
              )}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header - adapts based on user state
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { isConnected } = useAccount();
  const { isCreator, creator } = useCurrentCreator();

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  const profileLink = isCreator && creator?.username ? `/creator/${creator.username}` : "/profile/create";

  return (
    <div className="sticky top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 border-b border-base-200 px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        {/* Mobile menu */}
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-6 w-6" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-lg bg-base-100 rounded-xl w-52 border border-base-200"
            onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
          >
            <HeaderMenuLinks />
          </ul>
        </details>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-fo-primary to-fo-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="hidden sm:block font-bold text-xl fo-gradient-text">FansOnly</span>
        </Link>
      </div>

      {/* Desktop navigation */}
      <div className="navbar-center hidden lg:flex">
        <ul className="flex items-center gap-1">
          <HeaderMenuLinks />
        </ul>
      </div>

      {/* Right side */}
      <div className="navbar-end grow mr-4 gap-2">
        {/* Create Post - creators only */}
        {isConnected && isCreator && (
          <Link href="/create" className="btn btn-sm btn-primary gap-1" title="Create Post">
            <PlusCircleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </Link>
        )}

        {/* Mobile profile avatar - creators only */}
        {isConnected && isCreator && creator && (
          <Link href={profileLink} className="lg:hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fo-primary to-fo-accent p-0.5">
              {creator.profileImageCID ? (
                <Image
                  src={getIpfsUrl(creator.profileImageCID)}
                  alt={creator.displayName}
                  width={32}
                  height={32}
                  className="w-full h-full rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-xs font-bold text-fo-primary">
                  {creator.displayName?.charAt(0) || "?"}
                </div>
              )}
            </div>
          </Link>
        )}

        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
