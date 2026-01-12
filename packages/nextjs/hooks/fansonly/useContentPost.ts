import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Content types matching the smart contract enum
export enum ContentType {
  TEXT = 0,
  IMAGE = 1,
  VIDEO = 2,
  AUDIO = 3,
  MIXED = 4,
}

// Access levels matching the smart contract enum
export enum AccessLevel {
  PUBLIC = 0,
  SUBSCRIBERS = 1,
  TIER_GATED = 2,
}

// Types matching the smart contract structs
export interface Post {
  id: bigint;
  creator: string;
  contentCID: string;
  previewCID: string;
  caption: string;
  contentType: ContentType;
  accessLevel: AccessLevel;
  requiredTierId: bigint;
  createdAt: bigint;
  likesCount: bigint;
  commentsCount: bigint;
  isActive: boolean;
}

export interface Comment {
  id: bigint;
  postId: bigint;
  commenter: string;
  content: string;
  createdAt: bigint;
  isActive: boolean;
}

/**
 * Hook to get a single post
 */
export function usePost(postId: bigint | undefined) {
  const { address } = useAccount();

  const {
    data: post,
    isLoading,
    refetch,
  } = useScaffoldReadContract({
    contractName: "ContentPost",
    functionName: "getPost",
    args: [postId],
  });

  const { data: hasLiked } = useScaffoldReadContract({
    contractName: "ContentPost",
    functionName: "hasLiked",
    args: [postId, address],
  });

  const { data: canAccess } = useScaffoldReadContract({
    contractName: "ContentPost",
    functionName: "canAccessPost",
    args: [postId, address],
  });

  return {
    post: post as Post | undefined,
    hasLiked: hasLiked ?? false,
    canAccess: canAccess ?? false,
    isLoading,
    refetch,
  };
}

/**
 * Hook to get posts for a creator
 */
export function useCreatorPosts(creatorAddress: string | undefined, offset: number = 0, limit: number = 20) {
  const { data: postCount, isLoading: isLoadingCount } = useScaffoldReadContract({
    contractName: "ContentPost",
    functionName: "getCreatorPostCount",
    args: [creatorAddress],
  });

  const {
    data: posts,
    isLoading: isLoadingPosts,
    refetch,
  } = useScaffoldReadContract({
    contractName: "ContentPost",
    functionName: "getCreatorPosts",
    args: [creatorAddress, BigInt(offset), BigInt(limit)],
  });

  return {
    postCount: postCount ? Number(postCount) : 0,
    posts: (posts as Post[]) ?? [],
    isLoading: isLoadingCount || isLoadingPosts,
    refetch,
  };
}

/**
 * Hook to get comments for a post
 */
export function usePostComments(postId: bigint | undefined, offset: number = 0, limit: number = 50) {
  const {
    data: comments,
    isLoading,
    refetch,
  } = useScaffoldReadContract({
    contractName: "ContentPost",
    functionName: "getPostComments",
    args: [postId, BigInt(offset), BigInt(limit)],
  });

  return {
    comments: (comments as Comment[]) ?? [],
    isLoading,
    refetch,
  };
}

/**
 * Hook to get user's liked posts
 */
export function useUserLikedPosts() {
  const { address } = useAccount();

  const {
    data: likedPostIds,
    isLoading,
    refetch,
  } = useScaffoldReadContract({
    contractName: "ContentPost",
    functionName: "getUserLikedPosts",
    args: [address],
  });

  return {
    likedPostIds: (likedPostIds as bigint[]) ?? [],
    isLoading,
    refetch,
  };
}

/**
 * Hook for creating a post
 */
export function useCreatePost() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "ContentPost",
  });

  const createPost = async (
    contentCID: string,
    previewCID: string,
    caption: string,
    contentType: ContentType,
    accessLevel: AccessLevel,
    requiredTierId: bigint = BigInt(0),
  ) => {
    return writeContractAsync({
      functionName: "createPost",
      args: [contentCID, previewCID, caption, contentType, accessLevel, requiredTierId],
    });
  };

  return {
    createPost,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook for updating a post
 */
export function useUpdatePost() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "ContentPost",
  });

  const updatePost = async (postId: bigint, caption: string, previewCID: string) => {
    return writeContractAsync({
      functionName: "updatePost",
      args: [postId, caption, previewCID],
    });
  };

  return {
    updatePost,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook for deleting a post
 */
export function useDeletePost() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "ContentPost",
  });

  const deletePost = async (postId: bigint) => {
    return writeContractAsync({
      functionName: "deletePost",
      args: [postId],
    });
  };

  return {
    deletePost,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook for liking a post
 */
export function useLikePost() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "ContentPost",
  });

  const likePost = async (postId: bigint) => {
    return writeContractAsync({
      functionName: "likePost",
      args: [postId],
    });
  };

  return {
    likePost,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook for unliking a post
 */
export function useUnlikePost() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "ContentPost",
  });

  const unlikePost = async (postId: bigint) => {
    return writeContractAsync({
      functionName: "unlikePost",
      args: [postId],
    });
  };

  return {
    unlikePost,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook for adding a comment
 */
export function useAddComment() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "ContentPost",
  });

  const addComment = async (postId: bigint, content: string) => {
    return writeContractAsync({
      functionName: "addComment",
      args: [postId, content],
    });
  };

  return {
    addComment,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook for deleting a comment
 */
export function useDeleteComment() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "ContentPost",
  });

  const deleteComment = async (commentId: bigint) => {
    return writeContractAsync({
      functionName: "deleteComment",
      args: [commentId],
    });
  };

  return {
    deleteComment,
    isPending,
    isSuccess,
    error,
  };
}

// Helper function to get content type label
export function getContentTypeLabel(type: ContentType): string {
  const labels: Record<ContentType, string> = {
    [ContentType.TEXT]: "Text",
    [ContentType.IMAGE]: "Image",
    [ContentType.VIDEO]: "Video",
    [ContentType.AUDIO]: "Audio",
    [ContentType.MIXED]: "Mixed",
  };
  return labels[type] || "Unknown";
}

// Helper function to get access level label
export function getAccessLevelLabel(level: AccessLevel): string {
  const labels: Record<AccessLevel, string> = {
    [AccessLevel.PUBLIC]: "Public",
    [AccessLevel.SUBSCRIBERS]: "Subscribers Only",
    [AccessLevel.TIER_GATED]: "Premium Tier",
  };
  return labels[level] || "Unknown";
}
