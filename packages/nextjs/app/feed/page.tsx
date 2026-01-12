"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
  LockClosedIcon,
  PhotoIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getIPFSUrl } from "~~/services/ipfs";

// Mock feed data - will be replaced with contract reads
const mockFeedPosts = [
  {
    id: 1,
    creator: {
      address: "0x1234567890123456789012345678901234567890",
      username: "cryptoartist",
      displayName: "Crypto Artist",
      profileImageCID: "",
      isVerified: true,
    },
    contentCID: "",
    previewCID: "",
    caption:
      "Just dropped a new piece! 🎨 This one took me 3 weeks to complete. The details in the background represent the chaos of the crypto markets. What do you see in it?",
    contentType: 1, // IMAGE
    accessLevel: 0, // PUBLIC
    requiredTierId: 0,
    likes: 142,
    comments: 23,
    createdAt: Date.now() / 1000 - 3600, // 1 hour ago
    isLiked: false,
  },
  {
    id: 2,
    creator: {
      address: "0x2345678901234567890123456789012345678901",
      username: "defi_guru",
      displayName: "DeFi Guru",
      profileImageCID: "",
      isVerified: true,
    },
    contentCID: "",
    previewCID: "",
    caption:
      "🔥 Alpha Alert: New yield farming strategy that's been printing. Full breakdown in this exclusive video for subscribers only!",
    contentType: 2, // VIDEO
    accessLevel: 1, // SUBSCRIBERS
    requiredTierId: 0,
    likes: 89,
    comments: 15,
    createdAt: Date.now() / 1000 - 7200, // 2 hours ago
    isLiked: true,
  },
  {
    id: 3,
    creator: {
      address: "0x3456789012345678901234567890123456789012",
      username: "web3_dev",
      displayName: "Web3 Developer",
      profileImageCID: "",
      isVerified: false,
    },
    contentCID: "",
    previewCID: "",
    caption:
      "Tutorial: Building a gas-optimized NFT marketplace in Solidity. Part 1 covers the core listing logic. Code repo in comments! 💻",
    contentType: 0, // TEXT
    accessLevel: 0, // PUBLIC
    requiredTierId: 0,
    likes: 256,
    comments: 42,
    createdAt: Date.now() / 1000 - 14400, // 4 hours ago
    isLiked: false,
  },
  {
    id: 4,
    creator: {
      address: "0x1234567890123456789012345678901234567890",
      username: "cryptoartist",
      displayName: "Crypto Artist",
      profileImageCID: "",
      isVerified: true,
    },
    contentCID: "",
    previewCID: "",
    caption: "VIP exclusive: The complete process video of my latest piece. 2 hours of pure creation! 🖌️",
    contentType: 2, // VIDEO
    accessLevel: 2, // TIER_GATED
    requiredTierId: 2,
    likes: 67,
    comments: 8,
    createdAt: Date.now() / 1000 - 28800, // 8 hours ago
    isLiked: false,
  },
];

interface PostCardProps {
  post: (typeof mockFeedPosts)[0];
  isSubscribed?: boolean;
  subscribedTier?: number;
}

