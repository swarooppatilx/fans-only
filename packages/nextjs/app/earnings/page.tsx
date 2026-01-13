"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useCreatorPosts } from "~~/hooks/fansonly/useContentPost";
import { useCreator, useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";

// Mock data for demo mode
const mockEarningsData = {
  totalEarnings: BigInt("2500000000000000000"),
  totalSubscribers: BigInt(156),
  postCount: 47,
  totalLikes: 1243,
};

const mockTierBreakdown = [
  { name: "Fan", subscribers: 89, revenue: BigInt("890000000000000000"), percentage: 57 },
  { name: "Supporter", subscribers: 52, revenue: BigInt("2600000000000000000"), percentage: 33 },
  { name: "VIP", subscribers: 15, revenue: BigInt("2250000000000000000"), percentage: 10 },
];

const mockRecentTransactions = [
  {
    id: 1,
    type: "subscription",
    from: "0x1234...5678",
    amount: BigInt("50000000000000000"),
    tier: "Supporter",
    timestamp: Date.now() - 3600000,
  },
  {
    id: 2,
    type: "subscription",
    from: "0x2345...6789",
    amount: BigInt("150000000000000000"),
    tier: "VIP",
    timestamp: Date.now() - 7200000,
  },
  {
    id: 3,
    type: "renewal",
    from: "0x3456...7890",
    amount: BigInt("50000000000000000"),
    tier: "Supporter",
    timestamp: Date.now() - 14400000,
  },
];

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  iconBg?: string;
  isDemo?: boolean;
}

