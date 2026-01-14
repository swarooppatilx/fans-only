/**
 * IPFS Upload Service
 * Uses Pinata SDK for decentralized file storage
 */

// Pinata gateway format: https://{gateway}.mypinata.cloud/ipfs/{CID}
// Fallback to public ipfs.io gateway if not configured
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL;
const IPFS_GATEWAY = GATEWAY_URL ? `https://${GATEWAY_URL}/ipfs` : "https://ipfs.io/ipfs";

// For production, uploads go through /api/upload route using Pinata SDK

export interface UploadResult {
  cid: string;
  url: string;
  size: number;
  name: string;
}

export interface IPFSConfig {
  gateway?: string;
  apiEndpoint?: string;
  apiKey?: string;
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadToPinata(file: File, apiKey: string, secretKey: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      app: "FansOnly",
      type: file.type,
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", options);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    cid: data.IpfsHash,
    url: `${IPFS_GATEWAY}/${data.IpfsHash}`,
    size: file.size,
    name: file.name,
  };
}

/**
 * Upload a file to IPFS via web3.storage
 */
export async function uploadToWeb3Storage(file: File, token: string): Promise<UploadResult> {
  const response = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Name": file.name,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`web3.storage upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    cid: data.cid,
    url: `${IPFS_GATEWAY}/${data.cid}`,
    size: file.size,
    name: file.name,
  };
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadMetadata(
  metadata: Record<string, unknown>,
  apiKey: string,
  secretKey: string,
): Promise<UploadResult> {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: "FansOnly Metadata",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Pinata JSON upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  const jsonString = JSON.stringify(metadata);

  return {
    cid: data.IpfsHash,
    url: `${IPFS_GATEWAY}/${data.IpfsHash}`,
    size: new Blob([jsonString]).size,
    name: "metadata.json",
  };
}

/**
 * Get IPFS URL from CID
 */
export function getIPFSUrl(cid: string, gateway?: string): string {
  if (!cid) return "";
  const baseGateway = gateway || IPFS_GATEWAY;
  // Handle both CID formats
  if (cid.startsWith("ipfs://")) {
    return `${baseGateway}/${cid.replace("ipfs://", "")}`;
  }
  return `${baseGateway}/${cid}`;
}

/**
 * Check if a string is a valid IPFS CID
 */
export function isValidCID(cid: string): boolean {
  if (!cid) return false;
  // Basic validation for CIDv0 (Qm...) and CIDv1 (bafy...)
  const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidv1Regex = /^b[a-z2-7]{58}$/;
  return cidv0Regex.test(cid) || cidv1Regex.test(cid) || cid.startsWith("bafk") || cid.startsWith("bafy");
}

/**
 * Get file type category from MIME type
 */
export function getFileCategory(mimeType: string): "image" | "video" | "audio" | "document" | "unknown" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("application/pdf") || mimeType.startsWith("text/") || mimeType.includes("document")) {
    return "document";
  }
  return "unknown";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
