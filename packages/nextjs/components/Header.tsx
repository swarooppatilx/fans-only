"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import {
  Bars3Icon,
  BellIcon,
  BugAntIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BellIcon as BellIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ChatBubbleLeftIcon as ChatIconSolid,
  HomeIcon as HomeIconSolid,
  UserCircleIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { getIpfsUrl, useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  iconActive?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/feed",
    icon: <HomeIcon className="h-6 w-6" />,
    iconActive: <HomeIconSolid className="h-6 w-6" />,
  },
  {
    label: "Explore",
    href: "/explore",
    icon: <MagnifyingGlassIcon className="h-6 w-6" />,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <BellIcon className="h-6 w-6" />,
    iconActive: <BellIconSolid className="h-6 w-6" />,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: <ChatBubbleLeftIcon className="h-6 w-6" />,
    iconActive: <ChatIconSolid className="h-6 w-6" />,
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: <CreditCardIcon className="h-6 w-6" />,
  },
  {
    label: "Earnings",
    href: "/earnings",
    icon: <ChartBarIcon className="h-6 w-6" />,
    iconActive: <ChartBarIconSolid className="h-6 w-6" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <UserCircleIcon className="h-6 w-6" />,
    iconActive: <UserIconSolid className="h-6 w-6" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Cog6ToothIcon className="h-6 w-6" />,
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-6 w-6" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { isCreator, creator } = useCurrentCreator();

  // Dynamic profile link based on creator status
  const getProfileLink = () => {
    if (isCreator && creator?.username) {
      return `/creator/${creator.username}`;
    }
    return "/profile/create";
  };

  return (
    <>
      {menuLinks.map(({ label, href, icon, iconActive }) => {
        // Handle dynamic profile link
        const actualHref = label === "Profile" ? getProfileLink() : href;
        const isActive = pathname === actualHref || (label === "Profile" && pathname.startsWith("/creator/"));

        // For Profile, show creator avatar if available
        const showCreatorAvatar = label === "Profile" && isCreator && creator?.profileImageCID;

        return (
          <li key={href}>
            <Link href={actualHref} passHref className={`fo-nav-link ${isActive ? "active" : ""}`}>
              {showCreatorAvatar ? (
                <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-[--fo-primary]">
                  <Image
                    src={getIpfsUrl(creator.profileImageCID)}
                    alt={creator.displayName || "Profile"}
                    width={24}
                    height={24}
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
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { isCreator, creator } = useCurrentCreator();

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  // Get the profile link
  const profileLink = isCreator && creator?.username ? `/creator/${creator.username}` : "/profile/create";

  return (
    <div className="sticky top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 border-b border-[--fo-border] px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-6 w-6" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-lg bg-base-100 rounded-xl w-56 border border-[--fo-border]"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[--fo-primary] to-[--fo-accent] flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-xl fo-gradient-text">FansOnly</span>
            </div>
          </div>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="flex items-center gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4 gap-2">
        {/* Create Post - only show for creators */}
        {isCreator && (
          <Link href="/create" className="btn btn-circle btn-ghost hover:bg-[--fo-primary-light]" title="Create Post">
            <PlusCircleIcon className="h-6 w-6 text-[--fo-primary]" />
          </Link>
        )}

        {/* Creator Avatar (mobile) */}
        {isCreator && creator && (
          <Link href={profileLink} className="lg:hidden" title={`@${creator.username}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-0.5">
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
                <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-xs font-bold text-[--fo-primary]">
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
