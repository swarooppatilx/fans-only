"use client";

import { useState } from "react";
import { CheckCircle, Share2 } from "lucide-react";
import { shareCreator, sharePost } from "~~/utils/share";

interface ShareButtonProps {
  postId?: string;
  username?: string;
  displayName?: string;
  caption?: string;
  className?: string;
}

export function ShareButton({ postId, username, displayName, caption, className = "" }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);

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
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className={`text-slate-500 hover:text-[#00aff0] transition-colors p-2 hover:bg-[#00aff0]/10 rounded-full ${className}`}
      >
        <Share2 className="w-5 h-5" />
      </button>

      {/* Custom Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl border border-slate-700">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">Link copied to clipboard!</span>
          </div>
        </div>
      )}
    </>
  );
}
