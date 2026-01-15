"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  ArrowRightIcon,
  BanknotesIcon,
  ChartBarIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  HeartIcon,
  PencilSquareIcon,
  UserGroupIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { TierManager } from "~~/components/fansonly/TierManager";
import { useCreatorPosts } from "~~/hooks/fansonly/useContentPost";
import { useCreator, useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";

type TimeFilter = "today" | "week" | "month" | "year" | "all";

const EarningsPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const { isCreator, creator, isLoading: isLoadingCreator } = useCurrentCreator();
  const { tiers, refetch: refetchTiers } = useCreator(connectedAddress);
  const { postCount, posts, isLoading: isLoadingPosts } = useCreatorPosts(connectedAddress, 0, 100);

  const totalLikes = useMemo(() => {
    return posts.reduce((sum, post) => sum + Number(post.likesCount), 0);
  }, [posts]);

  const totalComments = useMemo(() => {
    return posts.reduce((sum, post) => sum + Number(post.commentsCount), 0);
  }, [posts]);

  const isLoading = isLoadingCreator || isLoadingPosts;

  const timeFilterLabels: Record<TimeFilter, string> = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
    all: "All Time",
  };

  const totalEarnings = Number(formatEther(creator?.totalEarnings ?? BigInt(0)));
  const netEarnings = totalEarnings * 0.95;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-slate-700 flex items-center justify-center">
            <WalletIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Connect Your Wallet</h2>
          <p className="text-slate-400 text-sm">Connect your wallet to access your creator dashboard</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-800 rounded"></div>
            <div className="h-32 bg-slate-800 rounded-xl"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-slate-700 flex items-center justify-center">
            <BanknotesIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Become a Creator</h2>
          <p className="text-slate-400 text-sm mb-6">
            Start earning by sharing exclusive content with your subscribers
          </p>
          <Link
            href="/profile/create"
            className="inline-block py-2.5 px-6 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Earnings</h1>
              <p className="text-slate-400 text-sm mt-1">@{creator?.username}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
              >
                {timeFilterLabels[timeFilter]}
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${showTimeDropdown ? "rotate-180" : ""}`} />
              </button>
              {showTimeDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-lg z-10">
                  {(Object.keys(timeFilterLabels) as TimeFilter[]).map(key => (
                    <button
                      key={key}
                      onClick={() => {
                        setTimeFilter(key);
                        setShowTimeDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                        timeFilter === key ? "text-[#00aff0]" : "text-slate-300"
                      }`}
                    >
                      {timeFilterLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6">
        {/* Balance Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Balance</p>
              <p className="text-3xl font-bold text-slate-100">
                {totalEarnings.toFixed(4)} <span className="text-lg text-slate-400 font-normal">MNT</span>
              </p>
              <p className="text-slate-500 text-sm mt-1">≈ ${(totalEarnings * 0.5).toFixed(2)} USD</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide">Net (95%)</p>
                <p className="text-lg font-semibold text-slate-100">{netEarnings.toFixed(4)} MNT</p>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <p className="text-slate-500 text-xs uppercase tracking-wide">Platform Fee</p>
                <p className="text-lg font-semibold text-slate-100">5%</p>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              <span className="text-[#00aff0]">•</span> Earnings are sent directly to your wallet with each subscription
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserGroupIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Subscribers</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{Number(creator?.totalSubscribers ?? 0)}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Posts</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{postCount}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <HeartIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Likes</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{totalLikes.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Comments</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{totalComments.toLocaleString()}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Tiers */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700">
              <h2 className="font-semibold text-slate-100">Subscription Tiers</h2>
            </div>
            <div className="p-5">
              <TierManager tiers={tiers} onTierCreated={() => refetchTiers()} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700">
              <h2 className="font-semibold text-slate-100">Quick Actions</h2>
            </div>
            <div className="p-2">
              <Link
                href="/create"
                className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-100">Create New Post</p>
                    <p className="text-xs text-slate-500">Share content with subscribers</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </Link>

              <Link
                href={`/creator/${creator?.username}`}
                className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-100">View Profile</p>
                    <p className="text-xs text-slate-500">See how subscribers see you</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </Link>

              <Link
                href="/profile/edit"
                className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <PencilSquareIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-100">Edit Profile</p>
                    <p className="text-xs text-slate-500">Update bio and images</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;
