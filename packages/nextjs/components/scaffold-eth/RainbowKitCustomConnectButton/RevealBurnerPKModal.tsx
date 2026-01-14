import { useRef } from "react";
import { rainbowkitBurnerWallet } from "burner-connector";
import { CheckIcon, ClipboardDocumentIcon, ShieldExclamationIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const BURNER_WALLET_PK_KEY = "burnerWallet.pk";

export const RevealBurnerPKModal = () => {
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();
  const modalCheckboxRef = useRef<HTMLInputElement>(null);

  const handleCopyPK = async () => {
    try {
      const storage = rainbowkitBurnerWallet.useSessionStorage ? sessionStorage : localStorage;
      const burnerPK = storage?.getItem(BURNER_WALLET_PK_KEY);
      if (!burnerPK) throw new Error("Burner wallet private key not found");
      await copyToClipboard(burnerPK);
      notification.success("Burner wallet private key copied to clipboard");
    } catch (e) {
      const parsedError = getParsedError(e);
      notification.error(parsedError);
      if (modalCheckboxRef.current) modalCheckboxRef.current.checked = false;
    }
  };

  return (
    <>
      <div>
        <input type="checkbox" id="reveal-burner-pk-modal" className="modal-toggle" ref={modalCheckboxRef} />
        <label htmlFor="reveal-burner-pk-modal" className="modal cursor-pointer backdrop-blur-sm bg-slate-950/80">
          <label className="modal-box relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/30 max-w-md animate-in">
            {/* dummy input to capture event onclick on modal box */}
            <input className="h-0 w-0 absolute top-0 left-0" />
            <label
              htmlFor="reveal-burner-pk-modal"
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all duration-200 hover:scale-110"
            >
              <XMarkIcon className="h-5 w-5" />
            </label>

            <div className="pt-2">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Copy Burner Wallet Private Key</h3>

              {/* Warning Alert */}
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                <ShieldExclamationIcon className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200 m-0">
                  Burner wallets are intended for <strong>local development only</strong> and are not safe for storing
                  real funds.
                </p>
              </div>

              <p className="text-slate-400 text-sm mb-6">
                Your Private Key provides <span className="text-slate-200 font-medium">full access</span> to your entire
                wallet and funds. This is currently stored{" "}
                <span className="text-slate-200 font-medium">temporarily</span> in your browser.
              </p>

              <button
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-500/10 border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCopyPK}
                disabled={isCopiedToClipboard}
              >
                {isCopiedToClipboard ? (
                  <>
                    <CheckIcon className="h-5 w-5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-5 w-5" />
                    <span>Copy Private Key To Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};