const StatCard = ({ title, value, subtitle, icon, trend, iconBg = "bg-[--fo-primary]/10", isDemo }: StatCardProps) => (
  <div className="fo-card p-4 relative">
    {isDemo && (
      <div className="absolute top-2 right-2 bg-warning/20 text-warning text-xs px-2 py-0.5 rounded-full">Demo</div>
    )}
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-[--fo-text-muted] mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-sm text-[--fo-text-secondary] mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? "text-[--fo-success]" : "text-[--fo-error]"}`}
          >
            <ArrowTrendingUpIcon className={`w-4 h-4 ${trend < 0 ? "rotate-180" : ""}`} />
            <span>
              {trend >= 0 ? "+" : ""}
              {trend}% this month
            </span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>{icon}</div>
    </div>
  </div>
);

// Loading skeleton
const StatSkeleton = () => (
  <div className="fo-card p-4 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-base-300 rounded"></div>
        <div className="h-8 w-32 bg-base-300 rounded"></div>
        <div className="h-3 w-20 bg-base-300 rounded"></div>
      </div>
      <div className="w-12 h-12 bg-base-300 rounded-full"></div>
    </div>
  </div>
);

const EarningsPage: NextPage = () => {
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useAccount();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year" | "all">("month");

  // Get creator profile with real data
  const { isCreator, creator, isLoading: isLoadingCreator } = useCurrentCreator();

  // Get creator tiers
  const { tiers } = useCreator(connectedAddress);

  // Get post stats
  const { postCount, posts, isLoading: isLoadingPosts } = useCreatorPosts(connectedAddress, 0, 100);

  // Calculate total likes from posts
  const totalLikes = useMemo(() => {
    return posts.reduce((sum, post) => sum + Number(post.likesCount), 0);
  }, [posts]);

  // Determine if we're in demo mode
  const hasRealData = creator && Number(creator.totalEarnings) > 0;
  const isDemo = !hasRealData;

  // Use real data or mock data
  const displayData = {
    totalEarnings: hasRealData ? creator.totalEarnings : mockEarningsData.totalEarnings,
    totalSubscribers: hasRealData ? creator.totalSubscribers : mockEarningsData.totalSubscribers,
    postCount: hasRealData ? postCount : mockEarningsData.postCount,
    totalLikes: hasRealData ? totalLikes : mockEarningsData.totalLikes,
  };

  // Calculate tier breakdown from real tiers
  const tierBreakdown = useMemo(() => {
    if (!hasRealData || !tiers || tiers.length === 0) {
      return mockTierBreakdown;
    }

    // For now, we can't get per-tier subscriber counts from the contract
    // so we'll show tiers with their prices
    return tiers
      .filter(tier => tier.isActive)
      .map((tier, idx) => ({
        name: tier.name,
        subscribers: 0, // Would need contract events to track this
        revenue: BigInt(0), // Would need contract events to track this
        percentage: Math.floor(100 / tiers.length) * (idx + 1),
        price: tier.price,
      }));
  }, [hasRealData, tiers]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const isLoading = isLoadingCreator || isLoadingPosts;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <BanknotesIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-[--fo-text-secondary]">Please connect your wallet to view your earnings</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-64 bg-base-300 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-base-300 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
          <h2 className="text-2xl font-bold mb-2">Creator Dashboard</h2>
          <p className="text-[--fo-text-secondary] mb-6">
            Become a creator to access your earnings dashboard and analytics
          </p>
          <Link href="/profile/create" className="fo-btn-primary inline-block">
            Become a Creator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Earnings Dashboard</h1>
            <p className="text-[--fo-text-secondary]">
              Track your revenue and subscriber analytics
              {creator && <span className="ml-2 text-[--fo-primary]">@{creator.username}</span>}
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 bg-base-200 p-1 rounded-lg">
            {(["week", "month", "year", "all"] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  timeRange === range ? "bg-base-100 text-base-content shadow-sm" : "text-[--fo-text-muted]"
                }`}
              >
                {range === "all" ? "All Time" : range}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="bg-info/10 border border-info/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-info">
              <strong>Demo Mode:</strong> Showing sample data. Real earnings will appear here once you receive
              subscriptions.
            </p>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Earnings"
            value={`${formatEther(displayData.totalEarnings)} MNT`}
            subtitle="All time (95% after platform fee)"
            icon={<BanknotesIcon className="w-6 h-6 text-[--fo-primary]" />}
            isDemo={isDemo}
          />
          <StatCard
            title="Total Subscribers"
            value={Number(displayData.totalSubscribers).toString()}
            icon={<UserGroupIcon className="w-6 h-6 text-[--fo-accent]" />}
            iconBg="bg-[--fo-accent]/10"
            isDemo={isDemo}
          />
          <StatCard
            title="Total Posts"
            value={displayData.postCount.toString()}
            icon={<CalendarDaysIcon className="w-6 h-6 text-[--fo-success]" />}
            iconBg="bg-[--fo-success]/10"
            isDemo={isDemo}
          />
          <StatCard
            title="Total Likes"
            value={displayData.totalLikes.toLocaleString()}
            icon={<HeartIcon className="w-6 h-6 text-red-500" />}
            iconBg="bg-red-500/10"
            isDemo={isDemo}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="fo-card p-4 text-center">
            <UserPlusIcon className="w-6 h-6 mx-auto mb-2 text-[--fo-primary]" />
            <div className="text-xl font-bold">{hasRealData ? Number(creator.totalSubscribers) : 23}</div>
            <div className="text-sm text-[--fo-text-muted]">Subscribers</div>
          </div>
          <div className="fo-card p-4 text-center">
            <CalendarDaysIcon className="w-6 h-6 mx-auto mb-2 text-[--fo-accent]" />
            <div className="text-xl font-bold">{displayData.postCount}</div>
            <div className="text-sm text-[--fo-text-muted]">Total Posts</div>
          </div>
          <div className="fo-card p-4 text-center">
            <HeartIcon className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-xl font-bold">{displayData.totalLikes.toLocaleString()}</div>
            <div className="text-sm text-[--fo-text-muted]">Total Likes</div>
          </div>
          <div className="fo-card p-4 text-center">
            <CurrencyDollarIcon className="w-6 h-6 mx-auto mb-2 text-[--fo-success]" />
            <div className="text-xl font-bold">5%</div>
            <div className="text-sm text-[--fo-text-muted]">Platform Fee</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tier Breakdown */}
          <div className="fo-card p-6">
            <h2 className="text-lg font-bold mb-4">Your Subscription Tiers</h2>
            {tierBreakdown.length > 0 ? (
              <div className="space-y-4">
                {tierBreakdown.map((tier, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{tier.name}</span>
                        {"price" in tier && (
                          <span className="text-sm text-[--fo-text-muted]">
                            {formatEther(tier.price as bigint)} MNT/month
                          </span>
                        )}
                      </div>
                      {!("price" in tier) && <span className="font-semibold">{formatEther(tier.revenue)} MNT</span>}
                    </div>
                    <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[--fo-primary] to-[--fo-accent] transition-all"
                        style={{ width: `${tier.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[--fo-text-muted]">
                <p>No tiers created yet</p>
                <Link href="/profile/create" className="text-[--fo-primary] text-sm hover:underline mt-2 inline-block">
                  Create subscription tiers
                </Link>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="fo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Activity</h2>
              {isDemo && <span className="text-xs text-warning bg-warning/20 px-2 py-0.5 rounded-full">Demo</span>}
            </div>
            <div className="space-y-3">
              {mockRecentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === "subscription"
                          ? "bg-[--fo-success]/10 text-[--fo-success]"
                          : "bg-[--fo-primary]/10 text-[--fo-primary]"
                      }`}
                    >
                      {tx.type === "subscription" ? (
                        <UserPlusIcon className="w-4 h-4" />
                      ) : (
                        <CalendarDaysIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {tx.type === "subscription" ? "New Subscription" : "Renewal"}
                      </div>
                      <div className="text-xs text-[--fo-text-muted]">
                        {tx.from} · {tx.tier}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[--fo-success]">+{formatEther(tx.amount)} MNT</div>
                    <div className="text-xs text-[--fo-text-muted]">{formatTimeAgo(tx.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-[--fo-text-muted] mt-4">
              Transaction history from blockchain events coming soon
            </p>
          </div>
        </div>

        {/* Creator Info */}
        <div className="mt-8 fo-card p-6 bg-gradient-to-r from-[--fo-primary]/5 to-[--fo-accent]/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold mb-1">Your Earnings</h2>
              <p className="text-[--fo-text-secondary]">
                Total earned:{" "}
                <span className="font-semibold text-[--fo-primary]">{formatEther(displayData.totalEarnings)} MNT</span>
                <span className="text-sm ml-2">(Sent directly to your wallet on each subscription)</span>
              </p>
            </div>
            <button onClick={() => router.push(`/creator/${creator?.username}`)} className="fo-btn-primary">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;
