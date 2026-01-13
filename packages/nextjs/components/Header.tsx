"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import {
  Bars3Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, UserCircleIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { getIpfsUrl, useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

/**
 * Simplified navigation - MVP only
 */
export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { isCreator, creator } = useCurrentCreator();

  // Dynamic profile link
  const profileLink = isCreator && creator?.username ? `/creator/${creator.username}` : "/profile/create";

  const links = [
    {
      label: "Feed",
      href: "/feed",
      icon: <HomeIcon className="h-5 w-5" />,
      iconActive: <HomeIconSolid className="h-5 w-5" />,
    },
    {
      label: "Explore",
      href: "/explore",
      icon: <MagnifyingGlassIcon className="h-5 w-5" />,
    },
  ];

  // Creator-only links
  if (isCreator) {
    links.push({
      label: "Earnings",
      href: "/earnings",
      icon: <ChartBarIcon className="h-5 w-5" />,
    });
  }

  // Profile link (always show)
  links.push({
    label: "Profile",
    href: profileLink,
    icon: <UserCircleIcon className="h-5 w-5" />,
    iconActive: <UserIconSolid className="h-5 w-5" />,
  });

  // Settings
  links.push({
    label: "Settings",
    href: "/settings",
    icon: <Cog6ToothIcon className="h-5 w-5" />,
  });

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
 * Site header - simplified for MVP
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
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
        {isCreator && (
          <Link href="/create" className="btn btn-sm btn-primary gap-1" title="Create Post">
            <PlusCircleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </Link>
        )}

        {/* Mobile profile avatar */}
        {isCreator && creator && (
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
