"use client";
import Image from "next/image";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useContext, useState } from "react";
import { ModalContext } from "@/components/modals/providers";
import { useRouter } from "next/navigation";
import { stripePayment } from "@/lib/firebase/stripePayment";

function SettingsPageSkeleton() {
  return (
    <div className="max-w-[1070px] mx-auto p-6 animate-pulse">
      <div className="h-9 w-36 rounded bg-[#d8e3e0] mb-2" />
      <hr className="mb-8 border-t border-[#e1e7ea]" />

      <section className="mb-12">
        <div className="h-7 w-56 rounded bg-[#d8e3e0] mb-4" />
        <div className="bg-[#f7faf9] rounded-xl p-6 flex flex-col items-center gap-4">
          <div className="h-5 w-28 rounded bg-[#d8e3e0]" />
          <div className="h-10 w-44 rounded bg-[#d8e3e0]" />
        </div>
      </section>

      <section>
        <div className="h-7 w-20 rounded bg-[#d8e3e0] mb-4" />
        <div className="bg-[#f7faf9] rounded-xl p-6">
          <div className="h-7 w-64 rounded bg-[#d8e3e0] mx-auto" />
        </div>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  const { user, subscriptionStatus, isAuthLoading } = useAuth();
  const { setShowSignInModal } = useContext(ModalContext);
  const router = useRouter();
  const [isOpeningBillingPortal, setIsOpeningBillingPortal] = useState(false);
  const [billingPortalError, setBillingPortalError] = useState<string | null>(null);

  if (isAuthLoading) {
    return <SettingsPageSkeleton />;
  }

  const handleManageSubscription = async () => {
    setBillingPortalError(null);
    setIsOpeningBillingPortal(true);

    try {
      const billingPortalUrl = await stripePayment.openBillingPortal(
        `${window.location.origin}/settings`
      );

      window.location.assign(billingPortalUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to open subscription management. Please try again.";
      setBillingPortalError(message);
      setIsOpeningBillingPortal(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-[1070px] mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-2 w-full text-left">Settings</h1>
        <hr className="mb-8 border-t border-[#e1e7ea] w-full" />
        <Image
          src="/login.png"
          alt="Login"
          width={460}
          height={460}
          className="mb-8"
        />
        <h2 className="text-2xl font-bold mb-2 text-center">
          Login to your account to see your details
        </h2>
        <button
          className="mt-2 px-6 py-2 bg-[#032b41] text-white rounded font-semibold transition-colors duration-200 hover:bg-[#0365f2]"
          onClick={() => setShowSignInModal(true)}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1070px] mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <hr className="mb-8 border-t border-[#e1e7ea]" />
      <section className="mb-12">
        <h2 className="text-[22px] font-[700] text-[#394547] mb-4">
          Your subscription plan
        </h2>
        <div className="bg-[#f7faf9] rounded-xl p-6 flex flex-col items-center gap-4">
          <span className="text-[#394547] font-medium">
            {subscriptionStatus === "premium-plus" ? "Premium Plus" : "Basic"}
          </span>
          {subscriptionStatus === "premium-plus" && (
            <button
              className="px-5 py-2 bg-[#032b41] text-white rounded font-semibold transition-colors duration-200 hover:bg-[#0365f2] disabled:cursor-not-allowed disabled:opacity-70"
              onClick={handleManageSubscription}
              disabled={isOpeningBillingPortal}
            >
              {isOpeningBillingPortal ? "Opening billing portal..." : "Manage Subscription"}
            </button>
          )}
          {subscriptionStatus !== "premium-plus" && (
            <button
              className="px-5 py-2 bg-[#032b41] text-white rounded font-semibold transition-colors duration-200 hover:bg-[#0365f2]"
              onClick={() => router.push("/choose-plan")}
            >
              Upgrade to Premium
            </button>
          )}
          {billingPortalError ? (
            <p className="text-center text-sm text-[#ef4444]">{billingPortalError}</p>
          ) : null}
        </div>
      </section>
      <section>
        <h2 className="text-[22px] font-[700] text-[#394547] mb-4">Email</h2>
        <div className="bg-[#f7faf9] rounded-xl p-6 text-[#394547] text-center text-lg font-medium">
          {user.email}
        </div>
      </section>
    </div>
  );
}
