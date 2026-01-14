import React from "react";
import Link from "next/link";
import { Compass, DollarSign, Home, Plus, Settings, User } from "lucide-react";

const menuItems = [
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: DollarSign, label: "Earnings", href: "/earnings" },
  { icon: Home, label: "Feed", href: "/feed" },
  { icon: Plus, label: "New Post", href: "/create" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="avatar placeholder w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
            <span className="text-xl font-bold">F</span>
          </div>
          <span className="text-xl font-bold">FansOnly</span>
        </Link>
      </div>
      {/* Navigation */}
      <nav className="menu flex-1 gap-1">
        {menuItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 hover:bg-base-200 rounded-lg text-base font-medium"
          >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      {/* New Post Button */}
      <Link
        href="/create"
        className="btn btn-primary btn-block rounded-full mt-auto flex items-center gap-2 justify-center"
      >
        <Plus className="w-5 h-5" />
        New Post
      </Link>
    </div>
  );
}
