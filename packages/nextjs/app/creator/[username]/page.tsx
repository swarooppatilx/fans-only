"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { parseEther } from "viem";
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
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Mock creator data - will be replaced with contract reads
const mockCreator = {
  address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
  username: "cryptoartist",
  displayName: "Crypto Artist",
  bio: "Digital artist creating NFT masterpieces. Exclusive behind-the-scenes content, early access to drops, and personalized artwork for top-tier subscribers. Join my creative journey! 🎨",
  profileImageCID: "",
  bannerImageCID: "",
  isVerified: true,
  isActive: true,
  totalSubscribers: 156,
  totalPosts: 47,
  joinedDate: "2024-06-15",
  tiers: [
    {
      id: 0,
      name: "Fan",
      price: "0.01",
      description: "Access to public posts and community chat",
      isActive: true,
    },
    {
      id: 1,
      name: "Supporter",
      price: "0.05",
      description: "Exclusive content, early access, and monthly wallpapers",
      isActive: true,
    },
    {
      id: 2,
      name: "VIP",
      price: "0.15",
      description: "All previous perks + personalized artwork requests",
      isActive: true,
    },
  ],
};

// Mock posts
const mockPosts = [
  {
    id: 1,
    contentCID: "",
    caption: "Just finished this new piece! What do you think? 🔥",
    contentType: "IMAGE",
    accessLevel: "PUBLIC",
    requiredTier: 0,
    likes: 42,
    comments: 8,
    createdAt: "2024-12-10T15:30:00Z",
    isLocked: false,
  },
  {
    id: 2,
    contentCID: "",
    caption: "Behind the scenes of my latest collection - exclusive for supporters! 🎨",
    contentType: "IMAGE",
    accessLevel: "TIER_GATED",
    requiredTier: 1,
    likes: 28,
    comments: 5,
    createdAt: "2024-12-09T10:00:00Z",
    isLocked: true,
  },
  {
    id: 3,
    contentCID: "",
    caption: "New tutorial dropping this week - how I create my signature style ✨",
    contentType: "VIDEO",
    accessLevel: "SUBSCRIBERS",
    requiredTier: 0,
    likes: 67,
    comments: 12,
    createdAt: "2024-12-08T18:45:00Z",
    isLocked: true,
  },
];

const TierCard = ({
  tier,
  isSubscribed,
  onSubscribe,
  isLoading,
}: {
  tier: (typeof mockCreator.tiers)[0];
  isSubscribed: boolean;
  onSubscribe: () => void;
  isLoading: boolean;
}) => {
  return (
    <div className={`fo-tier-card ${isSubscribed ? "selected" : ""}`}>
      <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
      <div className="text-2xl font-bold text-[--fo-primary] mb-2">{tier.price} MNT</div>
      <p className="text-sm text-[--fo-text-secondary] mb-4">{tier.description}</p>
      {isSubscribed ? (
        <div className="fo-badge-verified">Subscribed</div>
      ) : (
        <button onClick={onSubscribe} disabled={isLoading} className="fo-btn-subscribe w-full">
          {isLoading ? "Processing..." : "Subscribe"}
        </button>
      )}
    </div>
  );
};

