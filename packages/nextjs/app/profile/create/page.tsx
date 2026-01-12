"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface TierInput {
  name: string;
  price: string;
  description: string;
}

const CreateProfilePage: NextPage = () => {
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useAccount();

  // Form state
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageCID, setProfileImageCID] = useState("");
  const [bannerImageCID, setBannerImageCID] = useState("");
  const [tiers, setTiers] = useState<TierInput[]>([
    { name: "Basic", price: "0.01", description: "Access to subscriber-only content" },
  ]);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  // Contract interaction
  const { writeContractAsync: registerCreator, isPending: isRegistering } = useScaffoldWriteContract("CreatorProfile");

  // Validation functions
  const validateUsername = (value: string): string | null => {
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 20) return "Username must be 20 characters or less";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Only letters, numbers, and underscores allowed";
    return null;
  };

  const validateDisplayName = (value: string): string | null => {
    if (value.length < 1) return "Display name is required";
    if (value.length > 50) return "Display name must be 50 characters or less";
    return null;
  };

  const validateBio = (value: string): string | null => {
    if (value.length > 500) return "Bio must be 500 characters or less";
    return null;
  };

  const validateTier = (tier: TierInput, index: number): Record<string, string> => {
    const tierErrors: Record<string, string> = {};
    if (!tier.name) tierErrors[`tier${index}Name`] = "Tier name is required";
    if (!tier.price || parseFloat(tier.price) <= 0) tierErrors[`tier${index}Price`] = "Price must be greater than 0";
    if (!tier.description) tierErrors[`tier${index}Desc`] = "Description is required";
    return tierErrors;
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const usernameError = validateUsername(username);
    if (usernameError) newErrors.username = usernameError;

    const displayNameError = validateDisplayName(displayName);
    if (displayNameError) newErrors.displayName = displayNameError;

    const bioError = validateBio(bio);
    if (bioError) newErrors.bio = bioError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    let newErrors: Record<string, string> = {};

    tiers.forEach((tier, index) => {
      newErrors = { ...newErrors, ...validateTier(tier, index) };
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Tier management
  const addTier = () => {
    if (tiers.length >= 5) return;
    setTiers([...tiers, { name: "", price: "", description: "" }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length <= 1) return;
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof TierInput, value: string) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!isConnected || !connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!validateStep2()) return;

    try {
      // Register creator profile
      await registerCreator({
        functionName: "registerCreator",
        args: [username, displayName, bio, profileImageCID, bannerImageCID],
      });

      // Add tiers one by one
      for (const tier of tiers) {
        await registerCreator({
          functionName: "createTier",
          args: [tier.name, tier.description, parseEther(tier.price)],
        });
      }

      // Redirect to profile
      router.push(`/creator/${username}`);
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ submit: "Registration failed. Please try again." });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fo-card p-8 text-center max-w-md">
          <UserCircleIcon className="w-16 h-16 mx-auto mb-4 text-[--fo-text-muted]" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-[--fo-text-secondary] mb-6">Please connect your wallet to create a creator profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Become a <span className="fo-gradient-text">Creator</span>
          </h1>
          <p className="text-[--fo-text-secondary]">Set up your profile and start earning from your content</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? "bg-[--fo-primary] text-white" : "bg-base-200 text-[--fo-text-muted]"
                }`}
              >
                {step > s ? <CheckCircleIcon className="w-6 h-6" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 rounded ${step > s ? "bg-[--fo-primary]" : "bg-base-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Profile Info */}
        {step === 1 && (
          <div className="fo-card p-6">
            <h2 className="text-xl font-bold mb-6">Profile Information</h2>

            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Username <span className="text-[--fo-error]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[--fo-text-muted]">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  placeholder="yourname"
                  className={`fo-input pl-8 ${errors.username ? "border-[--fo-error]" : ""}`}
                  maxLength={20}
                />
              </div>
              {errors.username && (
                <p className="text-[--fo-error] text-sm mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {errors.username}
                </p>
              )}
              <p className="text-[--fo-text-muted] text-sm mt-1">
                3-20 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            {/* Display Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Display Name <span className="text-[--fo-error]">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className={`fo-input ${errors.displayName ? "border-[--fo-error]" : ""}`}
                maxLength={50}
              />
              {errors.displayName && (
                <p className="text-[--fo-error] text-sm mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {errors.displayName}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell your fans about yourself..."
                className={`fo-textarea ${errors.bio ? "border-[--fo-error]" : ""}`}
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                {errors.bio ? (
                  <p className="text-[--fo-error] text-sm flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {errors.bio}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-[--fo-text-muted] text-sm">{bio.length}/500</span>
              </div>
            </div>

            {/* Profile Image CID */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Profile Image (IPFS CID)</label>
              <input
                type="text"
                value={profileImageCID}
                onChange={e => setProfileImageCID(e.target.value)}
                placeholder="Qm... or bafk..."
                className="fo-input"
              />
              <p className="text-[--fo-text-muted] text-sm mt-1">Upload your image to IPFS and paste the CID here</p>
            </div>

            {/* Banner Image CID */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Banner Image (IPFS CID)</label>
              <input
                type="text"
                value={bannerImageCID}
                onChange={e => setBannerImageCID(e.target.value)}
                placeholder="Qm... or bafk..."
                className="fo-input"
              />
            </div>

            <button onClick={() => validateStep1() && setStep(2)} className="fo-btn-primary w-full">
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Subscription Tiers */}
        {step === 2 && (
          <div className="fo-card p-6">
            <h2 className="text-xl font-bold mb-2">Subscription Tiers</h2>
            <p className="text-[--fo-text-secondary] mb-6">
              Set up your subscription tiers (1-5 tiers). You can add more later.
            </p>

            <div className="space-y-4 mb-6">
              {tiers.map((tier, index) => (
                <div key={index} className="p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Tier {index + 1}</h3>
                    {tiers.length > 1 && (
                      <button
                        onClick={() => removeTier(index)}
                        className="p-2 hover:bg-base-300 rounded-full text-[--fo-error]"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={e => updateTier(index, "name", e.target.value)}
                        placeholder="e.g., Supporter"
                        className={`fo-input ${errors[`tier${index}Name`] ? "border-[--fo-error]" : ""}`}
                      />
                      {errors[`tier${index}Name`] && (
                        <p className="text-[--fo-error] text-xs mt-1">{errors[`tier${index}Name`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (MNT)</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={tier.price}
                        onChange={e => updateTier(index, "price", e.target.value)}
                        placeholder="0.05"
                        className={`fo-input ${errors[`tier${index}Price`] ? "border-[--fo-error]" : ""}`}
                      />
                      {errors[`tier${index}Price`] && (
                        <p className="text-[--fo-error] text-xs mt-1">{errors[`tier${index}Price`]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={tier.description}
                      onChange={e => updateTier(index, "description", e.target.value)}
                      placeholder="What subscribers get..."
                      className={`fo-input ${errors[`tier${index}Desc`] ? "border-[--fo-error]" : ""}`}
                    />
                    {errors[`tier${index}Desc`] && (
                      <p className="text-[--fo-error] text-xs mt-1">{errors[`tier${index}Desc`]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {tiers.length < 5 && (
              <button
                onClick={addTier}
                className="w-full p-3 border-2 border-dashed border-[--fo-border] rounded-lg text-[--fo-text-secondary] hover:border-[--fo-primary] hover:text-[--fo-primary] transition-colors flex items-center justify-center gap-2 mb-6"
              >
                <PlusIcon className="w-5 h-5" />
                Add Another Tier
              </button>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="fo-btn-secondary flex-1">
                Back
              </button>
              <button onClick={() => validateStep2() && setStep(3)} className="fo-btn-primary flex-1">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="fo-card p-6">
            <h2 className="text-xl font-bold mb-6">Review Your Profile</h2>

            {/* Preview Card */}
            <div className="fo-card-elevated mb-6">
              <div className="h-24 bg-gradient-to-r from-[--fo-primary] to-[--fo-accent]" />
              <div className="p-4 pt-0 relative">
                <div className="-mt-10 mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[--fo-primary] to-[--fo-accent] p-1">
                    <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-2xl font-bold text-[--fo-primary]">
                      {displayName.charAt(0) || "?"}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{displayName || "Your Name"}</h3>
                <p className="text-sm text-[--fo-text-muted]">@{username || "username"}</p>
                <p className="text-sm text-[--fo-text-secondary] mt-2 line-clamp-2">
                  {bio || "Your bio will appear here..."}
                </p>
              </div>
            </div>

            {/* Tiers Summary */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Subscription Tiers</h3>
              <div className="space-y-2">
                {tiers.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div>
                      <span className="font-medium">{tier.name}</span>
                      <span className="text-[--fo-text-muted] text-sm ml-2">({tier.description})</span>
                    </div>
                    <span className="font-bold text-[--fo-primary]">{tier.price} MNT</span>
                  </div>
                ))}
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-[--fo-error]/10 border border-[--fo-error] rounded-lg mb-6 text-[--fo-error]">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="fo-btn-secondary flex-1">
                Back
              </button>
              <button onClick={handleSubmit} disabled={isRegistering} className="fo-btn-primary flex-1">
                {isRegistering ? "Creating Profile..." : "Create Profile"}
              </button>
            </div>

            <p className="text-[--fo-text-muted] text-sm text-center mt-4">
              By creating a profile, you agree to our Terms of Service
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProfilePage;
