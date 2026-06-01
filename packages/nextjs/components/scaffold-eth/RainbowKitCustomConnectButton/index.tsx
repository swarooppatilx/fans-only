"use client";

// @refresh reset
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { RevealBurnerPKModal } from "./RevealBurnerPKModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Balance } from "@scaffold-ui/components";
import { Wallet } from "lucide-react";
import { Address } from "viem";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="group flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#00aff0] hover:bg-[#009bd6] text-white font-bold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#00aff0]/25 active:scale-[0.98]"
                    onClick={openConnectModal}
                    type="button"
                  >
                    <Wallet size={20} className="transition-transform group-hover:scale-110" />
                    <span className="hidden xl:inline">Connect Wallet</span>
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <div className="flex flex-col items-center gap-2">
                  <div className="hidden xl:flex items-center gap-2">
                    {/* <FaucetButton /> */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <Balance
                          address={account.address as Address}
                          style={{
                            minHeight: "0",
                            height: "auto",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#f8fafc",
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: networkColor }}>
                        {chain.name}
                      </span>
                    </div>
                  </div>
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                  <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
                  <RevealBurnerPKModal />
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
