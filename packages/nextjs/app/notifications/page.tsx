"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BellIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  CurrencyDollarIcon,
  HeartIcon,
  SparklesIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

type NotificationType = "subscription" | "tip" | "like" | "comment" | "mention" | "milestone";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  link?: string;
  amount?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "subscription",
    title: "New Subscriber!",
    message: "CryptoWhale subscribed to your Diamond tier",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    read: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=whale",
    link: "/creator/cryptowhale",
    amount: "0.05 MNT",
  },
  {
    id: "2",
    type: "tip",
    title: "You received a tip!",
    message: "NFTCollector sent you a tip on your latest post",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=collector",
    link: "/feed",
    amount: "0.1 MNT",
  },
  {
    id: "3",
    type: "like",
    title: "Post liked",
    message: 'DeFiDegen liked your post "Market Analysis Update"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=degen",
    link: "/feed",
  },
  {
    id: "4",
    type: "comment",
    title: "New comment",
    message: 'Web3Builder commented: "Great insights! 🔥"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=builder",
    link: "/feed",
  },
  {
    id: "5",
    type: "milestone",
    title: "Milestone reached! 🎉",
    message: "Congratulations! You've reached 100 subscribers",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: "6",
    type: "subscription",
    title: "Subscription renewed",
    message: "TokenMaster renewed their Gold tier subscription",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=master",
    amount: "0.03 MNT",
  },
  {
    id: "7",
    type: "mention",
    title: "You were mentioned",
    message: "AlphaTrader mentioned you in a comment",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alpha",
    link: "/feed",
  },
  {
    id: "8",
    type: "tip",
    title: "You received a tip!",
    message: "Anonymous sent you a generous tip",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    read: true,
    amount: "0.5 MNT",
  },
];

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const iconClass = "h-5 w-5";

  switch (type) {
    case "subscription":
      return <UserPlusIcon className={`${iconClass} text-fo-primary`} />;
    case "tip":
      return <CurrencyDollarIcon className={`${iconClass} text-green-500`} />;
    case "like":
      return <HeartIcon className={`${iconClass} text-red-500`} />;
    case "comment":
      return <ChatBubbleLeftIcon className={`${iconClass} text-blue-500`} />;
    case "mention":
      return <SparklesIcon className={`${iconClass} text-purple-500`} />;
    case "milestone":
      return <SparklesIcon className={`${iconClass} text-yellow-500`} />;
    default:
      return <BellIcon className={`${iconClass} text-gray-500`} />;
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

type FilterType = "all" | "unread" | "subscriptions" | "tips" | "interactions";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "subscriptions":
        return notification.type === "subscription";
      case "tips":
        return notification.type === "tip";
      case "interactions":
        return ["like", "comment", "mention"].includes(notification.type);
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filterButtons: { label: string; value: FilterType; count?: number }[] = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread", count: unreadCount },
    { label: "Subscriptions", value: "subscriptions" },
    { label: "Tips", value: "tips" },
    { label: "Interactions", value: "interactions" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-300">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-fo-primary text-white text-sm font-bold rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="fo-btn-secondary text-sm flex items-center gap-2">
              <CheckIcon className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === btn.value ? "bg-fo-primary text-white" : "bg-base-100 text-base-content/70 hover:bg-base-200"
              }`}
            >
              {btn.label}
              {btn.count !== undefined && btn.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{btn.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="fo-card p-12 text-center">
              <BellIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-base-content/60">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`fo-card p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-fo-primary bg-fo-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar or Icon */}
                  <div className="relative flex-shrink-0">
                    {notification.avatar ? (
                      <div className="relative">
                        <Image
                          src={notification.avatar}
                          alt=""
                          width={48}
                          height={48}
                          className="rounded-full bg-base-200"
                          unoptimized
                        />
                        <div className="absolute -bottom-1 -right-1 p-1 bg-base-100 rounded-full">
                          <NotificationIcon type={notification.type} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fo-primary/20 to-fo-accent/20 flex items-center justify-center">
                        <NotificationIcon type={notification.type} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`font-semibold ${!notification.read ? "text-fo-primary" : ""}`}>
                          {notification.title}
                        </h4>
                        <p className="text-base-content/70 text-sm mt-0.5">{notification.message}</p>
                      </div>

                      {/* Amount badge */}
                      {notification.amount && (
                        <span className="px-2 py-1 bg-green-500/10 text-green-600 text-sm font-medium rounded-lg whitespace-nowrap">
                          +{notification.amount}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-base-content/50">{formatTimeAgo(notification.timestamp)}</span>

                      <div className="flex items-center gap-2">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={e => e.stopPropagation()}
                            className="text-xs text-fo-primary hover:underline"
                          >
                            View
                          </Link>
                        )}
                        {notification.read && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="fo-btn-secondary">Load older notifications</button>
          </div>
        )}

        {/* Settings Link */}
        <div className="mt-8 p-4 fo-card bg-base-100/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Notification Preferences</h4>
              <p className="text-sm text-base-content/60">Manage what notifications you receive</p>
            </div>
            <Link href="/settings/notifications" className="fo-btn-outline text-sm">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
