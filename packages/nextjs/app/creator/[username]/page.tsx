"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatEther } from "viem";
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
import { SubscriptionTier, getIpfsUrl, useCreatorByUsername, useSubscribe, useSubscription } from "~~/hooks/fansonly";
import { AccessLevel, Post, useCreatorPosts } from "~~/hooks/fansonly";

// Mock creator data - used when no on-chain data exists
const mockCreator = {
  address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
  username: "cryptoartist",
  displayName: "Crypto Artist",
  bio: "Digital artist creating NFT masterpieces. Exclusive behind-the-scenes content, early access to drops, and personalized artwork for top-tier subscribers. Join my creative journey! 🎨",
  profileImageCID: "",
  bannerImageCID: "",
  isVerified: true,
  isActive: true,
  totalSubscribers: BigInt(156),
  totalEarnings: BigInt(0),
  createdAt: BigInt(1718496000),
  tiers: [
    {
      name: "Fan",
      price: BigInt(10000000000000000),
      description: "Access to public posts and community chat",
      isActive: true,
    },
    {
      name: "Supporter",
      price: BigInt(50000000000000000),
      description: "Exclusive content, early access, and monthly wallpapers",
      isActive: true,
    },
    {
      name: "VIP",
      price: BigInt(150000000000000000),
      description: "All previous perks + personalized artwork requests",
      isActive: true,
    },
  ] as SubscriptionTier[],
};

// Mock posts for demo
const mockPosts: Post[] = [
  {
    id: BigInt(1),
    creator: mockCreator.address,
    contentCID: "",
    previewCID: "",
    caption: "Just finished this new piece! What do you think? 🔥",
    contentType: 1,
    accessLevel: AccessLevel.PUBLIC,
    requiredTierId: BigInt(0),
    likesCount: BigInt(42),
    commentsCount: BigInt(8),
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
    isActive: true,
  },
  {
    id: BigInt(2),
    creator: mockCreator.address,
    contentCID: "",
    previewCID: "",
    caption: "Behind the scenes of my latest collection - exclusive for supporters! 🎨",
    contentType: 1,
    accessLevel: AccessLevel.TIER_GATED,
    requiredTierId: BigInt(1),
    likesCount: BigInt(28),
    commentsCount: BigInt(5),
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 172800),
    isActive: true,
  },
  {
    id: BigInt(3),
    creator: mockCreator.address,
    contentCID: "",
    previewCID: "",
    caption: "New tutorial dropping this week - how I create my signature style ✨",
    contentType: 2,
    accessLevel: AccessLevel.SUBSCRIBERS,
    requiredTierId: BigInt(0),
    likesCount: BigInt(67),
    commentsCount: BigInt(12),
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 259200),
    isActive: true,
  },
];

const TierCard = ({
  tier,
  isCurrentTier,
  onSubscribe,
  isLoading,
}: {
  tier: SubscriptionTier;
  isCurrentTier: boolean;
  onSubscribe: () => void;
  isLoading: boolean;
}) => {
  const priceInEth = formatEther(tier.price);

  return (
    <div className={`fo-tier-card ${isCurrentTier ? "selected" : ""}`}>
      <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
      <div className="text-2xl font-bold text-[--fo-primary] mb-2">{priceInEth} MNT</div>
      <p className="text-sm text-[--fo-text-secondary] mb-4">{tier.description}</p>
      {isCurrentTier ? (
        <div className="fo-badge-verified">Subscribed</div>
      ) : (
        <button onClick={onSubscribe} disabled={isLoading || !tier.isActive} className="fo-btn-subscribe w-full">
          {isLoading ? "Processing..." : !tier.isActive ? "Unavailable" : "Subscribe"}
        </button>
      )}
    </div>
  );
};

