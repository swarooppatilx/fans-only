import React from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "small" | "medium" | "large";
  fallback?: React.ReactNode;
}

const sizeMap = {
  small: "w-8 h-8",
  medium: "w-12 h-12",
  large: "w-20 h-20",
};

export default function Avatar({ src, alt, size = "medium", fallback }: AvatarProps) {
  return (
    <div className={`avatar placeholder ${sizeMap[size]}`.trim()}>
      {src ? (
        <Image src={src} alt={alt || "avatar"} className="rounded-full object-cover" fill />
      ) : (
        fallback || (
          <div className="bg-primary text-primary-content rounded-full flex items-center justify-center font-bold w-full h-full">
            {alt?.[0] || "?"}
          </div>
        )
      )}
    </div>
  );
}
