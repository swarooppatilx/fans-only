"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  DocumentTextIcon,
  GlobeAltIcon,
  LockClosedIcon,
  MusicalNoteIcon,
  PhotoIcon,
  UserGroupIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type ContentType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "MIXED";
type AccessLevel = "PUBLIC" | "SUBSCRIBERS" | "TIER_GATED";

const contentTypeOptions = [
  { value: "TEXT" as ContentType, label: "Text", icon: DocumentTextIcon },
  { value: "IMAGE" as ContentType, label: "Image", icon: PhotoIcon },
  { value: "VIDEO" as ContentType, label: "Video", icon: VideoCameraIcon },
  { value: "AUDIO" as ContentType, label: "Audio", icon: MusicalNoteIcon },
  { value: "MIXED" as ContentType, label: "Mixed", icon: PhotoIcon },
];

const accessLevelOptions = [
  {
    value: "PUBLIC" as AccessLevel,
    label: "Public",
    description: "Anyone can view this post",
    icon: GlobeAltIcon,
  },
  {
    value: "SUBSCRIBERS" as AccessLevel,
    label: "All Subscribers",
    description: "Any subscriber can view",
    icon: UserGroupIcon,
  },
  {
    value: "TIER_GATED" as AccessLevel,
    label: "Tier Gated",
    description: "Specific tier required",
    icon: LockClosedIcon,
  },
];

const CreatePostPage: NextPage = () => {
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useAccount();

  // Form state
  const [caption, setCaption] = useState("");
  const [contentCID, setContentCID] = useState("");
  const [contentType, setContentType] = useState<ContentType>("TEXT");
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("PUBLIC");
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [isPreview, setIsPreview] = useState(false);

  // Contract interactions
  const { writeContractAsync: createPost, isPending: isCreating } = useScaffoldWriteContract("ContentPost");

  // Get creator's profile and tiers for tier-gated posts
  const { data: creatorProfile } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getCreator",
    args: [connectedAddress],
  });

  const { data: creatorTiers } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getCreatorTiers",
    args: [connectedAddress],
  });

  const isCreator = creatorProfile?.isActive;

  // Map content type to contract enum value
  const getContentTypeValue = (type: ContentType): number => {
    const types: Record<ContentType, number> = {
      TEXT: 0,
      IMAGE: 1,
      VIDEO: 2,
      AUDIO: 3,
      MIXED: 4,
    };
    return types[type];
  };

  // Map access level to contract enum value
  const getAccessLevelValue = (level: AccessLevel): number => {
    const levels: Record<AccessLevel, number> = {
      PUBLIC: 0,
      SUBSCRIBERS: 1,
      TIER_GATED: 2,
    };
    return levels[level];
  };

  const handleSubmit = async () => {
    if (!isConnected || !connectedAddress) {
      alert("Please connect your wallet");
      return;
    }

    if (!caption.trim()) {
      alert("Please add a caption");
      return;
    }

    try {
      await createPost({
        functionName: "createPost",
        args: [
          contentCID,
          "", // previewCID - optional
          caption,
          getContentTypeValue(contentType),
          getAccessLevelValue(accessLevel),
          BigInt(selectedTier),
        ],
      });

      router.push(`/creator/${creatorProfile?.username}`);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

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

          {/* Content CID */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Content IPFS CID (optional for text posts)</label>
            <input
              type="text"
              value={contentCID}
              onChange={e => setContentCID(e.target.value)}
              placeholder="Qm... or bafk..."
              className="fo-input"
            />
            <p className="text-[--fo-text-muted] text-sm mt-1">Upload your media to IPFS and paste the CID here</p>
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
                      <PhotoIcon className="w-12 h-12 text-[--fo-text-muted]" />
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

          {/* Submit Button */}
          <button onClick={handleSubmit} disabled={isCreating || !caption.trim()} className="fo-btn-primary w-full">
            {isCreating ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
