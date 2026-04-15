"use client";

import { auth, db } from "./init";
import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

export type StripeCheckoutMode = "subscription" | "payment";
export type StripeBillingPeriod = "monthly" | "yearly";

export const STRIPE_PRICE_IDS: Record<StripeBillingPeriod, string> = {
  monthly: "price_1TJvqBDTVIOtUo0SHVL1UI1J",
  yearly: "price_1TJvr7DTVIOtUo0SHQ4i9hjW",
};

export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode?: StripeCheckoutMode;
  allowPromotionCodes?: boolean;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  status: string;
  role: string | null;
  currentPeriodEnd: number | null;
}

export interface CreatePlanCheckoutSessionParams {
  billingPeriod: StripeBillingPeriod;
  successUrl: string;
  cancelUrl: string;
  allowPromotionCodes?: boolean;
  metadata?: Record<string, string>;
}

const DEFAULT_STRIPE_EXTENSION_INSTANCE_ID = "firestore-stripe-payments";
const STRIPE_EXTENSION_INSTANCE_ID =
  process.env.NEXT_PUBLIC_STRIPE_EXTENSION_INSTANCE_ID ??
  DEFAULT_STRIPE_EXTENSION_INSTANCE_ID;
const FIREBASE_FUNCTIONS_REGION =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? "us-east1";

export class StripePayment {
  private readonly functions = getFunctions(undefined, FIREBASE_FUNCTIONS_REGION);

  private getPortalCallableNames(): string[] {
    return Array.from(
      new Set([
        `ext-${STRIPE_EXTENSION_INSTANCE_ID}-createPortalLink`,
        `ext-${DEFAULT_STRIPE_EXTENSION_INSTANCE_ID}-createPortalLink`,
      ])
    );
  }

  getPriceIdForBillingPeriod(billingPeriod: StripeBillingPeriod): string {
    return STRIPE_PRICE_IDS[billingPeriod];
  }

  private getCurrentUser(): User {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User must be authenticated to use Stripe payments.");
    }

    return user;
  }

  async createCheckoutSession({
    priceId,
    successUrl,
    cancelUrl,
    mode = "subscription",
    allowPromotionCodes = true,
    metadata,
  }: CreateCheckoutSessionParams): Promise<string> {
    const user = this.getCurrentUser();

    const checkoutSessionsRef = collection(
      db,
      "customers",
      user.uid,
      "checkout_sessions"
    );

    const sessionDocRef = await addDoc(checkoutSessionsRef, {
      price: priceId,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: allowPromotionCodes,
      metadata: metadata ?? {},
      createdAt: new Date(),
    });

    return this.waitForCheckoutUrl(user.uid, sessionDocRef.id);
  }

  async createPlanCheckoutSession({
    billingPeriod,
    successUrl,
    cancelUrl,
    allowPromotionCodes = true,
    metadata,
  }: CreatePlanCheckoutSessionParams): Promise<string> {
    return this.createCheckoutSession({
      priceId: this.getPriceIdForBillingPeriod(billingPeriod),
      successUrl,
      cancelUrl,
      mode: "subscription",
      allowPromotionCodes,
      metadata,
    });
  }

  async openBillingPortal(returnUrl: string): Promise<string> {
    const errors: string[] = [];

    for (const callableName of this.getPortalCallableNames()) {
      try {
        const createPortalLink = httpsCallable<
          { returnUrl: string; locale?: string },
          { url?: string }
        >(this.functions, callableName);

        const result = await createPortalLink({
          returnUrl,
          locale: "auto",
        });

        if (result.data?.url) {
          return result.data.url;
        }

        errors.push(`${callableName}: Stripe did not return a billing portal URL.`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown billing portal error.";
        errors.push(`${callableName}: ${message}`);
      }
    }

    throw new Error(
      `Unable to open the Stripe billing portal in region ${FIREBASE_FUNCTIONS_REGION}. ${errors.join(" ")}`
    );
  }

  async getActiveSubscription(): Promise<StripeSubscription | null> {
    const user = this.getCurrentUser();

    const subscriptionsRef = collection(db, "customers", user.uid, "subscriptions");
    const activeSubQuery = query(
      subscriptionsRef,
      where("status", "in", ["trialing", "active"])
    );

    const snapshot = await getDocs(activeSubQuery);

    if (snapshot.empty) {
      return null;
    }

    const firstSub = snapshot.docs[0];
    const data = firstSub.data();

    return {
      id: firstSub.id,
      status: String(data.status ?? ""),
      role: data.role ? String(data.role) : null,
      currentPeriodEnd:
        typeof data.current_period_end === "number"
          ? data.current_period_end
          : null,
    };
  }

  private waitForCheckoutUrl(userId: string, sessionId: string): Promise<string> {
    const sessionRef = doc(db, "customers", userId, "checkout_sessions", sessionId);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(
          new Error(
            "Timed out while waiting for Stripe checkout session. Please try again."
          )
        );
      }, 30000);

      const unsubscribe = onSnapshot(
        sessionRef,
        (snapshot) => {
          const data = snapshot.data() as DocumentData | undefined;

          if (!data) {
            return;
          }

          if (data.error?.message) {
            clearTimeout(timeout);
            unsubscribe();
            reject(new Error(String(data.error.message)));
            return;
          }

          if (typeof data.url === "string" && data.url.length > 0) {
            clearTimeout(timeout);
            unsubscribe();
            resolve(data.url);
          }
        },
        (error) => {
          clearTimeout(timeout);
          unsubscribe();
          reject(error);
        }
      );
    });
  }
}

export const stripePayment = new StripePayment();
