"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

type SettingsTab = "profile" | "notifications" | "privacy" | "payments" | "appearance";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    displayName: "CryptoCreator",
    username: "cryptocreator",
    bio: "Web3 enthusiast sharing insights on DeFi, NFTs, and the future of decentralized technology. Diamond hands only! 💎🙌",
    email: "creator@example.com",
    website: "https://mysite.com",
    twitter: "@cryptocreator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creator",
    banner: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "new_subscriber",
      label: "New Subscribers",
      description: "When someone subscribes to your content",
      enabled: true,
    },
    {
      id: "subscription_renewal",
      label: "Subscription Renewals",
      description: "When a subscriber renews",
      enabled: true,
    },
    { id: "tips", label: "Tips Received", description: "When you receive a tip", enabled: true },
    { id: "messages", label: "New Messages", description: "When you receive a direct message", enabled: true },
    { id: "likes", label: "Likes", description: "When someone likes your post", enabled: false },
    { id: "comments", label: "Comments", description: "When someone comments on your post", enabled: true },
    { id: "mentions", label: "Mentions", description: "When someone mentions you", enabled: true },
    { id: "marketing", label: "Marketing & Updates", description: "Platform news and feature updates", enabled: false },
  ]);

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    showSubscriberCount: true,
    showEarnings: false,
    allowMessages: "subscribers" as "everyone" | "subscribers" | "none",
    showOnlineStatus: true,
    hideFromSearch: false,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "system" as "light" | "dark" | "system",
    compactMode: false,
    showPreviews: true,
  });

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: UserCircleIcon },
    { id: "notifications" as const, label: "Notifications", icon: BellIcon },
    { id: "privacy" as const, label: "Privacy", icon: ShieldCheckIcon },
    { id: "payments" as const, label: "Payments", icon: CreditCardIcon },
    { id: "appearance" as const, label: "Appearance", icon: PaintBrushIcon },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, enabled: !n.enabled } : n)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-300">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="fo-card p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id ? "bg-fo-primary text-white" : "hover:bg-base-200 text-base-content"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}

              <hr className="my-2 border-base-300" />

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left text-red-500 hover:bg-red-500/10">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="fo-card p-6 space-y-6">
                <h2 className="text-xl font-bold">Profile Settings</h2>

                {/* Avatar & Banner */}
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Image
                        src={profile.avatar}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="rounded-full bg-base-300"
                      />
                      <button className="absolute bottom-0 right-0 p-1.5 bg-fo-primary text-white rounded-full hover:bg-fo-primary-dark transition-colors">
                        <CameraIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold">Profile Photo</h3>
                      <p className="text-sm text-base-content/60">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                      className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <div className="flex">
                      <span className="px-4 py-2 bg-base-300 rounded-l-lg text-base-content/60">@</span>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={e => setProfile({ ...profile, username: e.target.value })}
                        className="flex-1 px-4 py-2 bg-base-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={e => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary resize-none"
                    />
                    <p className="text-xs text-base-content/50 mt-1">{profile.bio.length}/500 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={e => setProfile({ ...profile, website: e.target.value })}
                      className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Twitter</label>
                    <input
                      type="text"
                      value={profile.twitter}
                      onChange={e => setProfile({ ...profile, twitter: e.target.value })}
                      className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="fo-card p-6 space-y-6">
                <h2 className="text-xl font-bold">Notification Preferences</h2>
                <p className="text-base-content/60">Choose what notifications you want to receive.</p>

                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{notification.label}</h3>
                        <p className="text-sm text-base-content/60">{notification.description}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(notification.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notification.enabled ? "bg-fo-primary" : "bg-base-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            notification.enabled ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="fo-card p-6 space-y-6">
                <h2 className="text-xl font-bold">Privacy Settings</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Show Subscriber Count</h3>
                      <p className="text-sm text-base-content/60">Display your subscriber count publicly</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showSubscriberCount: !privacy.showSubscriberCount })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy.showSubscriberCount ? "bg-fo-primary" : "bg-base-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          privacy.showSubscriberCount ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Show Online Status</h3>
                      <p className="text-sm text-base-content/60">Let others see when you&apos;re online</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showOnlineStatus: !privacy.showOnlineStatus })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy.showOnlineStatus ? "bg-fo-primary" : "bg-base-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          privacy.showOnlineStatus ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Hide from Search</h3>
                      <p className="text-sm text-base-content/60">Don&apos;t appear in explore or search results</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, hideFromSearch: !privacy.hideFromSearch })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy.hideFromSearch ? "bg-fo-primary" : "bg-base-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          privacy.hideFromSearch ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 bg-base-200/50 rounded-lg">
                    <h3 className="font-medium mb-2">Who can message you</h3>
                    <select
                      value={privacy.allowMessages}
                      onChange={e =>
                        setPrivacy({ ...privacy, allowMessages: e.target.value as typeof privacy.allowMessages })
                      }
                      className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="subscribers">Subscribers Only</option>
                      <option value="none">No One</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="fo-card p-6 space-y-6">
                <h2 className="text-xl font-bold">Payment Settings</h2>

                {/* Connected Wallet */}
                <div className="p-4 bg-base-200/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Connected Wallet</h3>
                      <p className="text-sm text-base-content/60 font-mono">0x1234...5678</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 text-sm font-medium rounded-full">
                      Connected
                    </span>
                  </div>
                </div>

                {/* Payout Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">Payout Address</label>
                  <p className="text-xs text-base-content/50 mb-2">Where your earnings will be sent</p>
                  <input
                    type="text"
                    placeholder="0x..."
                    defaultValue="0x1234567890abcdef1234567890abcdef12345678"
                    className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary font-mono text-sm"
                  />
                </div>

                {/* Earnings Summary */}
                <div className="p-4 bg-gradient-to-r from-fo-primary/10 to-fo-accent/10 rounded-lg">
                  <h3 className="font-semibold mb-3">Earnings Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-base-content/60">Available</p>
                      <p className="text-xl font-bold text-green-600">2.45 MNT</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">Pending</p>
                      <p className="text-xl font-bold">0.82 MNT</p>
                    </div>
                  </div>
                  <Link href="/earnings" className="fo-btn-primary w-full mt-4 text-center block">
                    View Earnings Dashboard
                  </Link>
                </div>

                {/* Transaction History Link */}
                <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
                  <div>
                    <h3 className="font-medium">Transaction History</h3>
                    <p className="text-sm text-base-content/60">View all your transactions</p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-base-content/50" />
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="fo-card p-6 space-y-6">
                <h2 className="text-xl font-bold">Appearance</h2>

                {/* Theme */}
                <div>
                  <h3 className="font-medium mb-3">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(["light", "dark", "system"] as const).map(theme => (
                      <button
                        key={theme}
                        onClick={() => setAppearance({ ...appearance, theme })}
                        className={`p-4 rounded-lg border-2 transition-colors capitalize ${
                          appearance.theme === theme
                            ? "border-fo-primary bg-fo-primary/10"
                            : "border-base-300 hover:border-fo-primary/50"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Compact Mode</h3>
                      <p className="text-sm text-base-content/60">Reduce spacing for more content</p>
                    </div>
                    <button
                      onClick={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        appearance.compactMode ? "bg-fo-primary" : "bg-base-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          appearance.compactMode ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Show Link Previews</h3>
                      <p className="text-sm text-base-content/60">Display previews for shared links</p>
                    </div>
                    <button
                      onClick={() => setAppearance({ ...appearance, showPreviews: !appearance.showPreviews })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        appearance.showPreviews ? "bg-fo-primary" : "bg-base-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          appearance.showPreviews ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex items-center justify-between">
              <div>
                {showSaved && (
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckIcon className="h-5 w-5" />
                    Settings saved!
                  </span>
                )}
              </div>
              <button onClick={handleSave} disabled={isSaving} className="fo-btn-primary flex items-center gap-2">
                {isSaving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 p-6 border-2 border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-500">Danger Zone</h3>
                  <p className="text-sm text-base-content/60 mt-1">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