const PostCard = ({
  post,
  creatorName,
  creatorVerified,
  profileImageCID,
  isSubscribed,
  subscribedTierId,
}: {
  post: Post;
  creatorName: string;
  creatorVerified: boolean;
  profileImageCID: string;
  isSubscribed: boolean;
  subscribedTierId: bigint;
}) => {
  const [liked, setLiked] = useState(false);

  // Check if user can view this content
  const canView =
    post.accessLevel === AccessLevel.PUBLIC ||
    (isSubscribed && post.accessLevel === AccessLevel.SUBSCRIBERS) ||
    (isSubscribed && post.accessLevel === AccessLevel.TIER_GATED && subscribedTierId >= post.requiredTierId);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getAccessLabel = () => {
    if (post.accessLevel === AccessLevel.SUBSCRIBERS) {
      return "Subscribe to unlock this content";
    }
    return `Tier ${Number(post.requiredTierId) + 1} required`;
  };

  return (
    <div className="fo-post-card">
      {/* Header */}
      <div className="fo-post-header">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-0.5">
          {profileImageCID ? (
            <Image
              src={getIpfsUrl(profileImageCID)}
              alt={creatorName}
              width={36}
              height={36}
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-sm font-bold text-[--fo-primary]">
              {creatorName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold">{creatorName}</span>
            {creatorVerified && <CheckBadgeIcon className="w-4 h-4 text-[--fo-primary]" />}
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
            {post.contentCID ? (
              <Image src={getIpfsUrl(post.contentCID)} alt="" fill className="object-cover" unoptimized />
            ) : (
              <PhotoIcon className="w-16 h-16 text-[--fo-text-muted]" />
            )}
          </div>
        ) : (
          <div className="fo-post-media relative">
            <div className="absolute inset-0 bg-gradient-to-br from-base-300 to-base-200" />
            {post.previewCID && (
              <Image src={getIpfsUrl(post.previewCID)} alt="" fill className="object-cover blur-xl" unoptimized />
            )}
            <div className="absolute inset-0 backdrop-blur-xl flex flex-col items-center justify-center gap-3 p-4">
              <div className="w-16 h-16 rounded-full bg-base-100/80 flex items-center justify-center">
                <LockClosedIcon className="w-8 h-8 text-[--fo-primary]" />
              </div>
              <p className="text-center font-medium">{getAccessLabel()}</p>
              <a href="#tiers" className="fo-btn-subscribe text-xs">
                Subscribe to Unlock
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="fo-post-actions">
        <button className="fo-post-action" onClick={() => setLiked(!liked)}>
          {liked ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
          <span>{liked ? Number(post.likesCount) + 1 : Number(post.likesCount)}</span>
        </button>
        <button className="fo-post-action">
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>{Number(post.commentsCount)}</span>
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

  // Fetch creator data from contract
  const { creatorAddress, creator, tiers, isLoading: isLoadingCreator } = useCreatorByUsername(username);

  // Fetch subscription status
  const { isSubscribed, subscription, isLoading: isLoadingSubscription } = useSubscription(creatorAddress);

  // Fetch creator posts
  const { posts, isLoading: isLoadingPosts } = useCreatorPosts(creatorAddress, 0, 50);

  // Subscribe hook
  const { subscribe, isPending: isSubscribing } = useSubscribe();

  // Determine if we have on-chain data or should use mock
  const hasOnChainData = !!creatorAddress && !!creator && creator.isActive;

  // Use real data or fallback to mock
  const displayCreator = hasOnChainData
    ? {
        address: creatorAddress as `0x${string}`,
        username: creator!.username,
        displayName: creator!.displayName,
        bio: creator!.bio,
        profileImageCID: creator!.profileImageCID,
        bannerImageCID: creator!.bannerImageCID,
        isVerified: creator!.isVerified,
        isActive: creator!.isActive,
        totalSubscribers: creator!.totalSubscribers,
        totalEarnings: creator!.totalEarnings,
        createdAt: creator!.createdAt,
        tiers: tiers,
      }
    : { ...mockCreator, username };

  const displayPosts = hasOnChainData && posts.length > 0 ? posts : mockPosts;
  const displayTiers = displayCreator.tiers;

  const subscribedTierId = subscription?.tierId ?? BigInt(-1);

  const handleSubscribe = async (tierIndex: number, price: bigint) => {
    if (!connectedAddress) {
      alert("Please connect your wallet");
      return;
    }

    if (!creatorAddress) {
      alert("Creator not found on-chain");
      return;
    }

    try {
      await subscribe(creatorAddress, BigInt(tierIndex), price);
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };

  const formatJoinDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const isLoading = isLoadingCreator || isLoadingSubscription;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Loading skeleton */}
        <div className="h-48 md:h-64 bg-base-300 animate-pulse" />
        <div className="max-w-4xl mx-auto px-4">
          <div className="-mt-16 md:-mt-20 mb-4">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-base-300 animate-pulse" />
          </div>
          <div className="h-8 bg-base-300 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-base-300 rounded w-1/4 mb-4 animate-pulse" />
          <div className="h-20 bg-base-300 rounded mb-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-[--fo-primary] to-[--fo-accent] relative overflow-hidden">
        {displayCreator.bannerImageCID && (
          <Image src={getIpfsUrl(displayCreator.bannerImageCID)} alt="" fill className="object-cover" unoptimized />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Header */}
      <div className="fo-profile-header">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Avatar */}
          <div className="-mt-16 md:-mt-20">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-1 ring-4 ring-base-100 overflow-hidden">
              {displayCreator.profileImageCID ? (
                <Image
                  src={getIpfsUrl(displayCreator.profileImageCID)}
                  alt={displayCreator.displayName}
                  width={156}
                  height={156}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-4xl md:text-5xl font-bold text-[--fo-primary]">
                  {displayCreator.displayName.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{displayCreator.displayName}</h1>
              {displayCreator.isVerified && <CheckBadgeIcon className="w-6 h-6 text-[--fo-primary]" />}
            </div>
            <p className="text-[--fo-text-secondary] mb-2">@{displayCreator.username}</p>
            <div className="flex items-center gap-1 text-sm text-[--fo-text-muted]">
              <Address address={displayCreator.address} />
            </div>
            {!hasOnChainData && (
              <span className="inline-block mt-2 px-2 py-1 bg-amber-500/10 text-amber-600 text-xs rounded">
                Demo Profile
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-4">
            {connectedAddress === displayCreator.address ? (
              <Link href="/settings" className="fo-btn-secondary">
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
        <p className="text-base-content mb-6">{displayCreator.bio}</p>

        <div className="flex gap-8 mb-6">
          <div className="fo-stat">
            <div className="fo-stat-value">{Number(displayCreator.totalSubscribers)}</div>
            <div className="fo-stat-label">Subscribers</div>
          </div>
          <div className="fo-stat">
            <div className="fo-stat-value">{displayPosts.length}</div>
            <div className="fo-stat-label">Posts</div>
          </div>
          <div className="fo-stat">
            <div className="fo-stat-value">{displayTiers.filter(t => t.isActive).length}</div>
            <div className="fo-stat-label">Tiers</div>
          </div>
        </div>

        {/* Subscription Tiers */}
        {!isSubscribed && displayTiers.length > 0 && (
          <div id="tiers" className="mb-8 scroll-mt-20">
            <h2 className="text-xl font-bold mb-4">Subscription Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayTiers.map((tier, index) => (
                <TierCard
                  key={index}
                  tier={tier}
                  isCurrentTier={isSubscribed && Number(subscribedTierId) === index}
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
            {isLoadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="fo-card p-4 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-base-300" />
                      <div className="flex-1">
                        <div className="h-4 bg-base-300 rounded w-1/4 mb-1" />
                        <div className="h-3 bg-base-300 rounded w-1/6" />
                      </div>
                    </div>
                    <div className="h-4 bg-base-300 rounded w-3/4 mb-4" />
                    <div className="h-48 bg-base-300 rounded" />
                  </div>
                ))}
              </div>
            ) : displayPosts.length > 0 ? (
              displayPosts.map(post => (
                <PostCard
                  key={Number(post.id)}
                  post={post}
                  creatorName={displayCreator.displayName}
                  creatorVerified={displayCreator.isVerified}
                  profileImageCID={displayCreator.profileImageCID}
                  isSubscribed={isSubscribed}
                  subscribedTierId={subscribedTierId}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <PhotoIcon className="w-16 h-16 mx-auto text-[--fo-text-muted] mb-4" />
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-[--fo-text-secondary]">This creator hasn&apos;t posted anything yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "media" && (
          <div className="grid grid-cols-3 gap-1">
            {displayPosts
              .filter(p => p.contentType === 1 || p.contentType === 2)
              .map(post => {
                const canView =
                  post.accessLevel === AccessLevel.PUBLIC ||
                  (isSubscribed && post.accessLevel === AccessLevel.SUBSCRIBERS) ||
                  (isSubscribed && subscribedTierId >= post.requiredTierId);

                return (
                  <div
                    key={Number(post.id)}
                    className="aspect-square bg-gradient-to-br from-[--fo-primary]/20 to-[--fo-accent]/20 relative overflow-hidden"
                  >
                    {canView && post.contentCID ? (
                      <Image src={getIpfsUrl(post.contentCID)} alt="" fill className="object-cover" unoptimized />
                    ) : canView ? (
                      <PhotoIcon className="w-8 h-8 text-[--fo-text-muted] absolute inset-0 m-auto" />
                    ) : (
                      <div className="absolute inset-0 bg-base-300/80 backdrop-blur flex items-center justify-center">
                        <LockClosedIcon className="w-8 h-8 text-[--fo-text-muted]" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {activeTab === "about" && (
          <div className="fo-card p-6">
            <h3 className="font-bold mb-4">About {displayCreator.displayName}</h3>
            <p className="text-[--fo-text-secondary] mb-4">{displayCreator.bio}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[--fo-text-muted]">Joined</span>
                <span>{formatJoinDate(displayCreator.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--fo-text-muted]">Wallet</span>
                <Address address={displayCreator.address} />
              </div>
              {hasOnChainData && (
                <div className="flex justify-between">
                  <span className="text-[--fo-text-muted]">Total Earned</span>
                  <span className="font-semibold text-green-600">{formatEther(displayCreator.totalEarnings)} MNT</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorProfilePage;
