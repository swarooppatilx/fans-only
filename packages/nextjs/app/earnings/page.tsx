"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { TierManager } from "~~/components/fansonly/TierManager";
import { useCreatorPosts } from "~~/hooks/fansonly/useContentPost";
import { useCreator, useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
}

const StatCard = ({ title, value, subtitle, icon, iconBg = "bg-[--fo-primary]/10" }: StatCardProps) => (
  <div className="fo-card p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-[--fo-text-muted] mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-sm text-[--fo-text-secondary] mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>{icon}</div>
    </div>
  </div>
);

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

  // Get creator profile with real data
  const { isCreator, creator, isLoading: isLoadingCreator } = useCurrentCreator();

  // Get creator tiers
  const { tiers, refetch: refetchTiers } = useCreator(connectedAddress);

  // Get post stats
  const { postCount, posts, isLoading: isLoadingPosts } = useCreatorPosts(connectedAddress, 0, 100);

  // Calculate total likes from posts
  const totalLikes = useMemo(() => {
    return posts.reduce((sum, post) => sum + Number(post.likesCount), 0);
  }, [posts]);

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
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Earnings"
            value={`${formatEther(creator?.totalEarnings ?? BigInt(0))} MNT`}
            subtitle="95% after platform fee"
            icon={<BanknotesIcon className="w-6 h-6 text-[--fo-primary]" />}
          />
          <StatCard
            title="Total Subscribers"
            value={Number(creator?.totalSubscribers ?? 0).toString()}
            icon={<UserGroupIcon className="w-6 h-6 text-[--fo-accent]" />}
            iconBg="bg-[--fo-accent]/10"
          />
          <StatCard
            title="Total Posts"
            value={postCount.toString()}
            icon={<CalendarDaysIcon className="w-6 h-6 text-[--fo-success]" />}
            iconBg="bg-[--fo-success]/10"
          />
          <StatCard
            title="Total Likes"
            value={totalLikes.toLocaleString()}
            icon={<HeartIcon className="w-6 h-6 text-red-500" />}
            iconBg="bg-red-500/10"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="fo-card p-4 text-center">
            <UserGroupIcon className="w-6 h-6 mx-auto mb-2 text-[--fo-primary]" />
            <div className="text-xl font-bold">{Number(creator?.totalSubscribers ?? 0)}</div>
            <div className="text-sm text-[--fo-text-muted]">Subscribers</div>
          </div>
          <div className="fo-card p-4 text-center">
            <CalendarDaysIcon className="w-6 h-6 mx-auto mb-2 text-[--fo-accent]" />
            <div className="text-xl font-bold">{postCount}</div>
            <div className="text-sm text-[--fo-text-muted]">Total Posts</div>
          </div>
          <div className="fo-card p-4 text-center">
            <HeartIcon className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-xl font-bold">{totalLikes.toLocaleString()}</div>
            <div className="text-sm text-[--fo-text-muted]">Total Likes</div>
          </div>
          <div className="fo-card p-4 text-center">
            <CurrencyDollarIcon className="w-6 h-6 mx-auto mb-2 text-[--fo-success]" />
            <div className="text-xl font-bold">5%</div>
            <div className="text-sm text-[--fo-text-muted]">Platform Fee</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tier Management */}
          <TierManager tiers={tiers} onTierCreated={() => refetchTiers()} />

          {/* Quick Actions */}
          <div className="fo-card p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/create"
                className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div>
                  <div className="font-medium">Create New Post</div>
                  <div className="text-sm text-[--fo-text-muted]">Share content with your subscribers</div>
                </div>
                <span className="text-[--fo-primary]">→</span>
              </Link>
              <Link
                href={`/creator/${creator?.username}`}
                className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div>
                  <div className="font-medium">View Your Profile</div>
                  <div className="text-sm text-[--fo-text-muted]">See how subscribers see you</div>
                </div>
                <span className="text-[--fo-primary]">→</span>
              </Link>
              <Link
                href="/profile/edit"
                className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div>
                  <div className="font-medium">Edit Profile</div>
                  <div className="text-sm text-[--fo-text-muted]">Update your bio and images</div>
                </div>
                <span className="text-[--fo-primary]">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Earnings Info */}
        <div className="mt-8 fo-card p-6 bg-gradient-to-r from-[--fo-primary]/5 to-[--fo-accent]/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold mb-1">Your Earnings</h2>
              <p className="text-[--fo-text-secondary]">
                Total earned:{" "}
                <span className="font-semibold text-[--fo-primary]">
                  {formatEther(creator?.totalEarnings ?? BigInt(0))} MNT
                </span>
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
