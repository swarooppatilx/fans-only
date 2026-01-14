"use client";

import React from "react";
import { FaucetButton, RainbowKitCustomConnectButton } from "../../scaffold-eth";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { mantleSepolia } from "~~/scaffold.config";

export default function FansOnlyHeader() {
  const { chain: connectedChain } = useAccount();

  return (
    <header className="w-full bg-base-100 border-b border-base-300 px-4 py-2 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-primary">FansOnly</span>
      </div>
      <div className="flex items-center gap-2">
        <RainbowKitCustomConnectButton />
        {(connectedChain?.id === hardhat.id && <FaucetButton />) ||
          (connectedChain?.id === mantleSepolia.id && (
            <a
              href="https://faucet.testnet.mantle.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm px-2 rounded-full tooltip tooltip-bottom tooltip-primary"
              data-tip="Get test MNT"
            >
              <BanknotesIcon className="h-4 w-4" />
            </a>
          ))}
      </div>
    </header>
  );
}
