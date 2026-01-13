"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  AccessLevel,
  ContentType,
  Post,
  useCreatorPosts,
  useLikePost,
  useUnlikePost,
} from "~~/hooks/fansonly/useContentPost";
import {
  Creator,
  Subscription,
  getIpfsUrl,
  useAllCreators,
  useCreator,
  useCurrentCreator,
  useSubscription,
} from "~~/hooks/fansonly/useCreatorProfile";

// Mock feed posts for demo when no on-chain data exists
const mockFeedPosts = [
  {
    id: BigInt(1),
    creator: "0x1234567890123456789012345678901234567890",
    creatorData: {
      username: "cryptoartist",
      displayName: "Crypto Artist",
      profileImageCID: "",
      isVerified: true,
    },
    contentCID: "",
    previewCID: "",
    caption:
      "Just dropped a new piece! 🎨 This one took me 3 weeks to complete. The details in the background represent the chaos of the crypto markets.",
    contentType: ContentType.IMAGE,
    accessLevel: AccessLevel.PUBLIC,
    requiredTierId: BigInt(0),
    likesCount: BigInt(142),
    commentsCount: BigInt(23),
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 3600),
    isActive: true,
  },
  {
    id: BigInt(2),
    creator: "0x2345678901234567890123456789012345678901",
    creatorData: {
      username: "defi_guru",
      displayName: "DeFi Guru",
      profileImageCID: "",
      isVerified: true,
    },
    contentCID: "",
    previewCID: "",
    caption:
      "🔥 Alpha Alert: New yield farming strategy that's been printing. Full breakdown in this exclusive video for subscribers only!",
    contentType: ContentType.VIDEO,
    accessLevel: AccessLevel.SUBSCRIBERS,
    requiredTierId: BigInt(0),
    likesCount: BigInt(89),
    commentsCount: BigInt(15),
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 7200),
    isActive: true,
  },
  {
    id: BigInt(3),
    creator: "0x3456789012345678901234567890123456789012",
    creatorData: {
      username: "web3_dev",
      displayName: "Web3 Developer",
      profileImageCID: "",
      isVerified: false,
    },
    contentCID: "",
    previewCID: "",
    caption:
      "Tutorial: Building a gas-optimized NFT marketplace in Solidity. Part 1 covers the core listing logic. Code repo in comments! 💻",
    contentType: ContentType.TEXT,
    accessLevel: AccessLevel.PUBLIC,
    requiredTierId: BigInt(0),
    likesCount: BigInt(256),
    commentsCount: BigInt(42),
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 14400),
    isActive: true,
  },
];

// Extended post type with creator data
interface FeedPost extends Post {
  creatorData?: {
    username: string;
    displayName: string;
    profileImageCID: string;
    isVerified: boolean;
  };
}

// Component to fetch posts for a single creator
function CreatorPostsFetcher({
  creatorAddress,
  onPostsLoaded,
}: {
  creatorAddress: string;
  onPostsLoaded: (posts: Post[], creatorAddress: string) => void;
}) {
  const { posts, isLoading } = useCreatorPosts(creatorAddress, 0, 20);

  useEffect(() => {
    if (!isLoading && posts.length > 0) {
      onPostsLoaded(posts, creatorAddress);
    }
  }, [posts, isLoading, creatorAddress, onPostsLoaded]);

  return null;
}

// Component to fetch creator data for a post
function CreatorDataFetcher({
  creatorAddress,
  onCreatorLoaded,
}: {
  creatorAddress: string;
  onCreatorLoaded: (creator: Creator, address: string) => void;
}) {
  const { creator, isLoading } = useCreator(creatorAddress);

  useEffect(() => {
    if (!isLoading && creator?.isActive) {
      onCreatorLoaded(creator, creatorAddress);
    }
  }, [creator, isLoading, creatorAddress, onCreatorLoaded]);

  return null;
}

// Component to fetch subscription status
function SubscriptionFetcher({
  creatorAddress,
  onSubscriptionLoaded,
}: {
  creatorAddress: string;
  onSubscriptionLoaded: (isSubscribed: boolean, subscription: Subscription | undefined, address: string) => void;
}) {
  const { isSubscribed, subscription, isLoading } = useSubscription(creatorAddress);

  useEffect(() => {
    if (!isLoading) {
      onSubscriptionLoaded(isSubscribed, subscription, creatorAddress);
    }
  }, [isSubscribed, subscription, isLoading, creatorAddress, onSubscriptionLoaded]);

  return null;
}

interface PostCardProps {
  post: FeedPost;
  isSubscribed: boolean;
  subscribedTierId: bigint;
  hasLiked: boolean;
  onLike: () => void;
  onUnlike: () => void;
  isDemo?: boolean;
}

