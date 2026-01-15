"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Coins, Heart, Sparkles, X } from "lucide-react";
import { useAccount } from "wagmi";
import { getIpfsUrl, useTipCreator } from "~~/hooks/fansonly";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar?: string;
  creatorAddress: string;
  onTipSuccess?: () => void;
}

const TIP_AMOUNTS = [0.01, 0.05, 0.1];

export default function TipModal({
  isOpen,
  onClose,
  creatorName,
  creatorAvatar,
  creatorAddress,
  onTipSuccess,
}: TipModalProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const { address: userAddress, isConnected } = useAccount();
  const { tipCreator, isPending: isTipping } = useTipCreator();

  const isSelfTipping = userAddress?.toLowerCase() === creatorAddress.toLowerCase();

  if (!isOpen) return null;

  const handleTip = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0 || isSelfTipping) return;

    try {
      const amountInWei = BigInt(amount * 10 ** 18);
      await tipCreator(creatorAddress, amountInWei);
      onTipSuccess?.();
      onClose();
    } catch (error) {
      console.error("Tip failed:", error);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full p-1.5 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#00aff0] to-[#0099cc] rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
            {creatorAvatar ? (
              <Image
                src={getIpfsUrl(creatorAvatar)}
                alt={creatorName}
                width={56}
                height={56}
                className="w-full h-full object-cover rounded-full"
                unoptimized
              />
            ) : (
              <span className="text-lg font-bold text-white">{creatorName.charAt(0)}</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-1">Support {creatorName}</h3>
          <p className="text-slate-400 text-sm">Send a tip to show appreciation</p>
        </div>

        {/* Preset Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {TIP_AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => handleAmountSelect(amt)}
              className={`bg-slate-800 hover:bg-slate-700 border transition-all rounded-lg p-3 flex flex-col items-center gap-1 group ${
                selectedAmount === amt
                  ? "border-[#00aff0] bg-[#00aff0]/10 shadow-sm"
                  : "border-slate-700 hover:border-[#00aff0]/50"
              }`}
            >
              <Coins
                size={16}
                className={`transition-colors ${
                  selectedAmount === amt ? "text-[#00aff0]" : "text-slate-400 group-hover:text-[#00aff0]"
                }`}
              />
              <span
                className={`text-sm font-semibold transition-colors ${
                  selectedAmount === amt ? "text-[#00aff0]" : "text-slate-200 group-hover:text-[#00aff0]"
                }`}
              >
                {amt}
              </span>
              <span className="text-xs text-slate-500">MNT</span>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="bg-slate-800 rounded-lg p-3 mb-4 flex items-center gap-2 border border-slate-700 focus-within:border-[#00aff0]/50 transition-all">
          <Coins size={16} className="text-slate-400" />
          <input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={e => handleCustomAmountChange(e.target.value)}
            className="bg-transparent text-slate-100 font-medium text-sm w-full focus:outline-none placeholder:text-slate-500"
            step="0.001"
            min="0"
          />
          <span className="text-xs text-slate-500 font-medium">MNT</span>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleTip}
          disabled={isTipping || (!selectedAmount && !customAmount) || !isConnected || isSelfTipping}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#00aff0] to-[#0099cc] hover:from-[#0099cc] hover:to-[#0088bb] disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isTipping ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Sending...</span>
            </>
          ) : isSelfTipping ? (
            <>
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-sm">Can&apos;t tip yourself</span>
            </>
          ) : (
            <>
              <Heart size={16} className="text-pink-300" />
              <span className="text-sm">Send Tip</span>
            </>
          )}
        </button>

        {!isConnected && (
          <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
            <Sparkles size={12} />
            Connect wallet to tip
          </p>
        )}

        {isSelfTipping && isConnected && (
          <p className="text-center text-xs text-amber-400 mt-3 flex items-center justify-center gap-1">
            <Sparkles size={12} />
            You can&apos;t tip yourself
          </p>
        )}
      </div>
    </div>
  );
}
