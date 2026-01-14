"use client";

import Link from "next/link";
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
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useAllCreators } from "~~/hooks/fansonly/useCreatorProfile";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { totalCreators } = useAllCreators(0, 1);

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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-[--fo-primary]/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[--fo-primary-light] text-[--fo-primary] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <SparklesIcon className="h-4 w-4" />
            Built on Mantle Network
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="fo-gradient-text">Monetize Your Content</span>
            <br />
            <span className="text-base-content">On Your Terms</span>
          </h1>

          <p className="text-lg md:text-xl text-[--fo-text-secondary] max-w-2xl mx-auto mb-8">
            The decentralized platform for creators. Accept crypto subscriptions, maintain full control of your content,
            and keep 95% of your earnings.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {connectedAddress ? (
              <>
                <Link href="/explore" className="fo-btn-primary flex items-center gap-2">
                  Explore Creators
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link href="/profile/create" className="fo-btn-secondary">
                  Become a Creator
                </Link>
              </>
            ) : (
              <>
                <RainbowKitCustomConnectButton />
                <p className="text-sm text-[--fo-text-muted]">Connect your wallet to get started</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-[--fo-border]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: totalCreators.toString(), label: "Creators" },
            { value: "—", label: "Subscribers" },
            { value: "5%", label: "Platform Fee" },
            { value: "0", label: "Hidden Fees" },
          ].map((stat, i) => (
            <div key={i} className="fo-stat">
              <div className="fo-stat-value text-2xl md:text-3xl fo-gradient-text">{stat.value}</div>
              <div className="fo-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Choose <span className="fo-gradient-text">FansOnly</span>?
          </h2>
          <p className="text-[--fo-text-secondary] text-center max-w-2xl mx-auto mb-12">
            Built for creators who want ownership, transparency, and direct connection with their audience.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="fo-card-elevated p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[--fo-primary-light] flex items-center justify-center text-[--fo-primary]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[--fo-text-secondary]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Tiers Preview */}
      <section className="py-20 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Flexible Subscription Tiers</h2>
          <p className="text-[--fo-text-secondary] text-center max-w-2xl mx-auto mb-12">
            Creators can set up to 5 custom tiers with different perks and pricing.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tiers.map((tier, i) => (
              <div key={i} className={`fo-tier-card ${i === 1 ? "border-[--fo-primary] scale-105" : ""}`}>
                {i === 1 && <div className="fo-badge-verified mb-4">Most Popular</div>}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-3xl font-bold fo-gradient-text mb-4">{tier.price}</p>
                <p className="text-sm text-[--fo-text-muted] mb-6">per month</p>
                <ul className="space-y-2 text-left">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-5 w-5 text-[--fo-primary]" />
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
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-[--fo-text-secondary] mb-8 max-w-xl mx-auto">
            Join the decentralized creator economy. Set up your profile in minutes and start accepting crypto
            subscriptions today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profile/create" className="fo-btn-primary">
              Create Your Profile
            </Link>
            <Link href="/explore" className="fo-btn-secondary">
              Browse Creators
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
