"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { PlusIcon } from "@heroicons/react/24/outline";
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">
          {activeTiers.length}/{MAX_TIERS} tiers created
        </p>
        {canCreateMore && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00aff0] hover:bg-[#009bd6] text-white text-sm font-medium rounded-full transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Tier
          </button>
        )}
      </div>

      {/* Existing Tiers */}
      <div className="space-y-3 mb-4">
        {activeTiers.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <p className="text-sm">No subscription tiers yet</p>
            <p className="text-xs mt-1">Create your first tier to start earning</p>
          </div>
        ) : (
          activeTiers.map((tier, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-100">{tier.name}</h4>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">Active</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{tier.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-[#00aff0]">{formatEther(tier.price)} MNT</div>
                <div className="text-xs text-slate-500">per month</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Tier Form */}
      {isCreating && (
        <form onSubmit={handleCreateTier} className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h4 className="font-medium text-slate-100">Create New Tier</h4>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Tier Name</label>
            <input
              type="text"
              value={newTier.name}
              onChange={e => setNewTier({ ...newTier, name: e.target.value })}
              placeholder="e.g., Gold, Premium, VIP"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00aff0] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={newTier.description}
              onChange={e => setNewTier({ ...newTier, description: e.target.value })}
              placeholder="What subscribers get with this tier..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00aff0] resize-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Monthly Price (MNT)</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={newTier.price}
              onChange={e => setNewTier({ ...newTier, price: e.target.value })}
              placeholder="0.05"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00aff0] text-sm"
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
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !newTier.name || !newTier.description || !newTier.price}
              className="flex-1 px-4 py-2 bg-[#00aff0] hover:bg-[#009bd6] disabled:opacity-50 disabled:hover:bg-[#00aff0] text-white font-medium rounded-lg transition-colors text-sm"
            >
              {isPending ? "Creating..." : "Create Tier"}
            </button>
          </div>
        </form>
      )}

      {/* Max tiers warning */}
      {!canCreateMore && (
        <div className="text-center text-xs text-slate-500 py-2">Maximum of {MAX_TIERS} tiers allowed</div>
      )}
    </div>
  );
}
