"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { SubscriptionTier, useCreateTier } from "~~/hooks/fansonly/useCreatorProfile";

interface TierManagerProps {
  tiers: SubscriptionTier[];
  onTierCreated?: () => void;
}

export function TierManager({ tiers, onTierCreated }: TierManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTier, setNewTier] = useState({
    name: "",
    description: "",
    price: "",
  });

  const { createTier, isPending } = useCreateTier();
  const MAX_TIERS = 5;
  const canCreateMore = tiers.length < MAX_TIERS;

  const handleCreateTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTier.name || !newTier.description || !newTier.price) return;

    try {
      const priceInWei = parseEther(newTier.price);
      await createTier(newTier.name, newTier.description, priceInWei);
      setNewTier({ name: "", description: "", price: "" });
      setIsCreating(false);
      onTierCreated?.();
    } catch (error) {
      console.error("Failed to create tier:", error);
    }
  };

  const activeTiers = tiers.filter(t => t.isActive);

  return (
    <div className="fo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Subscription Tiers</h3>
          <p className="text-sm text-base-content/60">
            {activeTiers.length}/{MAX_TIERS} tiers created
          </p>
        </div>
        {canCreateMore && !isCreating && (
          <button onClick={() => setIsCreating(true)} className="fo-btn-primary flex items-center gap-2 text-sm">
            <PlusIcon className="w-4 h-4" />
            Add Tier
          </button>
        )}
      </div>

      {/* Existing Tiers */}
      <div className="space-y-3 mb-6">
        {activeTiers.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <SparklesIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No subscription tiers yet</p>
            <p className="text-sm">Create your first tier to start earning</p>
          </div>
        ) : (
          activeTiers.map((tier, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg border border-base-300"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{tier.name}</h4>
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs rounded-full">Active</span>
                </div>
                <p className="text-sm text-base-content/60 mt-1">{tier.description}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-fo-primary">{formatEther(tier.price)} MNT</div>
                <div className="text-xs text-base-content/50">per month</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Tier Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateTier}
          className="space-y-4 p-4 bg-base-200/30 rounded-lg border border-fo-primary/30"
        >
          <h4 className="font-semibold text-fo-primary">Create New Tier</h4>

          <div>
            <label className="block text-sm font-medium mb-1">Tier Name</label>
            <input
              type="text"
              value={newTier.name}
              onChange={e => setNewTier({ ...newTier, name: e.target.value })}
              placeholder="e.g., Gold, Premium, VIP"
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newTier.description}
              onChange={e => setNewTier({ ...newTier, description: e.target.value })}
              placeholder="What subscribers get with this tier..."
              rows={2}
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monthly Price (MNT)</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={newTier.price}
              onChange={e => setNewTier({ ...newTier, price: e.target.value })}
              placeholder="0.05"
              className="w-full px-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fo-primary"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewTier({ name: "", description: "", price: "" });
              }}
              className="flex-1 px-4 py-2 bg-base-300 rounded-lg hover:bg-base-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !newTier.name || !newTier.description || !newTier.price}
              className="flex-1 fo-btn-primary disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                "Create Tier"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Max tiers warning */}
      {!canCreateMore && (
        <div className="text-center text-sm text-base-content/50 py-2">Maximum of {MAX_TIERS} tiers allowed</div>
      )}
    </div>
  );
}
