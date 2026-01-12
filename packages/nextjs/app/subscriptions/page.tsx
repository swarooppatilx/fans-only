"use client";

import { useState } from "react";
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
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getIPFSUrl } from "~~/services/ipfs";

// Mock subscription data - will be replaced with contract reads
const mockSubscriptions = [
  {
    creator: {
      address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
      username: "cryptoartist",
      displayName: "Crypto Artist",
      profileImageCID: "",
      isVerified: true,
    },
    tier: {
      id: 1,
      name: "Supporter",
      price: BigInt("50000000000000000"), // 0.05 ETH
      description: "Exclusive content and early access",
    },
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 15), // 15 days ago
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 15), // 15 days left
    isActive: true,
  },
  {
    creator: {
      address: "0x2345678901234567890123456789012345678901" as `0x${string}`,
      username: "defi_guru",
      displayName: "DeFi Guru",
      profileImageCID: "",
      isVerified: true,
    },
    tier: {
      id: 0,
      name: "Fan",
      price: BigInt("10000000000000000"), // 0.01 ETH
      description: "Basic subscriber access",
    },
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 25), // 25 days ago
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 5), // 5 days left (expiring soon)
    isActive: true,
  },
  {
    creator: {
      address: "0x3456789012345678901234567890123456789012" as `0x${string}`,
      username: "web3_dev",
      displayName: "Web3 Developer",
      profileImageCID: "",
      isVerified: false,
    },
    tier: {
      id: 1,
      name: "Premium",
      price: BigInt("100000000000000000"), // 0.1 ETH
      description: "Full access to all tutorials",
    },
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 35), // 35 days ago
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 5), // Expired 5 days ago
    isActive: false,
  },
];

interface SubscriptionCardProps {
  subscription: (typeof mockSubscriptions)[0];
  onRenew: () => void;
  isRenewing: boolean;
}

const SubscriptionCard = ({ subscription, onRenew, isRenewing }: SubscriptionCardProps) => {
  const { creator, tier, startTime, endTime, isActive } = subscription;

  const now = BigInt(Math.floor(Date.now() / 1000));
  const daysLeft = isActive ? Math.ceil(Number(endTime - now) / 86400) : 0;
  const isExpiringSoon = isActive && daysLeft <= 7;
  const isExpired = !isActive || endTime < now;

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`fo-card p-4 ${isExpired ? "opacity-60" : ""} ${isExpiringSoon && !isExpired ? "ring-2 ring-[--fo-warning]" : ""}`}
    >
      <div className="flex gap-4">
        {/* Creator Avatar */}
        <Link href={`/creator/${creator.username}`}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-0.5 flex-shrink-0">
            {creator.profileImageCID ? (
              <Image
                src={getIPFSUrl(creator.profileImageCID)}
                alt={creator.displayName}
                width={64}
                height={64}
                className="w-full h-full rounded-full object-cover"
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
              <span>Started {formatDate(startTime)}</span>
            </div>
            <div
              className={`flex items-center gap-1 ${isExpired ? "text-[--fo-text-muted]" : isExpiringSoon ? "text-[--fo-warning]" : "text-[--fo-text-secondary]"}`}
            >
              <ClockIcon className="w-4 h-4" />
              <span>{isExpired ? `Expired ${formatDate(endTime)}` : `${daysLeft} days left`}</span>
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
          disabled={isRenewing}
          className={`flex-1 text-sm py-2 rounded-full font-semibold transition-colors ${
            isExpired
              ? "bg-[--fo-primary] text-white hover:bg-[--fo-primary-hover]"
              : "bg-base-200 text-base-content hover:bg-base-300"
          }`}
        >
          {isRenewing ? "Processing..." : isExpired ? "Resubscribe" : "Renew Early"}
        </button>
      </div>
    </div>
  );
};

const SubscriptionsPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"active" | "expired">("active");
  const [renewingId, setRenewingId] = useState<string | null>(null);

  // Contract interaction
  const { writeContractAsync: renewSubscription, isPending: isRenewing } = useScaffoldWriteContract("CreatorProfile");

  const handleRenew = async (creatorAddress: `0x${string}`, tierId: number, price: bigint) => {
    if (!connectedAddress) return;

    setRenewingId(`${creatorAddress}-${tierId}`);
    try {
      await renewSubscription({
        functionName: "renewSubscription",
        args: [creatorAddress],
        value: price,
      });
    } catch (error) {
      console.error("Renewal failed:", error);
    } finally {
      setRenewingId(null);
    }
  };

  const activeSubscriptions = mockSubscriptions.filter(s => s.isActive);
  const expiredSubscriptions = mockSubscriptions.filter(s => !s.isActive);

  const totalMonthlySpend = activeSubscriptions.reduce((sum, s) => sum + s.tier.price, BigInt(0));

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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-[--fo-text-secondary]">Manage your creator subscriptions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="fo-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[--fo-primary]/10 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-[--fo-primary]" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
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
        {activeSubscriptions.some(s => {
          const daysLeft = Math.ceil(Number(s.endTime - BigInt(Math.floor(Date.now() / 1000))) / 86400);
          return daysLeft <= 7;
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
              Active ({activeSubscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("expired")}
              className={`pb-3 px-1 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === "expired"
                  ? "text-[--fo-primary] border-[--fo-primary]"
                  : "text-[--fo-text-muted] border-transparent hover:text-base-content"
              }`}
            >
              Expired ({expiredSubscriptions.length})
            </button>
          </div>
        </div>

        {/* Subscription List */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeSubscriptions.length > 0 ? (
              activeSubscriptions.map((subscription, index) => (
                <SubscriptionCard
                  key={index}
                  subscription={subscription}
                  onRenew={() =>
                    handleRenew(subscription.creator.address, subscription.tier.id, subscription.tier.price)
                  }
                  isRenewing={renewingId === `${subscription.creator.address}-${subscription.tier.id}` && isRenewing}
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

        {activeTab === "expired" && (
          <div className="space-y-4">
            {expiredSubscriptions.length > 0 ? (
              expiredSubscriptions.map((subscription, index) => (
                <SubscriptionCard
                  key={index}
                  subscription={subscription}
                  onRenew={() =>
                    handleRenew(subscription.creator.address, subscription.tier.id, subscription.tier.price)
                  }
                  isRenewing={renewingId === `${subscription.creator.address}-${subscription.tier.id}` && isRenewing}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
                <h3 className="text-xl font-semibold mb-2">No Expired Subscriptions</h3>
                <p className="text-[--fo-text-secondary]">All your subscriptions are active!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
