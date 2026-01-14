"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import LaunchPopup from "~~/components/fansonly/LaunchPopup";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useAllCreators } from "~~/hooks/fansonly/useCreatorProfile";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const { totalCreators } = useAllCreators(0, 1);
  const [showLaunchPopup, setShowLaunchPopup] = useState(false);
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    // Show popup on first visit if wallet not connected
    const hasSeenPopup = localStorage.getItem("fansonly_seen_popup");
    if (!isConnected && !hasSeenPopup) {
      setShowLaunchPopup(true);
    }
  }, [isConnected]);

  const handleConnectWallet = () => {
    setShowLaunchPopup(false);
    localStorage.setItem("fansonly_seen_popup", "true");
    openConnectModal?.();
  };

  const handleExploreAsGuest = () => {
    setShowLaunchPopup(false);
    localStorage.setItem("fansonly_seen_popup", "true");
  };

  const handleClosePopup = () => {
    setShowLaunchPopup(false);
    localStorage.setItem("fansonly_seen_popup", "true");
  };

  const features = [
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: "Decentralized & Secure",
      description: "Your content and earnings are protected by blockchain technology. No middlemen, no censorship.",
    },
    {
      icon: <CurrencyDollarIcon className="h-8 w-8" />,
      title: "Low Platform Fees",
      description: "Only 5% platform fee compared to 20% on traditional platforms. Keep more of what you earn.",
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: "Direct Fan Connection",
      description: "Build genuine relationships with subscribers through exclusive content and tier-based access.",
    },
  ];

  const tiers = [
    { name: "Bronze", price: "0.01 MNT", features: ["Basic content access", "Community feed", "Creator updates"] },
    { name: "Silver", price: "0.05 MNT", features: ["All Bronze perks", "Exclusive posts", "Direct messages"] },
    {
      name: "Gold",
      price: "0.1 MNT",
      features: ["All Silver perks", "Behind-the-scenes", "Priority support", "Custom requests"],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Launch Popup */}
      {showLaunchPopup && (
        <LaunchPopup onConnect={handleConnectWallet} onExplore={handleExploreAsGuest} onClose={handleClosePopup} />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-800 text-[#00aff0] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-slate-700">
            <SparklesIcon className="h-4 w-4" />
            Built on Mantle Network
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-[#00aff0]">Monetize Your Content</span>
            <br />
            <span className="text-slate-100">On Your Terms</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            The decentralized platform for creators. Accept crypto subscriptions, maintain full control of your content,
            and keep 95% of your earnings.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {connectedAddress ? (
              <>
                <Link
                  href="/explore"
                  className="flex items-center gap-2 px-6 py-3 bg-[#00aff0] hover:bg-[#009bd6] text-white font-semibold rounded-full transition-all duration-200 shadow-lg shadow-[#00aff0]/30 hover:shadow-[#00aff0]/50"
                >
                  Explore Creators
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  href="/profile/create"
                  className="px-6 py-3 bg-transparent border-2 border-[#00aff0] text-[#00aff0] hover:bg-[#00aff0]/10 font-semibold rounded-full transition-all duration-200"
                >
                  Become a Creator
                </Link>
              </>
            ) : (
              <>
                <RainbowKitCustomConnectButton />
                <p className="text-sm text-slate-500">Connect your wallet to get started</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-slate-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: totalCreators.toString(), label: "Creators" },
            { value: "—", label: "Subscribers" },
            { value: "5%", label: "Platform Fee" },
            { value: "0", label: "Hidden Fees" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#00aff0]">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-100">
            Why Choose <span className="text-[#00aff0]">FansOnly</span>?
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">
            Built for creators who want ownership, transparency, and direct connection with their audience.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center hover:border-[#00aff0]/50 transition-all duration-200"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-700 flex items-center justify-center text-[#00aff0]">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-100">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Tiers Preview */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-100">
            Flexible Subscription Tiers
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">
            Creators can set up to 5 custom tiers with different perks and pricing.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`bg-slate-800 border rounded-2xl p-6 text-center transition-all duration-200 ${i === 1 ? "border-[#00aff0] scale-105 shadow-lg shadow-[#00aff0]/20" : "border-slate-700 hover:border-slate-600"}`}
              >
                {i === 1 && (
                  <div className="inline-flex items-center gap-1 bg-[#00aff0] text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-slate-100">{tier.name}</h3>
                <p className="text-3xl font-bold text-[#00aff0] mb-2">{tier.price}</p>
                <p className="text-sm text-slate-500 mb-6">per month</p>
                <ul className="space-y-3 text-left">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircleIcon className="h-5 w-5 text-[#00aff0] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">Ready to Start Earning?</h2>
          <p className="text-slate-400 mb-8">
            Join the decentralized creator economy. Set up your profile in minutes and start accepting crypto
            subscriptions today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/profile/create"
              className="px-6 py-3 bg-[#00aff0] hover:bg-[#009bd6] text-white font-semibold rounded-full transition-all duration-200 shadow-lg shadow-[#00aff0]/30"
            >
              Create Your Profile
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-full transition-all duration-200"
            >
              Browse Creators
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
