"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import {
  Bars3Icon,
  BellIcon,
  BugAntIcon,
  ChatBubbleLeftIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BellIcon as BellIconSolid,
  ChatBubbleLeftIcon as ChatIconSolid,
  HomeIcon as HomeIconSolid,
  UserCircleIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
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
    href: "/",
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
    label: "Profile",
    href: "/profile",
    icon: <UserCircleIcon className="h-6 w-6" />,
    iconActive: <UserIconSolid className="h-6 w-6" />,
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-6 w-6" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon, iconActive }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link href={href} passHref className={`fo-nav-link ${isActive ? "active" : ""}`}>
              {isActive && iconActive ? iconActive : icon}
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

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

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
        <Link href="/create" className="btn btn-circle btn-ghost hover:bg-[--fo-primary-light]" title="Create Post">
          <PlusCircleIcon className="h-6 w-6 text-[--fo-primary]" />
        </Link>
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
