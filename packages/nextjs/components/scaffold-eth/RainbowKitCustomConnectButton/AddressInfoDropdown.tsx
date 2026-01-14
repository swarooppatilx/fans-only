import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { getAddress } from "viem";
import { Address } from "viem";
import { useAccount, useDisconnect } from "wagmi";
import {
  ArrowLeftIcon,
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useCopyToClipboard, useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";
import { isENS } from "~~/utils/scaffold-eth/common";

const BURNER_WALLET_ID = "burnerWallet";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const { connector } = useAccount();
  const checkSumAddress = getAddress(address);

  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };

  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-top dropdown-end leading-3">
        <summary className="group flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-full cursor-pointer transition-all duration-200 hover:shadow-lg list-none">
          <BlockieAvatar address={checkSumAddress} size={28} ensImage={ensAvatar} />
          <span className="hidden xl:inline text-sm font-medium text-slate-200">
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <ul className="dropdown-content menu z-[100] p-2 bottom-full mb-2 right-0 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl shadow-black/40 min-w-[220px]">
          {/* Back button when selecting network */}
          {selectingNetwork && (
            <li>
              <button
                className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors mb-1"
                onClick={() => setSelectingNetwork(false)}
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
            </li>
          )}

          <NetworkOptions hidden={!selectingNetwork} />

          {/* Copy Address */}
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
              onClick={() => copyAddressToClipboard(checkSumAddress)}
            >
              {isAddressCopiedToClipboard ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium">Copy address</span>
                </>
              )}
            </button>
          </li>

          {/* QR Code */}
          <li className={selectingNetwork ? "hidden" : ""}>
            <label
              htmlFor="qrcode-modal"
              className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <QrCodeIcon className="h-5 w-5" />
              <span className="text-sm font-medium">View QR Code</span>
            </label>
          </li>

          {/* Block Explorer */}
          <li className={selectingNetwork ? "hidden" : ""}>
            <a
              href={blockExplorerAddressLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              <span className="text-sm font-medium">View on Explorer</span>
            </a>
          </li>

          {/* Switch Network - Always show if more than 1 network available */}
          {allowedNetworks.length > 1 && (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                type="button"
                onClick={() => setSelectingNetwork(true)}
              >
                <ArrowsRightLeftIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Switch Network</span>
              </button>
            </li>
          )}

          {/* Reveal PK (Burner only) */}
          {connector?.id === BURNER_WALLET_ID && (
            <li className={selectingNetwork ? "hidden" : ""}>
              <label
                htmlFor="reveal-burner-pk-modal"
                className="flex items-center gap-3 px-3 py-2.5 text-amber-500 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <EyeIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Reveal Private Key</span>
              </label>
            </li>
          )}

          {/* Divider */}
          <div className={`my-1 border-t border-slate-700 ${selectingNetwork ? "hidden" : ""}`} />

          {/* Disconnect */}
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
              type="button"
              onClick={() => disconnect()}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
