"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
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
        <div className="fo-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-base-content/60">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-fo-primary"></span>
    </div>
  );
};

export default ProfilePage;
