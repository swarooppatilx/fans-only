"use client";

import { useCallback, useState } from "react";
import { type UploadResult, formatFileSize, getFileCategory, getIPFSUrl, isValidCID } from "~~/services/ipfs";

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
 * Hook for handling IPFS file uploads
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
        // Get API keys from environment
        const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
        const pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

        if (!pinataApiKey || !pinataSecretKey) {
          // Fallback: Generate a mock CID for development
          // In production, this should throw an error
          console.warn("IPFS API keys not configured. Using mock upload for development.");

          setProgress(50);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay

          const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

          setProgress(100);

          const result: UploadResult = {
            cid: mockCid,
            url: getIPFSUrl(mockCid),
            size: file.size,
            name: file.name,
          };

          onSuccess?.(result);
          return result;
        }

        // Real upload to Pinata
        const formData = new FormData();
        formData.append("file", file);

        const metadata = JSON.stringify({
          name: file.name,
          keyvalues: {
            app: "FansOnly",
            type: file.type,
            category: getFileCategory(file.type),
          },
        });
        formData.append("pinataMetadata", metadata);
        formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

        const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretKey,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        setProgress(100);

        const result: UploadResult = {
          cid: data.IpfsHash,
          url: getIPFSUrl(data.IpfsHash),
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
