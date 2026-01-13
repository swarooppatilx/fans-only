"use client";

import { useState } from "react";
import Link from "next/link";
import { useDisconnect } from "wagmi";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  MoonIcon,
  PencilIcon,
  SunIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";

export default function SettingsPage() {
  const { isCreator, creator } = useCurrentCreator();
  const { disconnect } = useDisconnect();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Notification preferences (local state - would be stored off-chain in production)
  const [notifications, setNotifications] = useState({
    newSubscribers: true,
    likes: false,
    comments: true,
  });

  const profileLink = isCreator && creator?.username ? `/creator/${creator.username}` : "/profile/create";

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Account Section */}
        <div className="fo-card p-4 mb-4">
          <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-3">Account</h2>

          <Link href={profileLink} className="flex items-center justify-between p-3 hover:bg-base-200 rounded-lg -mx-1">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="w-5 h-5 text-base-content/60" />
              <div>
                <div className="font-medium">{isCreator ? `@${creator?.username}` : "Create Profile"}</div>
                <div className="text-sm text-base-content/60">
                  {isCreator ? "View and edit your profile" : "Become a creator"}
                </div>
              </div>
            </div>
            <PencilIcon className="w-4 h-4 text-base-content/40" />
          </Link>
        </div>

        {/* Appearance */}
        <div className="fo-card p-4 mb-4">
          <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-3">Appearance</h2>

          <div className="space-y-2">
            {(["light", "dark", "system"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  theme === t ? "bg-fo-primary/10 border border-fo-primary" : "hover:bg-base-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {t === "light" && <SunIcon className="w-5 h-5" />}
                  {t === "dark" && <MoonIcon className="w-5 h-5" />}
                  {t === "system" && (
                    <div className="w-5 h-5 flex">
                      <SunIcon className="w-3 h-3" />
                      <MoonIcon className="w-3 h-3" />
                    </div>
                  )}
                  <span className="capitalize">{t}</span>
                </div>
                {theme === t && <div className="w-2 h-2 rounded-full bg-fo-primary"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="fo-card p-4 mb-4">
          <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-3">
            <BellIcon className="w-4 h-4 inline mr-1" />
            Notifications
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>New subscribers</span>
              <input
                type="checkbox"
                checked={notifications.newSubscribers}
                onChange={e => setNotifications({ ...notifications, newSubscribers: e.target.checked })}
                className="toggle toggle-primary toggle-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Likes on posts</span>
              <input
                type="checkbox"
                checked={notifications.likes}
                onChange={e => setNotifications({ ...notifications, likes: e.target.checked })}
                className="toggle toggle-primary toggle-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Comments</span>
              <input
                type="checkbox"
                checked={notifications.comments}
                onChange={e => setNotifications({ ...notifications, comments: e.target.checked })}
                className="toggle toggle-primary toggle-sm"
              />
            </div>
          </div>

          <p className="text-xs text-base-content/50 mt-3">Notification preferences are stored locally.</p>
        </div>

        {/* Danger Zone */}
        <div className="fo-card p-4 border-red-500/30">
          <button
            onClick={() => disconnect()}
            className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Disconnect Wallet
          </button>
        </div>

        <p className="text-center text-xs text-base-content/40 mt-6">FansOnly v1.0 • Built on Mantle</p>
      </div>
    </div>
  );
}
