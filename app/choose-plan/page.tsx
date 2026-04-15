"use client";

import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { FileText, Handshake, Sprout } from "lucide-react";
import { ModalContext } from "@/components/modals/providers";
import { useAuth } from "@/lib/firebase/AuthContext";
import {
  stripePayment,
  StripeBillingPeriod,
} from "@/lib/firebase/stripePayment";

export default function ChoosePlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<StripeBillingPeriod>("yearly");
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCtaFixed, setIsCtaFixed] = useState(true);
  const ctaAnchorRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { setShowSignInModal } = useContext(ModalContext);

  const handleCheckout = async () => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }

    setCheckoutError(null);
    setIsRedirectingToCheckout(true);

    try {
      const origin = window.location.origin;
      const checkoutUrl = await stripePayment.createPlanCheckoutSession({
        billingPeriod: selectedPlan,
        successUrl: `${origin}/for-you`,
        cancelUrl: `${origin}/choose-plan`,
      });

      window.location.assign(checkoutUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again.";
      setCheckoutError(message);
      setIsRedirectingToCheckout(false);
    }
  };

  useEffect(() => {
    const onScrollOrResize = () => {
      const anchorEl = ctaAnchorRef.current;
      const ctaEl = ctaRef.current;

      if (!anchorEl || !ctaEl) return;

      const anchorTop = anchorEl.getBoundingClientRect().top;
      const releaseY = window.innerHeight - ctaEl.offsetHeight - 16;

      setIsCtaFixed(anchorTop > releaseY);
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <>
      <header className="relative min-h-[65vh] bg-[#032b41] flex rounded-b-[16rem] overflow-hidden">
        <div className="max-w-[1070px] mx-auto w-full px-6 pt-12 pb-32">
          <h1 className="text-[48px] font-bold text-white mb-3 text-center">
            Get unlimited access to many amazing books to read
          </h1>
          <p className="text-[20px] text-[#d7e4ea] text-center">
            Turn ordinary moments into amazing learning opportunities.
          </p>
        </div>
        <Image
          src="/pricing-top.png"
          alt="Pricing decoration"
          width={320}
          height={180}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full"
        />
      </header>

      <section className="max-w-[1070px] mx-auto px-6 py-16">
        <div className="grid gap-10 md:grid-cols-3 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f1f4] text-[#032b41]">
              <FileText size={30} />
            </div>
            <p className="text-[18px] leading-7 text-[#394547]">
              <b>Key ideas in a few min</b> with many books to read
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f1f4] text-[#032b41]">
              <Sprout size={30} />
            </div>
            <p className="text-[18px] leading-7 text-[#394547]">
              <b>3 million people growing</b> with Summarist everyday
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f1f4] text-[#032b41]">
              <Handshake size={30} />
            </div>
            <p className="text-[18px] leading-7 text-[#394547]">
              <b>Precise recommendations</b> collections curated by experts
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1070px] mx-auto px-6">
        <h2 className="text-[36px] font-bold text-[#032b41] text-center mb-10">
          Choose the plan that fits you
        </h2>

        <div className="grid gap-6 md:grid-cols-2 mb-10">
          <button
            type="button"
            onClick={() => setSelectedPlan("yearly")}
            className={`relative rounded-[2rem] p-8 pt-12 shadow-sm text-left transition-colors ${
              selectedPlan === "yearly"
                ? "border-2 border-[#2bd97c] bg-white"
                : "border border-[#d7e4ea] bg-white"
            }`}
          >
            <span
              className={`absolute left-1/2 top-5 h-3 w-3 -translate-x-1/2 rounded-full ${
                selectedPlan === "yearly" ? "bg-[#2bd97c]" : "bg-[#d7e4ea]"
              }`}
            />
            <p
              className={`text-[14px] font-semibold uppercase tracking-[0.12em] mb-3 ${
                selectedPlan === "yearly" ? "text-[#2bd97c]" : "text-[#032b41]"
              }`}
            >
              Premium Plus Yearly
            </p>
            <p className="text-[40px] font-bold text-[#032b41] mb-3">
              $99.99/year
            </p>
            <p className="text-[18px] text-[#394547]">
              7-day free trial included
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("monthly")}
            className={`relative rounded-[2rem] p-8 pt-12 shadow-sm text-left transition-colors ${
              selectedPlan === "monthly"
                ? "border-2 border-[#2bd97c] bg-white"
                : "border border-[#d7e4ea] bg-white"
            }`}
          >
            <span
              className={`absolute left-1/2 top-5 h-3 w-3 -translate-x-1/2 rounded-full ${
                selectedPlan === "monthly" ? "bg-[#2bd97c]" : "bg-[#d7e4ea]"
              }`}
            />
            <p
              className={`text-[14px] font-semibold uppercase tracking-[0.12em] mb-3 ${
                selectedPlan === "monthly" ? "text-[#2bd97c]" : "text-[#032b41]"
              }`}
            >
              Premium Monthly
            </p>
            <p className="text-[40px] font-bold text-[#032b41] mb-3">
              $9.99/month
            </p>
            <p className="text-[18px] text-[#394547]">No trial included</p>
          </button>
        </div>

        <div ref={ctaAnchorRef} className={isCtaFixed ? "h-[132px]" : "h-0"} />

        <div
          ref={ctaRef}
          className={
            isCtaFixed ? "fixed bottom-0 left-0 right-0 z-50 px-6 pb-4" : ""
          }
        >
          <div
            className={
              isCtaFixed
                ? "max-w-[1070px] mx-auto rounded-2xl bg-white/95 py-4 shadow-[0_-8px_20px_rgba(3,43,65,0.12)] backdrop-blur"
                : ""
            }
          >
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isRedirectingToCheckout}
                className="rounded-full bg-[#2bd97c] px-10 py-4 text-[18px] font-semibold text-[#032b41] transition-colors hover:bg-[#20c56d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRedirectingToCheckout
                  ? "Redirecting to checkout..."
                  : selectedPlan === "monthly"
                    ? "Start your first month"
                    : "Start your free 7-day trial"}
              </button>
              {checkoutError ? (
                <p className="text-center text-[14px] text-[#ef4444]">{checkoutError}</p>
              ) : null}
              <p className="text-center text-[16px] text-[#6b757b]">
                {selectedPlan === "monthly"
                  ? "30-day money back guarantee, no questions asked."
                  : "Cancel your trial at anytime before it ends, and you won't be charged."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[600px] mx-auto px-6 pt-8 pb-16">
        {[
          {
            header: "How does the free 7-day trial work?",
            body: "Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. With Premium access, you can learn at your own pace and as frequently as you desire, and you may terminate your subscription prior to the conclusion of the 7-day free trial.",
          },
          {
            header: "Can I switch subscriptions from monthly to yearly, or yearly to monthly?",
            body: "While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the current month ends, transitioning from a monthly plan to an annual plan is an option.",
          },
          {
            header: "What's included in the Premium plan?",
            body: "Premium membership provides you with the ultimate Summarist experience, including unrestricted entry to many best-selling books high-quality audio, the ability to download titles for offline reading, and the option to send your reads to your Kindle.",
          },
          {
            header: "Can I cancel during my trial or subscription?",
            body: "You can cancel your trial or subscription at any time. If you cancel during the trial period, you won't be charged. If you cancel after the trial, your subscription will continue until the end of the billing cycle.",
          },
        ].map((item, i) => (
          <AccordionItem key={i} header={item.header} body={item.body} />
        ))}
        <hr className="border-t border-[#e1e7ea]" />
      </section>

      <footer className="border-t border-[#e1e7ea] bg-[#f7faf9]">
        <div className="max-w-[1070px] mx-auto px-6 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[18px] font-semibold text-[#032b41]">Summarist</p>
            <p className="text-[14px] text-[#6b757b]">Learn smarter in minutes a day.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-[#394547]">
            <span className="opacity-50 cursor-not-allowed" aria-disabled="true">Terms</span>
            <span className="opacity-50 cursor-not-allowed" aria-disabled="true">Privacy</span>
            <span className="opacity-50 cursor-not-allowed" aria-disabled="true">Contact</span>
          </nav>
          <p className="text-[13px] text-[#6b757b]">© {new Date().getFullYear()} Summarist. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

function AccordionItem({ header, body }: { header: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <hr className="border-t border-[#e1e7ea]" />
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-[18px] font-semibold text-[#032b41]">
          {header}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-[#032b41] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <p className="pb-5 text-[16px] leading-7 text-[#394547]">{body}</p>
        </div>
      </div>
    </div>
  );
}
