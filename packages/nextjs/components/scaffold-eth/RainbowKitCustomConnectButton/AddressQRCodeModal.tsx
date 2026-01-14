import { Address } from "@scaffold-ui/components";
import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { hardhat } from "viem/chains";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

type AddressQRCodeModalProps = {
  address: AddressType;
  modalId: string;
};

export const AddressQRCodeModal = ({ address, modalId }: AddressQRCodeModalProps) => {
  const { targetNetwork } = useTargetNetwork();
  return (
    <>
      <div>
        <input type="checkbox" id={`${modalId}`} className="modal-toggle" />
        <label htmlFor={`${modalId}`} className="modal cursor-pointer backdrop-blur-sm bg-slate-950/80">
          <label className="modal-box relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/30 max-w-sm animate-in">
            {/* dummy input to capture event onclick on modal box */}
            <input className="h-0 w-0 absolute top-0 left-0" />
            <label
              htmlFor={`${modalId}`}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all duration-200 hover:scale-110"
            >
              <XMarkIcon className="h-5 w-5" />
            </label>

            <div className="pt-2 pb-4">
              <h3 className="text-lg font-bold text-slate-100 mb-6">Wallet QR Code</h3>
              <div className="flex flex-col items-center gap-5">
                <div className="p-4 bg-white rounded-xl shadow-lg">
                  <QRCodeSVG value={address} size={200} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">Scan to receive funds</p>
                  <Address
                    address={address}
                    format="long"
                    disableAddressLink
                    onlyEnsOrAddress
                    blockExplorerAddressLink={
                      targetNetwork.id === hardhat.id ? `/blockexplorer/address/${address}` : undefined
                    }
                  />
                </div>
              </div>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};
