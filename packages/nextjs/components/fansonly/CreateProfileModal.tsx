"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CameraIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getIpfsUrl, useCurrentCreator, useRegisterCreator } from "~~/hooks/fansonly";
import { useIPFSUpload } from "~~/hooks/useIPFSUpload";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProfileModal = ({ isOpen, onClose, onSuccess }: CreateProfileModalProps) => {
  const router = useRouter();
  const { refetch } = useCurrentCreator();
  const { registerCreator, isPending, isSuccess, reset } = useRegisterCreator();
  const { upload: uploadFile, isUploading } = useIPFSUpload();

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    bio: "",
    profileImageCID: "",
    bannerImageCID: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      reset();
      setShowSuccess(false);
      setFormData({
        username: "",
        displayName: "",
        bio: "",
        profileImageCID: "",
        bannerImageCID: "",
      });
      setErrors({});
    }
  }, [isOpen, reset]);

  // Handle successful registration
  useEffect(() => {
    if (isSuccess && !showSuccess) {
      setShowSuccess(true);
      refetch();
    }
  }, [isSuccess, showSuccess, refetch]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = "3-20 chars, lowercase, numbers, underscores only";
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
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

  const handleViewProfile = () => {
    onSuccess?.();
    onClose();
    router.push(`/creator/${formData.username}`);
  };

  if (!isOpen) return null;

  // Success state
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 mx-4 p-8 text-center">
          <CheckCircleIcon className="w-14 h-14 mx-auto mb-4 text-emerald-400" />
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Profile Created!</h2>
          <p className="text-slate-400 text-sm mb-6">Your creator profile is now live on the blockchain.</p>
          <button
            onClick={handleViewProfile}
            className="px-6 py-2.5 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
          >
            View Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[600px] max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-1.5 -ml-1.5 hover:bg-slate-800 rounded-full transition-colors">
              <XMarkIcon className="w-5 h-5 text-slate-100" />
            </button>
            <h1 className="text-lg font-bold text-slate-100">Create your profile</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isPending || isUploading || !formData.displayName.trim() || !formData.username.trim()}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-900 font-bold text-sm rounded-full transition-colors"
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
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
          <div className="pt-16 px-4 pb-6 space-y-5">
            {/* Username Field */}
            <div className="relative">
              <input
                type="text"
                id="create-username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                placeholder=" "
                className={`peer w-full px-3 pt-6 pb-2 bg-transparent border rounded-md text-slate-100 focus:outline-none focus:border-[#00aff0] text-base ${
                  errors.username ? "border-red-500" : "border-slate-700"
                }`}
              />
              <label
                htmlFor="create-username"
                className="absolute left-3 top-2 text-xs text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00aff0] transition-all"
              >
                Username
              </label>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
              <p className="text-xs text-slate-600 mt-1">
                Your URL: fansonly.com/creator/{formData.username || "yourname"}
              </p>
            </div>

            {/* Name Field */}
            <div className="relative">
              <input
                type="text"
                id="create-displayName"
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                placeholder=" "
                className={`peer w-full px-3 pt-6 pb-2 bg-transparent border rounded-md text-slate-100 focus:outline-none focus:border-[#00aff0] text-base ${
                  errors.displayName ? "border-red-500" : "border-slate-700"
                }`}
                required
              />
              <label
                htmlFor="create-displayName"
                className="absolute left-3 top-2 text-xs text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00aff0] transition-all"
              >
                Name
              </label>
              {errors.displayName && <p className="text-red-400 text-xs mt-1">{errors.displayName}</p>}
            </div>

            {/* Bio Field */}
            <div className="relative">
              <textarea
                id="create-bio"
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder=" "
                rows={3}
                className="peer w-full px-3 pt-6 pb-2 bg-transparent border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-[#00aff0] resize-none text-base"
              />
              <label
                htmlFor="create-bio"
                className="absolute left-3 top-2 text-xs text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00aff0] transition-all"
              >
                Bio
              </label>
            </div>

            {/* Profile Image CID */}
            <div className="relative">
              <input
                type="text"
                id="create-profileCID"
                value={formData.profileImageCID}
                onChange={e => setFormData({ ...formData, profileImageCID: e.target.value })}
                placeholder=" "
                className="peer w-full px-3 pt-6 pb-2 bg-transparent border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-[#00aff0] text-sm font-mono"
              />
              <label
                htmlFor="create-profileCID"
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
                id="create-bannerCID"
                value={formData.bannerImageCID}
                onChange={e => setFormData({ ...formData, bannerImageCID: e.target.value })}
                placeholder=" "
                className="peer w-full px-3 pt-6 pb-2 bg-transparent border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-[#00aff0] text-sm font-mono"
              />
              <label
                htmlFor="create-bannerCID"
                className="absolute left-3 top-2 text-xs text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00aff0] transition-all"
              >
                Banner Image CID
              </label>
              <p className="text-xs text-slate-600 mt-1">Upload via camera icon or paste IPFS CID directly</p>
            </div>

            {/* Uploading indicator */}
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-4 h-4 border-2 border-[#00aff0] border-t-transparent rounded-full animate-spin" />
                <span>Uploading to IPFS...</span>
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-center text-slate-600 pt-2">
              By creating a profile, you agree to our terms of service. Your profile will be stored on the blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
