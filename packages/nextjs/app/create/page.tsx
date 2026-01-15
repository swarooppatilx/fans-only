"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FileUpload } from "~~/components/FileUpload";
import { AccessLevel, ContentType, useCreatePost } from "~~/hooks/fansonly/useContentPost";
import { useCreator, useCurrentCreator } from "~~/hooks/fansonly/useCreatorProfile";

type ContentTypeOption = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";
type AccessLevelOption = "PUBLIC" | "SUBSCRIBERS" | "TIER_GATED";

const contentTypeOptions = [
  { value: "TEXT", icon: DocumentTextIcon, enumValue: ContentType.TEXT },
  { value: "IMAGE", icon: PhotoIcon, enumValue: ContentType.IMAGE },
  { value: "VIDEO", icon: VideoCameraIcon, enumValue: ContentType.VIDEO },
  { value: "AUDIO", icon: MusicalNoteIcon, enumValue: ContentType.AUDIO },
];

const CreatePostPage: NextPage = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [caption, setCaption] = useState("");
  const [contentCID, setContentCID] = useState("");
  const [contentType, setContentType] = useState<ContentTypeOption>("TEXT");
  const [accessLevel, setAccessLevel] = useState<AccessLevelOption>("PUBLIC");
  const [selectedTier, setSelectedTier] = useState(0);
  const [showCID, setShowCID] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { createPost, isPending: isCreating } = useCreatePost();
  const { isCreator, creator, isLoading } = useCurrentCreator();
  const { tiers } = useCreator(address);

  const ipfsUrl = contentCID ? `https://ipfs.io/ipfs/${contentCID}` : "";

  const isPublishDisabled = isCreating || isUploading || (contentType !== "TEXT" && !contentCID.trim());

  const submit = async () => {
    setErrorMessage("");

    const finalCID = contentType === "TEXT" && !contentCID.trim() ? "TEXT_ONLY" : contentCID;

    try {
      await createPost(
        finalCID,
        caption,
        contentTypeOptions.find(c => c.value === contentType)!.enumValue,
        accessLevel === "SUBSCRIBERS"
          ? AccessLevel.SUBSCRIBERS
          : accessLevel === "TIER_GATED"
            ? AccessLevel.TIER_GATED
            : AccessLevel.PUBLIC,
        BigInt(selectedTier),
      );

      setIsSuccess(true);
      setTimeout(() => router.push(`/creator/${creator?.username}`), 2200);
    } catch (e: any) {
      setErrorMessage(e?.message || "Transaction failed");
    }
  };

  if (isLoading || !isConnected || !isCreator) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center">
          <CheckCircleIcon className="w-14 h-14 mx-auto text-emerald-400 mb-4" />
          <div className="text-lg font-semibold text-slate-100">Post published</div>
          <div className="text-sm text-slate-400 mt-1">Your content is now live on your profile</div>

          <div className="mt-6 w-full h-1 bg-slate-700 rounded overflow-hidden">
            <div className="h-full w-full bg-[#00aff0] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-slate-100">New Post</h1>
          <button onClick={() => router.back()}>
            <XMarkIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-3xl px-7 py-6 space-y-6">
          {/* Caption */}
          <div>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Share something with your audience…"
              className="w-full bg-transparent outline-none resize-none text-lg text-slate-100 placeholder:text-slate-500 leading-relaxed"
              rows={4}
              maxLength={1000}
            />
            <div className="text-right text-xs text-slate-500 mt-1">{caption.length}/1000</div>
          </div>

          {/* Toolbar */}
          <div className="flex gap-3">
            {contentTypeOptions.map(o => (
              <button
                key={o.value}
                onClick={() => setContentType(o.value as ContentTypeOption)}
                className={`p-2 rounded-full ${
                  contentType === o.value ? "bg-[#00aff0]/20 text-[#00aff0]" : "text-slate-400 hover:bg-slate-700"
                }`}
              >
                <o.icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Upload */}
          {contentType !== "TEXT" && (
            <div className="bg-slate-700/40 border border-slate-600 rounded-2xl p-5">
              <FileUpload
                label=""
                accept={contentType === "IMAGE" ? "image/*" : contentType === "VIDEO" ? "video/*" : "audio/*"}
                maxSizeMB={contentType === "VIDEO" ? 100 : 50}
                onUpload={cid => setContentCID(cid)}
                onUploadingChange={setIsUploading}
                placeholder={`Upload ${contentType.toLowerCase()}`}
              />
            </div>
          )}

          {/* CID */}
          <div>
            <button onClick={() => setShowCID(v => !v)} className="text-xs text-slate-500">
              Paste CID manually
            </button>

            {showCID && (
              <input
                value={contentCID}
                onChange={e => setContentCID(e.target.value)}
                className="w-full mt-2 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-100"
                placeholder="Qm... or bafk..."
              />
            )}
          </div>

          {/* Visibility */}
          <div className="flex gap-2">
            {(["PUBLIC", "SUBSCRIBERS", "TIER_GATED"] as AccessLevelOption[]).map(v => (
              <button
                key={v}
                onClick={() => setAccessLevel(v)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  accessLevel === v
                    ? "border-[#00aff0] text-[#00aff0] bg-[#00aff0]/10"
                    : "border-slate-600 text-slate-400"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Tier */}
          {accessLevel === "TIER_GATED" && tiers?.length > 0 && (
            <div className="space-y-2">
              {tiers.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTier(i)}
                  className={`w-full flex justify-between px-4 py-2 rounded-xl border ${
                    selectedTier === i ? "border-[#00aff0] bg-[#00aff0]/10" : "border-slate-600"
                  }`}
                >
                  <span className="text-slate-100">{t.name}</span>
                  <span className="text-slate-400">{(Number(t.price) / 1e18).toFixed(4)} MNT</span>
                </button>
              ))}
            </div>
          )}

          {/* Preview toggle */}
          {(caption || contentCID) && (
            <button onClick={() => setIsPreview(v => !v)} className="text-sm text-[#00aff0]">
              {isPreview ? "Hide preview" : "Show preview"}
            </button>
          )}

          {/* Preview */}
          {isPreview && (
            <div className="bg-slate-700 border border-slate-600 rounded-2xl overflow-hidden">
              <div className="p-5 text-slate-100 whitespace-pre-wrap">{caption}</div>

              {contentCID && (
                <div className="bg-black">
                  {contentType === "IMAGE" && (
                    <Image
                      src={ipfsUrl}
                      alt="preview"
                      width={800}
                      height={600}
                      className="object-contain w-full"
                      unoptimized
                    />
                  )}
                  {contentType === "VIDEO" && <video src={ipfsUrl} controls className="w-full max-h-[420px]" />}
                  {contentType === "AUDIO" && <audio src={ipfsUrl} controls className="w-full p-4" />}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {errorMessage && <div className="text-sm text-red-400">{errorMessage}</div>}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={isPublishDisabled}
            className="w-full py-3 rounded-full bg-[#00aff0] hover:bg-[#009bd6] disabled:bg-slate-700 font-semibold text-white transition"
          >
            {isCreating ? "Publishing…" : isUploading ? "Uploading…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
