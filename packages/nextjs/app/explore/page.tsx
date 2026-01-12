"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckBadgeIcon, MagnifyingGlassIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// Mock data for demo - will be replaced with contract data
const mockCreators = [
  {
    address: "0x1234567890123456789012345678901234567890",
    username: "cryptoartist",
    displayName: "Crypto Artist",
    bio: "Digital artist creating NFT masterpieces. Exclusive content for subscribers.",
    profileImageCID: "",
    bannerImageCID: "",
    isVerified: true,
    totalSubscribers: 156,
    tierPrice: "0.05",
  },
  {
    address: "0x2345678901234567890123456789012345678901",
    username: "defi_guru",
    displayName: "DeFi Guru",
    bio: "Teaching you how to navigate the DeFi landscape. Alpha leaks for subscribers.",
    profileImageCID: "",
    bannerImageCID: "",
    isVerified: true,
    totalSubscribers: 423,
    tierPrice: "0.1",
  },
  {
    address: "0x3456789012345678901234567890123456789012",
    username: "web3_dev",
    displayName: "Web3 Developer",
    bio: "Building the future of the internet. Code tutorials and project breakdowns.",
    profileImageCID: "",
    bannerImageCID: "",
    isVerified: false,
    totalSubscribers: 89,
    tierPrice: "0.03",
  },
  {
    address: "0x4567890123456789012345678901234567890123",
    username: "nft_collector",
    displayName: "NFT Collector",
    bio: "Curating the best NFT collections. Early alpha on upcoming drops.",
    profileImageCID: "",
    bannerImageCID: "",
    isVerified: true,
    totalSubscribers: 267,
    tierPrice: "0.08",
  },
];

const CreatorCard = ({ creator }: { creator: (typeof mockCreators)[0] }) => {
  return (
    <Link href={`/creator/${creator.username}`} className="block">
      <div className="fo-card-elevated group">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[--fo-primary] to-[--fo-accent] relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content */}
        <div className="p-4 pt-0 relative">
          {/* Avatar */}
          <div className="-mt-10 mb-3 relative inline-block">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-1">
              <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-2xl font-bold text-[--fo-primary]">
                {creator.displayName.charAt(0)}
              </div>
            </div>
            {creator.isVerified && (
              <div className="absolute -right-1 bottom-1 bg-base-100 rounded-full p-0.5">
                <CheckBadgeIcon className="w-5 h-5 text-[--fo-primary]" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-base-content group-hover:text-[--fo-primary] transition-colors">
              {creator.displayName}
            </h3>
            <p className="text-sm text-[--fo-text-muted]">@{creator.username}</p>
          </div>

          <p className="text-sm text-[--fo-text-secondary] line-clamp-2 mb-4">{creator.bio}</p>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-[--fo-text-secondary]">
              <UserGroupIcon className="w-4 h-4" />
              <span>{creator.totalSubscribers} subscribers</span>
            </div>
            <div className="text-sm font-semibold text-[--fo-primary]">From {creator.tierPrice} MNT</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ExplorePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Read total creators from contract
  const { data: totalCreators } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getTotalCreators",
  });

  const categories = [
    { id: "all", label: "All Creators" },
    { id: "verified", label: "Verified" },
    { id: "trending", label: "Trending" },
    { id: "new", label: "New" },
  ];

  // Filter creators based on search and category
  const filteredCreators = mockCreators.filter(creator => {
    const matchesSearch =
      creator.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || (selectedCategory === "verified" && creator.isVerified);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-base-100 border-b border-[--fo-border] sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">
            Explore <span className="fo-gradient-text">Creators</span>
          </h1>
          <p className="text-[--fo-text-secondary] mb-6">
            Discover amazing creators and support them with crypto subscriptions
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[--fo-text-muted]" />
            <input
              type="text"
              placeholder="Search creators by name or username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="fo-input pl-12"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-[--fo-primary] text-white"
                    : "bg-base-200 text-[--fo-text-secondary] hover:bg-base-300"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-base-200 border-b border-[--fo-border]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-[--fo-text-secondary]">
            <span className="font-semibold text-base-content">{filteredCreators.length}</span> creators found
          </span>
          {totalCreators !== undefined && (
            <span className="text-[--fo-text-muted]">
              Total on-chain: <span className="font-semibold text-[--fo-primary]">{totalCreators.toString()}</span>
            </span>
          )}
        </div>
      </div>

      {/* Creators Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {filteredCreators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCreators.map((creator, index) => (
              <CreatorCard key={index} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-10 h-10 text-[--fo-text-muted]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No creators found</h3>
            <p className="text-[--fo-text-secondary] mb-6">Try adjusting your search or filters</p>
            <button onClick={() => setSearchQuery("")} className="fo-btn-secondary">
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* CTA for non-creators */}
      {connectedAddress && (
        <div className="bg-gradient-to-r from-[--fo-primary]/10 to-[--fo-accent]/10 border-t border-[--fo-border]">
          <div className="max-w-6xl mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Become a Creator</h2>
            <p className="text-[--fo-text-secondary] mb-6 max-w-md mx-auto">
              Start earning by sharing exclusive content with your subscribers
            </p>
            <Link href="/profile/create" className="fo-btn-primary inline-block">
              Create Your Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
