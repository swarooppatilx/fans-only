"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { CheckBadgeIcon, MagnifyingGlassIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { getIpfsUrl, useAllCreators, useCreator } from "~~/hooks/fansonly";

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

const CreatorCard = ({ creator }: { creator: CreatorCardData }) => {
  const formatPrice = (price: bigint | string): string => {
    if (typeof price === "bigint") {
      return formatEther(price);
    }
    return price;
  };

  return (
    <Link href={`/creator/${creator.username}`} className="block">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden group hover:border-slate-600 transition-all duration-200">
        {/* Banner */}
        <div className="h-24 bg-slate-700 relative overflow-hidden">
          {creator.bannerImageCID && (
            <Image src={getIpfsUrl(creator.bannerImageCID)} alt="" fill className="object-cover" unoptimized />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content */}
        <div className="p-4 pt-0 relative">
          {/* Avatar */}
          <div className="-mt-10 mb-3 relative inline-block">
            <div className="w-20 h-20 rounded-full bg-slate-600 p-1 border-2 border-slate-800">
              {creator.profileImageCID ? (
                <Image
                  src={getIpfsUrl(creator.profileImageCID)}
                  alt={creator.displayName}
                  width={72}
                  height={72}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl font-bold text-[#00aff0]">
                  {creator.displayName.charAt(0)}
                </div>
              )}
            </div>
            {creator.isVerified && (
              <div className="absolute -right-1 bottom-1 bg-slate-900 rounded-full p-0.5">
                <CheckBadgeIcon className="w-5 h-5 text-[#00aff0]" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-[#00aff0] transition-colors">
              {creator.displayName}
            </h3>
            <p className="text-sm text-slate-500">@{creator.username}</p>
          </div>

          <p className="text-sm text-slate-400 line-clamp-2 mb-4">{creator.bio || "No bio yet"}</p>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <UserGroupIcon className="w-4 h-4" />
              <span>
                {typeof creator.totalSubscribers === "bigint"
                  ? Number(creator.totalSubscribers)
                  : creator.totalSubscribers}{" "}
                subscribers
              </span>
            </div>
            {creator.tierPrice !== BigInt(0) && creator.tierPrice !== "0" && (
              <div className="text-sm font-semibold text-[#00aff0]">From {formatPrice(creator.tierPrice)} MNT</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// Component to fetch and display a creator from chain data
const OnChainCreatorCard = ({ creatorAddress }: { creatorAddress: string }) => {
  const { creator, tiers, isLoading, isCreator: exists } = useCreator(creatorAddress);

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden animate-pulse">
        <div className="h-24 bg-slate-700" />
        <div className="p-4 pt-0">
          <div className="-mt-10 mb-3">
            <div className="w-20 h-20 rounded-full bg-slate-700" />
          </div>
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-700 rounded w-1/2 mb-4" />
          <div className="h-12 bg-slate-700 rounded mb-4" />
          <div className="h-4 bg-slate-700 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!exists || !creator || !creator.isActive) {
    return null;
  }

  // Get minimum tier price
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

  return <CreatorCard creator={creatorData} />;
};

const ExplorePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [searchQuery, setSearchQuery] = useState("");

  // Read creators from contract
  const { totalCreators, creatorAddresses, isLoading: isLoadingCreators } = useAllCreators(0, 50);

  const hasCreators = totalCreators > 0 && creatorAddresses.length > 0;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2 text-slate-100">
            Explore <span className="text-[#00aff0]">Creators</span>
          </h1>
          <p className="text-slate-400 mb-6">Discover amazing creators and support them with crypto subscriptions</p>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search creators by name or username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00aff0] focus:ring-1 focus:ring-[#00aff0]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-800/50 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-slate-400">
            <span className="font-semibold text-slate-100">{totalCreators}</span> creators on-chain
          </span>
        </div>
      </div>

      {/* Creators Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoadingCreators ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-24 bg-slate-700" />
                <div className="p-4 pt-0">
                  <div className="-mt-10 mb-3">
                    <div className="w-20 h-20 rounded-full bg-slate-700" />
                  </div>
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-1/2 mb-4" />
                  <div className="h-12 bg-slate-700 rounded mb-4" />
                  <div className="h-4 bg-slate-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : hasCreators ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatorAddresses.map(address => (
              <OnChainCreatorCard key={address} creatorAddress={address} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-100">No creators yet</h3>
            <p className="text-slate-400 mb-6">Be the first to create a profile!</p>
            <Link
              href="/profile/create"
              className="px-6 py-3 bg-[#00aff0] hover:bg-[#009bd6] text-white font-semibold rounded-full transition-all duration-200 inline-block"
            >
              Become a Creator
            </Link>
          </div>
        )}
      </div>

      {/* CTA for non-creators */}
      {connectedAddress && (
        <div className="bg-slate-800/50 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-2 text-slate-100">Become a Creator</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start earning by sharing exclusive content with your subscribers
            </p>
            <Link
              href="/profile/create"
              className="px-6 py-3 bg-[#00aff0] hover:bg-[#009bd6] text-white font-semibold rounded-full transition-all duration-200 inline-block"
            >
              Create Your Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
