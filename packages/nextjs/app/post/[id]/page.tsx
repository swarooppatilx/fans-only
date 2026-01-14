"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Address } from "@scaffold-ui/components";
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import {
  AccessLevel,
  Comment,
  ContentType,
  useAddComment,
  useLikePost,
  usePost,
  usePostComments,
  useUnlikePost,
} from "~~/hooks/fansonly/useContentPost";
import { getIpfsUrl, useCreator } from "~~/hooks/fansonly/useCreatorProfile";

const PostDetailPage: NextPage = () => {
  const params = useParams();
  const router = useRouter();
  const postId = params.id ? BigInt(params.id as string) : undefined;

  const { address } = useAccount();
  const { post, hasLiked, canAccess, isLoading: isLoadingPost, refetch: refetchPost } = usePost(postId);
  const { comments, isLoading: isLoadingComments, refetch: refetchComments } = usePostComments(postId, 0, 100);
  const { addComment, isPending: isAddingComment } = useAddComment();
  const { likePost, isPending: isLiking } = useLikePost();
  const { unlikePost, isPending: isUnliking } = useUnlikePost();

  const [newComment, setNewComment] = useState("");
  const [localLiked, setLocalLiked] = useState(hasLiked);
  const [localLikeCount, setLocalLikeCount] = useState(0);

  // Get creator data
  const { creator } = useCreator(post?.creator);

  useEffect(() => {
    setLocalLiked(hasLiked);
  }, [hasLiked]);

  useEffect(() => {
    if (post) {
      setLocalLikeCount(Number(post.likesCount));
    }
  }, [post]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId) return;
    try {
      await addComment(postId, newComment.trim());
      setNewComment("");
      refetchComments();
      refetchPost();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleLikeToggle = async () => {
    if (!postId) return;
    try {
      if (localLiked) {
        setLocalLiked(false);
        setLocalLikeCount(prev => prev - 1);
        await unlikePost(postId);
      } else {
        setLocalLiked(true);
        setLocalLikeCount(prev => prev + 1);
        await likePost(postId);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setLocalLiked(hasLiked);
      setLocalLikeCount(Number(post?.likesCount || 0));
    }
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const seconds = Math.floor(Date.now() / 1000 - Number(timestamp));
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#00aff0]"></span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-2">Post not found</h2>
        <p className="text-slate-400 mb-4">This post may have been deleted or doesn&apos;t exist.</p>
        <button onClick={() => router.back()} className="text-[#00aff0] hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const username = creator?.username || post.creator.slice(0, 8);
  const displayName = creator?.displayName || `Creator ${post.creator.slice(0, 6)}`;
  const canView =
    post.accessLevel === AccessLevel.PUBLIC || canAccess || post.creator.toLowerCase() === address?.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 border-b border-slate-800">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-slate-100">Post</h2>
      </div>

      {/* Main Post */}
      <div className="p-4 border-b border-slate-800">
        {/* Author Header */}
        <div className="flex items-start gap-3 mb-4">
          <Link href={`/creator/${username}`}>
            {creator?.profileImageCID ? (
              <Image
                src={getIpfsUrl(creator.profileImageCID)}
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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/creator/${username}`} className="font-bold text-slate-100 hover:underline">
                {displayName}
              </Link>
              {creator?.isVerified && <CheckBadgeIcon className="w-5 h-5 text-[#00aff0]" />}
            </div>
            <span className="text-slate-500 text-sm">@{username}</span>
          </div>
          <button className="text-slate-500 hover:text-[#00aff0] p-2">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-slate-100 text-lg whitespace-pre-wrap leading-relaxed">{post.caption}</p>
        </div>

        {/* Media */}
        {post.contentType !== ContentType.TEXT && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-slate-800">
            {canView && post.contentCID ? (
              <Image
                src={getIpfsUrl(post.contentCID)}
                alt="Post content"
                width={600}
                height={400}
                className="w-full h-auto max-h-[600px] object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-64 bg-slate-800/50 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-400 mb-2">🔒 Premium Content</p>
                  <Link href={`/creator/${username}`} className="text-[#00aff0] hover:underline text-sm">
                    Subscribe to unlock
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-slate-500 text-sm mb-4 pb-4 border-b border-slate-800">{formatDate(post.createdAt)}</div>

        {/* Stats */}
        <div className="flex gap-6 text-sm pb-4 border-b border-slate-800">
          <span>
            <strong className="text-slate-100">{localLikeCount}</strong> <span className="text-slate-500">Likes</span>
          </span>
          <span>
            <strong className="text-slate-100">{Number(post.commentsCount)}</strong>{" "}
            <span className="text-slate-500">Comments</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-around py-2">
          <button
            onClick={handleLikeToggle}
            disabled={isLiking || isUnliking}
            className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
              localLiked ? "text-rose-500" : "text-slate-500 hover:text-rose-500"
            }`}
          >
            <Heart size={22} fill={localLiked ? "currentColor" : "none"} />
          </button>
          <button className="flex items-center gap-2 p-2 rounded-full text-slate-500 hover:text-[#00aff0] transition-colors">
            <MessageCircle size={22} />
          </button>
          <button className="flex items-center gap-2 p-2 rounded-full text-slate-500 hover:text-[#00aff0] transition-colors">
            <Share2 size={22} />
          </button>
        </div>
      </div>

      {/* Comment Input */}
      {address ? (
        <div className="p-4 border-b border-slate-800 flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-[#00aff0]">
            {address.slice(2, 4).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Post your reply"
              className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none min-h-[80px] text-base pt-2"
              disabled={isAddingComment}
            />
            <div className="flex justify-end mt-2">
              <button
                disabled={!newComment.trim() || isAddingComment}
                onClick={handleAddComment}
                className="bg-[#00aff0] text-white font-bold py-1.5 px-4 rounded-full disabled:opacity-50 hover:bg-[#009bd6] transition-colors"
              >
                {isAddingComment ? <span className="loading loading-spinner loading-xs"></span> : "Reply"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-slate-800 text-center text-slate-500">Connect your wallet to comment</div>
      )}

      {/* Comments List */}
      <div className="pb-20">
        {isLoadingComments ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md text-[#00aff0]"></span>
          </div>
        ) : comments.filter(c => c.isActive).length === 0 ? (
          <div className="py-8 text-center text-slate-500">No comments yet. Be the first to reply!</div>
        ) : (
          comments
            .filter((c: Comment) => c.isActive)
            .map((comment: Comment) => (
              <div
                key={comment.id.toString()}
                className="p-4 border-b border-slate-800 hover:bg-slate-900/50 transition-colors flex gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-[#00aff0] flex-shrink-0">
                  {comment.commenter.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex gap-2 items-center">
                      <Address address={comment.commenter} format="short" size="sm" />
                      <span className="text-slate-500 text-sm">· {formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <button className="text-slate-500 hover:text-[#00aff0]">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                  <div className="flex gap-12 mt-3 text-slate-500">
                    <button className="flex items-center gap-2 group hover:text-rose-500 text-xs">
                      <Heart size={16} className="group-hover:text-rose-500" />
                    </button>
                    <button className="flex items-center gap-2 group hover:text-[#00aff0] text-xs">
                      <MessageCircle size={16} className="group-hover:text-[#00aff0]" />
                    </button>
                    <button className="flex items-center gap-2 group hover:text-[#00aff0] text-xs">
                      <Share2 size={16} className="group-hover:text-[#00aff0]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
