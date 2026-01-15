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
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
  LockClosedIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { EditProfileModal } from "~~/components/fansonly/EditProfileModal";
import { PostComments } from "~~/components/fansonly/PostComments";
import { ShareButton } from "~~/components/fansonly/ShareButton";
import TipModal from "~~/components/fansonly/TipModal";
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
    <div
      className={`bg-slate-800 border rounded-xl p-5 transition-colors ${
        isCurrentTier ? "border-[#00aff0]" : "border-slate-700 hover:border-slate-600"
      }`}
    >
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{tier.name}</h3>
      <div className="text-2xl font-bold text-[#00aff0] mb-2">{priceInEth} MNT</div>
      <p className="text-sm text-slate-400 mb-4">{tier.description}</p>
      {isCurrentTier ? (
        <div className="inline-block px-3 py-1 bg-[#00aff0]/10 text-[#00aff0] text-sm font-medium rounded-full">
          Subscribed
        </div>
      ) : (
        <button
          onClick={onSubscribe}
          disabled={isLoading || !tier.isActive}
          className="w-full py-2 bg-[#00aff0] hover:bg-[#009bd6] disabled:opacity-50 text-white font-medium rounded-full transition-colors text-sm"
        >
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
  const { post: userPost, canAccess } = usePost(post.id);
  const { hasLiked, refetch: refetchPost } = usePost(post.id);
  const { likePost, isPending: isLiking } = useLikePost();
  const { unlikePost, isPending: isUnliking } = useUnlikePost();

  const canView =
    post.accessLevel === AccessLevel.PUBLIC ||
    (isSubscribed && post.accessLevel === AccessLevel.SUBSCRIBERS) ||
    (isSubscribed && post.accessLevel === AccessLevel.TIER_GATED && subscribedTierId >= post.requiredTierId) ||
    canAccess;

  const contentCID = canView && userPost?.contentCID ? userPost.contentCID : post.contentCID;

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
    <div className="border-b border-slate-800 px-4 py-4 hover:bg-slate-800/30 transition-colors">
      {/* Header */}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 overflow-hidden flex-shrink-0">
          {profileImageCID ? (
            <Image
              src={getIpfsUrl(profileImageCID)}
              alt={creatorName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#00aff0]">
              {creatorName.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-slate-100 truncate">{creatorName}</span>
            {creatorVerified && <CheckBadgeIcon className="w-4 h-4 text-[#00aff0] flex-shrink-0" />}
            <span className="text-slate-500 text-sm">· {formatDate(post.createdAt)}</span>
            <button className="ml-auto p-1.5 hover:bg-slate-700 rounded-full -mr-1.5">
              <EllipsisHorizontalIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <p className="text-slate-200 mt-1 whitespace-pre-wrap">{post.caption}</p>

          {/* Media */}
          {post.contentType !== 0 && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
              {canView ? (
                <div className="relative aspect-video bg-slate-800">
                  {contentCID ? (
                    <Image src={getIpfsUrl(contentCID)} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PhotoIcon className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative aspect-video bg-slate-800">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                    <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center">
                      <LockClosedIcon className="w-7 h-7 text-[#00aff0]" />
                    </div>
                    <p className="text-center text-slate-300 text-sm font-medium">{getAccessLabel()}</p>
                    <a
                      href="#tiers"
                      className="px-4 py-1.5 bg-[#00aff0] hover:bg-[#009bd6] text-white text-sm font-medium rounded-full transition-colors"
                    >
                      Subscribe to Unlock
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-3 -ml-2">
            <button
              className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10"
              onClick={handleLikeToggle}
              disabled={isLiking || isUnliking}
            >
              {hasLiked ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
              <span className="text-sm">{Number(post.likesCount)}</span>
            </button>
            <button
              className={`flex items-center gap-1.5 transition-colors p-2 rounded-full hover:bg-[#00aff0]/10 ${
                showComments ? "text-[#00aff0]" : "text-slate-500 hover:text-[#00aff0]"
              }`}
              onClick={() => setShowComments(!showComments)}
            >
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span className="text-sm">{Number(post.commentsCount)}</span>
            </button>
            <div className="ml-auto">
              <ShareButton postId={post.id} displayName={creatorName} caption={post.caption} />
            </div>
          </div>

          {/* Comments Section */}
          <PostComments postId={post.id} isExpanded={showComments} />
        </div>
      </div>
    </div>
  );
};

const CreatorProfilePage: NextPage = () => {
  const params = useParams();
  const username = params.username as string;
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "about">("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  const { creatorAddress, creator, tiers, isLoading: isLoadingCreator } = useCreatorByUsername(username);
  const { isSubscribed, subscription, isLoading: isLoadingSubscription } = useSubscription(creatorAddress);
  const { posts, postCount, isLoading: isLoadingPosts } = useCreatorPosts(creatorAddress, 0, 50);
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

  const handleTip = () => {
    setShowTipModal(true);
  };

  const formatJoinDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const isLoading = isLoadingCreator || isLoadingSubscription;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-48 bg-slate-800 animate-pulse" />
        <div className="max-w-2xl mx-auto px-4">
          <div className="-mt-16 mb-4">
            <div className="w-32 h-32 rounded-full bg-slate-700 border-4 border-slate-900 animate-pulse" />
          </div>
          <div className="h-6 bg-slate-800 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-slate-800 rounded w-1/4 mb-4 animate-pulse" />
          <div className="h-16 bg-slate-800 rounded mb-4 animate-pulse" />
        </div>
      </div>
    );
  }

  // Creator not found
  if (!creator || !creator.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-slate-700 flex items-center justify-center">
            <PhotoIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Creator Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">
            The creator @{username} doesn&apos;t exist or hasn&apos;t registered yet.
          </p>
          <Link
            href="/explore"
            className="inline-block px-6 py-2.5 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
          >
            Explore Creators
          </Link>
        </div>
      </div>
    );
  }

  const activeTiers = tiers.filter(t => t.isActive);
  const activePosts = posts.filter(p => p.isActive);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-48 bg-slate-800 relative overflow-hidden">
        {creator.bannerImageCID && (
          <Image src={getIpfsUrl(creator.bannerImageCID)} alt="" fill className="object-cover" unoptimized />
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-start">
          {/* Avatar */}
          <div className="-mt-16 relative">
            <div className="w-32 h-32 rounded-full bg-slate-700 border-4 border-slate-900 overflow-hidden">
              {creator.profileImageCID ? (
                <Image
                  src={getIpfsUrl(creator.profileImageCID)}
                  alt={creator.displayName}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#00aff0]">
                  {creator.displayName.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-2">
            {connectedAddress === creatorAddress ? (
              <Link
                href="/profile/edit"
                className="px-4 py-1.5 border border-slate-600 hover:border-slate-500 text-slate-100 font-medium rounded-full transition-colors text-sm"
              >
                Edit profile
              </Link>
            ) : (
              <>
                {isSubscribed ? (
                  <button className="px-4 py-1.5 bg-slate-700 text-slate-100 font-medium rounded-full text-sm">
                    Subscribed ✓
                  </button>
                ) : (
                  <a
                    href="#tiers"
                    className="px-4 py-1.5 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
                  >
                    Subscribe
                  </a>
                )}
                <button
                  onClick={handleTip}
                  className="px-4 py-1.5 border border-[#00aff0] hover:bg-[#00aff0]/10 text-[#00aff0] font-medium rounded-full transition-colors text-sm"
                >
                  Tip Creator
                </button>
              </>
            )}
            <ShareButton username={creator.username} displayName={creator.displayName} />
          </div>
        </div>

        {/* Name & Username */}
        <div className="mt-3">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold text-slate-100">{creator.displayName}</h1>
            {creator.isVerified && <CheckBadgeIcon className="w-5 h-5 text-[#00aff0]" />}
          </div>
          <p className="text-slate-500">@{creator.username}</p>
        </div>

        {/* Bio */}
        <p className="text-slate-200 mt-3">{creator.bio || "No bio yet."}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-slate-500">
          <div className="text-xs">
            <Address address={creatorAddress as `0x${string}`} />
          </div>
          <div className="flex items-center gap-1">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>Joined {formatJoinDate(creator.createdAt)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-100">{Number(creator.totalSubscribers)}</span>
            <span className="text-slate-500 text-sm">Subscribers</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-100">{postCount}</span>
            <span className="text-slate-500 text-sm">Posts</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-100">{activeTiers.length}</span>
            <span className="text-slate-500 text-sm">Tiers</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 mt-4 sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex">
            {(["posts", "media", "about"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "text-slate-100 border-[#00aff0]"
                    : "text-slate-500 border-transparent hover:bg-slate-800/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {activeTab === "posts" && (
          <div>
            {isLoadingPosts ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="border-b border-slate-800 p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-800 rounded w-32" />
                      <div className="h-4 bg-slate-800 rounded w-full" />
                      <div className="h-4 bg-slate-800 rounded w-2/3" />
                      <div className="h-40 bg-slate-800 rounded-xl mt-2" />
                    </div>
                  </div>
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
              <div className="text-center py-16 px-4">
                <PhotoIcon className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-100 mb-1">No posts yet</h3>
                <p className="text-slate-500 text-sm">
                  {connectedAddress === creatorAddress
                    ? "Create your first post to share with your subscribers!"
                    : "This creator hasn't posted anything yet."}
                </p>
                {connectedAddress === creatorAddress && (
                  <Link
                    href="/create"
                    className="inline-block mt-4 px-5 py-2 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
                  >
                    Create Post
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "media" && (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {activePosts
              .filter(p => p.contentType !== 0 && p.contentCID)
              .map(post => (
                <div key={post.id.toString()} className="aspect-square bg-slate-800 relative overflow-hidden">
                  <Image src={getIpfsUrl(post.contentCID)} alt="" fill className="object-cover" unoptimized />
                </div>
              ))}
            {activePosts.filter(p => p.contentType !== 0 && p.contentCID).length === 0 && (
              <div className="col-span-3 text-center py-16">
                <PhotoIcon className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500 text-sm">No media posts yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="font-semibold text-slate-100 mb-3">About {creator.displayName}</h3>
              <p className="text-slate-400 text-sm mb-5">{creator.bio || "No bio provided."}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Joined</span>
                  <span className="text-slate-300">{formatJoinDate(creator.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Subscribers</span>
                  <span className="text-slate-300">{Number(creator.totalSubscribers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Posts</span>
                  <span className="text-slate-300">{postCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Tiers */}
      <div id="tiers" className="bg-slate-800/50 py-10 mt-6 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-xl font-bold text-slate-100 mb-5">Subscription Tiers</h2>
          {activeTiers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <p className="text-slate-500 text-sm">No subscription tiers available yet.</p>
              {connectedAddress === creatorAddress && (
                <Link
                  href="/earnings"
                  className="inline-block mt-4 px-5 py-2 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
                >
                  Create Tiers
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />

      {/* Tip Modal */}
      {creator && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          creatorName={creator.displayName}
          creatorHandle={creator.username}
          creatorAvatar={creator.profileImageCID}
          creatorAddress={creatorAddress || ""}
          onTipSuccess={() => {
            // Could add a success toast or animation here
          }}
        />
      )}
    </div>
  );
};

export default CreatorProfilePage;
