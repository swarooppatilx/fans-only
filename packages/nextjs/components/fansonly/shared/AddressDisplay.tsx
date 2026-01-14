import React from "react";

interface AddressDisplayProps {
  address: string;
  ens?: string;
  showCopy?: boolean;
  blockie?: React.ReactNode;
}

function truncateAddress(address: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
}

export default function AddressDisplay({ address, ens, showCopy = true, blockie }: AddressDisplayProps) {
  const [copied, setCopied] = React.useState(false);
  const display = ens || truncateAddress(address);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <span className="inline-flex items-center gap-1 font-mono text-sm">
      {blockie}
      <span>{display}</span>
      {showCopy && (
        <button className="btn btn-ghost btn-xs px-1" aria-label="Copy address" onClick={handleCopy}>
          {copied ? "✓" : "Copy"}
        </button>
      )}
    </span>
  );
}
