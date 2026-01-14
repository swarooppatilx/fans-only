"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LockClosedIcon,
  MusicalNoteIcon,
  PhotoIcon,
  UserGroupIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FileUpload } from "~~/components/FileUpload";
import { AccessLevel, ContentType, useCreatePost } from "~~/hooks/fansonly/useContentPost";
import { useCreator, useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";

type ContentTypeOption = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "MIXED";
type AccessLevelOption = "PUBLIC" | "SUBSCRIBERS" | "TIER_GATED";

const contentTypeOptions = [
  { value: "TEXT" as ContentTypeOption, label: "Text", icon: DocumentTextIcon, enumValue: ContentType.TEXT },
  { value: "IMAGE" as ContentTypeOption, label: "Image", icon: PhotoIcon, enumValue: ContentType.IMAGE },
  { value: "VIDEO" as ContentTypeOption, label: "Video", icon: VideoCameraIcon, enumValue: ContentType.VIDEO },
  { value: "AUDIO" as ContentTypeOption, label: "Audio", icon: MusicalNoteIcon, enumValue: ContentType.AUDIO },
  { value: "MIXED" as ContentTypeOption, label: "Mixed", icon: PhotoIcon, enumValue: ContentType.MIXED },
];

const accessLevelOptions = [
  {
    value: "PUBLIC" as AccessLevelOption,
    label: "Public",
    description: "Anyone can view this post",
    icon: GlobeAltIcon,
    enumValue: AccessLevel.PUBLIC,
  },
  {
    value: "SUBSCRIBERS" as AccessLevelOption,
    label: "All Subscribers",
    description: "Any subscriber can view",
    icon: UserGroupIcon,
    enumValue: AccessLevel.SUBSCRIBERS,
  },
  {
    value: "TIER_GATED" as AccessLevelOption,
    label: "Tier Gated",
    description: "Specific tier required",
    icon: LockClosedIcon,
    enumValue: AccessLevel.TIER_GATED,
  },
];

const CreatePostPage: NextPage = () => {
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useAccount();

  // Form state
  const [caption, setCaption] = useState("");
  const [contentCID, setContentCID] = useState("");
  const [contentType, setContentType] = useState<ContentTypeOption>("TEXT");
  const [accessLevel, setAccessLevel] = useState<AccessLevelOption>("PUBLIC");
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [isPreview, setIsPreview] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Custom hooks for contract interactions
  const { createPost, isPending: isCreating, error: createError } = useCreatePost();

  // Get creator's profile and tiers
  const { isCreator, creator: creatorProfile, isLoading: isLoadingCreator } = useCurrentCreator();
  const { tiers: creatorTiers } = useCreator(connectedAddress);

  // Determine if publish should be disabled
  const isPublishDisabled = isCreating || isUploading || (contentType !== "TEXT" && !contentCID.trim());

  // Get enum values from options
  const getContentTypeEnum = (type: ContentTypeOption): ContentType => {
    const option = contentTypeOptions.find(o => o.value === type);
    return option?.enumValue ?? ContentType.TEXT;
  };

  const getAccessLevelEnum = (level: AccessLevelOption): AccessLevel => {
    const option = accessLevelOptions.find(o => o.value === level);
    return option?.enumValue ?? AccessLevel.PUBLIC;
  };

  const handleSubmit = async () => {
    if (!isConnected || !connectedAddress) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    // For non-TEXT posts, require a contentCID (image/video/audio/mixed), regardless of access level
    if (contentType !== "TEXT" && !contentCID.trim()) {
      setErrorMessage(
        "You must upload or paste a valid IPFS CID for your media (image, video, audio, or mixed) before publishing.",
      );
      return;
    }

    setErrorMessage("");

    try {
      // For TEXT posts, use "TEXT_ONLY" as placeholder since contract requires non-empty CID
      const finalContentCID = contentType === "TEXT" && !contentCID.trim() ? "TEXT_ONLY" : contentCID;

      await createPost(
        finalContentCID,
        caption,
        getContentTypeEnum(contentType),
        getAccessLevelEnum(accessLevel),
        BigInt(selectedTier),
      );

      setIsSuccess(true);
      // Wait for the block to be mined, then redirect
      setTimeout(() => {
        router.push(`/creator/${creatorProfile?.username}`);
      }, 3000);
    } catch (error) {
      console.error("Failed to create post:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Parse common contract errors
      if (errorMsg.includes("NotACreator")) {
        setErrorMessage("You are not registered as a creator. Please create a profile first.");
      } else if (errorMsg.includes("InvalidContent")) {
        setErrorMessage("Invalid content. Please make sure you've provided valid content.");
      } else if (errorMsg.includes("InvalidTier")) {
        setErrorMessage("Invalid subscription tier selected.");
      } else if (errorMsg.includes("reverted")) {
        setErrorMessage("Transaction failed. Please make sure you have a creator profile.");
      } else {
        setErrorMessage(errorMsg);
      }
    }
  };

  // Loading creator status
  if (isLoadingCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-[--fo-primary]"></div>
          <p className="mt-4 text-[--fo-text-muted]">Loading...</p>
        </div>
      </div>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-[--fo-text-secondary]">Please connect your wallet to create posts</p>
        </div>
      </div>
    );
  }

  // Not a creator
  if (!isCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <LockClosedIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
          <h2 className="text-2xl font-bold mb-2">Become a Creator</h2>
          <p className="text-[--fo-text-secondary] mb-6">You need to create a creator profile before posting content</p>
          <button onClick={() => router.push("/profile/create")} className="fo-btn-primary">
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[--fo-success]/20 flex items-center justify-center">
            <CheckCircleIcon className="w-10 h-10 text-[--fo-success]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Post Published!</h2>
          <p className="text-[--fo-text-secondary] mb-4">Your post is now live on your profile.</p>
          <div className="loading loading-spinner loading-sm text-[--fo-primary]"></div>
          <p className="text-sm text-[--fo-text-muted] mt-2">Redirecting to your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create Post</h1>
          <button onClick={() => router.back()} className="p-2 hover:bg-base-200 rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="fo-card p-6">
          {/* Caption */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="fo-textarea"
              rows={4}
              maxLength={1000}
            />
            <div className="text-right text-sm text-[--fo-text-muted] mt-1">{caption.length}/1000</div>
          </div>

          {/* Media Upload */}
          {contentType !== "TEXT" && (
            <div className="mb-6">
              <FileUpload
                label="Upload Media"
                accept={
                  contentType === "IMAGE"
                    ? "image/*"
                    : contentType === "VIDEO"
                      ? "video/*"
                      : contentType === "AUDIO"
                        ? "audio/*"
                        : "image/*,video/*,audio/*"
                }
                maxSizeMB={contentType === "VIDEO" ? 100 : 50}
                onUpload={cid => setContentCID(cid)}
                onUploadingChange={setIsUploading}
                placeholder={`Drag and drop your ${contentType.toLowerCase()} or click to upload`}
              />
            </div>
          )}

          {/* Manual CID Input (fallback) */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {contentType === "TEXT" ? "Content CID (optional)" : "Or paste IPFS CID manually"}
            </label>
            <input
              type="text"
              value={contentCID}
              onChange={e => setContentCID(e.target.value)}
              placeholder="Qm... or bafk..."
              className="fo-input"
            />
          </div>

          {/* Content Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <div className="grid grid-cols-5 gap-2">
              {contentTypeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setContentType(option.value)}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    contentType === option.value
                      ? "border-[--fo-primary] bg-[--fo-primary]/10 text-[--fo-primary]"
                      : "border-[--fo-border] hover:border-[--fo-border-light]"
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Access Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Who can see this?</label>
            <div className="space-y-2">
              {accessLevelOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setAccessLevel(option.value)}
                  className={`w-full p-4 rounded-lg border flex items-center gap-4 transition-all text-left ${
                    accessLevel === option.value
                      ? "border-[--fo-primary] bg-[--fo-primary]/10"
                      : "border-[--fo-border] hover:border-[--fo-border-light]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      accessLevel === option.value ? "bg-[--fo-primary] text-white" : "bg-base-200"
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-[--fo-text-muted]">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tier Selection (for tier-gated posts) */}
          {accessLevel === "TIER_GATED" && creatorTiers && creatorTiers.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Required Tier</label>
              <div className="space-y-2">
                {creatorTiers.map((tier, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTier(index)}
                    className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${
                      selectedTier === index
                        ? "border-[--fo-primary] bg-[--fo-primary]/10"
                        : "border-[--fo-border] hover:border-[--fo-border-light]"
                    }`}
                  >
                    <span className="font-medium">{tier.name}</span>
                    <span className="text-[--fo-text-muted]">{(Number(tier.price) / 1e18).toFixed(4)} MNT</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview Toggle */}
          {caption && (
            <div className="mb-6">
              <button onClick={() => setIsPreview(!isPreview)} className="text-[--fo-primary] text-sm font-medium">
                {isPreview ? "Hide Preview" : "Show Preview"}
              </button>

              {isPreview && (
                <div className="mt-4 fo-post-card">
                  <div className="fo-post-header">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-0.5">
                      <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-sm font-bold text-[--fo-primary]">
                        {creatorProfile?.displayName?.charAt(0) || "?"}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">{creatorProfile?.displayName}</div>
                      <div className="text-sm text-[--fo-text-muted]">Just now</div>
                    </div>
                  </div>
                  <div className="fo-post-content">
                    <p>{caption}</p>
                  </div>
                  {contentCID && contentType !== "TEXT" && (
                    <div className="fo-post-media bg-gradient-to-br from-[--fo-primary]/20 to-[--fo-accent]/20 flex items-center justify-center">
                      {contentType === "IMAGE" ? (
                        <Image
                          src={`https://ipfs.io/ipfs/${contentCID}`}
                          alt="Preview"
                          width={320}
                          height={320}
                          className="object-contain max-h-80"
                          unoptimized
                        />
                      ) : (
                        <PhotoIcon className="w-12 h-12 text-[--fo-text-muted]" />
                      )}
                    </div>
                  )}
                  <div className="p-3 border-t border-[--fo-border] flex items-center gap-2 text-sm text-[--fo-text-muted]">
                    {accessLevel === "PUBLIC" && (
                      <>
                        <GlobeAltIcon className="w-4 h-4" />
                        <span>Public</span>
                      </>
                    )}
                    {accessLevel === "SUBSCRIBERS" && (
                      <>
                        <UserGroupIcon className="w-4 h-4" />
                        <span>Subscribers only</span>
                      </>
                    )}
                    {accessLevel === "TIER_GATED" && (
                      <>
                        <LockClosedIcon className="w-4 h-4" />
                        <span>{creatorTiers?.[selectedTier]?.name || `Tier ${selectedTier + 1}`} and above</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {(errorMessage || createError) && (
            <div className="mb-4 p-4 bg-[--fo-error]/10 border border-[--fo-error] rounded-lg text-[--fo-error] text-sm">
              {errorMessage || createError?.message || "An error occurred"}
            </div>
          )}

          {/* Submit Button */}
          <button onClick={handleSubmit} disabled={isPublishDisabled} className="fo-btn-primary w-full">
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                Publishing...
              </span>
            ) : isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                Uploading...
              </span>
            ) : (
              "Publish Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
