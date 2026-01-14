"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, Theme, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className={`flex flex-col min-h-screen `}>
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Custom FansOnly dark theme for RainbowKit
const fansOnlyTheme: Theme = {
  ...darkTheme({
    accentColor: "#00aff0",
    accentColorForeground: "#ffffff",
    borderRadius: "large",
    fontStack: "system",
    overlayBlur: "small",
  }),
  colors: {
    ...darkTheme().colors,
    accentColor: "#00aff0",
    accentColorForeground: "#ffffff",
    actionButtonBorder: "transparent",
    actionButtonBorderMobile: "transparent",
    actionButtonSecondaryBackground: "#334155",
    closeButton: "#94a3b8",
    closeButtonBackground: "#1e293b",
    connectButtonBackground: "#00aff0",
    connectButtonBackgroundError: "#ef4444",
    connectButtonInnerBackground: "#1e293b",
    connectButtonText: "#ffffff",
    connectButtonTextError: "#ffffff",
    connectionIndicator: "#10b981",
    downloadBottomCardBackground: "#0f172a",
    downloadTopCardBackground: "#1e293b",
    error: "#ef4444",
    generalBorder: "#334155",
    generalBorderDim: "#1e293b",
    menuItemBackground: "#1e293b",
    modalBackdrop: "rgba(15, 23, 42, 0.8)",
    modalBackground: "#0f172a",
    modalBorder: "#334155",
    modalText: "#f8fafc",
    modalTextDim: "#94a3b8",
    modalTextSecondary: "#64748b",
    profileAction: "#1e293b",
    profileActionHover: "#334155",
    profileForeground: "#0f172a",
    selectedOptionBorder: "#00aff0",
    standby: "#f59e0b",
  },
  fonts: {
    body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  radii: {
    actionButton: "9999px",
    connectButton: "9999px",
    menuButton: "12px",
    modal: "16px",
    modalMobile: "16px",
  },
  shadows: {
    connectButton: "0 4px 12px rgba(0, 175, 240, 0.25)",
    dialog: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    profileDetailsAction: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    selectedOption: "0 0 0 2px rgba(0, 175, 240, 0.4)",
    selectedWallet: "0 0 0 2px rgba(0, 175, 240, 0.4)",
    walletLogo: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
};

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={fansOnlyTheme}
          modalSize="compact"
          showRecentTransactions={true}
        >
          <ProgressBar height="3px" color="#00aff0" />
          {mounted && <ScaffoldEthApp>{children}</ScaffoldEthApp>}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
