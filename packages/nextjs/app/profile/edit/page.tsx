"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckCircleIcon, WalletIcon } from "@heroicons/react/24/outline";
import { FileUpload } from "~~/components/FileUpload";
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
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-slate-700 flex items-center justify-center">
            <WalletIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Connect Your Wallet</h2>
          <p className="text-slate-400 text-sm">Please connect your wallet to edit your profile</p>
        </div>
      </div>
    );
  }

  if (isConnecting || isLoadingCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00aff0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md">
          <CheckCircleIcon className="w-14 h-14 mx-auto mb-4 text-emerald-400" />
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Profile Updated!</h2>
          <p className="text-slate-400 text-sm mb-6">Your changes have been saved to the blockchain.</p>
          <button
            onClick={() => router.push(`/creator/${creator?.username}`)}
            className="px-6 py-2.5 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
          >
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
          <h1 className="text-2xl font-bold text-slate-100">Edit Profile</h1>
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-300 text-sm">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          {/* Username (read-only) */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Username</label>
            <div className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-500 text-sm">
              @{creator?.username}
            </div>
            <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Display Name *</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={e => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your Name"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00aff0] text-sm"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Bio</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell your subscribers about yourself..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00aff0] resize-none text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.bio.length}/500</p>
          </div>

          {/* Profile Image Upload & CID */}
          <div>
            <FileUpload
              label="Profile Image (IPFS upload or paste CID)"
              accept="image/*"
              maxSizeMB={10}
              onUpload={cid => setFormData(f => ({ ...f, profileImageCID: cid }))}
              onUploadingChange={() => {}}
              showPreview={true}
              className="mb-2"
            />
            <input
              type="text"
              value={formData.profileImageCID}
              onChange={e => setFormData({ ...formData, profileImageCID: e.target.value })}
              placeholder="Qm... (IPFS CID)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00aff0] font-mono text-xs mt-2"
            />
          </div>

          {/* Banner Image Upload & CID */}
          <div>
            <FileUpload
              label="Banner Image (IPFS upload or paste CID)"
              accept="image/*"
              maxSizeMB={20}
              onUpload={cid => setFormData(f => ({ ...f, bannerImageCID: cid }))}
              onUploadingChange={() => {}}
              showPreview={true}
              className="mb-2"
            />
            <input
              type="text"
              value={formData.bannerImageCID}
              onChange={e => setFormData({ ...formData, bannerImageCID: e.target.value })}
              placeholder="Qm... (IPFS CID)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00aff0] font-mono text-xs mt-2"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !formData.displayName.trim()}
            className="w-full py-2.5 bg-[#00aff0] hover:bg-[#009bd6] disabled:opacity-50 text-white font-medium rounded-full transition-colors"
          >
            {isPending ? "Saving to Blockchain..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
