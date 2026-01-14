"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  fullWidth = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-full";

  const variants = {
    primary: "bg-[#00aff0] hover:bg-[#009bd6] text-white focus:ring-[#00aff0]",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white focus:ring-slate-700",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-200 focus:ring-slate-700",
    ghost: "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
