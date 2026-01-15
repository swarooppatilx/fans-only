import React from "react";
import { toast } from "sonner";

type NotificationOptions = {
  duration?: number;
  description?: string;
};

// Helper function to extract text content from React nodes
const getTextContent = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (React.isValidElement(node)) {
    const props = node.props as any;
    if (props && props.children) {
      return getTextContent(props.children);
    }
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join(" ");
  }
  return "";
};

export const notification = {
  success: (content: React.ReactNode, options?: NotificationOptions) => {
    const textContent = getTextContent(content);
    return toast.success(textContent, {
      duration: options?.duration,
      description: options?.description,
    });
  },
  info: (content: React.ReactNode, options?: NotificationOptions) => {
    const textContent = getTextContent(content);
    return toast.info(textContent, {
      duration: options?.duration,
      description: options?.description,
    });
  },
  warning: (content: React.ReactNode, options?: NotificationOptions) => {
    const textContent = getTextContent(content);
    return toast.warning(textContent, {
      duration: options?.duration,
      description: options?.description,
    });
  },
  error: (content: React.ReactNode, options?: NotificationOptions) => {
    const textContent = getTextContent(content);
    return toast.error(textContent, {
      duration: options?.duration,
      description: options?.description,
    });
  },
  loading: (content: React.ReactNode, options?: NotificationOptions) => {
    const textContent = getTextContent(content);
    return toast.loading(textContent, {
      duration: options?.duration,
      description: options?.description,
    });
  },
  remove: (toastId: string | number) => {
    toast.dismiss(toastId);
  },
};
