"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckCircleIcon, WalletIcon } from "@heroicons/react/24/outline";
import { FileUpload } from "~~/components/FileUpload";
import { useCurrentCreator, useRegisterCreator } from "~~/hooks/fansonly/useCreatorProfile";

const CreateProfilePage: NextPage = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { isCreator, creator, isLoading: isLoadingCreator, refetch } = useCurrentCreator();
  const { registerCreator, isPending, isSuccess } = useRegisterCreator();

  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    bio: "",
    profileImageCID: "",
    bannerImageCID: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already a creator
  useEffect(() => {
    if (!isLoadingCreator && isCreator && creator?.username) {
      router.replace(`/creator/${creator.username}`);
    }
  }, [isLoadingCreator, isCreator, creator, router]);

  // Handle successful registration
  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = "Username must be 3-20 characters, lowercase letters, numbers, and underscores only";
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await registerCreator(
        formData.username.toLowerCase(),
        formData.displayName,
        formData.bio,
        formData.profileImageCID,
        formData.bannerImageCID,
      );
    } catch (error) {
      console.error("Failed to register:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-slate-700 flex items-center justify-center">
            <WalletIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Connect Your Wallet</h2>
          <p className="text-slate-400 text-sm">Please connect your wallet to create your profile</p>
        </div>
      </div>
    );
  }

  if (isLoadingCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00aff0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md">
          <CheckCircleIcon className="w-14 h-14 mx-auto mb-4 text-emerald-400" />
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Profile Created!</h2>
          <p className="text-slate-400 text-sm mb-6">Your creator profile is now live on the blockchain.</p>
          <button
            onClick={() => router.push(`/creator/${formData.username}`)}
            className="px-6 py-2.5 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
          >
            View Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Become a Creator</h1>
          <p className="text-slate-400 text-sm">Set up your profile and start earning from your content</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          {/* Profile Image Placeholder */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-[#00aff0] text-2xl font-bold">
                {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : "?"}
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Username *</label>
            <div className="flex">
              <span className="px-3 py-2 bg-slate-900 border border-slate-600 border-r-0 rounded-l-lg text-slate-500 text-sm">
                @
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                placeholder="yourname"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-r-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00aff0] text-sm"
              />
            </div>
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            <p className="text-xs text-slate-500 mt-1">This will be your unique URL</p>
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
            />
            {errors.displayName && <p className="text-red-400 text-xs mt-1">{errors.displayName}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Bio</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell your subscribers about yourself..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00aff0] resize-none text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.bio.length}/500 characters</p>
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
            disabled={isPending}
            className="w-full py-2.5 bg-[#00aff0] hover:bg-[#009bd6] disabled:opacity-50 text-white font-medium rounded-full transition-colors"
          >
            {isPending ? "Creating Profile..." : "Create Profile"}
          </button>

          <p className="text-xs text-center text-slate-500">
            By creating a profile, you agree to our terms of service. Your profile will be stored on the blockchain.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreateProfilePage;
