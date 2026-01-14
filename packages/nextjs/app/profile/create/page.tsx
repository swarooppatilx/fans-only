"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CameraIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
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
        <div className="fo-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-base-content/60">Please connect your wallet to create your profile</p>
        </div>
      </div>
    );
  }

  if (isLoadingCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-fo-primary"></span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold mb-2">Profile Created!</h2>
          <p className="text-base-content/60 mb-6">Your creator profile is now live on the blockchain.</p>
          <button onClick={() => router.push(`/creator/${formData.username}`)} className="fo-btn-primary">
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
          <h1 className="text-3xl font-bold mb-2">Become a Creator</h1>
          <p className="text-base-content/60">Set up your profile and start earning from your content</p>
        </div>

        <form onSubmit={handleSubmit} className="fo-card p-6 space-y-6">
          {/* Profile Image Placeholder */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-[#00aff0] text-3xl font-bold">
                {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="absolute bottom-0 right-0 p-2 bg-base-100 rounded-full border border-base-300">
                <CameraIcon className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username *</label>
            <div className="flex">
              <span className="px-4 py-2 bg-base-300 rounded-l-lg text-base-content/60">@</span>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                placeholder="yourname"
                className="flex-1 px-4 py-2 bg-base-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
              />
            </div>
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            <p className="text-xs text-base-content/50 mt-1">
              This will be your unique URL: fansonly.com/creator/yourname
            </p>
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
            />
            {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell your subscribers about yourself..."
              rows={3}
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary resize-none"
            />
            <p className="text-xs text-base-content/50 mt-1">{formData.bio.length}/500 characters</p>
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
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary font-mono text-sm mt-2"
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
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary font-mono text-sm mt-2"
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={isPending} className="w-full fo-btn-primary py-3 text-lg">
            {isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating Profile...
              </>
            ) : (
              "Create Profile"
            )}
          </button>

          <p className="text-xs text-center text-base-content/50">
            By creating a profile, you agree to our terms of service. Your profile will be stored on the blockchain.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreateProfilePage;
