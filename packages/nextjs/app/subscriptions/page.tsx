"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  Creator,
  Subscription,
  SubscriptionTier,
  getIpfsUrl,
  useAllCreators,
  useCreator,
  useRenewSubscription,
  useSubscription,
} from "~~/hooks/fansonly/useCreatorProfile";

// Mock subscriptions for demo when no real data
const mockSubscriptions = [
  {
    creatorAddress: "0x1234567890123456789012345678901234567890",
    creator: {
      username: "cryptoartist",
      displayName: "Crypto Artist",
      profileImageCID: "",
      isVerified: true,
    },
    tier: {
      name: "Supporter",
      price: BigInt("50000000000000000"),
      description: "Exclusive content and early access",
    },
    subscription: {
      tierId: BigInt(1),
      startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 15),
      endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 15),
      isActive: true,
    },
  },
  {
    creatorAddress: "0x2345678901234567890123456789012345678901",
    creator: {
      username: "defi_guru",
      displayName: "DeFi Guru",
      profileImageCID: "",
      isVerified: true,
    },
    tier: {
      name: "Fan",
      price: BigInt("10000000000000000"),
      description: "Basic subscriber access",
    },
    subscription: {
      tierId: BigInt(0),
      startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 25),
      endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 5),
      isActive: true,
    },
  },
];

// Type for subscription with creator data
interface SubscriptionWithCreator {
  creatorAddress: string;
  creator: {
    username: string;
    displayName: string;
    profileImageCID: string;
    isVerified: boolean;
  };
  tier: {
    name: string;
    price: bigint;
    description: string;
  };
  subscription: {
    tierId: bigint;
    startTime: bigint;
    endTime: bigint;
    isActive: boolean;
  };
}

// Fetcher component for subscription data
function SubscriptionDataFetcher({
  creatorAddress,
  onDataLoaded,
}: {
  creatorAddress: string;
  onDataLoaded: (
    creatorAddress: string,
    isSubscribed: boolean,
    subscription: Subscription | undefined,
    creator: Creator | undefined,
    tiers: SubscriptionTier[],
  ) => void;
}) {
  const { isSubscribed, subscription, isLoading: isLoadingSub } = useSubscription(creatorAddress);
  const { creator, tiers, isLoading: isLoadingCreator } = useCreator(creatorAddress);

  useEffect(() => {
    if (!isLoadingSub && !isLoadingCreator) {
      onDataLoaded(creatorAddress, isSubscribed, subscription, creator, tiers);
    }
  }, [isSubscribed, subscription, creator, tiers, isLoadingSub, isLoadingCreator, creatorAddress, onDataLoaded]);

  return null;
}

interface SubscriptionCardProps {
  data: SubscriptionWithCreator;
  onRenew: () => void;
  isRenewing: boolean;
  isDemo?: boolean;
}