const PostCard = ({ post, isSubscribed = false, subscribedTier = -1 }: PostCardProps) => {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);

  const canView =
    post.accessLevel === 0 || // PUBLIC
    (post.accessLevel === 1 && isSubscribed) || // SUBSCRIBERS
    (post.accessLevel === 2 && subscribedTier >= post.requiredTierId); // TIER_GATED

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => (liked ? prev - 1 : prev + 1));
  };

  const contentTypeIcons = ["📝", "🖼️", "🎬", "🎵", "📦"];

  return (
    <div className="fo-post-card">
      {/* Header */}
      <div className="fo-post-header">
        <Link href={`/creator/${post.creator.username}`} className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-0.5">
            {post.creator.profileImageCID ? (
              <Image
                src={getIPFSUrl(post.creator.profileImageCID)}
                alt={post.creator.displayName}
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-sm font-bold text-[--fo-primary]">
                {post.creator.displayName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold hover:text-[--fo-primary] transition-colors">
                {post.creator.displayName}
              </span>
              {post.creator.isVerified && <CheckBadgeIcon className="w-4 h-4 text-[--fo-primary]" />}
            </div>
            <div className="text-sm text-[--fo-text-muted]">
              @{post.creator.username} · {formatTimeAgo(post.createdAt)}
            </div>
          </div>
        </Link>
        <button className="p-2 hover:bg-base-200 rounded-full">
          <EllipsisHorizontalIcon className="w-5 h-5 text-[--fo-text-muted]" />
        </button>
      </div>

      {/* Caption */}
      <div className="fo-post-content">
        <p className="whitespace-pre-wrap">{post.caption}</p>
      </div>

      {/* Media */}
      {post.contentType !== 0 && ( // Not TEXT only
        <div className="relative">
          {canView ? (
            <div className="fo-post-media bg-gradient-to-br from-[--fo-primary]/20 to-[--fo-accent]/20 flex items-center justify-center">
              {post.contentCID ? (
                <Image src={getIPFSUrl(post.contentCID)} alt="Post content" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[--fo-text-muted]">
                  <PhotoIcon className="w-12 h-12" />
                  <span className="text-sm">{contentTypeIcons[post.contentType]} Content</span>
                </div>
              )}
            </div>
          ) : (
            <div className="fo-post-media relative">
              <div className="absolute inset-0 bg-gradient-to-br from-base-300 to-base-200" />
              <div className="absolute inset-0 backdrop-blur-xl flex flex-col items-center justify-center gap-3 p-4">
                <div className="w-14 h-14 rounded-full bg-base-100/80 flex items-center justify-center">
                  <LockClosedIcon className="w-7 h-7 text-[--fo-primary]" />
                </div>
                <p className="text-center font-medium text-sm">
                  {post.accessLevel === 1 ? "Subscribe to unlock" : `Tier ${post.requiredTierId + 1} required`}
                </p>
                <Link href={`/creator/${post.creator.username}`} className="fo-btn-subscribe text-xs py-2 px-4">
                  View Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="fo-post-actions">
        <button className="fo-post-action" onClick={handleLike}>
          {liked ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
          <span>{likeCount}</span>
        </button>
        <button className="fo-post-action">
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>{post.comments}</span>
        </button>
        <button className="fo-post-action ml-auto">
          <ShareIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const FeedPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [activeFilter, setActiveFilter] = useState<"all" | "subscribed">("all");

  // Get user's subscriptions (mock for now)
  const { data: creatorProfile } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getCreator",
    args: [connectedAddress],
  });

  const isCreator = creatorProfile?.isActive;

  // Mock subscription data - would come from contract
  const mockSubscriptions = new Set(["0x1234567890123456789012345678901234567890"]);
  const isSubscribed = (address: string) => mockSubscriptions.has(address);

  const filteredPosts =
    activeFilter === "subscribed" ? mockFeedPosts.filter(post => isSubscribed(post.creator.address)) : mockFeedPosts;

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-16 z-10 bg-base-100 border-b border-[--fo-border]">
        <div className="fo-feed-container !py-0">
          <div className="flex">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex-1 py-4 font-medium text-center border-b-2 transition-colors ${
                activeFilter === "all"
                  ? "text-[--fo-primary] border-[--fo-primary]"
                  : "text-[--fo-text-muted] border-transparent hover:text-base-content"
              }`}
            >
              For You
            </button>
            <button
              onClick={() => setActiveFilter("subscribed")}
              className={`flex-1 py-4 font-medium text-center border-b-2 transition-colors ${
                activeFilter === "subscribed"
                  ? "text-[--fo-primary] border-[--fo-primary]"
                  : "text-[--fo-text-muted] border-transparent hover:text-base-content"
              }`}
            >
              Subscribed
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="fo-feed-container">
        {/* Create Post CTA for Creators */}
        {isConnected && isCreator && (
          <Link href="/create" className="block mb-4">
            <div className="fo-card p-4 flex items-center gap-3 hover:border-[--fo-border-light] transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-0.5">
                <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-sm font-bold text-[--fo-primary]">
                  {creatorProfile?.displayName?.charAt(0) || "?"}
                </div>
              </div>
              <span className="text-[--fo-text-muted] flex-1">What&apos;s on your mind?</span>
              <span className="fo-btn-primary text-sm py-2 px-4">Post</span>
            </div>
          </Link>
        )}

        {/* Posts */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isSubscribed={isSubscribed(post.creator.address)}
                subscribedTier={1} // Mock - would come from subscription data
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
              <PhotoIcon className="w-10 h-10 text-[--fo-text-muted]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {activeFilter === "subscribed" ? "No subscribed content yet" : "No posts yet"}
            </h3>
            <p className="text-[--fo-text-secondary] mb-6">
              {activeFilter === "subscribed"
                ? "Subscribe to creators to see their posts here"
                : "Be the first to explore our creators"}
            </p>
            <Link href="/explore" className="fo-btn-primary inline-block">
              Explore Creators
            </Link>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="text-center py-8">
            <button className="fo-btn-secondary">Load More</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
