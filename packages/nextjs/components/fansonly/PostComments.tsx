"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import { useAccount } from "wagmi";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Comment, useAddComment, usePostComments } from "~~/hooks/fansonly/useContentPost";

interface PostCommentsProps {
  postId: bigint;
  isExpanded: boolean;
}

export function PostComments({ postId, isExpanded }: PostCommentsProps) {
  const { address } = useAccount();
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading, refetch } = usePostComments(postId, 0, 50);
  const { addComment, isPending: isAddingComment } = useAddComment();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !address) return;

    try {
      await addComment(postId, newComment.trim());
      setNewComment("");
      refetch();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!isExpanded) return null;

  return (
    <div className="border-t border-base-200 px-4 pb-4">
      {/* Comments List */}
      <div className="py-3 space-y-3 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-sm text-fo-primary"></span>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-base-content/50 py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments
            .filter((c: Comment) => c.isActive)
            .map((comment: Comment) => (
              <div key={comment.id.toString()} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex-shrink-0 flex items-center justify-center text-[#00aff0] text-xs font-bold">
                  {comment.commenter.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Address address={comment.commenter} format="short" size="xs" />
                    <span className="text-xs text-base-content/50">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-base-content break-words">{comment.content}</p>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Add Comment Form */}
      {address ? (
        <form onSubmit={handleSubmitComment} className="flex gap-2 pt-2 border-t border-base-200">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 bg-base-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fo-primary"
            disabled={isAddingComment}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isAddingComment}
            className="px-3 py-2 bg-fo-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-fo-primary-dark transition-colors"
          >
            {isAddingComment ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <PaperAirplaneIcon className="w-4 h-4" />
            )}
          </button>
        </form>
      ) : (
        <p className="text-center text-sm text-base-content/50 pt-2 border-t border-base-200">
          Connect wallet to comment
        </p>
      )}
    </div>
  );
}
