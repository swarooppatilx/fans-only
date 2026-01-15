"use client";

import { Share2 } from "lucide-react";
import { notification } from "~~/utils/scaffold-eth";
import { shareCreator, sharePost } from "~~/utils/share";

interface ShareButtonProps {
  postId?: string;
  username?: string;
  displayName?: string;
  caption?: string;
  className?: string;
}

export function ShareButton({ postId, username, displayName, caption, className = "" }: ShareButtonProps) {
  const handleShare = async () => {
    let result;
    if (postId) {
      result = await sharePost(postId, displayName, caption);
    } else if (username) {
      result = await shareCreator(username, displayName);
    } else {
      return;
    }

    if (result.success && result.method === "clipboard") {
      notification.success("Link copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`text-slate-500 hover:text-[#00aff0] transition-colors p-2 hover:bg-[#00aff0]/10 rounded-full ${className}`}
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}
