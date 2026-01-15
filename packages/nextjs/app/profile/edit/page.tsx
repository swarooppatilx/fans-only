"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CameraIcon, CheckCircleIcon, WalletIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getIpfsUrl, useCurrentCreator, useUpdateProfile } from "~~/hooks/fansonly";
import { useIPFSUpload } from "~~/hooks/useIPFSUpload";

const EditProfilePage: NextPage = () => {
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();
  const { isCreator, creator, isLoading: isLoadingCreator, refetch } = useCurrentCreator();
  const { updateProfile, isPending, isSuccess, reset } = useUpdateProfile();
  const { upload: uploadFile, isUploading } = useIPFSUpload();
  const [showSuccess, setShowSuccess] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    if (!isLoadingCreator && isConnected && !isCreator) {
      router.replace("/profile/create");
    }
  }, [isLoadingCreator, isConnected, isCreator, router]);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      if (result?.cid) setFormData(f => ({ ...f, bannerImageCID: result.cid }));
    } catch (error) {
      console.error("Failed to upload banner:", error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      if (result?.cid) setFormData(f => ({ ...f, profileImageCID: result.cid }));
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[600px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 hover:bg-slate-800 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-100" />
            </button>
            <h1 className="text-lg font-bold text-slate-100">Edit profile</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isPending || isUploading || !formData.displayName.trim()}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-900 font-bold text-sm rounded-full transition-colors"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Banner */}
        <div className="relative h-48 bg-slate-800">
          {formData.bannerImageCID ? (
            <Image src={getIpfsUrl(formData.bannerImageCID)} alt="Banner" fill className="object-cover" unoptimized />
          ) : null}
          <div className="absolute inset-0 bg-black/40" />

          {/* Banner Controls */}
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="p-3 bg-slate-900/70 hover:bg-slate-900/90 rounded-full transition-colors"
            >
              <CameraIcon className="w-5 h-5 text-slate-100" />
            </button>
            {formData.bannerImageCID && (
              <button
                type="button"
                onClick={() => setFormData(f => ({ ...f, bannerImageCID: "" }))}
                className="p-3 bg-slate-900/70 hover:bg-slate-900/90 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-100" />
              </button>
            )}
          </div>

          <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />

          {/* Avatar */}
          <div className="absolute -bottom-12 left-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-slate-700 border-4 border-slate-900 overflow-hidden">
                {formData.profileImageCID ? (
                  <Image
                    src={getIpfsUrl(formData.profileImageCID)}
                    alt="Avatar"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#00aff0]">
                    {formData.displayName.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="p-2.5 bg-slate-900/70 hover:bg-slate-900/90 rounded-full transition-colors"
                >
                  <CameraIcon className="w-5 h-5 text-slate-100" />
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pt-16 px-4 pb-6 space-y-5">
          {/* Name Field */}
          <div className="relative">
            <input
              type="text"
              id="displayName"
              value={formData.displayName}
              onChange={e => setFormData({ ...formData, displayName: e.target.value })}
              placeholder=" "
              className="peer w-full px-3 pt-6 pb-2 bg-transparent border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-[#00aff0] text-base"
              required
            />
            <label
              htmlFor="displayName"
              className="absolute left-3 top-2 text-xs text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00aff0] transition-all"
            >
              Name
            </label>
          </div>

          {/* Bio Field */}
          <div className="relative">
            <textarea
              id="bio"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder=" "
              rows={3}
              className="peer w-full px-3 pt-6 pb-2 bg-transparent border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-[#00aff0] resize-none text-base"
            />
            <label
              htmlFor="bio"
              className="absolute left-3 top-2 text-xs text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00aff0] transition-all"
            >
              Bio
            </label>
          </div>

          {/* Profile Image CID */}
          <div className="relative">
            <input
              type="text"
              id="profileCID"
              value={formData.profileImageCID}
              onChange={e => setFormData({ ...formData, profileImageCID: e.target.value })}
              placeholder=" "
              className="peer w-full px-3 pt-6 pb-2 bg-transparent border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-[#00aff0] text-sm font-mono"
            />
            <label
              htmlFor="profileCID"
              className="absolute left-3 top-2 text-xs text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00aff0] transition-all"
            >
              Profile Image CID
            </label>
            <p className="text-xs text-slate-600 mt-1">Upload via camera icon or paste IPFS CID directly</p>
          </div>

          {/* Banner Image CID */}
          <div className="relative">
            <input
              type="text"
              id="bannerCID"
              value={formData.bannerImageCID}
              onChange={e => setFormData({ ...formData, bannerImageCID: e.target.value })}
              placeholder=" "
              className="peer w-full px-3 pt-6 pb-2 bg-transparent border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-[#00aff0] text-sm font-mono"
            />
            <label
              htmlFor="bannerCID"
              className="absolute left-3 top-2 text-xs text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00aff0] transition-all"
            >
              Banner Image CID
            </label>
            <p className="text-xs text-slate-600 mt-1">Upload via camera icon or paste IPFS CID directly</p>
          </div>

          {/* Username (read-only) */}
          <div className="relative">
            <div className="w-full px-3 pt-6 pb-2 bg-transparent border border-slate-800 rounded-md text-slate-500 text-base">
              @{creator?.username}
            </div>
            <span className="absolute left-3 top-2 text-xs text-slate-600">Username</span>
          </div>

          {/* Uploading indicator */}
          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-4 h-4 border-2 border-[#00aff0] border-t-transparent rounded-full animate-spin" />
              <span>Uploading to IPFS...</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
