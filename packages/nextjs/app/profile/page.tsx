"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { WalletIcon } from "@heroicons/react/24/outline";
import { useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";

/**
 * Profile page - redirects to:
 * - /creator/[username] if user is a creator
 * - /profile/create if user needs to create a profile
 */
const ProfilePage: NextPage = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { isCreator, creator, isLoading } = useCurrentCreator();

  useEffect(() => {
    if (!isLoading) {
      if (!isConnected) {
        // Not connected - stay on this page with connect prompt
        return;
      }
      if (isCreator && creator?.username) {
        router.replace(`/creator/${creator.username}`);
      } else {
        router.replace("/profile/create");
      }
    }
  }, [isConnected, isCreator, creator, isLoading, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-slate-700 flex items-center justify-center">
            <WalletIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Connect Your Wallet</h2>
          <p className="text-slate-400 text-sm">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00aff0] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default ProfilePage;
