"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// Mock earnings data - will be replaced with contract reads/events
const mockEarningsData = {
  totalEarnings: BigInt("2500000000000000000"), // 2.5 ETH
  monthlyEarnings: BigInt("850000000000000000"), // 0.85 ETH
  pendingWithdrawal: BigInt("350000000000000000"), // 0.35 ETH
  totalSubscribers: 156,
  newSubscribersThisMonth: 23,
  totalPosts: 47,
  totalLikes: 1243,
  totalViews: 8542,
  subscriberGrowth: 17.3, // percentage
  earningsGrowth: 24.5, // percentage
};

const mockRecentTransactions = [
  {
    id: 1,
    type: "subscription",
    from: "0x1234...5678",
    amount: BigInt("50000000000000000"),
    tier: "Supporter",
    timestamp: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: 2,
    type: "subscription",
    from: "0x2345...6789",
    amount: BigInt("150000000000000000"),
    tier: "VIP",
    timestamp: Date.now() - 7200000, // 2 hours ago
  },
  {
    id: 3,
    type: "renewal",
    from: "0x3456...7890",
    amount: BigInt("50000000000000000"),
    tier: "Supporter",
    timestamp: Date.now() - 14400000, // 4 hours ago
  },
  {
    id: 4,
    type: "subscription",
    from: "0x4567...8901",
    amount: BigInt("10000000000000000"),
    tier: "Fan",
    timestamp: Date.now() - 28800000, // 8 hours ago
  },
  {
    id: 5,
    type: "subscription",
    from: "0x5678...9012",
    amount: BigInt("50000000000000000"),
    tier: "Supporter",
    timestamp: Date.now() - 86400000, // 1 day ago
  },
];

const mockTierBreakdown = [
  { name: "Fan", subscribers: 89, revenue: BigInt("890000000000000000"), percentage: 57 },
  { name: "Supporter", subscribers: 52, revenue: BigInt("2600000000000000000"), percentage: 33 },
  { name: "VIP", subscribers: 15, revenue: BigInt("2250000000000000000"), percentage: 10 },
];

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  iconBg?: string;
}

const StatCard = ({ title, value, subtitle, icon, trend, iconBg = "bg-[--fo-primary]/10" }: StatCardProps) => (
  <div className="fo-card p-4">
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

const EarningsPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year" | "all">("month");

  // Get creator profile
  const { data: creatorProfile } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getCreator",
    args: [connectedAddress],
  });

  const isCreator = creatorProfile?.isActive;

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

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
            <p className="text-[--fo-text-secondary]">Track your revenue and subscriber analytics</p>
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

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Earnings"
            value={`${formatEther(mockEarningsData.totalEarnings)} MNT`}
            subtitle="All time"
            icon={<BanknotesIcon className="w-6 h-6 text-[--fo-primary]" />}
          />
          <StatCard
            title="This Month"
            value={`${formatEther(mockEarningsData.monthlyEarnings)} MNT`}
            trend={mockEarningsData.earningsGrowth}
            icon={<CurrencyDollarIcon className="w-6 h-6 text-[--fo-success]" />}
            iconBg="bg-[--fo-success]/10"
          />
          <StatCard
            title="Total Subscribers"
            value={mockEarningsData.totalSubscribers.toString()}
            trend={mockEarningsData.subscriberGrowth}
            icon={<UserGroupIcon className="w-6 h-6 text-[--fo-accent]" />}
            iconBg="bg-[--fo-accent]/10"
          />
          <StatCard
            title="Pending Withdrawal"
            value={`${formatEther(mockEarningsData.pendingWithdrawal)} MNT`}
            subtitle="Available now"
            icon={<BanknotesIcon className="w-6 h-6 text-[--fo-warning]" />}
            iconBg="bg-[--fo-warning]/10"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="fo-card p-4 text-center">
            <UserPlusIcon className="w-6 h-6 mx-auto mb-2 text-[--fo-primary]" />
            <div className="text-xl font-bold">{mockEarningsData.newSubscribersThisMonth}</div>
            <div className="text-sm text-[--fo-text-muted]">New This Month</div>
          </div>
          <div className="fo-card p-4 text-center">
            <CalendarDaysIcon className="w-6 h-6 mx-auto mb-2 text-[--fo-accent]" />
            <div className="text-xl font-bold">{mockEarningsData.totalPosts}</div>
            <div className="text-sm text-[--fo-text-muted]">Total Posts</div>
          </div>
          <div className="fo-card p-4 text-center">
            <HeartIcon className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-xl font-bold">{mockEarningsData.totalLikes.toLocaleString()}</div>
            <div className="text-sm text-[--fo-text-muted]">Total Likes</div>
          </div>
          <div className="fo-card p-4 text-center">
            <EyeIcon className="w-6 h-6 mx-auto mb-2 text-[--fo-text-secondary]" />
            <div className="text-xl font-bold">{mockEarningsData.totalViews.toLocaleString()}</div>
            <div className="text-sm text-[--fo-text-muted]">Total Views</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tier Breakdown */}
          <div className="fo-card p-6">
            <h2 className="text-lg font-bold mb-4">Revenue by Tier</h2>
            <div className="space-y-4">
              {mockTierBreakdown.map((tier, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{tier.name}</span>
                      <span className="text-sm text-[--fo-text-muted]">{tier.subscribers} subscribers</span>
                    </div>
                    <span className="font-semibold">{formatEther(tier.revenue)} MNT</span>
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
          </div>

          {/* Recent Transactions */}
          <div className="fo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Transactions</h2>
              <button className="text-sm text-[--fo-primary] hover:underline">View All</button>
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
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="mt-8 fo-card p-6 bg-gradient-to-r from-[--fo-primary]/5 to-[--fo-accent]/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold mb-1">Withdraw Earnings</h2>
              <p className="text-[--fo-text-secondary]">
                You have{" "}
                <span className="font-semibold text-[--fo-primary]">
                  {formatEther(mockEarningsData.pendingWithdrawal)} MNT
                </span>{" "}
                available for withdrawal
              </p>
            </div>
            <button className="fo-btn-primary">Withdraw Funds</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;
