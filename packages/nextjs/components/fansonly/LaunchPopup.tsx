"use client";

import React from "react";
import { Feather, X } from "lucide-react";

interface LaunchPopupProps {
  onConnect: () => void;
  onExplore: () => void;
  onClose: () => void;
}

export default function LaunchPopup({ onConnect, onExplore, onClose }: LaunchPopupProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-[440px] bg-slate-900 rounded-2xl shadow-xl overflow-hidden text-center p-8 md:p-10 scale-100 transition-transform ring-1 ring-slate-800 border border-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-300 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <div className="h-12 w-12 bg-[#00aff0] rounded-xl flex items-center justify-center text-white mb-3">
              <Feather size={28} strokeWidth={2.5} />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3 tracking-tight leading-tight">
            See what&apos;s happening in <br />
            <span className="text-[#00aff0]">the creator economy.</span>
          </h2>

          <p className="text-slate-400 text-sm md:text-base mb-8 max-w-xs mx-auto leading-relaxed">
            Join FansOnly today to connect with creators, own your content, and support the future of Web3.
          </p>

          {/* Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={onConnect}
              className="w-full bg-[#00aff0] hover:bg-[#009bd6] text-white border-none text-base font-bold py-3 h-auto rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Connect Wallet
            </button>

            <button
              onClick={onExplore}
              className="w-full py-3 rounded-full border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-800 hover:text-white transition-all"
            >
              Explore as Guest
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-xs text-slate-500">
            By connecting, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
