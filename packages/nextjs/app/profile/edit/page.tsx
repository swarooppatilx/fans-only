"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useCurrentCreator, useUpdateProfile } from "~~/hooks/fansonly/useCreatorProfile";

const EditProfilePage: NextPage = () => {
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();
  const { isCreator, creator, isLoading: isLoadingCreator, refetch } = useCurrentCreator();
  const { updateProfile, isPending, isSuccess, reset } = useUpdateProfile();
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    profileImageCID: "",
    bannerImageCID: "",
  });

  // Reset state on mount
  useEffect(() => {
    reset();
    setShowSuccess(false);
  }, [reset]);

  // Populate form with existing data
  useEffect(() => {
    if (creator) {
      setFormData({
        displayName: creator.displayName,
        bio: creator.bio,
        profileImageCID: creator.profileImageCID,
        bannerImageCID: creator.bannerImageCID,
      });
    }
  }, [creator]);

  // Handle successful update
  useEffect(() => {
    if (isSuccess && !showSuccess) {
      setShowSuccess(true);
      refetch();
    }
  }, [isSuccess, showSuccess, refetch]);

  // Redirect if not a creator - only after loading is completely done
  useEffect(() => {
    // Only redirect if we're done loading AND confirmed not a creator
    if (!isLoadingCreator && isConnected && !isCreator) {
      router.replace("/profile/create");
    }
  }, [isLoadingCreator, isConnected, isCreator, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) return;

    try {
      await updateProfile(formData.displayName, formData.bio, formData.profileImageCID, formData.bannerImageCID);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (!isConnected && !isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-base-content/60">Please connect your wallet to edit your profile</p>
        </div>
      </div>
    );
  }

  if (isConnecting || isLoadingCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-fo-primary"></span>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold mb-2">Profile Updated!</h2>
          <p className="text-base-content/60 mb-6">Your changes have been saved to the blockchain.</p>
          <button onClick={() => router.push(`/creator/${creator?.username}`)} className="fo-btn-primary">
            View Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <button onClick={() => router.back()} className="text-base-content/60 hover:text-base-content">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fo-card p-6 space-y-6">
          {/* Username (read-only) */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <div className="px-4 py-2 bg-base-300 rounded-lg text-base-content/60">@{creator?.username}</div>
            <p className="text-xs text-base-content/50 mt-1">Username cannot be changed</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Display Name *</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={e => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your Name"
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell your subscribers about yourself..."
              rows={4}
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary resize-none"
            />
            <p className="text-xs text-base-content/50 mt-1">{formData.bio.length}/500</p>
          </div>

          {/* Profile Image CID */}
          <div>
            <label className="block text-sm font-medium mb-1">Profile Image CID</label>
            <input
              type="text"
              value={formData.profileImageCID}
              onChange={e => setFormData({ ...formData, profileImageCID: e.target.value })}
              placeholder="Qm... (IPFS CID)"
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary font-mono text-sm"
            />
          </div>

          {/* Banner Image CID */}
          <div>
            <label className="block text-sm font-medium mb-1">Banner Image CID</label>
            <input
              type="text"
              value={formData.bannerImageCID}
              onChange={e => setFormData({ ...formData, bannerImageCID: e.target.value })}
              placeholder="Qm... (IPFS CID)"
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary font-mono text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !formData.displayName.trim()}
            className="w-full fo-btn-primary py-3"
          >
            {isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving to Blockchain...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
