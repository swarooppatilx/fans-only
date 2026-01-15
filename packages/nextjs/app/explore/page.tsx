"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  CheckBadgeIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getIpfsUrl, useAllCreators, useCreator } from "~~/hooks/fansonly";

type ExploreTab = "for-you" | "trending" | "new" | "verified";

interface CreatorCardData {
  address: string;
  username: string;
  displayName: string;
  bio: string;
  profileImageCID: string;
  bannerImageCID: string;
  isVerified: boolean;
  totalSubscribers: bigint | number;
  tierPrice: bigint | string;
}

// Compact creator row for "Who to follow" style
const CreatorRow = ({ creator }: { creator: CreatorCardData }) => {
  return (
    <Link href={`/creator/${creator.username}`} className="block">
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
          {creator.profileImageCID ? (
            <Image
              src={getIpfsUrl(creator.profileImageCID)}
              alt={creator.displayName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#00aff0]">
              {creator.displayName.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-100 truncate">{creator.displayName}</span>
            {creator.isVerified && <CheckBadgeIcon className="w-4 h-4 text-[#00aff0] flex-shrink-0" />}
          </div>
          <p className="text-sm text-slate-500 truncate">@{creator.username}</p>
        </div>

        {/* Follow Button */}
        <button
          onClick={e => {
            e.preventDefault();
            // Navigate to profile for subscription
          }}
          className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm rounded-full transition-colors"
        >
          Follow
        </button>
      </div>
    </Link>
  );
};

// Full creator card with banner
const CreatorCard = ({ creator }: { creator: CreatorCardData }) => {
  const formatPrice = (price: bigint | string): string => {
    if (typeof price === "bigint") {
      return formatEther(price);
    }
    return price;
  };

  return (
    <Link href={`/creator/${creator.username}`} className="block">
      <div className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
        {/* Banner */}
        <div className="h-28 bg-slate-800 relative overflow-hidden">
          {creator.bannerImageCID && (
            <Image src={getIpfsUrl(creator.bannerImageCID)} alt="" fill className="object-cover" unoptimized />
          )}
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start">
            {/* Avatar */}
            <div className="-mt-8 relative">
              <div className="w-16 h-16 rounded-full bg-slate-700 border-4 border-slate-900 overflow-hidden">
                {creator.profileImageCID ? (
                  <Image
                    src={getIpfsUrl(creator.profileImageCID)}
                    alt={creator.displayName}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#00aff0]">
                    {creator.displayName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Follow Button */}
            <button
              onClick={e => {
                e.preventDefault();
              }}
              className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm rounded-full transition-colors"
            >
              Follow
            </button>
          </div>

          {/* Info */}
          <div className="mt-2">
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-slate-100">{creator.displayName}</h3>
              {creator.isVerified && <CheckBadgeIcon className="w-4 h-4 text-[#00aff0]" />}
            </div>
            <p className="text-sm text-slate-500">@{creator.username}</p>
          </div>

          <p className="text-sm text-slate-300 mt-2 line-clamp-2">{creator.bio || "No bio yet"}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
            <span>
              <span className="text-slate-100 font-semibold">
                {typeof creator.totalSubscribers === "bigint"
                  ? Number(creator.totalSubscribers)
                  : creator.totalSubscribers}
              </span>{" "}
              subscribers
            </span>
            {creator.tierPrice !== BigInt(0) && creator.tierPrice !== "0" && (
              <span>
                From <span className="text-[#00aff0] font-semibold">{formatPrice(creator.tierPrice)} MNT</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// Component to fetch and display a creator from chain data
const OnChainCreatorCard = ({ creatorAddress, compact }: { creatorAddress: string; compact?: boolean }) => {
  const { creator, tiers, isLoading, isCreator: exists } = useCreator(creatorAddress);

  if (isLoading) {
    if (compact) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-slate-800" />
          <div className="flex-1">
            <div className="h-4 bg-slate-800 rounded w-24 mb-1" />
            <div className="h-3 bg-slate-800 rounded w-16" />
          </div>
          <div className="w-16 h-8 bg-slate-800 rounded-full" />
        </div>
      );
    }
    return (
      <div className="border-b border-slate-800 animate-pulse">
        <div className="h-28 bg-slate-800" />
        <div className="px-4 pb-4">
          <div className="-mt-8 w-16 h-16 rounded-full bg-slate-700 border-4 border-slate-900" />
          <div className="mt-2 h-4 bg-slate-800 rounded w-32 mb-1" />
          <div className="h-3 bg-slate-800 rounded w-20 mb-3" />
          <div className="h-10 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (!exists || !creator || !creator.isActive) {
    return null;
  }

  const activeTiers = tiers.filter(t => t.isActive);
  const minPrice =
    activeTiers.length > 0
      ? activeTiers.reduce((min, t) => (t.price < min ? t.price : min), activeTiers[0].price)
      : BigInt(0);

  const creatorData: CreatorCardData = {
    address: creatorAddress,
    username: creator.username,
    displayName: creator.displayName,
    bio: creator.bio,
    profileImageCID: creator.profileImageCID,
    bannerImageCID: creator.bannerImageCID,
    isVerified: creator.isVerified,
    totalSubscribers: creator.totalSubscribers,
    tierPrice: minPrice,
  };

  return compact ? <CreatorRow creator={creatorData} /> : <CreatorCard creator={creatorData} />;
};

const ExplorePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ExploreTab>("for-you");

  const { totalCreators, creatorAddresses, isLoading: isLoadingCreators } = useAllCreators(0, 50);

  const hasCreators = totalCreators > 0 && creatorAddresses.length > 0;

  const tabs: { id: ExploreTab; label: string }[] = [
    { id: "for-you", label: "For You" },
    { id: "trending", label: "Trending" },
    { id: "new", label: "New" },
    { id: "verified", label: "Verified" },
  ];

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-full py-2.5 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00aff0] focus:bg-transparent text-sm"
              />
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <Cog6ToothIcon className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-slate-100 border-[#00aff0]"
                    : "text-slate-500 border-transparent hover:bg-slate-800/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {/* Featured Section */}
        <div className="border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <SparklesIcon className="w-5 h-5 text-[#00aff0]" />
            <h2 className="font-bold text-slate-100">Featured Creators</h2>
          </div>
          <p className="text-sm text-slate-500">{totalCreators} creators on-chain</p>
        </div>

        {/* Creators List */}
        {isLoadingCreators ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-slate-800 animate-pulse">
                <div className="h-28 bg-slate-800" />
                <div className="px-4 pb-4">
                  <div className="-mt-8 w-16 h-16 rounded-full bg-slate-700 border-4 border-slate-900" />
                  <div className="mt-2 h-4 bg-slate-800 rounded w-32 mb-1" />
                  <div className="h-3 bg-slate-800 rounded w-20 mb-3" />
                  <div className="h-10 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : hasCreators ? (
          <div>
            {creatorAddresses.map(address => (
              <OnChainCreatorCard key={address} creatorAddress={address} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <UserGroupIcon className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1">No creators yet</h3>
            <p className="text-slate-500 text-sm mb-6">Be the first to create a profile!</p>
            <Link
              href="/profile/create"
              className="inline-block px-5 py-2 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
            >
              Become a Creator
            </Link>
          </div>
        )}

        {/* Who to Follow Section */}
        {hasCreators && (
          <div className="border-t border-slate-800 mt-4">
            <div className="px-4 py-3 border-b border-slate-800">
              <h2 className="font-bold text-slate-100">Who to follow</h2>
            </div>
            {creatorAddresses.slice(0, 3).map(address => (
              <OnChainCreatorCard key={`compact-${address}`} creatorAddress={address} compact />
            ))}
            {creatorAddresses.length > 3 && (
              <button className="w-full px-4 py-3 text-left text-[#00aff0] text-sm hover:bg-slate-800/50 transition-colors">
                Show more
              </button>
            )}
          </div>
        )}

        {/* CTA for non-creators */}
        {connectedAddress && (
          <div className="border-t border-slate-800 px-4 py-10 text-center">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Become a Creator</h2>
            <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
              Start earning by sharing exclusive content with your subscribers
            </p>
            <Link
              href="/profile/create"
              className="inline-block px-5 py-2 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
            >
              Create Your Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
