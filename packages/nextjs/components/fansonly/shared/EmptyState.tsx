import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  cta?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {icon && <div className="w-16 h-16 text-base-content/20 mb-4">{icon}</div>}
      {title && <div className="text-xl font-semibold text-base-content/60 mb-2">{title}</div>}
      {description && <div className="text-sm text-base-content/40 mb-4">{description}</div>}
      {cta}
    </div>
  );
}
