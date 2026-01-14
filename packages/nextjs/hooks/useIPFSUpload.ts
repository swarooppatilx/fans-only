"use client";

import { useCallback, useState } from "react";
import { PinataSDK } from "pinata";
import { type UploadResult, formatFileSize, getFileCategory, getIPFSUrl, isValidCID } from "~~/services/ipfs";

// Client-side Pinata SDK instance for uploads via signed URLs
const pinataClient = new PinataSDK({
  pinataJwt: "",
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

interface UseIPFSUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

interface UseIPFSUploadReturn {
  upload: (file: File) => Promise<UploadResult | null>;
  uploadMultiple: (files: File[]) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

const DEFAULT_MAX_SIZE_MB = 100; // 100MB default max
const DEFAULT_ALLOWED_TYPES = ["image/*", "video/*", "audio/*", "application/pdf"];

/**
 * Hook for handling IPFS file uploads using Pinata v3 API with signed URLs
 */
export function useIPFSUpload(options: UseIPFSUploadOptions = {}): UseIPFSUploadReturn {
  const { maxSizeMB = DEFAULT_MAX_SIZE_MB, allowedTypes = DEFAULT_ALLOWED_TYPES, onSuccess, onError } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return `File too large. Maximum size is ${maxSizeMB}MB`;
      }

      // Check file type
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith("/*")) {
          const category = type.split("/")[0];
          return file.type.startsWith(category + "/");
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`;
      }

      return null;
    },
    [maxSizeMB, allowedTypes],
  );

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setError(null);
      setProgress(0);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onError?.(new Error(validationError));
        return null;
      }

      setIsUploading(true);

      try {
        setProgress(10);

        // Get signed upload URL from server
        const urlRequest = await fetch("/api/url");
        if (!urlRequest.ok) {
          throw new Error("Failed to get upload URL");
        }
        const { url: signedUrl } = await urlRequest.json();

        setProgress(30);

        // Upload file using Pinata SDK with signed URL
        const uploadResponse = await pinataClient.upload.public.file(file).url(signedUrl);

        setProgress(80);

        // Get the gateway URL for the uploaded file
        const fileUrl = await pinataClient.gateways.public.convert(uploadResponse.cid);

        setProgress(100);

        const result: UploadResult = {
          cid: uploadResponse.cid,
          url: fileUrl,
          size: file.size,
          name: file.name,
        };

        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        onError?.(new Error(errorMessage));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onSuccess, onError],
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      const results: UploadResult[] = [];

      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round((i / files.length) * 100));
        const result = await upload(files[i]);
        if (result) {
          results.push(result);
        }
      }

      setProgress(100);
      return results;
    },
    [upload],
  );

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
    setIsUploading(false);
  }, []);

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
    reset,
  };
}

// Re-export utilities for convenience
export { formatFileSize, getFileCategory, getIPFSUrl, isValidCID };
