import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Types matching the smart contract structs
export interface Creator {
  username: string;
  displayName: string;
  bio: string;
  profileImageCID: string;
  bannerImageCID: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: bigint;
  totalSubscribers: bigint;
  totalEarnings: bigint;
  tipEarnings: bigint;
}

export interface SubscriptionTier {
  name: string;
  description: string;
  price: bigint;
  isActive: boolean;
}

export interface Subscription {
  tierId: bigint;
  startTime: bigint;
  endTime: bigint;
  isActive: boolean;
}

// IPFS gateway for displaying images
// Pinata gateway format: https://{gateway}.mypinata.cloud/ipfs/{CID}
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL;
export const IPFS_GATEWAY = GATEWAY_URL ? `https://${GATEWAY_URL}/ipfs/` : "https://ipfs.io/ipfs/";

export function getIpfsUrl(cid: string): string {
  if (!cid) return "";
  if (cid.startsWith("http")) return cid;
  return `${IPFS_GATEWAY}${cid}`;
}

/**
 * Hook to get the current user's creator profile
 */
export function useCurrentCreator() {
  const { address, isConnecting } = useAccount();

  const {
    data: isCreator,
    isLoading: isLoadingStatus,
    isFetched: isFetchedStatus,
  } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "isCreator",
    args: [address],
  });

  const {
    data: creator,
    isLoading: isLoadingProfile,
    isFetched: isFetchedProfile,
    refetch,
  } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getCreator",
    args: [address],
  });

  // Consider loading if: connecting, no address yet, queries are loading, or data not yet fetched
  const isLoading =
    isConnecting || !address || isLoadingStatus || isLoadingProfile || !isFetchedStatus || !isFetchedProfile;

  return {
    isCreator: isCreator ?? false,
    creator: creator as Creator | undefined,
    isLoading,
    refetch,
    address,
  };
}

/**
 * Hook to get a creator by address
 */
export function useCreator(creatorAddress: string | undefined) {
  const { data: isCreator, isLoading: isLoadingStatus } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "isCreator",
    args: [creatorAddress],
  });

  const {
    data: creator,
    isLoading: isLoadingProfile,
    refetch,
  } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getCreator",
    args: [creatorAddress],
  });

  const { data: tiers, isLoading: isLoadingTiers } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getCreatorTiers",
    args: [creatorAddress],
  });

  return {
    isCreator: isCreator ?? false,
    creator: creator as Creator | undefined,
    tiers: (tiers as SubscriptionTier[]) ?? [],
    isLoading: isLoadingStatus || isLoadingProfile || isLoadingTiers,
    refetch,
  };
}

/**
 * Hook to get a creator by username
 */
export function useCreatorByUsername(username: string | undefined) {
  const { data: creatorAddress, isLoading: isLoadingAddress } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getCreatorByUsername",
    args: [username],
  });

  const { creator, tiers, isLoading: isLoadingCreator, isCreator } = useCreator(creatorAddress as string);

  return {
    creatorAddress: creatorAddress as string | undefined,
    isCreator,
    creator,
    tiers,
    isLoading: isLoadingAddress || isLoadingCreator,
  };
}

/**
 * Hook to get all creators (paginated)
 */
export function useAllCreators(offset: number = 0, limit: number = 20) {
  const { data: totalCreators, isLoading: isLoadingTotal } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getTotalCreators",
  });

  const {
    data: creatorAddresses,
    isLoading: isLoadingAddresses,
    refetch,
  } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getCreators",
    args: [BigInt(offset), BigInt(limit)],
  });

  return {
    totalCreators: totalCreators ? Number(totalCreators) : 0,
    creatorAddresses: (creatorAddresses as string[]) ?? [],
    isLoading: isLoadingTotal || isLoadingAddresses,
    refetch,
  };
}

/**
 * Hook to check if current user is subscribed to a creator
 */
export function useSubscription(creatorAddress: string | undefined) {
  const { address } = useAccount();

  const {
    data: isSubscribed,
    isLoading: isLoadingSubscribed,
    refetch: refetchSubscribed,
  } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "isSubscribed",
    args: [creatorAddress, address],
  });

  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
  } = useScaffoldReadContract({
    contractName: "CreatorProfile",
    functionName: "getSubscription",
    args: [creatorAddress, address],
  });

  return {
    isSubscribed: isSubscribed ?? false,
    subscription: subscription as Subscription | undefined,
    isLoading: isLoadingSubscribed || isLoadingSubscription,
    refetch: () => {
      refetchSubscribed();
      refetchSubscription();
    },
  };
}

/**
 * Hook for creator registration
 */
export function useRegisterCreator() {
  const { writeContractAsync, isPending, isSuccess, error, reset } = useScaffoldWriteContract({
    contractName: "CreatorProfile",
  });

  const registerCreator = async (
    username: string,
    displayName: string,
    bio: string,
    profileImageCID: string,
    bannerImageCID: string,
  ) => {
    return writeContractAsync({
      functionName: "registerCreator",
      args: [username, displayName, bio, profileImageCID, bannerImageCID],
    });
  };

  return {
    registerCreator,
    isPending,
    isSuccess,
    error,
    reset,
  };
}

/**
 * Hook for updating creator profile
 */
export function useUpdateProfile() {
  const { writeContractAsync, isPending, isSuccess, error, reset } = useScaffoldWriteContract({
    contractName: "CreatorProfile",
  });

  const updateProfile = async (displayName: string, bio: string, profileImageCID: string, bannerImageCID: string) => {
    return writeContractAsync({
      functionName: "updateProfile",
      args: [displayName, bio, profileImageCID, bannerImageCID],
    });
  };

  return {
    updateProfile,
    isPending,
    isSuccess,
    error,
    reset,
  };
}

/**
 * Hook for creating a subscription tier
 */
export function useCreateTier() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "CreatorProfile",
  });

  const createTier = async (name: string, description: string, priceInWei: bigint) => {
    return writeContractAsync({
      functionName: "createTier",
      args: [name, description, priceInWei],
    });
  };

  return {
    createTier,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook for subscribing to a creator
 */
export function useSubscribe() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "CreatorProfile",
  });

  const subscribe = async (creatorAddress: string, tierId: bigint, priceInWei: bigint) => {
    return writeContractAsync({
      functionName: "subscribe",
      args: [creatorAddress, tierId],
      value: priceInWei,
    });
  };

  return {
    subscribe,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook for renewing a subscription
 */
export function useRenewSubscription() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "CreatorProfile",
  });

  const renewSubscription = async (creatorAddress: string, priceInWei: bigint) => {
    return writeContractAsync({
      functionName: "renewSubscription",
      args: [creatorAddress],
      value: priceInWei,
    });
  };

  return {
    renewSubscription,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook for tipping a creator
 */
export function useTipCreator() {
  const { writeContractAsync, isPending, isSuccess, error } = useScaffoldWriteContract({
    contractName: "CreatorProfile",
  });

  const tipCreator = async (creatorAddress: string, amountInWei: bigint) => {
    return writeContractAsync({
      functionName: "tipCreator",
      args: [creatorAddress],
      value: amountInWei,
    });
  };

  return {
    tipCreator,
    isPending,
    isSuccess,
    error,
  };
}
