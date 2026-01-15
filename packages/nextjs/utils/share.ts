/**
 * Share utilities for FansOnly posts and profiles
 */

export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

export interface ShareResult {
  success: boolean;
  method: "native" | "clipboard" | "none";
}

/**
 * Check if Web Share API is available
 */
export const canShare = (): boolean => {
  return typeof navigator !== "undefined" && !!navigator.share;
};

/**
 * Share content using Web Share API with fallback to clipboard
 */
export const shareContent = async (data: ShareData): Promise<ShareResult> => {
  // Try Web Share API first (mobile, some desktop browsers)
  if (canShare()) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return { success: true, method: "native" };
    } catch (error) {
      // User cancelled - don't fall through to clipboard
      if ((error as Error).name === "AbortError") {
        return { success: false, method: "none" };
      }
      // Other errors - fall through to clipboard below
      console.warn("Web Share API failed, falling back to clipboard:", error);
    }
  }

  // Fallback: copy to clipboard using legacy method first (more reliable across browsers)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = data.url;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true, method: "clipboard" };
    }

    // If execCommand failed, try modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(data.url);
      return { success: true, method: "clipboard" };
    }

    return { success: false, method: "none" };
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return { success: false, method: "none" };
  }
};

/**
 * Get the full URL for a post
 */
export const getPostShareUrl = (postId: string | number | bigint): string => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/post/${postId.toString()}`;
};

/**
 * Get the full URL for a creator profile
 */
export const getCreatorShareUrl = (username: string): string => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/creator/${username}`;
};

/**
 * Share a post
 */
export const sharePost = async (
  postId: string | number | bigint,
  creatorName?: string,
  caption?: string,
): Promise<ShareResult> => {
  const url = getPostShareUrl(postId);
  const title = creatorName ? `Post by ${creatorName} on FansOnly` : "Post on FansOnly";
  const text = caption ? `${caption.slice(0, 100)}${caption.length > 100 ? "..." : ""}` : undefined;

  return shareContent({ title, text, url });
};

/**
 * Share a creator profile
 */
export const shareCreator = async (username: string, displayName?: string): Promise<ShareResult> => {
  const url = getCreatorShareUrl(username);
  const title = displayName ? `${displayName} on FansOnly` : `@${username} on FansOnly`;
  const text = `Check out ${displayName || `@${username}`} on FansOnly!`;

  return shareContent({ title, text, url });
};