const PostCard = ({
  post,
  creator,
  isSubscribed,
  subscribedTier,
}: {
  post: (typeof mockPosts)[0];
  creator: typeof mockCreator;
  isSubscribed: boolean;
  subscribedTier: number;
}) => {
  const [liked, setLiked] = useState(false);
  const canView = post.accessLevel === "PUBLIC" || (isSubscribed && subscribedTier >= post.requiredTier);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="fo-post-card">
      {/* Header */}
      <div className="fo-post-header">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-0.5">
          <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-sm font-bold text-[--fo-primary]">
            {creator.displayName.charAt(0)}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold">{creator.displayName}</span>
            {creator.isVerified && <CheckBadgeIcon className="w-4 h-4 text-[--fo-primary]" />}
          </div>
          <span className="text-sm text-[--fo-text-muted]">{formatDate(post.createdAt)}</span>
        </div>
        <button className="p-2 hover:bg-base-200 rounded-full">
          <EllipsisHorizontalIcon className="w-5 h-5 text-[--fo-text-muted]" />
        </button>
      </div>

      {/* Content */}
      <div className="fo-post-content">
        <p className="text-base-content">{post.caption}</p>
      </div>

      {/* Media */}
      <div className="relative">
        {canView ? (
          <div className="fo-post-media bg-gradient-to-br from-[--fo-primary]/20 to-[--fo-accent]/20 flex items-center justify-center">
            <PhotoIcon className="w-16 h-16 text-[--fo-text-muted]" />
          </div>
        ) : (
          <div className="fo-post-media relative">
            <div className="absolute inset-0 bg-gradient-to-br from-base-300 to-base-200" />
            <div className="absolute inset-0 backdrop-blur-xl flex flex-col items-center justify-center gap-3 p-4">
              <div className="w-16 h-16 rounded-full bg-base-100/80 flex items-center justify-center">
                <LockClosedIcon className="w-8 h-8 text-[--fo-primary]" />
              </div>
              <p className="text-center font-medium">
                {post.accessLevel === "SUBSCRIBERS"
                  ? "Subscribe to unlock this content"
                  : `Tier ${post.requiredTier + 1} required`}
              </p>
              <button className="fo-btn-subscribe text-xs">Subscribe to Unlock</button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="fo-post-actions">
        <button className="fo-post-action" onClick={() => setLiked(!liked)}>
          {liked ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
          <span>{liked ? post.likes + 1 : post.likes}</span>
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

const CreatorProfilePage: NextPage = () => {
  const params = useParams();
  const username = params.username as string;
  const { address: connectedAddress } = useAccount();

  const [activeTab, setActiveTab] = useState<"posts" | "media" | "about">("posts");

  // Contract interactions (using mock data for now)
  const { writeContractAsync: subscribe, isPending: isSubscribing } = useScaffoldWriteContract("CreatorProfile");

  // Mock subscription state - will use username to lookup creator from contract
  const isSubscribed = false;
  const subscribedTier = -1;

  // For now use mock data, will be replaced with contract lookup by username
  const creator = { ...mockCreator, username };

  const handleSubscribe = async (tierIndex: number, price: string) => {
    if (!connectedAddress) {
      alert("Please connect your wallet");
      return;
    }

    try {
      await subscribe({
        functionName: "subscribe",
        args: [creator.address, BigInt(tierIndex)],
        value: parseEther(price),
      });
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-[--fo-primary] to-[--fo-accent] relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Header */}
      <div className="fo-profile-header">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Avatar */}
          <div className="-mt-16 md:-mt-20">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-1 ring-4 ring-base-100">
              <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-4xl md:text-5xl font-bold text-[--fo-primary]">
                {creator.displayName.charAt(0)}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{creator.displayName}</h1>
              {creator.isVerified && <CheckBadgeIcon className="w-6 h-6 text-[--fo-primary]" />}
            </div>
            <p className="text-[--fo-text-secondary] mb-2">@{creator.username}</p>
            <div className="flex items-center gap-1 text-sm text-[--fo-text-muted]">
              <Address address={creator.address} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-4">
            {connectedAddress === creator.address ? (
              <Link href="/profile/edit" className="fo-btn-secondary">
                Edit Profile
              </Link>
            ) : isSubscribed ? (
              <button className="fo-btn-secondary">Subscribed ✓</button>
            ) : (
              <a href="#tiers" className="fo-btn-primary">
                Subscribe
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio & Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-base-content mb-6">{creator.bio}</p>

        <div className="flex gap-8 mb-6">
          <div className="fo-stat">
            <div className="fo-stat-value">{creator.totalSubscribers}</div>
            <div className="fo-stat-label">Subscribers</div>
          </div>
          <div className="fo-stat">
            <div className="fo-stat-value">{creator.totalPosts}</div>
            <div className="fo-stat-label">Posts</div>
          </div>
          <div className="fo-stat">
            <div className="fo-stat-value">{creator.tiers.length}</div>
            <div className="fo-stat-label">Tiers</div>
          </div>
        </div>

        {/* Subscription Tiers */}
        {!isSubscribed && (
          <div id="tiers" className="mb-8 scroll-mt-20">
            <h2 className="text-xl font-bold mb-4">Subscription Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {creator.tiers.map((tier, index) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  isSubscribed={subscribedTier >= index}
                  onSubscribe={() => handleSubscribe(index, tier.price)}
                  isLoading={isSubscribing}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-[--fo-border] mb-6">
          <div className="flex gap-8">
            {(["posts", "media", "about"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "text-[--fo-primary] border-[--fo-primary]"
                    : "text-[--fo-text-muted] border-transparent hover:text-base-content"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {mockPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                creator={creator}
                isSubscribed={isSubscribed}
                subscribedTier={subscribedTier}
              />
            ))}
          </div>
        )}

        {activeTab === "media" && (
          <div className="grid grid-cols-3 gap-1">
            {mockPosts
              .filter(p => p.contentType === "IMAGE" || p.contentType === "VIDEO")
              .map(post => (
                <div
                  key={post.id}
                  className="aspect-square bg-gradient-to-br from-[--fo-primary]/20 to-[--fo-accent]/20 relative"
                >
                  {!post.isLocked || isSubscribed ? (
                    <PhotoIcon className="w-8 h-8 text-[--fo-text-muted] absolute inset-0 m-auto" />
                  ) : (
                    <div className="absolute inset-0 bg-base-300/80 backdrop-blur flex items-center justify-center">
                      <LockClosedIcon className="w-8 h-8 text-[--fo-text-muted]" />
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {activeTab === "about" && (
          <div className="fo-card p-6">
            <h3 className="font-bold mb-4">About {creator.displayName}</h3>
            <p className="text-[--fo-text-secondary] mb-4">{creator.bio}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[--fo-text-muted]">Joined</span>
                <span>{new Date(creator.joinedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--fo-text-muted]">Wallet</span>
                <Address address={creator.address} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorProfilePage;
