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
import { PostComments } from "~~/components/fansonly/PostComments";
import { SubscriptionTier, getIpfsUrl, useCreatorByUsername, useSubscribe, useSubscription } from "~~/hooks/fansonly";
import { AccessLevel, Post, useCreatorPosts, useLikePost, usePost, useUnlikePost } from "~~/hooks/fansonly";

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
  const [showComments, setShowComments] = useState(false);
  // Fetch the post with the connected user's address for access control
  const { post: userPost, canAccess } = usePost(post.id);
  const { hasLiked, refetch: refetchPost } = usePost(post.id);
  const { likePost, isPending: isLiking } = useLikePost();
  const { unlikePost, isPending: isUnliking } = useUnlikePost();

  // Check if user can view this content
  const canView =
    post.accessLevel === AccessLevel.PUBLIC ||
    (isSubscribed && post.accessLevel === AccessLevel.SUBSCRIBERS) ||
    (isSubscribed && post.accessLevel === AccessLevel.TIER_GATED && subscribedTierId >= post.requiredTierId) ||
    canAccess;

  // Use the user's post data for contentCID if available and user can access
  const contentCID = canView && userPost?.contentCID ? userPost.contentCID : post.contentCID;

  // Debug log for troubleshooting image display
  if (typeof window !== "undefined") {
    console.log("[PostCard debug] post.id:", post.id.toString(), {
      userPost,
      canAccess,
      isSubscribed,
      post,
      contentCID,
      canView,
      connectedAddress: typeof window !== "undefined" ? window.ethereum?.selectedAddress : undefined,
    });
  }

  const handleLikeToggle = async () => {
    try {
      if (hasLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
      refetchPost();
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

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
        <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 overflow-hidden">
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

      {/* Media - only show for non-text posts */}
      {post.contentType !== 0 && (
        <div className="relative">
          {canView ? (
            <div className="fo-post-media bg-slate-800 flex items-center justify-center">
              {contentCID ? (
                <Image src={getIpfsUrl(contentCID)} alt="" fill className="object-cover" unoptimized />
              ) : (
                <PhotoIcon className="w-16 h-16 text-[--fo-text-muted]" />
              )}
            </div>
          ) : (
            <div className="fo-post-media relative">
              <div className="absolute inset-0 bg-slate-800" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
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
      )}

      {/* Actions */}
      <div className="fo-post-actions">
        <button className="fo-post-action" onClick={handleLikeToggle} disabled={isLiking || isUnliking}>
          {hasLiked ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
          <span>{Number(post.likesCount)}</span>
        </button>
        <button
          className={`fo-post-action ${showComments ? "text-fo-primary" : ""}`}
          onClick={() => setShowComments(!showComments)}
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>{Number(post.commentsCount)}</span>
        </button>
        <button className="fo-post-action ml-auto">
          <ShareIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      <PostComments postId={post.id} isExpanded={showComments} />
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
  const { posts, postCount, isLoading: isLoadingPosts } = useCreatorPosts(creatorAddress, 0, 50);

  // Subscribe hook
  const { subscribe, isPending: isSubscribing } = useSubscribe();

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
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

  // Creator not found
  if (!creator || !creator.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
            <PhotoIcon className="w-10 h-10 text-[--fo-text-muted]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Creator Not Found</h2>
          <p className="text-[--fo-text-secondary] mb-6">
            The creator @{username} doesn&apos;t exist or hasn&apos;t registered yet.
          </p>
          <Link href="/explore" className="fo-btn-primary inline-block">
            Explore Creators
          </Link>
        </div>
      </div>
    );
  }

  const activeTiers = tiers.filter(t => t.isActive);
  // Show all active posts, including locked ones
  const activePosts = posts.filter(p => p.isActive);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-48 md:h-64 bg-slate-800 relative overflow-hidden">
        {creator.bannerImageCID && (
          <Image src={getIpfsUrl(creator.bannerImageCID)} alt="" fill className="object-cover" unoptimized />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Header */}
      <div className="fo-profile-header">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Avatar */}
          <div className="-mt-16 md:-mt-20">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-700 border-4 border-slate-900 ring-4 ring-base-100 overflow-hidden">
              {creator.profileImageCID ? (
                <Image
                  src={getIpfsUrl(creator.profileImageCID)}
                  alt={creator.displayName}
                  width={156}
                  height={156}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-4xl md:text-5xl font-bold text-[--fo-primary]">
                  {creator.displayName.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{creator.displayName}</h1>
              {creator.isVerified && <CheckBadgeIcon className="w-6 h-6 text-[--fo-primary]" />}
            </div>
            <p className="text-[--fo-text-muted] mb-2">@{creator.username}</p>
            <div className="text-sm text-[--fo-text-secondary]">
              <Address address={creatorAddress as `0x${string}`} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-4">
            {connectedAddress === creatorAddress ? (
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
        <p className="text-base-content mb-6">{creator.bio || "No bio yet."}</p>

        <div className="flex flex-wrap gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{Number(creator.totalSubscribers)}</div>
            <div className="text-sm text-[--fo-text-muted]">Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{postCount}</div>
            <div className="text-sm text-[--fo-text-muted]">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{activeTiers.length}</div>
            <div className="text-sm text-[--fo-text-muted]">Tiers</div>
          </div>
        </div>

        <div className="text-sm text-[--fo-text-muted]">Joined {formatJoinDate(creator.createdAt)}</div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[--fo-border] sticky top-16 z-10 bg-base-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex">
            {(["posts", "media", "about"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium border-b-2 transition-colors capitalize ${
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
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "posts" && (
          <div className="space-y-4">
            {isLoadingPosts ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <div key={i} className="fo-post-card animate-pulse">
                  <div className="fo-post-header">
                    <div className="w-10 h-10 rounded-full bg-base-300" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-base-300 rounded w-24" />
                      <div className="h-3 bg-base-300 rounded w-16" />
                    </div>
                  </div>
                  <div className="fo-post-content">
                    <div className="h-4 bg-base-300 rounded w-full mb-2" />
                    <div className="h-4 bg-base-300 rounded w-2/3" />
                  </div>
                  <div className="h-48 bg-base-300 rounded" />
                </div>
              ))
            ) : activePosts.length > 0 ? (
              activePosts.map(post => (
                <PostCard
                  key={post.id.toString()}
                  post={post}
                  creatorName={creator.displayName}
                  creatorVerified={creator.isVerified}
                  profileImageCID={creator.profileImageCID}
                  isSubscribed={isSubscribed}
                  subscribedTierId={subscribedTierId}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-[--fo-text-secondary]">
                  {connectedAddress === creatorAddress
                    ? "Create your first post to share with your subscribers!"
                    : "This creator hasn't posted anything yet."}
                </p>
                {connectedAddress === creatorAddress && (
                  <Link href="/create" className="fo-btn-primary mt-4 inline-block">
                    Create Post
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "media" && (
          <div className="grid grid-cols-3 gap-1">
            {activePosts
              .filter(p => p.contentType !== 0 && p.contentCID)
              .map(post => (
                <div key={post.id.toString()} className="aspect-square bg-base-300 relative overflow-hidden">
                  <Image src={getIpfsUrl(post.contentCID)} alt="" fill className="object-cover" unoptimized />
                </div>
              ))}
            {activePosts.filter(p => p.contentType !== 0 && p.contentCID).length === 0 && (
              <div className="col-span-3 text-center py-16">
                <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
                <p className="text-[--fo-text-secondary]">No media posts yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="fo-card p-6">
            <h3 className="font-bold mb-4">About {creator.displayName}</h3>
            <p className="text-[--fo-text-secondary] mb-6">{creator.bio || "No bio provided."}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[--fo-text-muted]">Joined</span>
                <span>{formatJoinDate(creator.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--fo-text-muted]">Total Subscribers</span>
                <span>{Number(creator.totalSubscribers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--fo-text-muted]">Total Posts</span>
                <span>{postCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Tiers */}
      <div id="tiers" className="bg-base-200 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Subscription Tiers</h2>
          {activeTiers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeTiers.map((tier, index) => (
                <TierCard
                  key={index}
                  tier={tier}
                  isCurrentTier={isSubscribed && subscribedTierId === BigInt(index)}
                  onSubscribe={() => handleSubscribe(index, tier.price)}
                  isLoading={isSubscribing}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[--fo-text-secondary]">No subscription tiers available yet.</p>
              {connectedAddress === creatorAddress && (
                <Link href="/earnings" className="fo-btn-primary mt-4 inline-block">
                  Create Tiers
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorProfilePage;