const PostCard = ({
  post,
  isSubscribed,
  subscribedTierId,
  hasLiked,
  onLike,
  onUnlike,
  isDemo = false,
}: PostCardProps) => {
  const [localLiked, setLocalLiked] = useState(hasLiked);
  const [localLikeCount, setLocalLikeCount] = useState(Number(post.likesCount));

  const canView =
    post.accessLevel === AccessLevel.PUBLIC ||
    (post.accessLevel === AccessLevel.SUBSCRIBERS && isSubscribed) ||
    (post.accessLevel === AccessLevel.TIER_GATED && subscribedTierId >= post.requiredTierId);

  const formatTimeAgo = (timestamp: bigint) => {
    const seconds = Math.floor(Date.now() / 1000 - Number(timestamp));
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const handleLikeClick = () => {
    if (isDemo) {
      setLocalLiked(!localLiked);
      setLocalLikeCount(prev => (localLiked ? prev - 1 : prev + 1));
      return;
    }

    if (localLiked) {
      onUnlike();
      setLocalLiked(false);
      setLocalLikeCount(prev => prev - 1);
    } else {
      onLike();
      setLocalLiked(true);
      setLocalLikeCount(prev => prev + 1);
    }
  };

  const contentTypeIcons = ["📝", "🖼️", "🎬", "🎵", "📦"];
  const username = post.creatorData?.username || post.creator.slice(0, 8);
  const displayName = post.creatorData?.displayName || `Creator ${post.creator.slice(0, 6)}`;

  return (
    <div className="fo-post-card relative">
      {/* Demo Badge */}
      {isDemo && (
        <div className="absolute top-2 right-2 bg-warning/20 text-warning text-xs px-2 py-0.5 rounded-full z-10">
          Demo
        </div>
      )}

      {/* Header */}
      <div className="fo-post-header">
        <Link href={`/creator/${username}`} className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-0.5">
            {post.creatorData?.profileImageCID ? (
              <Image
                src={getIpfsUrl(post.creatorData.profileImageCID)}
                alt={displayName}
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-sm font-bold text-[--fo-primary]">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold hover:text-[--fo-primary] transition-colors">{displayName}</span>
              {post.creatorData?.isVerified && <CheckBadgeIcon className="w-4 h-4 text-[--fo-primary]" />}
            </div>
            <div className="text-sm text-[--fo-text-muted]">
              @{username} · {formatTimeAgo(post.createdAt)}
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
      {post.contentType !== ContentType.TEXT && (
        <div className="relative">
          {canView ? (
            <div className="fo-post-media bg-gradient-to-br from-[--fo-primary]/20 to-[--fo-accent]/20 flex items-center justify-center">
              {post.contentCID ? (
                <Image src={getIpfsUrl(post.contentCID)} alt="Post content" fill className="object-cover" unoptimized />
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
                  {post.accessLevel === AccessLevel.SUBSCRIBERS
                    ? "Subscribe to unlock"
                    : `Tier ${Number(post.requiredTierId) + 1} required`}
                </p>
                <Link href={`/creator/${username}`} className="fo-btn-subscribe text-xs py-2 px-4">
                  View Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="fo-post-actions">
        <button className="fo-post-action" onClick={handleLikeClick}>
          {localLiked ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
          <span>{localLikeCount}</span>
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

// Wrapper component that handles like actions
function PostCardWithActions({
  post,
  isSubscribed,
  subscribedTierId,
  hasLiked: initialHasLiked,
  isDemo,
}: Omit<PostCardProps, "onLike" | "onUnlike">) {
  const { likePost } = useLikePost();
  const { unlikePost } = useUnlikePost();

  const handleLike = () => {
    likePost(post.id);
  };

  const handleUnlike = () => {
    unlikePost(post.id);
  };

  return (
    <PostCard
      post={post}
      isSubscribed={isSubscribed}
      subscribedTierId={subscribedTierId}
      hasLiked={initialHasLiked}
      onLike={handleLike}
      onUnlike={handleUnlike}
      isDemo={isDemo}
    />
  );
}

// Loading skeleton for posts
const PostSkeleton = () => (
  <div className="fo-post-card animate-pulse">
    <div className="fo-post-header">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-base-300"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-base-300 rounded"></div>
          <div className="h-3 w-32 bg-base-300 rounded"></div>
        </div>
      </div>
    </div>
    <div className="fo-post-content space-y-2">
      <div className="h-4 bg-base-300 rounded w-full"></div>
      <div className="h-4 bg-base-300 rounded w-3/4"></div>
    </div>
    <div className="fo-post-media bg-base-300"></div>
    <div className="fo-post-actions">
      <div className="h-5 w-16 bg-base-300 rounded"></div>
      <div className="h-5 w-16 bg-base-300 rounded"></div>
    </div>
  </div>
);

const FeedPage: NextPage = () => {
  const { isConnected } = useAccount();
  const [activeFilter, setActiveFilter] = useState<"all" | "subscribed">("all");
  const [allPosts, setAllPosts] = useState<Map<string, Post[]>>(new Map());
  const [creatorDataMap, setCreatorDataMap] = useState<Map<string, Creator>>(new Map());
  const [subscriptionMap, setSubscriptionMap] = useState<
    Map<string, { isSubscribed: boolean; subscription?: Subscription }>
  >(new Map());
  const [likedPostsSet] = useState<Set<string>>(new Set());

  // Get current user's creator profile
  const { isCreator, creator: currentCreator } = useCurrentCreator();

  // Get all creator addresses
  const { creatorAddresses, isLoading: isLoadingCreators } = useAllCreators(0, 50);

  // Callbacks for fetching data
  const handlePostsLoaded = useCallback((posts: Post[], creatorAddress: string) => {
    setAllPosts(prev => {
      const next = new Map(prev);
      next.set(creatorAddress, posts);
      return next;
    });
  }, []);

  const handleCreatorLoaded = useCallback((creator: Creator, address: string) => {
    setCreatorDataMap(prev => {
      const next = new Map(prev);
      next.set(address, creator);
      return next;
    });
  }, []);

  const handleSubscriptionLoaded = useCallback(
    (isSubscribed: boolean, subscription: Subscription | undefined, address: string) => {
      setSubscriptionMap(prev => {
        const next = new Map(prev);
        next.set(address, { isSubscribed, subscription });
        return next;
      });
    },
    [],
  );

  // Merge all posts and sort by date
  const feedPosts: FeedPost[] = useMemo(() => {
    const posts: FeedPost[] = [];

    allPosts.forEach((creatorPosts, creatorAddress) => {
      const creatorData = creatorDataMap.get(creatorAddress);
      creatorPosts.forEach(post => {
        if (post.isActive) {
          posts.push({
            ...post,
            creatorData: creatorData
              ? {
                  username: creatorData.username,
                  displayName: creatorData.displayName,
                  profileImageCID: creatorData.profileImageCID,
                  isVerified: creatorData.isVerified,
                }
              : undefined,
          });
        }
      });
    });

    // Sort by creation date (newest first)
    return posts.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }, [allPosts, creatorDataMap]);

  // Filter posts based on subscription
  const filteredPosts = useMemo(() => {
    if (activeFilter === "subscribed") {
      return feedPosts.filter(post => {
        const subData = subscriptionMap.get(post.creator);
        return subData?.isSubscribed;
      });
    }
    return feedPosts;
  }, [feedPosts, activeFilter, subscriptionMap]);

  // Determine if we should show mock data
  const hasRealPosts = feedPosts.length > 0;
  const displayPosts = hasRealPosts ? filteredPosts : mockFeedPosts.map(p => ({ ...p }) as unknown as FeedPost);
  const isDemo = !hasRealPosts;

  const isLoading = isLoadingCreators;

  return (
    <div className="min-h-screen">
      {/* Hidden data fetchers */}
      {creatorAddresses.map(address => (
        <CreatorPostsFetcher key={`posts-${address}`} creatorAddress={address} onPostsLoaded={handlePostsLoaded} />
      ))}
      {creatorAddresses.map(address => (
        <CreatorDataFetcher key={`creator-${address}`} creatorAddress={address} onCreatorLoaded={handleCreatorLoaded} />
      ))}
      {isConnected &&
        creatorAddresses.map(address => (
          <SubscriptionFetcher
            key={`sub-${address}`}
            creatorAddress={address}
            onSubscriptionLoaded={handleSubscriptionLoaded}
          />
        ))}

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
                  {currentCreator?.displayName?.charAt(0) || "?"}
                </div>
              </div>
              <span className="text-[--fo-text-muted] flex-1">What&apos;s on your mind?</span>
              <span className="fo-btn-primary text-sm py-2 px-4">Post</span>
            </div>
          </Link>
        )}

        {/* Demo Mode Banner */}
        {isDemo && displayPosts.length > 0 && (
          <div className="bg-info/10 border border-info/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-info">
              <strong>Demo Mode:</strong> Showing sample posts. Real posts from on-chain creators will appear here once
              content is created.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : displayPosts.length > 0 ? (
          <div className="space-y-4">
            {displayPosts.map(post => {
              const subData = subscriptionMap.get(post.creator);
              return (
                <PostCardWithActions
                  key={`${post.creator}-${post.id}`}
                  post={post}
                  isSubscribed={isDemo || subData?.isSubscribed || false}
                  subscribedTierId={subData?.subscription?.tierId ?? BigInt(0)}
                  hasLiked={likedPostsSet.has(post.id.toString())}
                  isDemo={isDemo}
                />
              );
            })}
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
        {displayPosts.length > 0 && (
          <div className="text-center py-8">
            <button className="fo-btn-secondary">Load More</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
