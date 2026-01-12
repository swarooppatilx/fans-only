"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  DocumentIcon,
  MusicalNoteIcon,
  PhotoIcon,
  TrashIcon,
  VideoCameraIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { getFileCategory, useIPFSUpload } from "~~/hooks/useIPFSUpload";

interface FileUploadProps {
  onUpload: (cid: string, url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  placeholder?: string;
  showPreview?: boolean;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept = "image/*,video/*,audio/*",
  maxSizeMB = 50,
  label,
  placeholder = "Drag and drop or click to upload",
  showPreview = true,
  className = "",
}: FileUploadProps) {
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null);
  const [uploadedCid, setUploadedCid] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { upload, isUploading, progress, error, reset } = useIPFSUpload({
    maxSizeMB,
    onSuccess: result => {
      setUploadedCid(result.cid);
      onUpload(result.cid, result.url);
    },
  });

  const handleFile = useCallback(
    async (file: File) => {
      // Create preview
      if (showPreview && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e => {
          setPreview({
            url: e.target?.result as string,
            type: file.type,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      } else {
        setPreview({
          url: "",
          type: file.type,
          name: file.name,
        });
      }

      // Upload to IPFS
      await upload(file);
    },
    [upload, showPreview],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setUploadedCid(null);
    reset();
    onUpload("", "");
  }, [reset, onUpload]);

  const getFileIcon = (type: string) => {
    const category = getFileCategory(type);
    switch (category) {
      case "image":
        return PhotoIcon;
      case "video":
        return VideoCameraIcon;
      case "audio":
        return MusicalNoteIcon;
      default:
        return DocumentIcon;
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}

      {/* Upload Area */}
      {!preview && (
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? "border-[--fo-primary] bg-[--fo-primary]/10"
              : "border-[--fo-border] hover:border-[--fo-border-light]"
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-4 text-[--fo-text-muted]" />
          <p className="text-[--fo-text-secondary] mb-2">{placeholder}</p>
          <p className="text-sm text-[--fo-text-muted]">Max size: {maxSizeMB}MB</p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative border border-[--fo-border] rounded-xl overflow-hidden">
          {/* Image Preview */}
          {preview.type.startsWith("image/") && preview.url && (
            <div className="aspect-video bg-base-200 flex items-center justify-center relative">
              <Image src={preview.url} alt="Preview" fill className="object-contain" unoptimized />
            </div>
          )}

          {/* Non-image Preview */}
          {(!preview.type.startsWith("image/") || !preview.url) && (
            <div className="aspect-video bg-base-200 flex flex-col items-center justify-center gap-2">
              {(() => {
                const Icon = getFileIcon(preview.type);
                return <Icon className="w-16 h-16 text-[--fo-text-muted]" />;
              })()}
              <span className="text-[--fo-text-secondary] text-sm">{preview.name}</span>
            </div>
          )}

          {/* Upload Status */}
          <div className="p-3 bg-base-100 border-t border-[--fo-border]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[--fo-primary] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-[--fo-text-secondary]">Uploading... {progress}%</span>
                  </>
                ) : uploadedCid ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5 text-[--fo-success] flex-shrink-0" />
                    <span className="text-sm text-[--fo-text-secondary] truncate">
                      CID: {uploadedCid.substring(0, 20)}...
                    </span>
                  </>
                ) : error ? (
                  <>
                    <XCircleIcon className="w-5 h-5 text-[--fo-error] flex-shrink-0" />
                    <span className="text-sm text-[--fo-error] truncate">{error}</span>
                  </>
                ) : null}
              </div>

              <button
                onClick={handleClear}
                className="p-1 hover:bg-base-200 rounded-full text-[--fo-text-muted] hover:text-[--fo-error]"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="mt-2 h-1 bg-base-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[--fo-primary] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !preview && (
        <p className="text-[--fo-error] text-sm mt-2 flex items-center gap-1">
          <XCircleIcon className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
