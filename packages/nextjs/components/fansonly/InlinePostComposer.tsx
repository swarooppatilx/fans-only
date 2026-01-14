"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PhotoIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { FileUpload } from "~~/components/FileUpload";
import { AccessLevel, ContentType, useCreatePost } from "~~/hooks/fansonly/useContentPost";
import { useCreator } from "~~/hooks/fansonly/useCreatorProfile";

type ContentTypeOption = "TEXT" | "IMAGE";
type AccessLevelOption = "PUBLIC" | "SUBSCRIBERS" | "TIER_GATED";
type PostState = "IDLE" | "UPLOADING" | "POSTING" | "SUCCESS" | "ERROR";

export function InlinePostComposer({ creator, onPostSuccess }: any) {
  const [caption, setCaption] = useState("");
  const [contentCID, setContentCID] = useState("");
  const [contentType, setContentType] = useState<ContentTypeOption>("TEXT");
  const [accessLevel, setAccessLevel] = useState<AccessLevelOption>("PUBLIC");
  const [selectedTier, setSelectedTier] = useState(0);
  const [postState, setPostState] = useState<PostState>("IDLE");
  const [errorMessage, setErrorMessage] = useState("");
  const [accessOpen, setAccessOpen] = useState(false);
  const [showCID, setShowCID] = useState(false);

  const { createPost } = useCreatePost();
  const { tiers } = useCreator(creator?.address);

  const isDisabled =
    postState === "POSTING" || postState === "UPLOADING" || (contentType !== "TEXT" && !contentCID.trim());

  const getContentEnum = () => (contentType === "IMAGE" ? ContentType.IMAGE : ContentType.TEXT);

  const getAccessEnum = () => {
    if (accessLevel === "SUBSCRIBERS") return AccessLevel.SUBSCRIBERS;
    if (accessLevel === "TIER_GATED") return AccessLevel.TIER_GATED;
    return AccessLevel.PUBLIC;
  };

  const submit = async () => {
    setErrorMessage("");
    setPostState("POSTING");

    try {
      const finalCID = contentType === "TEXT" && !contentCID.trim() ? "TEXT_ONLY" : contentCID;

      await createPost(finalCID, caption, getContentEnum(), getAccessEnum(), BigInt(selectedTier));

      setPostState("SUCCESS");
      setCaption("");
      setContentCID("");

      setTimeout(() => {
        setPostState("IDLE");
        onPostSuccess?.();
      }, 1200);
    } catch (e: any) {
      setErrorMessage(e?.message || "Transaction failed");
      setPostState("ERROR");
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 w-full max-w-xl mx-auto">
      <div className="flex">
        <div className="flex-1">
          {/* Access control */}
          <div className="relative mb-1">
            <button
              onClick={() => setAccessOpen(v => !v)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-[#00aff0]"
            >
              {accessLevel === "PUBLIC" && <GlobeAltIcon className="w-4 h-4" />}
              {accessLevel === "SUBSCRIBERS" && <UserGroupIcon className="w-4 h-4" />}
              {accessLevel === "TIER_GATED" && <LockClosedIcon className="w-4 h-4" />}
              {accessLevel}
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {accessOpen && (
              <div className="absolute z-20 mt-1 w-40 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                {["PUBLIC", "SUBSCRIBERS", "TIER_GATED"].map(l => (
                  <button
                    key={l}
                    onClick={() => {
                      setAccessLevel(l as any);
                      setAccessOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-700"
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Caption */}
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="What’s happening?"
            rows={2}
            maxLength={280}
            className="w-full bg-transparent outline-none resize-none text-slate-100 placeholder:text-slate-500 leading-relaxed"
          />

          {/* Upload */}
          {contentType === "IMAGE" && (
            <div className="mt-2 bg-slate-700/40 border border-slate-600 rounded-xl p-3">
              <FileUpload
                label=""
                accept="image/*"
                maxSizeMB={50}
                onUpload={cid => setContentCID(cid)}
                onUploadingChange={u => setPostState(u ? "UPLOADING" : "IDLE")}
                placeholder="Upload image"
              />
            </div>
          )}

          {/* CID fallback */}
          <button onClick={() => setShowCID(v => !v)} className="text-xs text-slate-500 mt-2">
            Paste CID manually
          </button>

          {showCID && (
            <input
              value={contentCID}
              onChange={e => setContentCID(e.target.value)}
              className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
              placeholder="Qm... or bafk..."
            />
          )}

          {/* Preview */}
          {contentCID && contentType === "IMAGE" && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
              <Image
                src={`https://ipfs.io/ipfs/${contentCID}`}
                alt="preview"
                width={400}
                height={300}
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Tier */}
          {accessLevel === "TIER_GATED" && tiers?.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {tiers.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTier(i)}
                  className={`px-2 py-1 rounded-full border text-xs ${
                    selectedTier === i
                      ? "border-[#00aff0] bg-[#00aff0]/10 text-[#00aff0]"
                      : "border-slate-600 text-slate-400"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2">
          <button
            onClick={() => setContentType("TEXT")}
            className={`p-1 rounded-full ${
              contentType === "TEXT" ? "bg-[#00aff0]/20 text-[#00aff0]" : "text-slate-400"
            }`}
          >
            <DocumentTextIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setContentType("IMAGE")}
            className={`p-1 rounded-full ${
              contentType === "IMAGE" ? "bg-[#00aff0]/20 text-[#00aff0]" : "text-slate-400"
            }`}
          >
            <PhotoIcon className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={submit}
          disabled={isDisabled}
          className="px-5 py-1.5 rounded-full bg-slate-100 text-slate-900 font-bold disabled:bg-slate-700 disabled:text-slate-400"
        >
          {postState === "POSTING" && "Posting…"}
          {postState === "UPLOADING" && "Uploading…"}
          {postState === "IDLE" && "Post"}
          {postState === "SUCCESS" && "Posted"}
          {postState === "ERROR" && "Retry"}
        </button>
      </div>

      {/* Status */}
      {postState === "SUCCESS" && (
        <div className="flex items-center gap-2 text-emerald-400 text-xs mt-2">
          <CheckCircleIcon className="w-4 h-4" /> Post published
        </div>
      )}

      {postState === "ERROR" && (
        <div className="flex items-center gap-2 text-red-400 text-xs mt-2">
          <ExclamationTriangleIcon className="w-4 h-4" /> {errorMessage}
        </div>
      )}
    </div>
  );
}
