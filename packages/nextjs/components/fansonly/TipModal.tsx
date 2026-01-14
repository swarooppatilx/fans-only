"use client";

import React, { useState } from "react";
import Image from "next/image";
import { DollarSign, X } from "lucide-react";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { getIpfsUrl } from "~~/hooks/fansonly";

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
  const [isSending, setIsSending] = useState(false);
  const { isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  if (!isOpen) return null;

  const handleTip = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) return;

    setIsSending(true);
    try {
      // Direct ETH transfer to creator
      // In a real app, you might use a smart contract for tipping
      await writeContract({
        address: creatorAddress as `0x${string}`,
        abi: [],
        functionName: "",
        value: parseEther(amount.toString()),
      });

      onTipSuccess?.();
      onClose();
    } catch (error) {
      console.error("Tip failed:", error);
    } finally {
      setIsSending(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full p-1 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center border-4 border-slate-700 shadow-sm overflow-hidden">
            {creatorAvatar ? (
              <Image
                src={getIpfsUrl(creatorAvatar)}
                alt={creatorName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-2xl font-bold text-[#00aff0]">{creatorName.charAt(0)}</span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-slate-100">Tip {creatorName}</h3>
          <p className="text-slate-500 text-sm mt-1">Support your favorite creator directly</p>
        </div>

        {/* Preset Amounts */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {TIP_AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => handleAmountSelect(amt)}
              className={`bg-slate-800 hover:bg-slate-700 border transition-all rounded-xl p-4 flex flex-col items-center gap-1 group ${
                selectedAmount === amt
                  ? "border-[#00aff0] shadow-md shadow-[#00aff0]/20"
                  : "border-slate-700 hover:border-[#00aff0]"
              }`}
            >
              <span
                className={`text-2xl font-bold transition-colors ${
                  selectedAmount === amt ? "text-[#00aff0]" : "text-slate-200 group-hover:text-[#00aff0]"
                }`}
              >
                Ξ {amt}
              </span>
              <span className="text-xs text-slate-500 font-medium">MNT</span>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 flex items-center gap-3 border border-slate-700 focus-within:border-[#00aff0] focus-within:ring-1 focus-within:ring-[#00aff0]/20 transition-all">
          <span className="text-slate-400 text-xl font-light">Ξ</span>
          <input
            type="number"
            placeholder="Custom Amount (MNT)"
            value={customAmount}
            onChange={e => handleCustomAmountChange(e.target.value)}
            className="bg-transparent text-slate-100 font-bold text-lg w-full focus:outline-none placeholder:text-slate-500"
            step="0.001"
            min="0"
          />
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleTip}
          disabled={isSending || (!selectedAmount && !customAmount) || !isConnected}
          className="w-full py-4 px-6 bg-[#00aff0] hover:bg-[#009bd6] disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#00aff0]/30 hover:shadow-[#00aff0]/50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Confirm Transaction
              <DollarSign size={18} />
            </>
          )}
        </button>

        {!isConnected && <p className="text-center text-sm text-slate-500 mt-3">Connect your wallet to send tips</p>}
      </div>
    </div>
  );
}
