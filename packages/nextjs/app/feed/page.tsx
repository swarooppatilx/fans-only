"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign,
  Heart,
  Home as HomeIcon,
  ImageIcon,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Sparkles,
} from "lucide-react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import {
  AccessLevel,
  ContentType,
  Post,
  useCreatorPosts,
  useLikePost,
  usePost,
  useUnlikePost,
} from "~~/hooks/fansonly";
import {
  Creator,
  Subscription,
  getIpfsUrl,
  useAllCreators,
  useCreator,
  useCurrentCreator,
  useSubscription,
} from "~~/hooks/fansonly/useCreatorProfile";

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
}

function PostCard({ post, isSubscribed, subscribedTierId, hasLiked, onLike, onUnlike }: PostCardProps) {
  const [localLiked, setLocalLiked] = useState(hasLiked);
  const [localLikeCount, setLocalLikeCount] = useState(Number(post.likesCount));

  // Fetch the post with the connected user's address for access control (profile logic)
  const { post: userPost, canAccess } = usePost(post.id);

  const canView =
    post.accessLevel === AccessLevel.PUBLIC ||
    (isSubscribed && post.accessLevel === AccessLevel.SUBSCRIBERS) ||
    (isSubscribed && post.accessLevel === AccessLevel.TIER_GATED && subscribedTierId >= post.requiredTierId) ||
    canAccess;

  // Use the user's post data for contentCID if available and user can access
  const contentCID = canView && userPost?.contentCID ? userPost.contentCID : post.contentCID;

  const formatTimeAgo = (timestamp: bigint) => {
    const seconds = Math.floor(Date.now() / 1000 - Number(timestamp));
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const handleLikeClick = () => {
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

  const username = post.creatorData?.username || post.creator.slice(0, 8);
  const displayName = post.creatorData?.displayName || `Creator ${post.creator.slice(0, 6)}`;

  return (
    <div className="border-b border-slate-800 p-4 hover:bg-slate-900/50 transition-colors">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Link href={`/creator/${username}`}>
            {post.creatorData?.profileImageCID ? (
              <Image
                src={getIpfsUrl(post.creatorData.profileImageCID)}
                alt={displayName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border border-slate-700"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-[#00aff0]">
                {displayName.charAt(0)}
              </div>
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={`/creator/${username}`} className="font-bold text-slate-100 hover:underline cursor-pointer">
                {displayName}
              </Link>
              {post.creatorData?.isVerified && <CheckBadgeIcon className="w-4 h-4 text-[#00aff0]" />}
              <span className="text-slate-500 text-sm">
                @{username} · {formatTimeAgo(post.createdAt)}
              </span>
            </div>
            <button className="text-slate-500 hover:text-[#00aff0]">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Text Body */}
          <p className="mt-1 text-slate-200 whitespace-pre-wrap leading-relaxed">{post.caption}</p>

          {/* Media / Locked Content */}
          {post.contentType !== ContentType.TEXT && (
            <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              {canView && contentCID ? (
                <Image
                  src={getIpfsUrl(contentCID)}
                  alt="Post content"
                  width={600}
                  height={400}
                  className="w-full h-auto max-h-[500px] object-cover"
                  unoptimized
                />
              ) : (
                <div className="relative w-full h-64 md:h-80 group">
                  {/* Blurry Background */}
                  <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-md"></div>

                  {/* Lock Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-[#00aff0] shadow-sm border border-slate-700">
                      <Lock size={26} />
                    </div>
                    <h3 className="text-slate-100 font-bold text-lg mb-1">Premium Content</h3>
                    <p className="text-slate-400 text-sm mb-5 font-medium">
                      {post.accessLevel === AccessLevel.SUBSCRIBERS
                        ? "Subscribe to unlock this content"
                        : `Tier ${Number(post.requiredTierId) + 1} required`}
                    </p>
                    <Link
                      href={`/creator/${username}`}
                      className="bg-[#00aff0] hover:bg-[#009bd6] text-white border-none px-8 py-2.5 text-sm font-bold rounded-full transition-all"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-2 text-sm group ${localLiked ? "text-rose-500" : "text-slate-500 hover:text-rose-500"}`}
            >
              <div className="p-2 rounded-full group-hover:bg-rose-500/10 transition-colors">
                <Heart size={18} fill={localLiked ? "currentColor" : "none"} />
              </div>
              <span className="font-medium">{localLikeCount}</span>
            </button>

            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00aff0] group">
              <div className="p-2 rounded-full group-hover:bg-[#00aff0]/10 transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="font-medium">{Number(post.commentsCount)}</span>
            </button>

            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-500 group">
              <div className="p-2 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                <DollarSign size={18} />
              </div>
              <span className="font-medium">Tip</span>
            </button>

            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00aff0] group">
              <div className="p-2 rounded-full group-hover:bg-[#00aff0]/10 transition-colors">
                <Share2 size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that handles like actions
function PostCardWithActions({
  post,
  isSubscribed,
  subscribedTierId,
  hasLiked: initialHasLiked,
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
    />
  );
}

// Loading skeleton for posts
const PostSkeleton = () => (
  <div className="border-b border-slate-800 p-4 animate-pulse">
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-800"></div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 w-24 bg-slate-800 rounded"></div>
          <div className="h-3 w-32 bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
        </div>
        <div className="rounded-2xl h-64 bg-slate-800"></div>
        <div className="mt-3 flex gap-8">
          <div className="h-5 w-12 bg-slate-800 rounded"></div>
          <div className="h-5 w-12 bg-slate-800 rounded"></div>
          <div className="h-5 w-12 bg-slate-800 rounded"></div>
        </div>
      </div>
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
        // Always include all active posts, even if locked (contentCID may be empty)
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

  const isLoading = isLoadingCreators;
  const hasPosts = filteredPosts.length > 0;

  // Not connected - show connect prompt
  if (!isConnected) {
    return (
      <div className="flex-1 min-h-screen border-r border-slate-800 max-w-2xl w-full bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <HomeIcon className="w-10 h-10 text-[#00aff0]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-100">Your Feed Awaits</h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to see posts from creators you follow and discover new content.
          </p>
          <Link
            href="/explore"
            className="px-6 py-3 bg-[#00aff0] hover:bg-[#009bd6] text-white font-semibold rounded-full transition-all duration-200 inline-block"
          >
            Explore Creators
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen border-r border-slate-800 max-w-2xl w-full bg-slate-900">
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

      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Home</h2>
        <div className="flex gap-4 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveFilter("subscribed")}
            className={`py-3 -my-3 cursor-pointer transition-colors ${
              activeFilter === "subscribed" ? "text-slate-100 border-b-2 border-[#00aff0]" : "hover:text-[#00aff0]"
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveFilter("all")}
            className={`py-3 -my-3 cursor-pointer flex items-center gap-1 transition-colors ${
              activeFilter === "all" ? "text-slate-100 border-b-2 border-[#00aff0]" : "hover:text-[#00aff0]"
            }`}
          >
            For You <Sparkles size={14} className="text-amber-400" />
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col pb-20">
        {/* Create Post CTA for Creators */}
        {isConnected && isCreator && (
          <Link href="/create" className="block border-b border-slate-800">
            <div className="p-4 flex items-center gap-3 hover:bg-slate-900/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-[#00aff0]">
                {currentCreator?.displayName?.charAt(0) || "?"}
              </div>
              <span className="text-slate-500 flex-1">What&apos;s on your mind?</span>
              <span className="px-4 py-2 bg-[#00aff0] hover:bg-[#009bd6] text-white text-sm font-semibold rounded-full transition-all">
                Post
              </span>
            </div>
          </Link>
        )}

        {/* Loading State */}
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : hasPosts ? (
          <>
            {filteredPosts.map(post => {
              const subData = subscriptionMap.get(post.creator);
              return (
                <PostCardWithActions
                  key={`${post.creator}-${post.id}`}
                  post={post}
                  isSubscribed={subData?.isSubscribed || false}
                  subscribedTierId={subData?.subscription?.tierId ?? BigInt(0)}
                  hasLiked={likedPostsSet.has(post.id.toString())}
                />
              );
            })}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-100">
              {activeFilter === "subscribed" ? "No subscribed content yet" : "No posts yet"}
            </h3>
            <p className="text-slate-400 mb-6">
              {activeFilter === "subscribed"
                ? "Subscribe to creators to see their posts here"
                : "Be the first to explore our creators"}
            </p>
            <Link
              href="/explore"
              className="px-6 py-3 bg-[#00aff0] hover:bg-[#009bd6] text-white font-semibold rounded-full transition-all duration-200 inline-block"
            >
              Explore Creators
            </Link>
          </div>
        )}

        <div className="p-12 text-center text-slate-600 text-sm">You&apos;ve reached the end of the internet 🚀</div>
      </div>
    </div>
  );
};

export default FeedPage;