const SubscriptionCard = ({ data, onRenew, isRenewing, isDemo = false }: SubscriptionCardProps) => {
  const { creator, tier, subscription } = data;

  const now = BigInt(Math.floor(Date.now() / 1000));
  const daysLeft = subscription.isActive ? Math.ceil(Number(subscription.endTime - now) / 86400) : 0;
  const isExpiringSoon = subscription.isActive && daysLeft <= 7 && daysLeft > 0;
  const isExpired = !subscription.isActive || subscription.endTime < now;

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`fo-card p-4 relative ${isExpired ? "opacity-60" : ""} ${isExpiringSoon && !isExpired ? "ring-2 ring-[--fo-warning]" : ""}`}
    >
      {isDemo && (
        <div className="absolute top-2 right-2 bg-warning/20 text-warning text-xs px-2 py-0.5 rounded-full z-10">
          Demo
        </div>
      )}

      <div className="flex gap-4">
        {/* Creator Avatar */}
        <Link href={`/creator/${creator.username}`}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-0.5 flex-shrink-0">
            {creator.profileImageCID ? (
              <Image
                src={getIpfsUrl(creator.profileImageCID)}
                alt={creator.displayName}
                width={64}
                height={64}
                className="w-full h-full rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-xl font-bold text-[--fo-primary]">
                {creator.displayName.charAt(0)}
              </div>
            )}
          </div>
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/creator/${creator.username}`} className="flex items-center gap-1">
                <span className="font-semibold hover:text-[--fo-primary] transition-colors">{creator.displayName}</span>
                {creator.isVerified && <CheckBadgeIcon className="w-4 h-4 text-[--fo-primary]" />}
              </Link>
              <p className="text-sm text-[--fo-text-muted]">@{creator.username}</p>
            </div>

            {/* Status Badge */}
            {isExpired ? (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-base-200 text-[--fo-text-muted]">
                Expired
              </span>
            ) : isExpiringSoon ? (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-[--fo-warning]/10 text-[--fo-warning]">
                Expiring Soon
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-[--fo-success]/10 text-[--fo-success]">
                Active
              </span>
            )}
          </div>

          {/* Tier Info */}
          <div className="mt-2 p-2 bg-base-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{tier.name}</span>
              <span className="text-sm text-[--fo-primary] font-semibold">{formatEther(tier.price)} MNT/month</span>
            </div>
            <p className="text-xs text-[--fo-text-muted] mt-1">{tier.description}</p>
          </div>

          {/* Dates */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-[--fo-text-secondary]">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>Started {formatDate(subscription.startTime)}</span>
            </div>
            <div
              className={`flex items-center gap-1 ${isExpired ? "text-[--fo-text-muted]" : isExpiringSoon ? "text-[--fo-warning]" : "text-[--fo-text-secondary]"}`}
            >
              <ClockIcon className="w-4 h-4" />
              <span>{isExpired ? `Expired ${formatDate(subscription.endTime)}` : `${daysLeft} days left`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-[--fo-border] flex gap-2">
        <Link href={`/creator/${creator.username}`} className="fo-btn-secondary flex-1 text-center text-sm py-2">
          View Profile
        </Link>
        <button
          onClick={onRenew}
          disabled={isRenewing || isDemo}
          className={`flex-1 text-sm py-2 rounded-full font-semibold transition-colors disabled:opacity-50 ${
            isExpired
              ? "bg-[--fo-primary] text-white hover:bg-[--fo-primary-hover]"
              : "bg-base-200 text-base-content hover:bg-base-300"
          }`}
        >
          {isRenewing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="loading loading-spinner loading-xs"></span>
              Processing...
            </span>
          ) : isExpired ? (
            "Resubscribe"
          ) : (
            "Renew Early"
          )}
        </button>
      </div>
    </div>
  );
};

// Loading skeleton
const SubscriptionSkeleton = () => (
  <div className="fo-card p-4 animate-pulse">
    <div className="flex gap-4">
      <div className="w-16 h-16 rounded-full bg-base-300"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-base-300 rounded w-32"></div>
        <div className="h-3 bg-base-300 rounded w-24"></div>
        <div className="h-12 bg-base-300 rounded mt-2"></div>
      </div>
    </div>
  </div>
);

const SubscriptionsPage: NextPage = () => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"active" | "expired">("active");
  const [subscriptionsMap, setSubscriptionsMap] = useState<Map<string, SubscriptionWithCreator>>(new Map());
  const [renewingAddress, setRenewingAddress] = useState<string | null>(null);

  // Get all creator addresses to check subscriptions
  const { creatorAddresses, isLoading: isLoadingCreators } = useAllCreators(0, 100);

  // Renew subscription hook
  const { renewSubscription, isPending: isRenewing } = useRenewSubscription();

  // Callback for subscription data
  const handleDataLoaded = useCallback(
    (
      creatorAddress: string,
      isSubscribed: boolean,
      subscription: Subscription | undefined,
      creator: Creator | undefined,
      tiers: SubscriptionTier[],
    ) => {
      if (isSubscribed && subscription && creator) {
        const tierData = tiers[Number(subscription.tierId)] || { name: "Tier", price: BigInt(0), description: "" };

        setSubscriptionsMap(prev => {
          const next = new Map(prev);
          next.set(creatorAddress, {
            creatorAddress,
            creator: {
              username: creator.username,
              displayName: creator.displayName,
              profileImageCID: creator.profileImageCID,
              isVerified: creator.isVerified,
            },
            tier: {
              name: tierData.name,
              price: tierData.price,
              description: tierData.description,
            },
            subscription: {
              tierId: subscription.tierId,
              startTime: subscription.startTime,
              endTime: subscription.endTime,
              isActive: subscription.isActive,
            },
          });
          return next;
        });
      }
    },
    [],
  );

  // Handle renew
  const handleRenew = async (creatorAddress: string, price: bigint) => {
    setRenewingAddress(creatorAddress);
    try {
      await renewSubscription(creatorAddress as `0x${string}`, price);
    } catch (error) {
      console.error("Renewal failed:", error);
    } finally {
      setRenewingAddress(null);
    }
  };

  // Process subscriptions
  const allSubscriptions = useMemo(() => Array.from(subscriptionsMap.values()), [subscriptionsMap]);

  const now = BigInt(Math.floor(Date.now() / 1000));
  const activeSubscriptions = allSubscriptions.filter(s => s.subscription.isActive && s.subscription.endTime > now);
  const expiredSubscriptions = allSubscriptions.filter(s => !s.subscription.isActive || s.subscription.endTime <= now);

  // Show demo data if no real subscriptions
  const hasRealSubscriptions = allSubscriptions.length > 0;
  const displayActive = hasRealSubscriptions ? activeSubscriptions : mockSubscriptions;
  const displayExpired = hasRealSubscriptions ? expiredSubscriptions : [];
  const isDemo = !hasRealSubscriptions;

  const totalMonthlySpend = (hasRealSubscriptions ? activeSubscriptions : mockSubscriptions).reduce(
    (sum, s) => sum + s.tier.price,
    BigInt(0),
  );

  const isLoading = isLoadingCreators;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-[--fo-text-secondary]">Please connect your wallet to view your subscriptions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Hidden data fetchers */}
      {creatorAddresses.map(address => (
        <SubscriptionDataFetcher key={address} creatorAddress={address} onDataLoaded={handleDataLoaded} />
      ))}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-[--fo-text-secondary]">Manage your creator subscriptions</p>
        </div>

        {/* Demo Mode Banner */}
        {isDemo && !isLoading && (
          <div className="bg-info/10 border border-info/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-info">
              <strong>Demo Mode:</strong> Showing sample subscriptions. Your real subscriptions will appear here once
              you subscribe to creators.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="fo-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[--fo-primary]/10 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-[--fo-primary]" />
              </div>
              <div>
                <div className="text-2xl font-bold">{displayActive.length}</div>
                <div className="text-sm text-[--fo-text-muted]">Active Subscriptions</div>
              </div>
            </div>
          </div>
          <div className="fo-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[--fo-accent]/10 flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 text-[--fo-accent]" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatEther(totalMonthlySpend)} MNT</div>
                <div className="text-sm text-[--fo-text-muted]">Monthly Spend</div>
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Soon Warning */}
        {displayActive.some(s => {
          const daysLeft = Math.ceil(Number(s.subscription.endTime - now) / 86400);
          return daysLeft <= 7 && daysLeft > 0;
        }) && (
          <div className="mb-6 p-4 bg-[--fo-warning]/10 border border-[--fo-warning] rounded-lg flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-[--fo-warning] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[--fo-warning]">Subscriptions Expiring Soon</p>
              <p className="text-sm text-[--fo-text-secondary]">
                Some of your subscriptions will expire within the next 7 days. Renew to keep access.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-[--fo-border] mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-3 px-1 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === "active"
                  ? "text-[--fo-primary] border-[--fo-primary]"
                  : "text-[--fo-text-muted] border-transparent hover:text-base-content"
              }`}
            >
              Active ({displayActive.length})
            </button>
            <button
              onClick={() => setActiveTab("expired")}
              className={`pb-3 px-1 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === "expired"
                  ? "text-[--fo-primary] border-[--fo-primary]"
                  : "text-[--fo-text-muted] border-transparent hover:text-base-content"
              }`}
            >
              Expired ({displayExpired.length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            <SubscriptionSkeleton />
            <SubscriptionSkeleton />
          </div>
        ) : (
          <>
            {/* Active Subscriptions */}
            {activeTab === "active" && (
              <div className="space-y-4">
                {displayActive.length > 0 ? (
                  displayActive.map(data => (
                    <SubscriptionCard
                      key={data.creatorAddress}
                      data={data}
                      onRenew={() => handleRenew(data.creatorAddress, data.tier.price)}
                      isRenewing={renewingAddress === data.creatorAddress && isRenewing}
                      isDemo={isDemo}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
                    <h3 className="text-xl font-semibold mb-2">No Active Subscriptions</h3>
                    <p className="text-[--fo-text-secondary] mb-6">
                      Discover amazing creators and support them with subscriptions
                    </p>
                    <Link href="/explore" className="fo-btn-primary inline-block">
                      Explore Creators
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Expired Subscriptions */}
            {activeTab === "expired" && (
              <div className="space-y-4">
                {displayExpired.length > 0 ? (
                  displayExpired.map(data => (
                    <SubscriptionCard
                      key={data.creatorAddress}
                      data={data}
                      onRenew={() => handleRenew(data.creatorAddress, data.tier.price)}
                      isRenewing={renewingAddress === data.creatorAddress && isRenewing}
                      isDemo={isDemo}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
                    <h3 className="text-xl font-semibold mb-2">No Expired Subscriptions</h3>
                    <p className="text-[--fo-text-secondary]">
                      {isDemo ? "Sample data shown - no expired subscriptions" : "All your subscriptions are active!"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
