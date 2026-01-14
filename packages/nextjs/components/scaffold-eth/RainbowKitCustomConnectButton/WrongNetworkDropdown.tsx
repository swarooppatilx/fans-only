import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="group flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 hover:border-red-500/50 rounded-full cursor-pointer transition-all duration-200"
      >
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
        <span className="text-sm font-medium text-red-400">Wrong network</span>
        <ChevronDownIcon className="h-4 w-4 text-red-400 transition-transform group-focus:rotate-180" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-50 p-2 mt-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl shadow-black/20 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <NetworkOptions />

        {/* Divider */}
        <div className="my-1 border-t border-slate-700" />

        <li>
          <button
            className="flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            type="button"
            onClick={() => disconnect()}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Disconnect</span>
          </button>
        </li>
      </ul>
    </div>
  );
};
