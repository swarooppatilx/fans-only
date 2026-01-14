"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Creator, getIpfsUrl, useAllCreators, useCreator } from "~~/hooks/fansonly";

// Component to fetch creator data
function CreatorFetcher({
  creatorAddress,
  onCreatorLoaded,
}: {
  creatorAddress: string;
  onCreatorLoaded: (creator: Creator & { address: string }) => void;
}) {
  const { creator, isLoading } = useCreator(creatorAddress);

  useEffect(() => {
    if (!isLoading && creator?.isActive) {
      onCreatorLoaded({ ...creator, address: creatorAddress });
    }
  }, [creator, isLoading, creatorAddress, onCreatorLoaded]);

  return null;
}

export default function RightSidebar() {
  const { creatorAddresses, isLoading } = useAllCreators(0, 5);
  const [creatorsData, setCreatorsData] = useState<(Creator & { address: string })[]>([]);

  const handleCreatorLoaded = useCallback((creator: Creator & { address: string }) => {
    setCreatorsData(prev => {
      // Avoid duplicates
      if (prev.find(c => c.address === creator.address)) return prev;
      return [...prev, creator].slice(0, 3);
    });
  }, []);

  return (
    <div className="flex flex-col w-full h-screen p-4 pl-6 gap-6 bg-slate-900 border-l border-slate-800 overflow-y-auto">
      {/* Hidden creator fetchers */}
      {creatorAddresses.map(address => (
        <CreatorFetcher key={address} creatorAddress={address} onCreatorLoaded={handleCreatorLoaded} />
      ))}

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-500 group-focus-within:text-[#00aff0]" />
        </div>
        <input
          type="text"
          placeholder="Search creators, posts..."
          className="w-full bg-slate-800 text-slate-100 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-[#00aff0] focus:bg-slate-900 transition-all placeholder:text-slate-500 border border-transparent focus:border-[#00aff0]"
        />
      </div>

      {/* Suggested Creators */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
        <h3 className="font-bold text-lg text-slate-100 mb-4">Who to follow</h3>
        <div className="flex flex-col gap-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#00aff0] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : creatorsData.length > 0 ? (
            creatorsData.map(creator => (
              <div key={creator.address} className="flex items-center justify-between">
                <Link href={`/creator/${creator.username}`} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden">
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
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center text-sm font-bold text-[#00aff0]">
                        {creator.displayName?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-100 text-sm hover:underline cursor-pointer">
                      {creator.displayName}
                    </span>
                    <span className="text-slate-500 text-xs">@{creator.username}</span>
                  </div>
                </Link>
                <button className="px-4 py-1.5 bg-slate-100 text-slate-900 hover:bg-slate-200 text-sm font-bold rounded-full shadow-sm transition-colors">
                  Follow
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">No creators yet</p>
          )}
        </div>
        <Link
          href="/explore"
          className="block mt-4 pt-4 border-t border-slate-700 text-[#00aff0] text-sm cursor-pointer hover:underline font-medium"
        >
          Show more
        </Link>
      </div>

      {/* Trending */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
        <h3 className="font-bold text-lg text-slate-100 mb-4">Trending on FansOnly</h3>
        <div className="flex flex-col gap-4">
          {[
            { tag: "#NFTPhotography", posts: "12.5K posts" },
            { tag: "#ETHNewYork", posts: "5.2K posts" },
            { tag: "Vitalik", posts: "2.1K posts" },
            { tag: "#Web3Model", posts: "54K posts" },
          ].map((topic, i) => (
            <div
              key={i}
              className="flex flex-col cursor-pointer hover:bg-slate-800 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <span className="text-slate-500 text-xs mb-0.5">Trending in Art</span>
              <span className="font-bold text-slate-200">{topic.tag}</span>
              <span className="text-slate-500 text-xs">{topic.posts}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-slate-500 text-xs px-2 leading-relaxed">
        © 2026 FansOnly Protocol • Privacy • Terms • Smart Contracts •{" "}
        <span className="hover:underline cursor-pointer">More</span>
      </div>
    </div>
  );
}
